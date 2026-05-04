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
        
        // إجبار حالة الحساب لتكون Pending عند التسجيل الجديد
        $validated['status'] = 'Pending'; 

        // 🟢 --- بداية التعديل: إضافة الـ OTP --- 🟢
        $otpCode = (string) random_int(100000, 999999); // توليد كود من 6 أرقام
        $validated['otp_code'] = $otpCode;
        $validated['otp_expires_at'] = now()->addMinutes(10); // صلاحية الكود 10 دقائق
        // 🟢 --- نهاية التعديل --- 🟢

        $user = User::create($validated);

        // 🟢 --- إرسال كود الـ OTP عبر الإيميل --- 🟢
        try {
            Mail::to($user->email)->send(new SendOtpMail($otpCode));
        } catch (\Throwable $e) {
            // نستخدم Throwable لتمسك أي نوع من الأخطاء سواء Exception أو Error
            \Illuminate\Support\Facades\Log::error('Mail Error: ' . $e->getMessage());
        }

        // إنشاء التوكن
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            // عدلت الرسالة شوي ليفهم المتطوع إنو في إيميل وصله
            'message' => 'Registered successfully. Please check your email for the OTP and wait for admin approval.',
            'data' => $user, 
            'access_token' => $token
        ], 201);
    }

    /**
     * التحقق من الـ OTP وتأكيد الحساب
     * POST /api/verify-otp
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6'
        ]);

        $user = \App\Models\User::where('email', $request->email)->first();

        // 1. التحقق من تطابق الكود
        if ($user->otp_code !== $request->otp) {
            return response()->json(['message' => 'Invalid OTP.'], 400);
        }

        // 2. التحقق من صلاحية الكود (هل انتهى وقته؟)
        if (now()->greaterThan($user->otp_expires_at)) {
            return response()->json(['message' => 'OTP has expired. Please request a new one.'], 400);
        }

        // 3. نجاح التحقق! (نفرغ الـ OTP ونوثق الإيميل)
        $user->update([
            'otp_code' => null,
            'otp_expires_at' => null,
            'email_verified_at' => now(),
        ]);

        // 4. إصدار التوكن للدخول
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Email verified successfully.',
            'token' => $token,
            'user' => $user
        ]);
    }

    /**
     * إعادة إرسال كود الـ OTP
     * POST /api/resend-otp
     */
    public function resendOtp(Request $request)
    {
        // 1. التحقق من صحة الإيميل
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ]);

        $user = \App\Models\User::where('email', $request->email)->first();

        // 2. حماية: التأكد أن الحساب لم يتم توثيقه مسبقاً
        if (!is_null($user->email_verified_at)) {
            return response()->json([
                'message' => 'This email is already verified. You can log in directly.'
            ], 400); 
        }

        // 3. توليد كود جديد وتحديث وقت الانتهاء (10 دقائق من الآن)
        $newOtp = (string) random_int(100000, 999999);
        
        $user->otp_code = $newOtp;
        $user->otp_expires_at = now()->addMinutes(10);
        $user->save(); // نستخدم save لتجنب أي مشاكل بالـ fillable

        // 4. إرسال الكود الجديد عبر الإيميل (مع الـ try-catch المعتادة للحماية)
        try {
            Mail::to($user->email)->send(new SendOtpMail($newOtp));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Resend OTP Mail Error: ' . $e->getMessage());
            // ملاحظة: يمكنك إرجاع رسالة خطأ هنا إذا أردت إخبار المستخدم بفشل الإرسال، 
            // لكننا سنكمل بسلاسة كما فعلنا في التسجيل.
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

        // 1. التحقق هل قام بتأكيد الإيميل عبر الـ OTP؟
        if (is_null($user->email_verified_at)) {
            return response()->json([
                'message' => 'Please verify your email via OTP first.',
                // ممكن ترجع الإيميل للفرونت عشان يقدر يطلب إعادة إرسال الكود إذا حابب
                'email' => $user->email 
            ], 403);
        }

        // 2. التحقق هل وافق عليه الأدمن؟
        if ($user->status === 'Pending') {
            return response()->json([
                'message' => 'Email verified, but your account is still pending admin approval.'
            ], 403);
        }

        if ($user->status === 'Rejected' || $user->status === 'Inactive') {
            return response()->json([
                'message' => 'Your account is disabled or rejected.'
            ], 403);
        }

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

    /**
     * طلب استعادة كلمة المرور (إرسال OTP)
     * POST /api/forgot-password
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ]);

        $user = \App\Models\User::where('email', $request->email)->first();

        // 1. توليد كود OTP جديد وصلاحية لـ 10 دقائق
        $otpCode = (string) random_int(100000, 999999);
        $user->otp_code = $otpCode;
        $user->otp_expires_at = now()->addMinutes(10);
        $user->save();

        // 2. إرسال الكود عبر الإيميل (نفس كلاس الإيميل اللي عملناه بيشتغل هون تماماً)
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
     * تعيين كلمة المرور الجديدة باستخدام الـ OTP
     * POST /api/reset-password
     */
    public function resetPassword(Request $request)
    {
        // 1. التحقق من المدخلات (الإيميل، الـ OTP، وكلمة المرور الجديدة مع تأكيدها)
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed'
        ]);

        $user = \App\Models\User::where('email', $request->email)->first();

        // 2. التحقق من تطابق كود الـ OTP
        if ($user->otp_code !== $request->otp) {
            return response()->json(['message' => 'Invalid OTP.'], 400);
        }

        // 3. التحقق من صلاحية الكود (هل انتهى وقته؟)
        if (now()->greaterThan($user->otp_expires_at)) {
            return response()->json(['message' => 'OTP has expired. Please request a new one.'], 400);
        }

        // 4. كل شيء سليم! نقوم بتحديث كلمة المرور وتصفير كود الـ OTP
        $user->password = Hash::make($request->password);
        $user->otp_code = null;
        $user->otp_expires_at = null;
        $user->save();

        return response()->json([
            'message' => 'Password has been reset successfully. You can now log in with your new password.'
        ]);
    }
}