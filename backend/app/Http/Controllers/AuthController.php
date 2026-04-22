<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|max:80',
            'email' => 'required|string|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'full_name' => 'required|string|max:150',
            'ieee_membership_number' => 'nullable|string|max:50|unique:users,ieee_membership_number',
            
            // 1. الحماية: مسموح التسجيل العام فقط لهذين الدورين
            'role' => 'required|in:Branch Admin,Volunteer', 
            
            // 2. تصحيح الأسماء لتتطابق تماماً مع السطر السابق
            'branch_id' => 'required_if:role,Branch Admin,Volunteer|exists:branches,branch_id',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        
        // إجبار حالة الحساب لتكون Pending عند التسجيل الجديد
        $validated['status'] = 'Pending'; 

        $user = User::create($validated);

        // إنشاء التوكن
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registered successfully. Please wait for admin approval.',
            'data' => $user, 
            'access_token' => $token
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // 3. إضافة فحص حالة الـ Pending لمنعه من الدخول قبل الموافقة
        if ($user->status === 'Pending') {
            return response()->json(['message' => 'Account is still pending approval'], 403);
        }

        if ($user->status === 'Suspended') {
            return response()->json(['message' => 'Account suspended'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['user' => $user, 'access_token' => $token]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}