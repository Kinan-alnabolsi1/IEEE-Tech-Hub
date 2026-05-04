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
        // جلب المستخدم مع مهاراته والمشاريع المنضم إليها والمشاريع التي يقودها
        $user = User::with([
            'skills', 
            'enrolledProjects', 
            'projectsAsLeader'
        ])->findOrFail($user_id);

        return response()->json([
            'message' => 'User profile retrieved successfully',
            'data' => $user
        ]);
    }

    /**
     * إعداد الحساب (Onboarding / Create Profile)
     * POST /api/profile/onboarding
     */
    /**
     * إعداد الحساب وتحديث البيانات الشخصية والأكاديمية
     * POST /api/profile/onboarding
     */
    public function createProfile(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'phone' => 'nullable|string|max:30',
            'bio' => 'nullable|string',
            'faculty' => 'nullable|string|max:150', // 👈 الكلية
            'major' => 'nullable|string|max:150',   // 👈 التخصص
            'current_study_year' => 'nullable|integer|min:1|max:7',
            'enrollment_year' => 'nullable|integer|min:2000|max:' . (date('Y') + 1),
            'expected_graduation_date' => 'nullable|date',
            'skills' => 'nullable|array',
            'skills.*' => 'exists:skills,skill_id' 
        ]);

        $user->update([
            'phone' => $validated['phone'] ?? $user->phone,
            'bio' => $validated['bio'] ?? $user->bio,
            'faculty' => $validated['faculty'] ?? $user->faculty, // 👈 حفظ الكلية
            'major' => $validated['major'] ?? $user->major,       // 👈 حفظ التخصص
            'current_study_year' => $validated['current_study_year'] ?? $user->current_study_year,
            'enrollment_year' => $validated['enrollment_year'] ?? $user->enrollment_year,
            'expected_graduation_date' => $validated['expected_graduation_date'] ?? $user->expected_graduation_date,
        ]);

        if ($request->has('skills')) {
            $user->skills()->sync($validated['skills']);
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => $user->load('skills')
        ]);
    }

    /**
     * جلب مشاريعي وطلبات الانضمام (My Projects & Applications)
     * GET /api/my-projects
     */
    public function myProjects(Request $request)
    {
        $user = $request->user();
        
        // نجلب المشاريع التي قدم عليها هذا المستخدم، مع جلب حالته فيها من الجدول الوسيط
        $projects = $user->projects()
                         ->withPivot('status', 'role', 'applied_at', 'joined_at')
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
        
        // نجلب التكليفات الخاصة بهذا المتطوع مع تفاصيل المهمة والمشروع التابع لها
        $assignments = \App\Models\TaskAssignment::where('user_id', $user->user_id)
            ->with(['task', 'task.project:project_id,title']) // نجلب المهمة، ومعلومات المشروع الأساسية
            ->get();

        return response()->json([
            'message' => 'My tasks retrieved successfully',
            'data' => $assignments
        ]);
    }

    /**
     * النظرة العامة وتقييمات المتطوع
     * GET /api/users/{userId}/overview
     */
    public function getUserOverview(Request $request, $userId)
    {
        $user = User::findOrFail($userId);

        // 1. جلب المهام التابعة لهذا المستخدم والتي تم تقييمها فقط
        // (بافتراض أن علاقة المهام في مودل User اسمها assignedTasks أو tasks)
        $evaluatedTasks = $user->tasks() // 👈 غيرناها من assignedTasks لـ tasks لتطابق المودل تبعك
                       ->with('project')
                       ->wherePivotNotNull('rating')
                       ->orderByPivot('evaluated_at', 'desc')
                       ->get();

        // 2. حساب متوسط التقييم (مثلاً 4.5 من 5)
        // نستخدم دالة avg الجاهزة من لارافل على حقل الـ rating جوا الـ pivot
        $averageRating = $evaluatedTasks->avg('pivot.rating');

        // 3. ترتيب الداتا لتكون سهلة جداً للفرونت إند (Transformation)
        $feedbacks = $evaluatedTasks->map(function ($task) {
            return [
                'task_id' => $task->task_id,
                'task_name' => $task->title, // أو name حسب داتابيزك
                'project_name' => $task->project->title ?? 'Unknown Project',
                'rating' => $task->pivot->rating,
                'feedback' => $task->pivot->leader_feedback,
                'evaluated_at' => $task->pivot->evaluated_at,
            ];
        });

        // 4. إرجاع النتيجة
        return response()->json([
            'message' => 'User overview retrieved successfully',
            'data' => [
                'user_info' => [
                    'full_name' => $user->full_name,
                    'role' => $user->role,
                ],
                'performance' => [
                    // نقرب الرقم لخانة عشرية واحدة، وإذا مافي تقييمات نرجعه 0
                    'average_rating' => $averageRating ? round($averageRating, 1) : 0, 
                    'total_evaluated_tasks' => $evaluatedTasks->count(),
                ],
                'task_feedbacks' => $feedbacks // مصفوفة التعليقات والنجوم
            ]
        ]);
    }
}