<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\ChapterController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SocietyController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SkillController;

// ==================================================================
// 🌍 Public Routes (مسارات عامة لا تحتاج تسجيل دخول)
// ==================================================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::get('/branches', [BranchController::class, 'index']);
Route::get('/skills', [SkillController::class, 'index']);

// ==================================================================
// 🔒 Protected Routes (يجب أن يكون مسجل دخول أولاً)
// ==================================================================
Route::middleware('auth:sanctum')->group(function () {

    // --------------------------------------------------------------
    // 👤 1. Shared Routes (مسموحة لأي مستخدم مسجل دخول)
    // --------------------------------------------------------------
    
    // Auth & Profile
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', function (Request $request) {
        return response()->json($request->user()->load('skills'));
    });
    Route::get('/profile/{user_id}', [UserController::class, 'showProfile']);
    
    // Branch & Project Applications (تقديم الطلبات)
    Route::get('/branches/{branch_id}', [BranchController::class, 'show']);
    Route::post('/branches/{branch}/apply', [BranchController::class, 'applyToBranch']);
    Route::post('/projects/{project}/join', [ProjectController::class, 'joinProject']);

    // Societies Management (الجمعيات) 
    // 💡 ملاحظة: حالياً أي مستخدم مسجل دخول يمكنه التعديل/الإضافة هنا.
    Route::get('/societies', [SocietyController::class, 'index']);
    Route::get('/societies/{society_id}', [SocietyController::class, 'show']);
    Route::post('/societies', [SocietyController::class, 'store']);
    Route::patch('/societies/{society_id}', [SocietyController::class, 'update']);
    Route::delete('/societies/{society_id}', [SocietyController::class, 'destroy']);

    // جلب مشاريع فصل محدد (للرؤساء، المدراء، وأعضاء الفصل)
    Route::get('/chapters/{chapter_id}/projects', [ProjectController::class, 'getChapterProjects']);
    // جلب قائمة أعضاء الفصل 
    Route::get('/chapters/{chapter_id}/members', [ChapterController::class, 'getMembers']);

    // 👤 Volunteer / User Profile & Dashboard
    Route::post('/profile/onboarding', [UserController::class, 'createProfile']); // استكمال إنشاء البروفايل
    Route::get('/my-projects', [UserController::class, 'myProjects']); // مشاريعي وطلباتي
    Route::get('/my-tasks', [UserController::class, 'myTasks']); // مهامي من كل المشاريع

    Route::post('/tasks/{taskId}/evaluate-member/{userId}', [TaskController::class, 'evaluateTaskMember']);
    Route::get('/users/{userId}/overview', [UserController::class, 'getUserOverview']);


    // --------------------------------------------------------------
    // 👑 2. Super Admin ONLY (مسارات مخصصة للسوبر أدمن فقط)
    // --------------------------------------------------------------
    Route::middleware('role:Super Admin')->group(function () {
        
        // Dashboard & Reports
        Route::get('/admin/stats', [AdminDashboardController::class, 'getStats']);
        Route::get('/reports/system', [ReportController::class, 'getSystemReports']);

        // Branches Management
        Route::patch('/branches/{branch}/status', [BranchController::class, 'updateStatus']);
        Route::apiResource('branches', BranchController::class)->except(['index', 'show']);

        // Branch-Society Relations (ربط الجمعيات بالفروع)
        Route::post('/branches/{branch}/societies', [BranchController::class, 'attachSocieties']);
        Route::delete('/branches/{branch_id}/societies/{society_id}', [BranchController::class, 'detachSociety']);
    });


    // --------------------------------------------------------------
    // 🏢 3. Branch Admins + Super Admin (إدارة الفروع)
    // --------------------------------------------------------------
    Route::middleware('role:Super Admin,Branch Admin')->group(function () {
        
        // Users Management (إدارة المستخدمين)
        Route::get('/users', [UserController::class, 'index']);
        Route::patch('/users/{user_id}/status', [UserController::class, 'updateStatus']);

        // Branch Dashboard & Memberships
        Route::get('/branches/{branch_id}/stats', [BranchController::class, 'getStats']);
        Route::get('/branches/{branch_id}/volunteers', [BranchController::class, 'getVolunteers']);
        Route::get('/branches/{branch}/memberships/pending', [BranchController::class, 'getPendingMemberships']);
        Route::patch('/memberships/{membership}/approve', [BranchController::class, 'approveMembership']);
        
        // Branch Projects
        Route::get('/branches/{branch_id}/projects', [ProjectController::class, 'getBranchProjects']);
        // Route::patch('/projects/{project}/status', [ProjectController::class, 'updateStatus']);

        // Chapters Management (إدارة الفصول)
        Route::get('/chapters', [ChapterController::class, 'getAllChapters']);
        Route::get('/chapters/{chapter_id}', [ChapterController::class, 'show']);
        Route::get('/branches/{branch_id}/chapters', [ChapterController::class, 'index']);
        Route::post('/chapters', [ChapterController::class, 'store']);
        Route::put('/chapters/{chapter_id}', [ChapterController::class, 'update']);
        Route::delete('/chapters/{chapter_id}', [ChapterController::class, 'destroy']);
        
        // Chapters Members & Chairs
        Route::post('/chapters/{chapter_id}/members', [ChapterController::class, 'addMember']);
        Route::delete('/chapters/{chapter_id}/members/{user_id}', [ChapterController::class, 'removeMember']);
        Route::patch('/chapters/{chapter_id}/assign-chair', [ChapterController::class, 'assignChair']);
        Route::delete('/chapters/{chapter_id}/chair', [ChapterController::class, 'removeChair']);

        // مسارات المهارات (Skills)
        
        Route::post('/skills', [SkillController::class, 'store']);

        Route::patch('/projects/{id}/approve', [ProjectController::class, 'approveProject']);
        Route::patch('/projects/{id}/reject', [ProjectController::class, 'rejectProject']);
    });


    // --------------------------------------------------------------
    // 📚 4. Chapter Chairs + Higher (إدارة المشاريع الأساسية)
    // --------------------------------------------------------------
    Route::middleware('role:Super Admin,Branch Admin,Chapter Chair')->group(function () {

        Route::get('/chapters/{chapter_id}/stats', [ChapterController::class, 'getStats']);
        // Projects CRUD (إضافة، تعديل، حذف)
        Route::apiResource('projects', ProjectController::class)->except(['index', 'show']);
        Route::patch('/projects/{project}/status', [ProjectController::class, 'updateStatus']);
        Route::patch('/projects/{project}/assign-leader', [ProjectController::class, 'assignLeader']);
        Route::delete('/projects/{project}/leader', [ProjectController::class, 'removeLeader']);
    });


    // --------------------------------------------------------------
    // 🎯 5. Project Leaders + Higher (إدارة الفرق والمهام)
    // --------------------------------------------------------------
    Route::middleware('role:Super Admin,Branch Admin,Chapter Chair,Project Leader')->group(function () {
        
        
        // Project Members Management (قبول/رفض المتطوعين في المشروع)
        Route::post('/projects/{project}/approve-member', [ProjectController::class, 'approveMember']);
        Route::post('/projects/{project}/reject-member', [ProjectController::class, 'rejectMember']);

        Route::get('/projects/{project}/applications', [ProjectController::class, 'getApplications']);

        // Tasks Management (إدارة المهام)
        Route::apiResource('tasks', TaskController::class);
        Route::patch('/tasks/assignments/{assignmentId}/progress', [TaskController::class, 'updateProgress']);

        // إحصائيات المشروع (لوحة تحكم القائد)
        Route::get('/projects/{project}/stats', [ProjectController::class, 'getStats']);

        // Project Reports
        Route::get('/reports/{report_id}', [ReportController::class, 'show']);
    });

});