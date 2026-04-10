<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\MovementController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AgencesController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\FortigateController;

// Auth public (login) 
Route::post('SignIn', [UserController::class, 'login']);
Route::post('SignUp', [UserController::class, 'store']);

// Routes protégées (auth + roles)
Route::middleware(['auth.token'])->group(function () {
    // Route pour récupérer les données importantes 
    Route::get('all-data', [\App\Http\Controllers\DataController::class, 'getData']);

    // Utilisateurs (Admin seulement)
    Route::middleware(['role:admin'])->group(function () {
        Route::apiResource('users', UserController::class);
    });

    // Affectations (Admin + IT)
    Route::middleware(['role:admin,IT'])->group(function () {
        Route::apiResource('assignments', AssignmentController::class);
        Route::patch('assets/{assetId}/return', [AssignmentController::class, 'return']);
    });

    // Matériel / Assets (Admin + IT)
    Route::middleware(['role:admin,IT'])->group(function () {
        Route::apiResource('assets', AssetController::class);
    });


    // create and assign asset in one step
    Route::post('/assets/create-and-assign', [AssetController::class, 'createAndAssign']);

    // Mouvements / Transferts (Admin + IT)
    Route::middleware(['role:admin,IT'])->group(function () {
        Route::apiResource('movements', MovementController::class);
    });

    Route::get('audit-logs/assets/{serial_number}', [AssetController::class, 'getAuditLogsBySerialNumber']);

    Route::get('audit-logs', [AuditLogController::class, 'index']);
    Route::get('audit-logs/{table}', [AuditLogController::class, 'byTable']);
    Route::get('audit-logs/{table}/{id}', [AuditLogController::class, 'byRecord']);

    Route::post('categories', [\App\Http\Controllers\DataController::class, 'addCategory']);
    Route::delete('categories/{id}', [\App\Http\Controllers\DataController::class, 'deleteCategory']);
    Route::post('brands', [\App\Http\Controllers\DataController::class, 'addBrand']);
    Route::delete('brands/{id}', [\App\Http\Controllers\DataController::class, 'deleteBrand']);
    Route::post('locations', [\App\Http\Controllers\DataController::class, 'addLocation']);
    Route::delete('locations/{id}', [\App\Http\Controllers\DataController::class, 'deleteLocation']);

    Route::put('/profile',          [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);
    Route::post('/logout',          [AuthController::class,    'logout']);

    Route::post('/employees/create', [\App\Http\Controllers\EmployeeController::class, 'createEmployee']);

    Route::get('/agences', [\App\Http\Controllers\AgencesController::class, 'index']);
    Route::get('/agences/{id}', [\App\Http\Controllers\AgencesController::class, 'show']);
    Route::post('/agences', [\App\Http\Controllers\AgencesController::class, 'store']);
    Route::delete('/agences/{id}', [\App\Http\Controllers\AgencesController::class, 'destroy']);
    Route::post('/villes', [\App\Http\Controllers\DataController::class, 'addVille']);
    // routes/api.php
    Route::get('/agences/{id}/fortigate-config', 
        [\App\Http\Controllers\FortigateController::class, 'generate']
    )->middleware('auth.token');
});