<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\Admin\ServiceFormController;
use App\Http\Controllers\Api\Admin\ServiceFormFieldController;
use App\Http\Controllers\Api\Admin\ApplicationDashboardController;

use App\Http\Controllers\Api\Public\PublicApplicationController;
use App\Http\Controllers\Api\Public\ApplicationTrackingController;

use App\Http\Controllers\Api\Officer\OfficerApplicationController;

/*
|--------------------------------------------------------------------------
| ADMIN FORM BUILDER
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')
    ->prefix('admin')
    ->group(function () {

        Route::get('/service-forms', [ServiceFormController::class, 'index']);
        Route::post('/service-forms', [ServiceFormController::class, 'store']);
        Route::get('/service-forms/{serviceForm}', [ServiceFormController::class, 'show']);
        Route::put('/service-forms/{serviceForm}', [ServiceFormController::class, 'update']);
        Route::delete('/service-forms/{serviceForm}', [ServiceFormController::class, 'destroy']);

        Route::get('/service-form-fields', [ServiceFormFieldController::class, 'index']);
        Route::post('/service-form-fields', [ServiceFormFieldController::class, 'store']);
        Route::get('/service-form-fields/{serviceFormField}', [ServiceFormFieldController::class, 'show']);
        Route::put('/service-form-fields/{serviceFormField}', [ServiceFormFieldController::class, 'update']);
        Route::delete('/service-form-fields/{serviceFormField}', [ServiceFormFieldController::class, 'destroy']);

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

        Route::get(
    '/applications/{application}/certificate',
    [CertificateController::class, 'download']
);
    });