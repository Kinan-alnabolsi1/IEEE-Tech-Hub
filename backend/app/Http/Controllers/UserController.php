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

        // 🛡️ منطق الصلاحيات (Authorization Logic)

        // 1. إذا كان المستخدم الحالي هو السوبر أدمن:
        // له الصلاحية المطلقة لتعديل أي مستخدم (وخصوصاً مدراء الفروع)
        if ($currentUser->role === 'Super Admin') {
            // يمر بدون أي قيود
        } 
        
        // 2. إذا كان المستخدم الحالي هو مدير فرع (Branch Admin):
        elseif ($currentUser->role === 'Branch Admin') {
            // الشرط الأول: يجب أن يكون المستخدم الهدف في نفس فرع المدير
            $isSameBranch = $targetUser->branch_id === $currentUser->branch_id;
            
            // الشرط الثاني: يمنع منعاً باتاً التعديل على أي Super Admin
            $isNotSuperAdmin = $targetUser->role !== 'Super Admin';

            if (!$isSameBranch || !$isNotSuperAdmin) {
                return response()->json([
                    'message' => 'Unauthorized action. You can only manage users within your own branch, and you cannot modify Super Admins.'
                ], 403);
            }
        } 
        
        // 3. أي دور آخر يحاول الوصول لهذا المسار (مثل المتطوعين): يتم طرده فوراً
        else {
            return response()->json([
                'message' => 'Unauthorized action.'
            ], 403);
        }

        // ✅ التحقق من صحة البيانات المرسلة (الـ Status)
        $validated = $request->validate([
            'status' => 'required|in:Pending,Active,Suspended,Rejected'
        ]);

        // تحديث الحالة
        $targetUser->update($validated);

        return response()->json([
            'message' => "User status updated to {$validated['status']} successfully",
            'data' => $targetUser
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
}