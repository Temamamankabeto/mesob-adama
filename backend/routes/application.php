<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\ServiceApplicationController;
use App\Http\Controllers\Api\Admin\ServiceFormController;
use App\Http\Controllers\Api\Admin\ServiceFormFieldController;
use App\Http\Controllers\Api\Admin\ServiceFormFieldConditionController;
use App\Http\Controllers\Api\Admin\ServiceFormSectionController;
use App\Http\Controllers\Api\Admin\ServiceFormStepController;
use App\Http\Controllers\Api\Admin\ApplicationDashboardController;
use App\Http\Controllers\Api\Customer\CustomerServiceApplicationController;
use App\Http\Controllers\Api\Public\PublicApplicationController;
use App\Http\Controllers\Api\Public\ApplicationTrackingController;
use App\Http\Controllers\Api\Officer\OfficerApplicationController;
use App\Http\Controllers\Api\Officer\CertificateController;

/*
|--------------------------------------------------------------------------
| AUTHENTICATED CUSTOMER APPLICATIONS
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/applications', [ApplicationController::class, 'index']);
    Route::post('/applications', [ApplicationController::class, 'store']);
    Route::get('/applications/{application}', [ApplicationController::class, 'show']);
    Route::put('/applications/{application}', [ApplicationController::class, 'update']);
    Route::delete('/applications/{application}', [ApplicationController::class, 'destroy']);

    Route::get('/customer/service-applications', [
        CustomerServiceApplicationController::class,
        'index',
    ]);

    Route::get('/customer/service-applications/{application}', [
        CustomerServiceApplicationController::class,
        'show',
    ]);
});

/*
|--------------------------------------------------------------------------
| ADMIN FORM BUILDER + APPLICATION BACK OFFICE
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')
    ->prefix('admin')
    ->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);

        Route::apiResource('service-forms', ServiceFormController::class);
        Route::apiResource('service-form-sections', ServiceFormSectionController::class);
        Route::apiResource('service-form-steps', ServiceFormStepController::class);
        Route::apiResource('service-form-fields', ServiceFormFieldController::class);
        Route::apiResource('service-form-field-conditions', ServiceFormFieldConditionController::class);

        Route::get('/service-applications', [ServiceApplicationController::class, 'index']);
        Route::get('/service-applications/{serviceApplication}', [ServiceApplicationController::class, 'show']);
        Route::put('/service-applications/{serviceApplication}', [ServiceApplicationController::class, 'update']);
        Route::delete('/service-applications/{serviceApplication}', [ServiceApplicationController::class, 'destroy']);

        Route::get('/applications/summary', [
            ApplicationDashboardController::class,
            'summary',
        ]);
    });

/*
|--------------------------------------------------------------------------
| PUBLIC APPLICATION
|--------------------------------------------------------------------------
*/

Route::prefix('public')
    ->group(function () {
        Route::get('/services/{service}/form', [
            PublicApplicationController::class,
            'form',
        ]);

        Route::middleware('auth:sanctum')->post('/services/{service}/apply', [
            PublicApplicationController::class,
            'apply',
        ]);

        Route::post('/track-application', [
            ApplicationTrackingController::class,
            'track',
        ]);
    });

/*
|--------------------------------------------------------------------------
| OFFICER APPLICATION PROCESSING
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')
    ->prefix('officer')
    ->group(function () {
        Route::get('/applications/queue', [
            OfficerApplicationController::class,
            'queue',
        ]);

        Route::get('/applications/{application}', [
            OfficerApplicationController::class,
            'show',
        ]);

        Route::post('/applications/{application}/accept', [
            OfficerApplicationController::class,
            'accept',
        ]);

        Route::post('/applications/{application}/share', [
            OfficerApplicationController::class,
            'share',
        ]);

        Route::post('/applications/{application}/forward-to-back-officer', [
            OfficerApplicationController::class,
            'forwardToBackOfficer',
        ]);

        Route::post('/applications/{application}/approve', [
            OfficerApplicationController::class,
            'approve',
        ]);

        Route::post('/applications/{application}/reject', [
            OfficerApplicationController::class,
            'reject',
        ]);

        Route::post('/applications/{application}/return', [
            OfficerApplicationController::class,
            'returnApplication',
        ]);

        Route::post('/applications/{application}/complete', [
            OfficerApplicationController::class,
            'complete',
        ]);

        Route::get('/applications/{application}/certificate', [
            CertificateController::class,
            'download',
        ]);
    });
