<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{

/**
     * Get a list of users, with optional filtering by role and status.
     * GET /api/users?role=Branch Admin&status=Pending
     */
    public function index(Request $request)
    {
        // بناء الاستعلام بناءً على الفلاتر القادمة من الفرونت إند
        $query = User::query();

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // جلب البيانات (أحدثها أولاً)
        $users = $query->latest()->get();

        return response()->json([
            'message' => 'Users retrieved successfully',
            'data' => $users
        ]);
    }

    /**
     * Update the status of a specific user.
     * PATCH /api/users/{user_id}/status
     */
    public function updateStatus(Request $request, $id)
    {
        $targetUser = \App\Models\User::findOrFail($id);
        $currentUser = $request->user();

        // 🛡️ 1. منطق الصلاحيات (Authorization Logic)
        if ($currentUser->role === 'Super Admin') {
            // السوبر أدمن يمر بدون أي قيود
        } elseif ($currentUser->role === 'Branch Admin') {
            // مدير الفرع: مسموح له فقط التعديل على أعضاء فرعه، وممنوع يعدل على أي Super Admin
            $isSameBranch = $targetUser->branch_id === $currentUser->branch_id;
            $isNotSuperAdmin = $targetUser->role !== 'Super Admin';

            if (!$isSameBranch || !$isNotSuperAdmin) {
                return response()->json([
                    'message' => 'Unauthorized action. You can only manage users within your own branch, and you cannot modify Super Admins.'
                ], 403);
            }
        } else {
            // طرد أي دور آخر (متطوعين الخ)
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        // ✅ 2. التحقق من صحة البيانات
        $validated = $request->validate([
            'status' => 'required|in:Pending,Active,Suspended,Rejected'
        ]);

        // 🔄 3. تحديث حالة المستخدم
        $targetUser->update($validated);

        $roleMessage = '';

        // 🔥 4. السحر هنا: ربط وفك ربط مدير الفرع بجدول الفروع 🔥
        if ($targetUser->role === 'Branch Admin') {
            $branch = \App\Models\Branch::find($targetUser->branch_id);
            
            if ($branch) {
                if ($validated['status'] === 'Active') {
                    // نربط الفرع بهذا المدير رسمياً
                    $branch->update(['admin_id' => $targetUser->user_id]);
                    $roleMessage = " They are now officially the Admin of branch: {$branch->name}.";
                } elseif (in_array($validated['status'], ['Suspended', 'Rejected'])) {
                    // نفك الارتباط إذا تم رفضه أو إيقافه (فقط إذا كان هو المدير الحالي)
                    if ($branch->admin_id === $targetUser->user_id) {
                        $branch->update(['admin_id' => null]);
                        $roleMessage = " They have been removed as the Admin of branch: {$branch->name}.";
                    }
                }
            }
        }

        return response()->json([
            'message' => "User status updated to {$validated['status']} successfully." . $roleMessage,
            'data' => $targetUser->load('branch') // نرجع بيانات الفرع للتأكيد للـ Frontend
        ]);
    }
    
    /**
     * Get the profile of a specific user.
     * GET /api/profile/{user_id}
     */
    public function showProfile($user_id)
    {
        // 1. جلب المستخدم مع مهاراته والمشاريع المقبول فيها
        $user = \App\Models\User::with([
            'skills',
            'enrolledProjects' // تعتمد على الجدول الوسيط الذي يحتوي على الـ Role
        ])->findOrFail($user_id);

        // 2. ترتيب بيانات المشاريع لتكون واضحة جداً للفرونت إند (Transformation)
        $formattedProjects = $user->enrolledProjects->map(function ($project) {
            return [
                'project_id' => $project->project_id,
                'title' => $project->title,
                'status' => $project->status,
                // 💡 السحر هنا: نسحب الدور من الجدول الوسيط
                'role_in_project' => $project->pivot->role ?? 'Member',
                'joined_at' => $project->pivot->joined_at,
            ];
        });

        // 3. إرجاع النتيجة مرتبة
        return response()->json([
            'message' => 'User profile retrieved successfully',
            'data' => [
                'user_info' => [
                    'user_id' => $user->user_id,
                    'full_name' => $user->full_name,
                    'email' => $user->email,
                    'role' => $user->role, // الدور العام في النظام (مثلاً: Project Leader أو Volunteer)
                    'faculty' => $user->faculty,
                    'major' => $user->major,
                    'bio' => $user->bio,
                ],
                'skills' => $user->skills, // ستتضمن الـ pivot الخاص بالتقييم والخبرة كما برمجناها سابقاً
                'projects' => $formattedProjects // 👈 مصفوفة المشاريع المنسقة
            ]
        ]);
    }

    /**
     * تحديث بيانات الملف الشخصي للمستخدم
     * PUT /api/profile/update
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        // 1. التحقق من صحة البيانات المرسلة (Validation)
        $validated = $request->validate([
            'full_name'      => 'sometimes|string|max:255',
            'phone'          => 'sometimes|string|max:20',
            'bio'            => 'nullable|string',
            'faculty'        => 'sometimes|string|max:150',
            'major'          => 'sometimes|string|max:150',
            'current_study_year' => 'sometimes|integer|min:1|max:7',
            
            // تحديث المهارات (اختياري)
            'skills'                    => 'nullable|array',
            'skills.*.skill_id'         => 'required_with:skills|exists:skills,skill_id',
            'skills.*.level'            => 'required_with:skills|integer|min:1|max:5',
            'skills.*.experience_years' => 'required_with:skills|integer|min:0',
        ]);

        // 2. تحديث البيانات الأساسية للمستخدم
        // استبعدنا الـ skills من مصفوفة التحديث الأساسية
        $userData = collect($validated)->except(['skills'])->toArray();
        $user->update($userData);

        // 3. تحديث المهارات (إذا تم إرسالها)
        if ($request->has('skills')) {
            $syncData = [];
            foreach ($validated['skills'] as $skill) {
                $syncData[$skill['skill_id']] = [
                    'level' => $skill['level'],
                    'experience_years' => $skill['experience_years']
                ];
            }
            // استخدام sync يمسح المهارات القديمة ويضيف الجديدة للحفاظ على نظافة البيانات
            $user->skills()->sync($syncData);
        }

        // 4. إرجاع البيانات كاملة بعد التحديث للتأكيد
        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => $user->load('skills')
        ]);
    }

    /**
     * إعداد الحساب (Onboarding / Create Profile)
     * POST /api/profile/onboarding
     */
    public function createProfile(Request $request)
    {
        $user = $request->user();
        
        // 1. التحقق من صحة البيانات
        $validated = $request->validate([
            'phone' => 'nullable|string|max:30',
            'bio' => 'nullable|string',
            'faculty' => 'nullable|string|max:150',
            'major' => 'nullable|string|max:150',
            'current_study_year' => 'nullable|integer|min:1|max:7',
            'enrollment_year' => 'nullable|integer|min:2000|max:' . (date('Y') + 1),
            'expected_graduation_date' => 'nullable|date',
            
            // 👈 التحقق من مصفوفة المهارات الجديدة
            'skills' => 'nullable|array',
            'skills.*.skill_id' => 'required_with:skills|exists:skills,skill_id',
            'skills.*.name' => 'nullable|string',
            'skills.*.level' => 'required_with:skills|integer|min:1|max:5', // نتوقع رقم من 1 لـ 5
            'skills.*.experience_years' => 'required_with:skills|integer|min:0'
        ]);

        // 2. تحديث بيانات المستخدم الأساسية
        $user->update([
            'phone' => $validated['phone'] ?? $user->phone,
            'bio' => $validated['bio'] ?? $user->bio,
            'faculty' => $validated['faculty'] ?? $user->faculty,
            'major' => $validated['major'] ?? $user->major,
            'current_study_year' => $validated['current_study_year'] ?? $user->current_study_year,
            'enrollment_year' => $validated['enrollment_year'] ?? $user->enrollment_year,
            'expected_graduation_date' => $validated['expected_graduation_date'] ?? $user->expected_graduation_date,
        ]);

        // 3. 🪄 السحر هنا: معالجة المهارات وربطها بجدول user_skills
        if ($request->has('skills')) {
            $syncData = [];
            
            // تحويل المصفوفة للشكل الذي تقبله دالة sync في لارافل
            foreach ($request->skills as $skill) {
                $syncData[$skill['skill_id']] = [
                    'level' => $skill['level'],
                    'experience_years' => $skill['experience_years']
                ];
            }
            
            // تنفيذ الربط (سيقوم بمسح المهارات القديمة وإضافة الجديدة مع تفاصيلها)
            $user->skills()->sync($syncData);
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => $user->load('skills') // نرجع المستخدم مع مهاراته للتأكيد
        ]);
    }

    /**
     * جلب مشاريعي وطلبات الانضمام (My Projects & Applications)
     * GET /api/my-projects
     */
    public function myProjects(Request $request)
    {
        $user = $request->user();
        
        // 💡 بما أن withPivot موجودة في المودل، نحتاج فقط للترتيب والجلب
        $projects = $user->projects()
                         ->orderByPivot('applied_at', 'desc')
                         ->get();

        return response()->json([
            'message' => 'My projects and applications retrieved successfully',
            'data' => $projects
        ]);
    }

    /**
     * جلب مهامي (My Tasks)
     * GET /api/my-tasks
     */
    public function myTasks(Request $request)
    {
        $user = $request->user();
        
        // جلب التكليفات مع المهمة، ومع المهمة نجلب المشروع التابع لها
        $assignments = \App\Models\TaskAssignment::where('user_id', $user->user_id)
            ->with([
                'task' => function($query) {
                    $query->with('project:project_id,title'); // جلب بيانات المشروع المختصرة
                }
            ])
            ->latest('assigned_at') // ترتيب المهام من الأحدث للقديم
            ->get();

        return response()->json([
            'message' => 'My tasks retrieved successfully',
            'data' => $assignments
        ]);
    }

    /**
     * النظرة العامة وتقييمات المتطوع (عامة أو لمشروع محدد)
     * GET /api/users/{userId}/overview?project_id=1
     * and GET /api/users/{userId}/overview
     */
    public function getUserOverview(Request $request, $userId)
    {
        $user = \App\Models\User::findOrFail($userId);
        $projectId = $request->query('project_id'); // استقبال رقم المشروع إذا وجد

        // 1. بناء استعلام المهام المقيمة
        $query = $user->tasks()
                      ->with('project')
                      ->wherePivotNotNull('rating');

        // 🔍 فلترة اختيارية: إذا طلب الفرونت إند مشروعاً محدداً
        if ($projectId) {
            $query->where('tasks.project_id', $projectId);
        }

        $evaluatedTasks = $query->orderByPivot('evaluated_at', 'desc')->get();

        // 2. حساب عدد المهام المنجزة (فلترة اختيارية أيضاً)
        $completedTasksQuery = $user->tasks()->where('tasks.status', 'Completed');
        if ($projectId) {
            $completedTasksQuery->where('tasks.project_id', $projectId);
        }
        $completedTasksCount = $completedTasksQuery->count();

        // 3. حساب متوسط التقييم
        $averageRating = $evaluatedTasks->avg('pivot.rating');

        // 4. ترتيب البيانات (Feedbacks)
        $feedbacks = $evaluatedTasks->map(function ($task) {
            return [
                'task_id' => $task->task_id,
                'task_name' => $task->title,
                'project_id' => $task->project_id,
                'project_name' => $task->project->title ?? 'Unknown Project',
                'rating' => $task->pivot->rating,
                'feedback' => $task->pivot->leader_feedback,
                'evaluated_at' => $task->pivot->evaluated_at,
            ];
        });

        return response()->json([
            'message' => $projectId ? 'User performance for specific project' : 'User general overview',
            'data' => [
                'user_info' => [
                    'full_name' => $user->full_name,
                    'role' => $user->role,
                    'bio' => $user->bio, 
                ],
                'performance' => [
                    'average_rating' => $averageRating ? round($averageRating, 1) : 0, 
                    'total_evaluated_tasks' => $evaluatedTasks->count(),
                    'completed_tasks_count' => $completedTasksCount,
                ],
                'skills' => $user->skills, 
                'task_feedbacks' => $feedbacks 
            ]
        ]);
    }

    /**
     * جلب رحلة المتطوع/القائد (طلبات، مشاريع حالية، وأرشيف)
     * GET /api/my-journey
     */
    public function getMyJourney(Request $request)
    {
        $user = $request->user();

        // 1. جلب كل المشاريع التي ارتبط بها المستخدم (سواء كمتطوع أو كقائد)
        // مع جلب تفاصيل المشروع الأساسية فقط لتخفيف الضغط
        $userProjects = $user->projects()->with('chapter:chapter_id,name')->get();

        // 2. إعادة تشكيل البيانات لتكون مريحة جداً للفرونت إند
        $formattedProjects = $userProjects->map(function ($project) {
            return [
                'project_id' => $project->project_id,
                'project_title' => $project->title,
                'chapter_name' => $project->chapter->name ?? 'N/A',
                'project_status' => $project->status, // (Open, Ongoing, Completed, Cancelled)
                'my_role' => $project->pivot->role, // الدور الذي استلمه (مثلاً Frontend أو Project Leader)
                'application_status' => $project->pivot->status, // (Pending, Approved, Rejected)
                'applied_at' => $project->pivot->applied_at,
                'joined_at' => $project->pivot->joined_at,
            ];
        });

        // 3. تقسيم البيانات الذكي لتسهيل بناء واجهة الفرونت إند
        return response()->json([
            'message' => 'User journey retrieved successfully',
            'data' => [
                // أ. الطلبات قيد الانتظار
                'pending_applications' => $formattedProjects->where('application_status', 'Pending')->values(),
                
                // ب. المشاريع الحالية (مقبول والمشروع لا يزال يعمل)
                'active_projects' => $formattedProjects->where('application_status', 'Approved')
                                                       ->whereIn('project_status', ['Open', 'Ongoing'])
                                                       ->values(),
                
                // ج. الأرشيف وسجل الإنجازات (المشاريع المنتهية بنجاح)
                'completed_projects' => $formattedProjects->where('application_status', 'Approved')
                                                          ->where('project_status', 'Completed')
                                                          ->values(),
                
                // 🛑 د. الإصلاح هنا: الطلبات المرفوضة أو المشاريع الملغاة (باستخدام filter)
                'rejected_or_cancelled' => $formattedProjects->filter(function ($project) {
                    return $project['application_status'] === 'Rejected' || $project['project_status'] === 'Cancelled';
                })->values(),
            ]
        ]);
    }
}