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
        
        // التحقق من الصلاحيات (فقط Super Admin أو مدراء بصلاحيات عليا يمكنهم إيقاف المستخدمين)
        if ($request->user()->role !== 'Super Admin') {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        $user->update(['status' => $request->status]);

        return response()->json([
            'message' => "User status updated to {$request->status} successfully",
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