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

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// === Protected Routes (يجب أن يكون مسجل دخول أولاً) ===
Route::middleware('auth:sanctum')->group(function () {
    
    // -- 1. مسارات مشتركة (مسموحة لأي مستخدم مسجل دخول) --
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', function (Request $request) { 
        return response()->json($request->user()->load('skills')); 
    });
    Route::get('/profile/{user_id}', [UserController::class, 'showProfile']);
    Route::get('/branches', [BranchController::class, 'index']); // الكل بيقدر يشوف الفروع
    Route::get('/societies', [SocietyController::class, 'index']); // الكل بيقدر يشوف الجمعيات
    
    // تقديم المتطوع لطلب انضمام والمشاركة بمشروع (خاص بالمتطوعين بشكل أساسي)
    Route::post('/branches/{branch}/apply', [BranchController::class, 'applyToBranch']);
    Route::post('/projects/{project}/join', [ProjectController::class, 'joinProject']);


    // -- 2. مسارات مخصصة للسوبر أدمن فقط (Super Admin ONLY) --
    Route::middleware('role:Super Admin')->group(function () {
        Route::get('/admin/stats', [AdminDashboardController::class, 'getStats']);
        Route::patch('/branches/{branch}/status', [BranchController::class, 'updateStatus']);
        
        // إدارة الفروع والجمعيات (إضافة، تعديل، حذف)
        Route::apiResource('branches', BranchController::class)->except(['index', 'show']);
        Route::apiResource('societies', SocietyController::class)->except(['index', 'show']);
        
        // ربط الجمعيات بالفروع
        Route::post('/branches/{branch}/societies', [BranchController::class, 'attachSocieties']);
        
        // تقارير السوبر أدمن
        Route::get('/reports/system', [ReportController::class, 'getSystemReports']);
    });


    // -- 3. مسارات مشتركة (السوبر أدمن + مدراء الفروع) --
    Route::middleware('role:Super Admin,Branch Admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']); 
        Route::patch('/users/{user_id}/status', [UserController::class, 'updateStatus']);
        
        // إدارة الفصول (Chapters)
        Route::apiResource('chapters', ChapterController::class)->except(['index', 'show']);
        
        // إدارة طلبات الانضمام للفرع
        Route::get('/branches/{branch}/memberships/pending', [BranchController::class, 'getPendingMemberships']);
        Route::patch('/memberships/{membership}/approve', [BranchController::class, 'approveMembership']);
    });


    // -- 4. مسارات إدارية متعددة (مدراء الفروع + رؤساء الفصول) --
    Route::middleware('role:Super Admin,Branch Admin,Chapter Chair')->group(function () {
        // إدارة المشاريع الأساسية (موافقة عليها أو تعديلها)
        Route::apiResource('projects', ProjectController::class)->except(['index', 'show']);
    });


    // -- 5. مسارات قادة المشاريع والمدراء (Project Leaders & Admins) --
    Route::middleware('role:Super Admin,Branch Admin,Chapter Chair,Project Leader')->group(function () {
        // إدارة المهام
        Route::apiResource('tasks', TaskController::class);
        Route::patch('/tasks/assignments/{assignmentId}/progress', [TaskController::class, 'updateProgress']);
        
        // قبول ورفض أعضاء المشروع
        Route::post('/projects/{project}/approve-member', [ProjectController::class, 'approveMember']);
        Route::post('/projects/{project}/reject-member', [ProjectController::class, 'rejectMember']);
        
        // التقارير
        Route::get('/reports/{report_id}', [ReportController::class, 'show']);
    });

});