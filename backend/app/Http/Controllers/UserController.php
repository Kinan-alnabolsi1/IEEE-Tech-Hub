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
        $request->validate([
            'status' => 'required|in:Pending,Active,Suspended'
        ]);

        $user = User::findOrFail($id);
        
        // التحقق من الصلاحيات (السوبر أدمن فقط هو من يوافق على مدراء الفروع)
        if ($request->user()->role !== 'Super Admin') {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        // تحديث حالة المستخدم
        $user->update(['status' => $request->status]);

        $roleMessage = '';

        // 🔥 السحر هنا: إذا كان المستخدم مدير فرع، وتمت الموافقة عليه (Active) 🔥
        if ($user->role === 'Branch Admin' && $request->status === 'Active') {
            
            // نجلب الفرع اللي هو سجل فيه
            $branch = \App\Models\Branch::find($user->branch_id);
            
            if ($branch) {
                // نربط الفرع بهذا المدير رسمياً
                $branch->update(['admin_id' => $user->user_id]);
                $roleMessage = " They are now officially the Admin of branch: {$branch->name}.";
            }
        }
        
        // (اختياري) إذا تم إيقاف المدير، نفك الربط من الفرع
        if ($user->role === 'Branch Admin' && in_array($request->status, ['Suspended', 'Rejected'])) {
             $branch = \App\Models\Branch::find($user->branch_id);
             if ($branch && $branch->admin_id === $user->user_id) {
                 $branch->update(['admin_id' => null]);
             }
        }

        return response()->json([
            'message' => "User status updated to {$request->status} successfully." . $roleMessage,
            'data' => $user
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