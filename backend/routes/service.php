<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\ServiceFormController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\ServiceFormSectionController;
use App\Http\Controllers\Api\UserServiceAssignmentController;

// use App\Http\Controllers\Api\ServiceFormController;

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/services', [ServiceController::class, 'index']);
    Route::post('/services', [ServiceController::class, 'store']);
    Route::put('/services/{service}', [ServiceController::class, 'update']);
    Route::delete('/services/{service}', [ServiceController::class, 'destroy']);

    Route::get('/users/{user}/services', [UserServiceAssignmentController::class, 'show']);
    Route::post('/users/{user}/services', [UserServiceAssignmentController::class, 'assign']);
    Route::delete('/users/{user}/services/{serviceId}', [UserServiceAssignmentController::class, 'remove']);
    Route::patch('/users/{user}/services/{serviceId}/toggle', [UserServiceAssignmentController::class, 'toggle']);
    Route::get('/service-officers', [UserServiceAssignmentController::class, 'officers']);

    Route::get('/services/{service}/forms', [ServiceController::class, 'forms']);
    Route::post('/services/{service}/forms', [ServiceController::class, 'storeForm']);
    Route::get('/service-forms/{serviceForm}', [ServiceController::class, 'showForm']);
    Route::put('/service-forms/{serviceForm}', [ServiceController::class, 'updateForm']);
    Route::delete('/service-forms/{serviceForm}', [ServiceController::class, 'destroyForm']);
    Route::patch('/service-forms/{serviceForm}/toggle', [ServiceController::class, 'toggleForm']);

<<<<<<<<< Temporary merge branch 1
    Route::put(
        '/services/{service}',
        [ServiceController::class, 'update']
    );

    Route::delete(
        '/services/{service}',
        [ServiceController::class, 'destroy']
    );

    /*
    |--------------------------------------------------------------------------
    | SERVICE FORMS
    |--------------------------------------------------------------------------
    */

    Route::apiResource(
        'service-forms',
        ServiceFormController::class
    );

    /*
    |--------------------------------------------------------------------------
    | USER SERVICE ASSIGNMENTS
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/users/{user}/services',
        [UserServiceAssignmentController::class, 'show']
    );

    Route::post(
        '/users/{user}/services',
        [UserServiceAssignmentController::class, 'assign']
    );

    Route::delete(
        '/users/{user}/services/{serviceId}',
        [UserServiceAssignmentController::class, 'remove']
    );

    Route::patch(
        '/users/{user}/services/{serviceId}/toggle',
        [UserServiceAssignmentController::class, 'toggle']
    );

    /*
    |--------------------------------------------------------------------------
    | OFFICERS
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/service-officers',
        [UserServiceAssignmentController::class, 'officers']
    );
=========
    Route::get('/service-form-sections', [ServiceFormSectionController::class, 'index']);
    Route::post('/service-form-sections', [ServiceFormSectionController::class, 'store']);
    Route::get('/service-form-sections/{serviceFormSection}', [ServiceFormSectionController::class, 'show']);
    Route::put('/service-form-sections/{serviceFormSection}', [ServiceFormSectionController::class, 'update']);
    Route::delete('/service-form-sections/{serviceFormSection}', [ServiceFormSectionController::class, 'destroy']);
>>>>>>>>> Temporary merge branch 2
});