<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Project;
use App\Http\Requests\CreateProjectRequest;
use App\Services\VolunteerMatchingService;

class ProjectController extends Controller
{
    /**
     * Display a listing of the projects.
     */
    public function index()
    {
        // جلب المشاريع مع معلومات القائد والأعضاء لتسهيل عرضها بالفرونت إند
        $projects = Project::with(['leader', 'members', 'requiredRoles', 'requiredSkills'])->get();
        return response()->json($projects);
    }

    /**
     * Store a newly created project in storage.
     * POST /api/projects
     */
    public function store(CreateProjectRequest $request)
    {
        $validated = $request->validated();

        // ✂️ عزل الأدوار المطلوبة من الداتا الأساسية حتى ما تضرب الداتابيز
        $roles = $validated['required_roles'] ?? null;
        $skills = $validated['required_skills'] ?? null;
        unset($validated['required_roles'], $validated['required_skills']);

        // 1. إنشاء المشروع الأساسي بالداتا الصافية
        $project = \App\Models\Project::create($validated);


        // 1. 🛑 إنشاء وربط الأدوار (هذا الجزء كان مفقوداً!)
        if ($roles) {
            $project->requiredRoles()->createMany($roles);
        }
        // 2. إذا تم إرسال مصفوفة الأدوار المطلوبة، نقوم بإنشائها وربطها
        if ($skills) {
            foreach ($skills as $skill) {
                $project->requiredSkills()->attach($skill['skill_id'], [
                    'min_level' => $skill['min_level'],
                    'weight' => $skill['weight']
                ]);
            }
        }

        return response()->json([
            'message' => 'Project created successfully', 
            'data' => $project->load(['requiredRoles', 'requiredSkills'])
        ], 201);
    }

    /**
     * Display the specified project with its details.
     */
    /**
     * جلب تفاصيل مشروع محدد (Get Project Details)
     * GET /api/projects/{id}
     */
    public function show(Request $request, $id)
    {
        // 1. جلب المشروع مع كافة العلاقات المهمة (الفصل، القائد، الأدوار، المهارات، والأعضاء)
        $project = \App\Models\Project::with([
            'chapter',
            'leader:user_id,full_name,email,profile_photo', // نكتفي بجلب البيانات الأساسية للقائد
            'requiredRoles',
            'requiredSkills',
            'members'
        ])->findOrFail($id);

        $currentUser = $request->user();

        // حماية أمنية
        $isAdmin = in_array($currentUser->role, ['Super Admin', 'Branch Admin', 'Chapter Chair']);
        $isLeader = $project->leader_id === $currentUser->user_id;

        // 💡 منطق الحماية للمتطوع العادي:
        // إذا كان المستخدم متطوعاً وليس له صفة إدارية على هذا المشروع،
        // يُمنع من رؤية تفاصيل المشروع إذا كان لا يزال قيد الانتظار (Pending) أو مرفوضاً (Rejected).
        if (!$isAdmin && !$isLeader && $project->approval_status !== 'Approved') {
            return response()->json(['message' => 'Unauthorized view.'], 403);
        }

        // ✅ 3. إرجاع النتيجة
        return response()->json([
            'message' => 'Project details retrieved successfully',
            'data' => $project
        ]);
    }

    /**
     * Update the specified project in storage.
     * PUT/PATCH /api/projects/{id}
     */
    public function update(Request $request, $id)
    {
        $project = \App\Models\Project::with('chapter')->findOrFail($id);
        $currentUser = $request->user();

        // 🛡️ 1. الحماية الأمنية
        $isSuperAdmin = $currentUser->role === 'Super Admin';
        $isBranchAdmin = $currentUser->role === 'Branch Admin' && $currentUser->branch_id === $project->chapter->branch_id;
        $isChapterChair = $currentUser->role === 'Chapter Chair' && $project->chapter->chair_id === $currentUser->user_id;
        $isProjectLeader = $currentUser->role === 'Project Leader' && $project->leader_id === $currentUser->user_id;

        if (!$isSuperAdmin && !$isBranchAdmin && !$isChapterChair && !$isProjectLeader) {
            return response()->json(['message' => 'Unauthorized to edit this project.'], 403);
        }

        // ✅ 2. التحقق من صحة البيانات المرسلة
        $validated = $request->validate([
            'title' => 'sometimes|string|max:200',
            'description' => 'nullable|string',
            'max_members' => 'nullable|integer|min:1',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'status' => 'sometimes|in:Open,Ongoing,Completed,Cancelled',
            // المهارات المطلوبة
            'required_skills' => 'nullable|array',
            'required_skills.*.skill_id' => 'required_with:required_skills|exists:skills,skill_id',
            'required_skills.*.min_level' => 'required_with:required_skills|integer|min:1|max:5',
            'required_skills.*.weight' => 'required_with:required_skills|numeric|min:0',
            // الأدوار المطلوبة
            'required_roles' => 'nullable|array',
            'required_roles.*.role_name' => 'required_with:required_roles|string',
            'required_roles.*.required_count' => 'required_with:required_roles|integer',
        ]);
// 🔄 تحديث الأدوار (حذف وإعادة إنشاء)
        if (array_key_exists('required_roles', $validated)) {
            $project->requiredRoles()->delete();
            if (!empty($validated['required_roles'])) {
                $project->requiredRoles()->createMany($validated['required_roles']);
            }
            unset($validated['required_roles']);
        }

        $project->update($validated);

        return response()->json([
            'message' => 'Project updated successfully', 
            'data' => $project->load(['requiredRoles', 'requiredSkills'])
        ]);
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
     * جلب كافة المشاريع التابعة لفرع محدد (مع حماية الخصوصية وفلترة حالة الموافقة)
     * GET /api/branches/{branch_id}/projects
     */
    /**
     * جلب كافة المشاريع التابعة لفرع محدد (مع حماية الخصوصية وفلترة حالة الموافقة والحالة)
     * GET /api/branches/{branch_id}/projects
     */
    public function getBranchProjects(Request $request, $branchId)
    {
        $currentUser = $request->user();

        // 🛡️ 1. منطق الحماية (Authorization Logic) - هاد الجزء المفقود والمهم جداً!
        // أ. السوبر أدمن مسموح له يشوف أي برانش في النظام.
        // ب. مدير الفرع مسموح له فقط إذا كان الـ branch_id في الرابط يطابق الـ branch_id تبعه.
        if ($currentUser->role === 'Branch Admin') {
            if ((int)$branchId !== (int)$currentUser->branch_id) {
                return response()->json([
                    'message' => 'Unauthorized. You can only view projects for your own branch.'
                ], 403);
            }
        } 
        // ج. أي دور آخر (متطوع مثلاً) ممنوع من الوصول لهذه القائمة الشاملة للفرع
        elseif ($currentUser->role !== 'Super Admin') {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        // ✅ 2. جلب البيانات (مع تطبيق الفلاتر والعلاقات):
        
        // أ. نجلب أرقام الفصول التابعة لهذا الفرع
        $chapterIds = \App\Models\Chapter::where('branch_id', $branchId)->pluck('chapter_id');

        // ب. نبدأ ببناء استعلام المشاريع التابعة لهذه الفصول
        $query = \App\Models\Project::whereIn('chapter_id', $chapterIds)
                                    ->with(['leader', 'members', 'chapter', 'requiredRoles', 'requiredSkills']);

        // 🔍 ج. تطبيق فلتر حالة الموافقة (Approval Status)
        if ($request->has('approval_status')) {
            $query->where('approval_status', $request->query('approval_status'));
        }

        // 🔍 د. تطبيق فلتر حالة المشروع (Project Status) - كان مفقوداً في نسختك
        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        // هـ. جلب النتائج (أحدثها أولاً)
        $projects = $query->latest()->get();

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
        // 💡 جلبنا المشروع مع الـ chapter الخاص به لنعرف كل التفاصيل (الفرع، رئيس الفصل، والقائد)
        $project = Project::with('chapter')->findOrFail($id);
        $currentUser = $request->user();

        // 🛡️ 1. منطق الصلاحيات (Authorization Logic)
        $isSuperAdmin = $currentUser->role === 'Super Admin';
        
        $isBranchAdmin = $currentUser->role === 'Branch Admin' 
                        && $currentUser->branch_id === $project->chapter->branch_id;
        
        // شرط رئيس الفصل: يجب أن يكون هو رئيس الفصل (Chair) الذي يتبع له هذا المشروع
        $isChapterChair = $currentUser->role === 'Chapter Chair' 
                        && $project->chapter->chair_id === $currentUser->user_id;
        
        // شرط قائد المشروع: يجب أن يكون هو القائد (Leader) المعين لهذا المشروع تحديداً
        $isProjectLeader = $currentUser->role === 'Project Leader' 
                        && $project->leader_id === $currentUser->user_id;

        // التحقق الشامل
        if (!$isSuperAdmin && !$isBranchAdmin && !$isChapterChair && !$isProjectLeader) {
            return response()->json([
                'message' => 'Unauthorized. You do not have permission to update this project\'s status.'
            ], 403);
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
     * جلب كافة المشاريع التابعة لفصل محدد (مع حماية الخصوصية وفلتر الموافقة والحالة)
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
            // 💡 نسمح للمتطوع برؤية المشاريع بشرط أن يكون منضماً كعضو في هذا الفصل تحديداً
            $isMember = $chapter->members()->where('users.user_id', $currentUser->user_id)->exists();
            if (!$isMember) {
                return response()->json(['message' => 'Unauthorized to view this chapter\'s projects.'], 403);
            }
        }

        // ✅ 2. جلب المشاريع (مع تطبيق الفلاتر)
        $query = \App\Models\Project::where('chapter_id', $chapterId)
                                    ->with(['leader', 'members', 'requiredRoles']); // جلب معلومات القائد والأعضاء للعرض

        // 🛡️ حماية إضافية ذكية (Approval Status)
        if (!in_array($currentUser->role, ['Super Admin', 'Branch Admin', 'Chapter Chair'])) {
            $query->where('approval_status', 'Approved');
        } else {
            if ($request->has('approval_status')) {
                $query->where('approval_status', $request->query('approval_status'));
            }
        }

        // 🔍 فلترة جديدة: حسب حالة المشروع (Project Status)
        // مسموحة للجميع (إدارة أو متطوعين) ليتمكنوا من تصفية المشاريع (مثلاً: المفتوحة فقط)
        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        $projects = $query->latest()->get();

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

    /**
     * موافقة الإدارة على المشروع
     * PATCH /api/projects/{id}/approve
     */
    public function approveProject(Request $request, $id)
    {
        $project = \App\Models\Project::with('chapter')->findOrFail($id);
        $currentUser = $request->user();

        // 🛡️ الحماية الأمنية
        if ($currentUser->role === 'Super Admin') {
            // مسموح
        } elseif ($currentUser->role === 'Branch Admin') {
            if ($project->chapter && $project->chapter->branch_id !== $currentUser->branch_id) {
                return response()->json(['message' => 'Unauthorized. You can only approve projects within your own branch.'], 403);
            }
        } else {
            return response()->json(['message' => 'Unauthorized action. Only Admins can approve projects.'], 403);
        }

        // التحقق إذا كان موافق عليه مسبقاً
        if ($project->approval_status === 'Approved') {
            return response()->json(['message' => 'Project is already approved.', 'data' => $project], 200);
        }

        // 🔄 السحر هنا: تحديث حالة الموافقة، وحالة المشروع، وتسجيل بيانات الأدمن
        $project->update([
            'approval_status' => 'Approved',
            'status' => 'Open', // تحويل حالة المشروع لـ Open ليتاح للمتطوعين
            'approved_by' => $currentUser->user_id, // تسجيل من قام بالموافقة
            'approved_at' => now() // تسجيل وقت الموافقة
        ]);

        return response()->json([
            'message' => 'Project has been approved and is now Open.',
            'data' => $project
        ]);
    }

    /**
     * رفض الإدارة للمشروع
     * PATCH /api/projects/{id}/reject
     */
    public function rejectProject(Request $request, $id)
    {
        $project = \App\Models\Project::with('chapter')->findOrFail($id);
        $currentUser = $request->user();

        // نفس الحماية الأمنية تماماً تبع الموافقة
        if ($currentUser->role !== 'Super Admin' && !($currentUser->role === 'Branch Admin' && $project->chapter->branch_id === $currentUser->branch_id)) {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        $project->update([
            'approval_status' => 'Rejected',
            'status' => 'Cancelled' // إذا انرفض، بيصير ملغى
        ]);

        return response()->json([
            'message' => 'Project has been rejected.',
            'data' => $project
        ]);
    }
    
    /**
     * الحصول على توصيات الذكاء الاصطناعي للمتقدمين لدور معين
     * GET /api/projects/{project_id}/recommendations?role=اسم_الدور
     */
    public function getAiRecommendations(Request $request, $projectId, VolunteerMatchingService $aiService)
    {
        // 1. جلب المشروع للتحقق من الصلاحيات
        $project = \App\Models\Project::with('chapter')->findOrFail($projectId);
        $currentUser = $request->user();

        // 🛡️ 2. الحماية الأمنية: الإدارة وقائد المشروع فقط
        $isSuperAdmin = $currentUser->role === 'Super Admin';
        $isBranchAdmin = $currentUser->role === 'Branch Admin' && $currentUser->branch_id === $project->chapter->branch_id;
        $isChapterChair = $currentUser->role === 'Chapter Chair' && $project->chapter->chair_id === $currentUser->user_id;
        $isProjectLeader = $currentUser->role === 'Project Leader' && $project->leader_id === $currentUser->user_id;

        if (!$isSuperAdmin && !$isBranchAdmin && !$isChapterChair && !$isProjectLeader) {
            return response()->json([
                'message' => 'Unauthorized. Only the Project Leader or Admins can view recommendations.'
            ], 403);
        }

        // ✅ 3. التحقق من تمرير الدور المطلوب (Role) في الرابط (Query Parameter)
        $request->validate([
            'role' => 'required|string|max:100' // يجب تحديد الدور لفرز المتقدمين له حصراً
        ]);

        $roleName = $request->query('role');

        // 🤖 4. استدعاء خدمة الذكاء الاصطناعي لحساب السكور وترتيب المتقدمين
        $recommendations = $aiService->getRecommendationsForRole($project, $roleName);

        // 5. إرجاع النتيجة
        return response()->json([
            'message' => 'AI Recommendations generated successfully',
            'role_requested' => $roleName,
            'data' => $recommendations
        ]);
    }
}