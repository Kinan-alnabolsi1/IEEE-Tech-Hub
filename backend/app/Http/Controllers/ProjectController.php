<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Project;
use App\Http\Requests\CreateProjectRequest;

class ProjectController extends Controller
{
    /**
     * Display a listing of the projects.
     */
    public function index()
    {
        // جلب المشاريع مع معلومات القائد والأعضاء لتسهيل عرضها بالفرونت إند
        $projects = Project::with(['leader', 'members'])->get();
        return response()->json($projects);
    }

    /**
     * Store a newly created project in storage.
     */
    public function store(CreateProjectRequest $request)
    {
        $project = Project::create($request->validated());
        return response()->json(['message' => 'Project created successfully', 'data' => $project], 201);
    }

    /**
     * Display the specified project with its details.
     */
    public function show($id)
    {
        $project = Project::with(['leader', 'members', 'requiredSkills'])->findOrFail($id);
        return response()->json($project);
    }

    /**
     * Update the specified project in storage.
     */
    public function update(Request $request, $id)
    {
        $project = Project::findOrFail($id);
        
        $validated = $request->validate([
            'title' => 'sometimes|string|max:200',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:Open,Ongoing,Completed,Cancelled'
        ]);
        
        $project->update($validated);
        
        return response()->json(['message' => 'Project updated successfully', 'data' => $project]);
    }

    /**
     * Remove the specified project from storage.
     */
    public function destroy($id)
    {
        $project = Project::findOrFail($id);
        $project->delete();
        
        return response()->json(['message' => 'Project deleted successfully']);
    }

    /**
     * Volunteer applies to join a project.
     */
    public function joinProject(Request $request, $projectId)
    {
        $project = Project::findOrFail($projectId);
        
        // منع المستخدم من التقديم مرتين لنفس المشروع
        if ($project->members()->where('users.user_id', $request->user()->user_id)->exists()) {
            return response()->json(['message' => 'Already applied to this project'], 409);
        }

        $project->members()->attach($request->user()->user_id, [
            'role' => 'Member',
            'status' => 'Pending',
            'applied_at' => now()
        ]);

        return response()->json(['message' => 'Application submitted successfully']);
    }

    /**
     * Approve a volunteer's application.
     */
    public function approveMember(Request $request, $projectId)
    {
        $request->validate([
            'user_id' => 'required|exists:users,user_id'
        ]);

        $project = Project::findOrFail($projectId);

        // تحديث حالة العضو إلى مقبول وتسجيل تاريخ الانضمام الفعلي
        $project->members()->updateExistingPivot($request->user_id, [
            'status' => 'Approved',
            'joined_at' => now()
        ]);

        return response()->json(['message' => 'Member approved successfully']);
    }

    /**
     * Reject a volunteer's application.
     */
    public function rejectMember(Request $request, $projectId)
    {
        $request->validate([
            'user_id' => 'required|exists:users,user_id'
        ]);

        $project = Project::findOrFail($projectId);

        // تحديث حالة العضو إلى مرفوض
        $project->members()->updateExistingPivot($request->user_id, [
            'status' => 'Rejected'
        ]);

        return response()->json(['message' => 'Member rejected successfully']);
    }


    /**
     * جلب كافة المشاريع التابعة لفرع محدد (مع حماية الخصوصية)
     * GET /api/branches/{branch_id}/projects
     */
    public function getBranchProjects(Request $request, $branchId)
    {
        $currentUser = $request->user();

        // 🛡️ منطق الحماية:
        // 1. السوبر أدمن مسموح له يشوف أي برانش.
        // 2. مدير الفرع مسموح له فقط إذا كان الـ branch_id في الرابط يطابق الـ branch_id تبعه.
        if ($currentUser->role === 'Branch Admin') {
            if ((int)$branchId !== (int)$currentUser->branch_id) {
                return response()->json([
                    'message' => 'Unauthorized. You can only view projects for your own branch.'
                ], 403);
            }
        } 
        // 3. أي دور آخر (متطوع مثلاً) ممنوع من الوصول لهذه القائمة الشاملة
        elseif ($currentUser->role !== 'Super Admin') {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        // ✅ إذا اجتاز الفحص، نقوم بجلب البيانات:
        
        // أ. نجلب أرقام الفصول التابعة لهذا الفرع
        $chapterIds = \App\Models\Chapter::where('branch_id', $branchId)->pluck('chapter_id');

        // ب. نجلب المشاريع التابعة لهذه الفصول
        $projects = Project::whereIn('chapter_id', $chapterIds)
                           ->with(['leader', 'members', 'society']) // جلب العلاقات المهمة للعرض
                           ->latest()
                           ->get();

        return response()->json([
            'message' => 'Branch projects retrieved successfully',
            'data' => $projects
        ]);
    }

    /**
     * تحديث حالة المشروع فقط
     * PATCH /api/projects/{project}/status
     */
    public function updateStatus(Request $request, $id)
    {
        // 💡 جلبنا المشروع مع الـ chapter الخاص به لنعرف إلى أي فرع ينتمي
        $project = Project::with('chapter')->findOrFail($id);
        $currentUser = $request->user();

        // 🛡️ 1. منطق الصلاحيات (Authorization Logic)
        if ($currentUser->role === 'Super Admin') {
            // السوبر أدمن يمر دائماً
        } 
        elseif ($currentUser->role === 'Branch Admin') {
            // التأكد أن المشروع يتبع لفصل (Chapter) موجود ضمن فرع (Branch) هذا المدير
            if ($project->chapter->branch_id !== $currentUser->branch_id) {
                return response()->json([
                    'message' => 'Unauthorized. You can only update projects within your own branch.'
                ], 403);
            }
        } 
        // 🌟 (اختياري) إذا كنت تريد السماح لقائد المشروع بتغيير حالته أيضاً:
        //  elseif ($project->leader_id === $currentUser->user_id) {
        //  يمر لأن هو قائد هذا المشروع
        // }
        else {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        // ✅ 2. التحقق من صحة البيانات
        $validated = $request->validate([
            'status' => 'required|in:Open,Ongoing,Completed,Cancelled'
        ]);
        
        // 🔄 3. تحديث الحالة
        $project->update($validated);
        
        return response()->json([
            'message' => 'Project status updated successfully', 
            'data' => $project
        ]);
    }
}