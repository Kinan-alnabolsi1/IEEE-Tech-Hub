<?php
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

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', function (Request $request) { 
        return response()->json($request->user()->load('skills')); 
    });
    Route::get('/profile/{user_id}', [UserController::class, 'showProfile']);

    // --- Users & Admins Management ---
    Route::get('/users', [UserController::class, 'index']); // جلب المستخدمين (مع الفلاتر)
    Route::patch('/users/{user_id}/status', [UserController::class, 'updateStatus']); // تفعيل/إيقاف/رفض المستخدم

    // --- Admin Dashboard Stats ---
    Route::get('/admin/stats', [AdminDashboardController::class, 'getStats']);

    // --- Projects Management ---
    Route::apiResource('projects', ProjectController::class);
    Route::post('/projects/{project}/join', [ProjectController::class, 'joinProject']);
    Route::post('/projects/{project}/approve-member', [ProjectController::class, 'approveMember']);
    Route::post('/projects/{project}/reject-member', [ProjectController::class, 'rejectMember']);
    
    // --- Tasks Management ---
    Route::apiResource('tasks', TaskController::class);
    Route::patch('/tasks/assignments/{assignmentId}/progress', [TaskController::class, 'updateProgress']);

    // --- Branches & Memberships ---
    Route::patch('/branches/{branch}/status', [BranchController::class, 'updateStatus']); // إضافة تغيير الحالة
    Route::apiResource('branches', BranchController::class);
    Route::post('/branches/{branch}/apply', [BranchController::class, 'applyToBranch']); // المتطوع يقدم طلب
    Route::get('/branches/{branch}/memberships/pending', [BranchController::class, 'getPendingMemberships']); // <--- أضف هذا السطر
    Route::patch('/memberships/{membership}/approve', [BranchController::class, 'approveMembership']); // الموافقة على الطلب

    // --- Societies ---
    Route::apiResource('societies', SocietyController::class);

    // --- Branch-Society Linking ---
    Route::post('/branches/{branch}/societies', [BranchController::class, 'attachSocieties']);


    // --- Chapters ---
    Route::apiResource('chapters', ChapterController::class);
    
    // --- Reports Management ---
    Route::get('/reports/system', [ReportController::class, 'getSystemReports']);
    Route::get('/reports/{report_id}', [ReportController::class, 'show']);
});