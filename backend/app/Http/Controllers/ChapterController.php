<?php

namespace App\Http\Controllers;

use App\Models\Chapter;
use App\Models\User;
use Illuminate\Http\Request;

class ChapterController extends Controller
{
    // 1. جلب فصول فرع معين
    public function index($branchId) {
        $chapters = Chapter::where('branch_id', $branchId)->with(['chair', 'society'])->get();
        return response()->json(['data' => $chapters]);
    }

    // 2. إنشاء فصل جديد (بصلاحية السوبر أدمن أو مدير الفرع)
    public function store(Request $request) {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'branch_id' => 'required|exists:branches,branch_id',
            'society_id' => 'nullable|exists:societies,society_id',
            'description' => 'nullable|string',
        ]);

        $chapter = Chapter::create($validated);
        return response()->json(['message' => 'Chapter created successfully', 'data' => $chapter], 201);
    }

    // 3. عرض تفاصيل فصل مع أعضائه
    public function show($chapterId) {
        $chapter = Chapter::with(['branch', 'society', 'chair', 'members'])->findOrFail($chapterId);
        return response()->json(['data' => $chapter]);
    }

    /**
     * تعيين رئيس للفصل وتحديث دوره
     * PATCH /api/chapters/{chapter_id}/assign-chair
     */
    public function assignChair(Request $request, $chapterId)
    {
        $request->validate([
            'user_id' => 'required|exists:users,user_id'
        ]);

        $chapter = Chapter::findOrFail($chapterId);
        $newUser = \App\Models\User::findOrFail($request->user_id);

        // 1. التعامل مع الرئيس القديم (إذا وجد)
        // إذا كان هناك رئيس سابق، نعيد دوره إلى متطوع عادي
        if ($chapter->chair_id) {
            $oldChair = \App\Models\User::find($chapter->chair_id);
            if ($oldChair) {
                $oldChair->update(['role' => 'Volunteer']);
            }
        }

        // 2. تحديث جدول الفصول لتعيين الرئيس الجديد
        $chapter->update(['chair_id' => $newUser->user_id]);

        // 3. تحديث دور المستخدم الجديد ليصبح Chapter Chair
        $newUser->update(['role' => 'Chapter Chair']);

        return response()->json([
            'message' => "User assigned as Chapter Chair and their role has been updated.",
            'data' => $chapter->load('chair')
        ]);
    }

    // 5. إضافة متطوع للفصل (Join Chapter)
    public function addMember(Request $request, $chapterId) {
        $request->validate([
            'user_id' => 'required|exists:users,user_id',
            'role_in_chapter' => 'nullable|string'
        ]);

        $chapter = Chapter::findOrFail($chapterId);
        
        // استخدام syncWithoutDetaching لمنع التكرار
        $chapter->members()->syncWithoutDetaching([
            $request->user_id => ['role_in_chapter' => $request->role_in_chapter ?? 'Member']
        ]);

        return response()->json(['message' => 'Member added to chapter successfully']);
    }

    // 6. إزالة متطوع من الفصل
    /**
     * إزالة عضو من الفصل (مع التحقق من منصبه كرئيس)
     * DELETE /api/chapters/{chapter_id}/members/{user_id}
     */
    public function removeMember($chapterId, $userId)
    {
        $chapter = Chapter::findOrFail($chapterId);
        $user = \App\Models\User::findOrFail($userId);

        // 1. إزالة العضو من جدول الأعضاء
        $chapter->members()->detach($userId);

        // 2. إذا كان هو رئيس الفصل، نصفر الرئاسة ونرجع دوره لمتطوع
        if ($chapter->chair_id == $userId) {
            $chapter->update(['chair_id' => null]);
            $user->update(['role' => 'Volunteer']);
            $message = "Member removed and chairmanship vacated (Role reverted to Volunteer).";
        } else {
            $message = "Member removed from chapter.";
        }

        return response()->json(['message' => $message]);
    }

    // 7. جلب جميع الفصول في النظام (ممتازة للـ Super Admin)
    public function getAllChapters(Request $request) {
        // نستخدم Query Builder عشان لو حبينا نفلتر مستقبلاً
        $query = Chapter::with(['branch', 'society', 'chair']);

        // فلتر اختياري: جلب الفصول الفعالة فقط (إذا تم تمرير ?status=Active)
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json([
            'message' => 'All chapters retrieved successfully',
            'data' => $query->latest()->get()
        ]);
    }

    // 8. تعديل بيانات الفصل (Update Chapter)
    public function update(Request $request, $chapterId) {
        $chapter = Chapter::findOrFail($chapterId);

        // استخدمنا sometimes عشان نقدر نعدل حقل واحد أو كل الحقول مع بعض
        $validated = $request->validate([
            'name' => 'sometimes|string|max:150',
            'description' => 'nullable|string',
            'society_id' => 'nullable|exists:societies,society_id',
            'status' => 'sometimes|in:Active,Inactive'
        ]);

        $chapter->update($validated);

        return response()->json([
            'message' => 'Chapter updated successfully',
            'data' => $chapter
        ]);
    }

    // 9. حذف فصل (Delete Chapter)
    public function destroy($chapterId) {
        $chapter = Chapter::findOrFail($chapterId);
        
        // 🚨 ملاحظة هندسية: بفضل الـ onDelete('cascade') في قاعدة البيانات، 
        // سيتم تلقائياً حذف:
        // 1. ارتباطات الأعضاء في جدول (chapter_user)
        // 2. المشاريع التابعة لهذا الفصل في جدول (projects)
        $chapter->delete();

        return response()->json([
            'message' => 'Chapter deleted successfully. All associated members and projects have been cleaned up.'
        ]);
    }

    /**
     * عزل رئيس الفصل وإعادته لدور متطوع
     * DELETE /api/chapters/{chapter_id}/chair
     */
    public function removeChair($chapterId)
    {
        $chapter = Chapter::findOrFail($chapterId);

        if (!$chapter->chair_id) {
            return response()->json(['message' => 'This chapter already has no chair.'], 400);
        }

        // 1. جلب المستخدم الذي هو رئيس حالياً
        $currentChair = \App\Models\User::find($chapter->chair_id);

        // 2. تغيير دوره ليعود متطوعاً عادياً
        if ($currentChair) {
            $currentChair->update(['role' => 'Volunteer']);
        }

        // 3. تصفير حقل الرئاسة في الفصل
        $chapter->update(['chair_id' => null]);

        return response()->json([
            'message' => 'Chairmanship removed and user role reverted to Volunteer.'
        ]);
    }

    /**
     * جلب إحصائيات لوحة تحكم الفصل (Chapter Dashboard Stats)
     * GET /api/chapters/{chapter_id}/stats
     */
    public function getStats(Request $request, $chapterId)
    {
        $chapter = \App\Models\Chapter::findOrFail($chapterId);
        $currentUser = $request->user();

        // 🛡️ 1. الحماية الأمنية (Authorization Logic)
        if ($currentUser->role === 'Super Admin') {
            // مسموح دائماً
        } elseif ($currentUser->role === 'Branch Admin' && $currentUser->branch_id === $chapter->branch_id) {
            // مسموح لمدير الفرع رؤية إحصائيات الفصول التابعة لفرعه فقط
        } elseif ($currentUser->role === 'Chapter Chair' && $chapter->chair_id === $currentUser->user_id) {
            // مسموح لرئيس الفصل رؤية إحصائيات فصله فقط
        } else {
            // طرد أي شخص آخر
            return response()->json(['message' => 'Unauthorized to view these statistics.'], 403);
        }

        // 📊 2. جلب الإحصائيات (Stats Gathering)

        // عدد أعضاء الفصل
        $totalMembers = $chapter->members()->count();

        // عدد مشاريع الفصل الإجمالية
        $totalProjects = \App\Models\Project::where('chapter_id', $chapterId)->count();

        // المشاريع قيد الإنجاز
        $ongoingProjects = \App\Models\Project::where('chapter_id', $chapterId)
                                ->where('status', 'Ongoing')
                                ->count();

        // المشاريع المكتملة
        $completedProjects = \App\Models\Project::where('chapter_id', $chapterId)
                                ->where('status', 'Completed')
                                ->count();

        // 🚀 3. إرجاع البيانات المجمعة
        return response()->json([
            'message' => 'Chapter statistics retrieved successfully',
            'data' => [
                'cards' => [
                    'total_members' => $totalMembers,
                    'total_projects' => $totalProjects,
                    'ongoing_projects' => $ongoingProjects,
                    'completed_projects' => $completedProjects,
                ]
            ]
        ]);
    }
}