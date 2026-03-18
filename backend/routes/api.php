<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\MovementController;
use App\Http\Controllers\AuditLogController;

// Auth public (login) 
Route::post('SignIn', [UserController::class, 'login']);
Route::post('SignUp', [UserController::class, 'store']);

// Routes protégées (auth + roles)
Route::middleware(['auth.token'])->group(function () {

    // Utilisateurs (Admin seulement)
    Route::middleware(['role:admin'])->group(function () {
        Route::apiResource('users', UserController::class);
    });

    // Matériel / Assets (Admin + IT)
    Route::middleware(['role:admin,it'])->group(function () {
        Route::apiResource('assets', AssetController::class);
    });

    // Affectations (Admin + IT)
    Route::middleware(['role:admin,it'])->group(function () {
        Route::apiResource('assignments', AssignmentController::class);
        Route::post('assignments/{assignment}/return', [AssignmentController::class, 'return']);
    });

    // Mouvements / Transferts (Admin + IT)
    Route::middleware(['role:admin,it'])->group(function () {
        Route::apiResource('movements', MovementController::class);
    });

    Route::get('audit-logs', [AuditLogController::class, 'index']);
    Route::get('audit-logs/{table}', [AuditLogController::class, 'byTable']);
    Route::get('audit-logs/{table}/{id}', [AuditLogController::class, 'byRecord']);
});