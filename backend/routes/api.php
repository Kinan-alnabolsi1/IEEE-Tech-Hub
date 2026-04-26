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
    Route::get('/branches', [BranchController::class, 'index']); // الكل بيقدر يشوف الفروع

// === Protected Routes (يجب أن يكون مسجل دخول أولاً) ===
Route::middleware('auth:sanctum')->group(function () {

    // -- 1. مسارات مشتركة (مسموحة لأي مستخدم مسجل دخول) --
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', function (Request $request) {
        return response()->json($request->user()->load('skills'));
    });
    Route::get('/profile/{user_id}', [UserController::class, 'showProfile']);
    Route::get('/societies', [SocietyController::class, 'index']); // جلب الكل مع الفلتر
    Route::post('/societies', [SocietyController::class, 'store']); // إنشاء
    Route::get('/societies/{society_id}', [SocietyController::class, 'show']); // جلب جمعية محددة
    Route::patch('/societies/{society_id}', [SocietyController::class, 'update']); // تعديل
    Route::delete('/societies/{society_id}', [SocietyController::class, 'destroy']);

    // تقديم المتطوع لطلب انضمام والمشاركة بمشروع (خاص بالمتطوعين بشكل أساسي)
    Route::post('/branches/{branch}/apply', [BranchController::class, 'applyToBranch']);
    Route::post('/projects/{project}/join', [ProjectController::class, 'joinProject']);
    Route::get('/branches/{branch_id}', [BranchController::class, 'show']);


    // -- 2. مسارات مخصصة للسوبر أدمن فقط (Super Admin ONLY) --
    Route::middleware('role:Super Admin')->group(function () {
        Route::get('/admin/stats', [AdminDashboardController::class, 'getStats']);
        Route::patch('/branches/{branch}/status', [BranchController::class, 'updateStatus']);

        // إدارة الفروع والجمعيات (إضافة، تعديل، حذف)
        Route::apiResource('branches', BranchController::class)->except(['index', 'show']);
        // Route::apiResource('societies', SocietyController::class)->except(['index', 'show']);

        // ربط الجمعيات بالفروع
        Route::post('/branches/{branch}/societies', [BranchController::class, 'attachSocieties']);
        Route::delete('/branches/{branch_id}/societies/{society_id}', [BranchController::class, 'detachSociety']);

        // تقارير السوبر أدمن
        Route::get('/reports/system', [ReportController::class, 'getSystemReports']);
    });


    // -- 3. مسارات مشتركة (السوبر أدمن + مدراء الفروع) --
    Route::middleware('role:Super Admin,Branch Admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::patch('/users/{user_id}/status', [UserController::class, 'updateStatus']);

        // إدارة الفصول (Chapters)
        // الفصول
        Route::get('/chapters', [ChapterController::class, 'getAllChapters']);
        Route::put('/chapters/{chapter_id}', [ChapterController::class, 'update']);
        Route::get('/branches/{branch_id}/chapters', [ChapterController::class, 'index']);
        Route::post('/chapters', [ChapterController::class, 'store']);
        Route::get('/chapters/{chapter_id}', [ChapterController::class, 'show']);
        Route::patch('/chapters/{chapter_id}/assign-chair', [ChapterController::class, 'assignChair']);
        Route::post('/chapters/{chapter_id}/members', [ChapterController::class, 'addMember']);
        Route::delete('/chapters/{chapter_id}', [ChapterController::class, 'destroy']);
        Route::delete('/chapters/{chapter_id}/members/{user_id}', [ChapterController::class, 'removeMember']);
        // عزل رئيس الفصل فقط (يبقى عضواً)
        Route::delete('/chapters/{chapter_id}/chair', [ChapterController::class, 'removeChair']);

        // جلب متطوعي الفرع (مع دعم الفلترة)
        Route::get('/branches/{branch_id}/volunteers', [BranchController::class, 'getVolunteers']);

        // إدارة طلبات الانضمام للفرع
        Route::get('/branches/{branch}/memberships/pending', [BranchController::class, 'getPendingMemberships']);
        Route::patch('/memberships/{membership}/approve', [BranchController::class, 'approveMembership']);

        Route::get('/branches/{branch_id}/stats', [BranchController::class, 'getStats']);

        Route::get('/branches/{branch_id}/projects', [ProjectController::class, 'getBranchProjects']);
        Route::patch('/projects/{project}/status', [ProjectController::class, 'updateStatus']);
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
