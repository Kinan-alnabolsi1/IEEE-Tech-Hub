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
     * Volunteer applies to join a project with a specific role.
     * POST /api/projects/{project_id}/join
     */
    public function joinProject(Request $request, $projectId)
    {
        // 1. التحقق من صحة البيانات (الـ role مطلوب الآن)
        $request->validate([
            'role' => 'required|string|max:100' // مثال: "Front-End Developer" أو "UI/UX"
        ]);

        $project = \App\Models\Project::findOrFail($projectId);
        $user = $request->user();
        
        // 2. منع المستخدم من التقديم مرتين لنفس المشروع (بغض النظر عن الـ Role)
        if ($project->members()->where('users.user_id', $user->user_id)->exists()) {
            return response()->json(['message' => 'Already applied to this project'], 409);
        }

        // 3. إضافة المتطوع مع تحديد الـ Role الذي قدم عليه وحالته Pending
        $project->members()->attach($user->user_id, [
            'role' => $request->role, // 👈 حفظ الـ Role المطلوب
            'status' => 'Pending',
            'applied_at' => now()
        ]);

        return response()->json(['message' => 'Application submitted successfully for role: ' . $request->role]);
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
        $currentUser = $request->user();

        // 🛡️ الحماية الأمنية: مسموح فقط لقائد هذا المشروع (أو السوبر أدمن)
        $isSuperAdmin = $currentUser->role === 'Super Admin';
        $isProjectLeader = $currentUser->role === 'Project Leader' && $project->leader_id === $currentUser->user_id;

        if (!$isSuperAdmin && !$isProjectLeader) {
            return response()->json([
                'message' => 'Unauthorized. Only the Project Leader can approve members.'
            ], 403);
        }

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
        $currentUser = $request->user();

        // 🛡️ الحماية الأمنية: مسموح فقط لقائد هذا المشروع (أو السوبر أدمن)
        $isSuperAdmin = $currentUser->role === 'Super Admin';
        $isProjectLeader = $currentUser->role === 'Project Leader' && $project->leader_id === $currentUser->user_id;

        if (!$isSuperAdmin && !$isProjectLeader) {
            return response()->json([
                'message' => 'Unauthorized. Only the Project Leader can reject members.'
            ], 403);
        }

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

    /**
     * جلب كافة المشاريع التابعة لفصل محدد (مع حماية الخصوصية)
     * GET /api/chapters/{chapter_id}/projects
     */
    public function getChapterProjects(Request $request, $chapterId)
    {
        $chapter = \App\Models\Chapter::findOrFail($chapterId);
        $currentUser = $request->user();

        // 🛡️ 1. الحماية الأمنية (Authorization Logic)
        if ($currentUser->role === 'Super Admin') {
            // مسموح دائماً
        } elseif ($currentUser->role === 'Branch Admin' && $currentUser->branch_id === $chapter->branch_id) {
            // مسموح لمدير الفرع رؤية مشاريع الفصول التابعة لفرعه فقط
        } elseif ($currentUser->role === 'Chapter Chair' && $chapter->chair_id === $currentUser->user_id) {
            // مسموح لرئيس الفصل رؤية مشاريع فصله فقط
        } else {
            // 💡 إضافة ذكية: نسمح للمتطوع برؤية المشاريع (ليتمكن من التقديم عليها) 
            // بشرط أن يكون منضماً كعضو في هذا الفصل تحديداً
            $isMember = $chapter->members()->where('users.user_id', $currentUser->user_id)->exists();
            if (!$isMember) {
                return response()->json(['message' => 'Unauthorized to view this chapter\'s projects.'], 403);
            }
        }

        // ✅ 2. جلب المشاريع
        $projects = Project::where('chapter_id', $chapterId)
                           ->with(['leader', 'members']) // جلب معلومات القائد والأعضاء للعرض
                           ->latest() // ترتيب من الأحدث للأقدم
                           ->get();

        return response()->json([
            'message' => 'Chapter projects retrieved successfully',
            'data' => $projects
        ]);
    }

    /**
     * جلب طلبات الانضمام لمشروع محدد (Project Applications)
     * GET /api/projects/{project_id}/applications
     */
    /**
     * جلب طلبات الانضمام لمشروع محدد (مع دعم الفلترة حسب الحالة والدور)
     * GET /api/projects/{project_id}/applications
     */
    public function getApplications(Request $request, $projectId)
    {
        // 💡 جلب المشروع مع الفصل للتحقق من الصلاحيات
        $project = \App\Models\Project::with('chapter')->findOrFail($projectId);
        $currentUser = $request->user();

        // 🛡️ 1. الحماية الأمنية (Authorization Logic)
        $isSuperAdmin = $currentUser->role === 'Super Admin';
        $isBranchAdmin = $currentUser->role === 'Branch Admin' && $currentUser->branch_id === $project->chapter->branch_id;
        $isChapterChair = $currentUser->role === 'Chapter Chair' && $project->chapter->chair_id === $currentUser->user_id;
        $isProjectLeader = $currentUser->role === 'Project Leader' && $project->leader_id === $currentUser->user_id;

        if (!$isSuperAdmin && !$isBranchAdmin && !$isChapterChair && !$isProjectLeader) {
            return response()->json([
                'message' => 'Unauthorized to view applications for this project.'
            ], 403);
        }

        // ✅ 2. بناء الاستعلام وجلب الطلبات
        $status = $request->query('status', 'Pending'); // الافتراضي Pending
        
        $query = $project->members()->wherePivot('status', $status);

        // 🔍 فلترة ذكية: إذا تم تمرير الـ role في الرابط، بنفلتر على أساسه
        if ($request->has('role')) {
            $query->wherePivot('role', $request->query('role'));
        }

        $applications = $query->get();

        return response()->json([
            'message' => "Project applications retrieved successfully",
            'data' => $applications
        ]);
    }

    /**
     * تعيين أو تغيير قائد المشروع (Assign Project Leader)
     * PATCH /api/projects/{project_id}/assign-leader
     */
    /**
     * تعيين أو قبول قائد المشروع من بين المتقدمين (Assign Project Leader)
     * PATCH /api/projects/{project_id}/assign-leader
     */
    public function assignLeader(Request $request, $projectId)
    {
        $request->validate([
            'user_id' => 'required|exists:users,user_id'
        ]);

        $project = \App\Models\Project::findOrFail($projectId);
        $newUser = \App\Models\User::findOrFail($request->user_id);

        // 1. التعامل مع القائد القديم (إذا كان هناك قائد سابق أردنا تغييره)
        if ($project->leader_id && $project->leader_id != $newUser->user_id) {
            $oldLeader = \App\Models\User::find($project->leader_id);
            if ($oldLeader) {
                // نرجعه لمتطوع فقط إذا لم يكن قائداً لمشاريع أخرى
                $leadsOtherProjects = \App\Models\Project::where('leader_id', $oldLeader->user_id)
                                                         ->where('project_id', '!=', $projectId)
                                                         ->exists();
                if (!$leadsOtherProjects) {
                    $oldLeader->update(['role' => 'Volunteer']);
                }
            }
        }

        // 2. تحديث المشروع بالقائد الجديد
        $project->update(['leader_id' => $newUser->user_id]);

        // 3. تحديث دور المستخدم الجديد ليصبح Project Leader في النظام بأكمله
        if (!in_array($newUser->role, ['Super Admin', 'Branch Admin', 'Chapter Chair', 'Project Leader'])) {
            $newUser->update(['role' => 'Project Leader']);
        }

        // 4. 🔥 الجديد: تحديث حالة طلب الانضمام في الجدول الوسيط ليصبح مقبولاً كقائد
        $existingMembership = $project->members()->where('users.user_id', $newUser->user_id)->first();
        
        if ($existingMembership) {
            // إذا كان مقدم طلب، نحدث طلبه ليصبح مقبولاً
            $project->members()->updateExistingPivot($newUser->user_id, [
                'status' => 'Approved',
                'role' => 'Project Leader',
                'joined_at' => now()
            ]);
        } else {
            // إذا لم يكن مقدم طلب (ورئيس الفصل اختاره مباشرة)، نضيفه كعضو مقبول
            $project->members()->attach($newUser->user_id, [
                'status' => 'Approved',
                'role' => 'Project Leader',
                'applied_at' => now(),
                'joined_at' => now()
            ]);
        }

        return response()->json([
            'message' => "Project Leader assigned successfully, application approved, and role updated.",
            'data' => $project->load('leader')
        ]);
    }

    /**
     * عزل قائد المشروع (Remove Project Leader)
     * DELETE /api/projects/{project_id}/leader
     */
    public function removeLeader($projectId)
    {
        $project = \App\Models\Project::findOrFail($projectId);

        if (!$project->leader_id) {
            return response()->json(['message' => 'This project already has no leader.'], 400);
        }

        $oldLeader = \App\Models\User::find($project->leader_id);

        // 1. تصفير القائد في المشروع
        $project->update(['leader_id' => null]);

        // 2. إرجاع القائد القديم إلى متطوع (إذا لم يكن لديه مشاريع أخرى)
        if ($oldLeader) {
            $leadsOtherProjects = \App\Models\Project::where('leader_id', $oldLeader->user_id)->exists();
            if (!$leadsOtherProjects) {
                $oldLeader->update(['role' => 'Volunteer']);
            }
        }

        return response()->json([
            'message' => 'Project Leader removed successfully.'
        ]);
    }
    
    /**
     * جلب إحصائيات المشروع (Project Stats)
     * GET /api/projects/{project_id}/stats
     */
    public function getStats(Request $request, $projectId)
    {
        $project = \App\Models\Project::with('chapter')->findOrFail($projectId);
        $currentUser = $request->user();

        // 🛡️ الحماية الأمنية: مسموح للقائد والإدارة فقط
        $isSuperAdmin = $currentUser->role === 'Super Admin';
        $isBranchAdmin = $currentUser->role === 'Branch Admin' && $currentUser->branch_id === $project->chapter->branch_id;
        $isChapterChair = $currentUser->role === 'Chapter Chair' && $project->chapter->chair_id === $currentUser->user_id;
        $isProjectLeader = $currentUser->role === 'Project Leader' && $project->leader_id === $currentUser->user_id;

        if (!$isSuperAdmin && !$isBranchAdmin && !$isChapterChair && !$isProjectLeader) {
            return response()->json(['message' => 'Unauthorized to view project stats.'], 403);
        }

        // 📊 1. إحصائيات المهام
        $tasksQuery = \App\Models\Task::where('project_id', $projectId);
        
        $totalTasks = $tasksQuery->count();
        $completedTasks = (clone $tasksQuery)->where('status', 'Completed')->count();
        $inProgressTasks = (clone $tasksQuery)->where('status', 'In Progress')->count();
        
        // المهام المتأخرة (تاريخ التسليم أصغر من تاريخ اليوم ولسا ما خلصت)
        $overdueTasks = (clone $tasksQuery)->where('status', '!=', 'Completed')
                                           ->whereNotNull('due_date')
                                           ->where('due_date', '<', now()->toDateString())
                                           ->count();

        // 📈 2. حساب نسبة الإنجاز الكلية للمشروع
        $taskIds = (clone $tasksQuery)->pluck('task_id');
        $overallProgress = 0;
        
        if ($taskIds->isNotEmpty()) {
            // نأخذ المتوسط الحسابي لنسب الإنجاز من جدول التكليفات (Task Assignments)
            $avgPct = \App\Models\TaskAssignment::whereIn('task_id', $taskIds)->avg('completion_pct');
            $overallProgress = round($avgPct ?? 0); // تقريب الرقم لأقرب عدد صحيح
        }

        // 👥 3. إحصائيات الفريق
        $activeMembers = $project->members()->wherePivot('status', 'Approved')->count();
        $pendingApplications = $project->members()->wherePivot('status', 'Pending')->count();

        return response()->json([
            'message' => 'Project statistics retrieved successfully',
            'data' => [
                'progress' => [
                    'overall_percentage' => $overallProgress,
                    'total_tasks' => $totalTasks,
                    'completed_tasks' => $completedTasks,
                    'in_progress_tasks' => $inProgressTasks,
                    'overdue_tasks' => $overdueTasks,
                ],
                'team' => [
                    'active_members' => $activeMembers,
                    'pending_applications' => $pendingApplications,
                ]
            ]
        ]);
    }
}