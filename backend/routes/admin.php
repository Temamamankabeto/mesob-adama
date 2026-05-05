<?php

use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EserviceReportController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/profile/update', [UserController::class, 'updateProfile']);
});

Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    // MESOB / eService dashboards
    Route::get('/dashboard', [DashboardController::class, 'overview']);
    Route::get('/city/dashboard', [DashboardController::class, 'cityDashboard']);
    Route::get('/subcity/dashboard', [DashboardController::class, 'subcityDashboard']);
    Route::get('/woreda/dashboard', [DashboardController::class, 'woredaDashboard']);
    Route::get('/officer/dashboard', [DashboardController::class, 'officerDashboard']);
    Route::get('/customer/dashboard', [DashboardController::class, 'customerDashboard']);

    // Users
    Route::get('/users/roles-lite', [UserController::class, 'rolesLite']);
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::patch('/users/{id}/toggle', [UserController::class, 'toggle']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::post('/users/{id}/reset-password', [UserController::class, 'resetPassword']);
    Route::post('/users/{id}/roles', [UserController::class, 'assignRole']);

    // Roles and permissions
    Route::get('/roles', [RoleController::class, 'index']);
    Route::get('/role-permissions', [RoleController::class, 'permissions']);
    Route::get('/roles/{id}/permissions', [RoleController::class, 'rolePermissions']);
    Route::post('/roles', [RoleController::class, 'store']);
    Route::put('/roles/{id}', [RoleController::class, 'update']);
    Route::post('/roles/{id}/permissions', [RoleController::class, 'assignPermissions']);

    Route::get('/permissions', [PermissionController::class, 'index']);
    Route::post('/permissions', [PermissionController::class, 'store']);
    Route::put('/permissions/{id}', [PermissionController::class, 'update']);
    Route::delete('/permissions/{id}', [PermissionController::class, 'destroy']);

    // Customers
    Route::get('/customers', [CustomerController::class, 'index']);
    Route::get('/customers/{id}', [CustomerController::class, 'show']);
    Route::put('/customers/{id}', [CustomerController::class, 'update']);
    Route::patch('/customers/{id}/verify', [CustomerController::class, 'verify']);
    Route::patch('/customers/{id}/reject', [CustomerController::class, 'reject']);

    // Audit logs and reports
    Route::get('/audit-logs', [AuditLogController::class, 'index']);
    Route::get('/audit-logs/{id}', [AuditLogController::class, 'show']);

    Route::get('/reports/users-summary', [EserviceReportController::class, 'usersSummary']);
    Route::get('/reports/users-by-location', [EserviceReportController::class, 'usersByLocation']);
    Route::get('/reports/role-assignments', [EserviceReportController::class, 'roleAssignments']);
    Route::get('/reports/customer-verification', [EserviceReportController::class, 'customerVerification']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);

    
});
