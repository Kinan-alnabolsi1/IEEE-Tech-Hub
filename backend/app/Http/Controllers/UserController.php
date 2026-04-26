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
}