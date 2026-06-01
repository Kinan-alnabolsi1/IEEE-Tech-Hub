<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\SendOtpMail;
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
            'role' => 'required|in:Branch Admin,Volunteer', 
            'branch_id' => 'required_if:role,Branch Admin,Volunteer|exists:branches,branch_id',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        
        $validated['status'] = 'Pending'; 

        $otpCode = (string) random_int(100000, 999999);
        $validated['otp_code'] = $otpCode;
        $validated['otp_expires_at'] = now()->addMinutes(10);

        $user = User::create($validated);

        
        try {
            Mail::to($user->email)->send(new SendOtpMail($otpCode));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Mail Error: ' . $e->getMessage());
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registered successfully. Please check your email for the OTP and wait for admin approval.',
            'data' => $user, 
            'access_token' => $token
        ], 201);
    }

    /**
     * POST /api/verify-otp
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6'
        ]);

        $user = \App\Models\User::where('email', $request->email)->first();

        if ($user->otp_code !== $request->otp) {
            return response()->json(['message' => 'Invalid OTP.'], 400);
        }

        if (now()->greaterThan($user->otp_expires_at)) {
            return response()->json(['message' => 'OTP has expired. Please request a new one.'], 400);
        }

        $user->update([
            'otp_code' => null,
            'otp_expires_at' => null,
            'email_verified_at' => now(),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Email verified successfully.',
            'token' => $token,
            'user' => $user
        ]);
    }

    /**
     * POST /api/resend-otp
     */
    public function resendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ]);

        $user = \App\Models\User::where('email', $request->email)->first();

        if (!is_null($user->email_verified_at)) {
            return response()->json([
                'message' => 'This email is already verified. You can log in directly.'
            ], 400); 
        }

        $newOtp = (string) random_int(100000, 999999);
        
        $user->otp_code = $newOtp;
        $user->otp_expires_at = now()->addMinutes(10);
        $user->save();

        try {
            Mail::to($user->email)->send(new SendOtpMail($newOtp));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Resend OTP Mail Error: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'A new OTP has been sent to your email.'
        ]);
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

        if (is_null($user->email_verified_at)) {
            return response()->json([
                'message' => 'Please verify your email via OTP first.',
                'email' => $user->email 
            ], 403);
        }

        if ($user->status === 'Pending') {
            return response()->json([
                'message' => 'Email verified, but your account is still pending admin approval.'
            ], 403);
        }

        if (in_array($user->status, ['Rejected', 'Inactive', 'Suspended'])) {
            return response()->json([
                'message' => 'Your account is disabled, suspended, or rejected.'
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['user' => $user, 'access_token' => $token]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * POST /api/forgot-password
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ]);

        $user = \App\Models\User::where('email', $request->email)->first();

        $otpCode = (string) random_int(100000, 999999);
        $user->otp_code = $otpCode;
        $user->otp_expires_at = now()->addMinutes(10);
        $user->save();

        try {
            Mail::to($user->email)->send(new SendOtpMail($otpCode));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Forgot Password Mail Error: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Password reset OTP has been sent to your email.'
        ]);
    }

    /**
     * POST /api/reset-password
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed'
        ]);

        $user = \App\Models\User::where('email', $request->email)->first();

        if ($user->otp_code !== $request->otp) {
            return response()->json(['message' => 'Invalid OTP.'], 400);
        }

        if (now()->greaterThan($user->otp_expires_at)) {
            return response()->json(['message' => 'OTP has expired. Please request a new one.'], 400);
        }

        $user->password = Hash::make($request->password);
        $user->otp_code = null;
        $user->otp_expires_at = null;
        $user->save();

        return response()->json([
            'message' => 'Password has been reset successfully. You can now log in with your new password.'
        ]);
    }
}