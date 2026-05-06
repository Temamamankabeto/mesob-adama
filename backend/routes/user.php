<?php

use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\OfficeController;
use App\Http\Controllers\Api\CityController;
use App\Http\Controllers\Api\SubcityController;
use App\Http\Controllers\Api\WoredaController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->prefix('admin')->group(function () {

    // USERS
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::post('/users/{id}/roles', [UserController::class, 'assignRole']);
    Route::post('/users/{id}/reset-password', [UserController::class, 'resetPassword']);
    Route::patch('/users/{id}/toggle', [UserController::class, 'toggle']);

    // ROLES
    Route::get('/roles', [RoleController::class, 'index']);
    Route::post('/roles', [RoleController::class, 'store']);
    Route::put('/roles/{id}', [RoleController::class, 'update']);
    Route::post('/roles/{id}/permissions', [RoleController::class, 'assignPermissions']);

    // PERMISSIONS
    Route::get('/permissions', [PermissionController::class, 'index']);
    Route::post('/permissions', [PermissionController::class, 'store']);
    Route::put('/permissions/{id}', [PermissionController::class, 'update']);
    Route::delete('/permissions/{id}', [PermissionController::class, 'destroy']);

    Route::get('/offices', [OfficeController::class, 'index']);
Route::post('/offices', [OfficeController::class, 'store']);
Route::get('/offices/{office}', [OfficeController::class, 'show']);
Route::put('/offices/{office}', [OfficeController::class, 'update']);
Route::delete('/offices/{office}', [OfficeController::class, 'destroy']);  


   // Cities
    Route::apiResource('cities', CityController::class);

    // Subcities
    Route::apiResource('subcities', SubcityController::class);

    // Woredas
    Route::apiResource('woredas', WoredaController::class);

      Route::post('/users/{id}/change-password', [UserController::class, 'changePassword']);
Route::patch('/users/{id}/toggle-status', [UserController::class, 'toggleStatus']);
 /*
    |--------------------------------------------------------------------------
    | ROLES
    |--------------------------------------------------------------------------
    */
    Route::prefix('roles')->group(function () {
        Route::get('/', [RoleController::class, 'index']);
        Route::post('/', [RoleController::class, 'store']);
        Route::put('{id}', [RoleController::class, 'update']);

        // role permissions
        Route::get('{id}/permissions', [RoleController::class, 'rolePermissions']);
        Route::post('{id}/permissions', [RoleController::class, 'assignPermissions']);
    });




});