<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjectController;

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) { return $request->user(); });

    // Projects Routes
    Route::apiResource('projects', ProjectController::class);
    Route::post('/projects/{project}/join', [ProjectController::class, 'joinProject']);
    
    // (Future endpoints for Tasks, Skills, etc. go here)
});