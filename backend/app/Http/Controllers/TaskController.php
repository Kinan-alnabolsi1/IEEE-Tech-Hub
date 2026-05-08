<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskAssignment;
use App\Models\Project;
use App\Http\Requests\CreateTaskRequest;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    /**
     * التحقق من الصلاحيات الإدارية على المشروع
     * (مساعدة داخلية لمنع تكرار الكود)
     */
    private function hasManagePermission($user, $project)
    {
        $isSuperAdmin = $user->role === 'Super Admin';
        $isBranchAdmin = $user->role === 'Branch Admin' && $user->branch_id === $project->chapter->branch_id;
        $isChapterChair = $user->role === 'Chapter Chair' && $project->chapter->chair_id === $user->user_id;
        $isProjectLeader = $user->role === 'Project Leader' && $project->leader_id === $user->user_id;

        return $isSuperAdmin || $isBranchAdmin || $isChapterChair || $isProjectLeader;
    }

    /**
     * جلب جميع المهام الخاصة بمشروع محدد (مع دعم الفلترة)
     * GET /api/tasks?project_id=1
     */
    public function index(Request $request)
    {
        $request->validate(['project_id' => 'required|exists:projects,project_id']);
        
        $project = Project::with('chapter')->findOrFail($request->project_id);
        $currentUser = $request->user();

        // السماح للإدارة أو لأي عضو "مقبول" في المشروع برؤية المهام
        $isMember = $project->members()->where('users.user_id', $currentUser->user_id)
                                       ->wherePivot('status', 'Approved')->exists();

        if (!$this->hasManagePermission($currentUser, $project) && !$isMember) {
            return response()->json(['message' => 'Unauthorized to view these tasks.'], 403);
        }

        // 🔍 بناء الاستعلام مع الفلترة الديناميكية
        $query = Task::where('project_id', $project->project_id)->with('assignees');

        // 1. فلترة حسب الحالة (To Do, In Progress, Completed)
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // 2. فلترة المهام المتأخرة (is_overdue=true)
        if ($request->has('is_overdue') && $request->is_overdue == 'true') {
            $query->where('status', '!=', 'Completed')
                  ->whereNotNull('due_date')
                  ->where('due_date', '<', now()->toDateString());
        }

        $tasks = $query->latest()->get();

        return response()->json([
            'message' => 'Tasks retrieved successfully', 
            'data' => $tasks
        ]);
    }

    /**
     * إنشاء مهمة جديدة
     * POST /api/tasks
     */
    public function store(CreateTaskRequest $request)
    {
        $validated = $request->validated();
        $project = Project::with('chapter')->findOrFail($validated['project_id']);
        
        // حماية: فقط الإدارة أو قائد المشروع يمكنهم إنشاء المهام
        if (!$this->hasManagePermission($request->user(), $project)) {
            return response()->json(['message' => 'Unauthorized to create tasks for this project.'], 403);
        }

        $task = Task::create([
            'project_id' => $validated['project_id'],
            'created_by' => $request->user()->user_id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'priority' => $validated['priority'],
            'due_date' => $validated['due_date'] ?? null,
            'status' => 'To Do'
        ]);

        // If users were provided, assign them
        if (!empty($validated['assigned_users'])) {
            foreach ($validated['assigned_users'] as $userId) {
                TaskAssignment::create([
                    'task_id' => $task->task_id,
                    'user_id' => $userId,
                    'assigned_by' => $request->user()->user_id,
                    'assigned_at' => now(),
                ]);
            }
        }

        return response()->json([
            'message' => 'Task created successfully', 
            'task' => $task->load('assignees')
        ], 201);
    }

    /**
     * عرض تفاصيل مهمة محددة
     * GET /api/tasks/{task}
     */
    public function show(string $id, Request $request)
    {
        $task = Task::with(['assignees', 'project.chapter'])->findOrFail($id);
        $currentUser = $request->user();

        $isMember = $task->project->members()->where('users.user_id', $currentUser->user_id)
                                             ->wherePivot('status', 'Approved')->exists();

        if (!$this->hasManagePermission($currentUser, $task->project) && !$isMember) {
            return response()->json(['message' => 'Unauthorized to view this task.'], 403);
        }

        return response()->json(['data' => $task]);
    }

    /**
     * تحديث بيانات المهمة الأساسية
     * PUT/PATCH /api/tasks/{task}
     */
    public function update(Request $request, string $id)
    {
        $task = Task::with('project.chapter')->findOrFail($id);
        
        if (!$this->hasManagePermission($request->user(), $task->project)) {
            return response()->json(['message' => 'Unauthorized to update this task.'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:200',
            'description' => 'nullable|string',
            'priority' => 'sometimes|in:Low,Medium,High',
            'status' => 'sometimes|in:To Do,In Progress,Completed',
            'due_date' => 'nullable|date'
        ]);

        $task->update($validated);

        return response()->json([
            'message' => 'Task updated successfully', 
            'data' => $task->load('assignees')
        ]);
    }

    /**
     * حذف المهمة
     * DELETE /api/tasks/{task}
     */
    public function destroy(string $id, Request $request)
    {
        $task = Task::with('project.chapter')->findOrFail($id);
        
        if (!$this->hasManagePermission($request->user(), $task->project)) {
            return response()->json(['message' => 'Unauthorized to delete this task.'], 403);
        }

        $task->delete();

        return response()->json(['message' => 'Task deleted successfully']);
    }

    /**
     * تحديث نسبة إنجاز المهمة (من قبل المتطوع المُسندة إليه)
     * PATCH /api/tasks/assignments/{assignmentId}/progress
     */
    public function updateProgress(Request $request, $assignmentId)
    {
        $request->validate([
            'completion_pct' => 'required|integer|min:0|max:100',
            'progress_note' => 'nullable|string'
        ]);

        $assignment = TaskAssignment::findOrFail($assignmentId);

        // Ensure only the assigned user can update their progress
        if ($assignment->user_id !== $request->user()->user_id) {
            return response()->json(['message' => 'Unauthorized to update this assignment progress.'], 403);
        }

        $assignment->update([
            'completion_pct' => $request->completion_pct,
            'progress_note' => $request->progress_note,
            'completed_at' => $request->completion_pct == 100 ? now() : null
        ]);

        // تحديث حالة المهمة الرئيسية إذا لزم الأمر
        $task = Task::find($assignment->task_id);
        if ($request->completion_pct > 0 && $request->completion_pct < 100 && $task->status === 'To Do') {
            $task->update(['status' => 'In Progress']);
        }

        return response()->json(['message' => 'Progress updated', 'data' => $assignment]);
    }

    /**
     * تقييم أداء متطوع في مهمة محددة
     * POST /api/tasks/{taskId}/evaluate-member/{userId}
     */
    public function evaluateTaskMember(Request $request, $taskId, $userId)
    {
        // 1. التحقق من المدخلات (التقييم من 1 لـ 5 إجباري، والتعليق اختياري)
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'leader_feedback' => 'nullable|string|max:1000'
        ]);

        // 2. جلب المهمة مع المشروع التابعة له للتحقق من الصلاحيات
        $task = \App\Models\Task::with('project')->findOrFail($taskId);
        $currentUser = $request->user();

        // 🛡️ 3. الحماية: التأكد أن المستخدم هو السوبر أدمن أو قائد هذا المشروع تحديداً
        $isSuperAdmin = $currentUser->role === 'Super Admin';
        $isProjectLeader = $currentUser->role === 'Project Leader' && $task->project->leader_id === $currentUser->user_id;

        if (!$isSuperAdmin && !$isProjectLeader) {
            return response()->json([
                'message' => 'Unauthorized. Only the Project Leader of this project (or Admins) can evaluate members.'
            ], 403);
        }

        // 4. التأكد أن المتطوع المراد تقييمه هو فعلاً موجود ضمن هذه المهمة
        // 💡 استخدمنا exists() بدل first() لأنها أسرع بكثير في قواعد البيانات (ما بتجيب الداتا، بس بتتأكد من وجودها)
        $isAssigned = $task->assignees()->where('users.user_id', $userId)->exists();

        if (!$isAssigned) {
            return response()->json([
                'message' => 'This volunteer is not assigned to this task.'
            ], 404);
        }

        // 💡 5. (اختياري) يمكنك إضافة شرط يمنع التقييم إلا إذا كانت المهمة Completed
        // if ($task->status !== 'Completed') {
        //     return response()->json(['message' => 'Cannot evaluate an incomplete task.'], 400);
        // }

        // 🔄 6. تحديث الجدول الوسيط (task_assignments) بالتقييم
        $task->assignees()->updateExistingPivot($userId, [
            'rating' => $validated['rating'],
            'leader_feedback' => $validated['leader_feedback'] ?? null,
            'evaluated_at' => now(), // تسجيل وقت التقييم
        ]);

        return response()->json([
            'message' => 'Task evaluation submitted successfully.',
            'data' => [
                'user_id' => (int) $userId,
                'task_id' => (int) $taskId,
                'rating' => $validated['rating'],
                'feedback' => $validated['leader_feedback'] ?? null,
            ]
        ]);
    }
}