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

    // 4. تعيين رئيس للفصل (Assign Chair)
    public function assignChair(Request $request, $chapterId) {
        $request->validate(['user_id' => 'required|exists:users,user_id']);
        
        $chapter = Chapter::findOrFail($chapterId);
        $user = User::findOrFail($request->user_id);

        // تحديث حقل رئيس الفصل
        $chapter->update(['chair_id' => $user->user_id]);

        return response()->json(['message' => "User {$user->full_name} is now the Chair of {$chapter->name}"]);
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

        // 1. إزالة العضو من الجدول الوسيط (Pivot Table)
        $chapter->members()->detach($userId);

        // 2. التحقق: إذا كان العضو المحذوف هو الـ Chair الحالي للفصل
        if ($chapter->chair_id == $userId) {
            $chapter->update(['chair_id' => null]);
            $message = "Member removed from chapter and chairmanship has been vacated.";
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
     * عزل رئيس الفصل (يبقى عضواً عادياً)
     * DELETE /api/chapters/{chapter_id}/chair
     */
    public function removeChair($chapterId)
    {
        $chapter = Chapter::findOrFail($chapterId);

        if (!$chapter->chair_id) {
            return response()->json(['message' => 'This chapter already has no chair.'], 400);
        }

        // تصفير حقل الرئيس فقط
        $chapter->update(['chair_id' => null]);

        return response()->json([
            'message' => 'Chairmanship removed successfully. The user is still a member of the chapter.'
        ]);
    }
}