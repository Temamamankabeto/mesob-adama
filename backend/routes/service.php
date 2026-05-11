<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\ServiceController;

use App\Http\Controllers\Api\UserServiceAssignmentController;
// controller for service form

use App\Http\Controllers\Api\ServiceFormController;

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | SERVICES
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/services',
        [ServiceController::class, 'index']
    );

     Route::apiResource('service-forms', ServiceFormController::class);
    Route::post(
        '/services',
        [ServiceController::class, 'store']
    );

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

    /*
    |--------------------------------------------------------------------------
    | REMOVE ASSIGNMENT
    |--------------------------------------------------------------------------
    */

    Route::delete(
        '/users/{user}/services/{serviceId}',
        [UserServiceAssignmentController::class, 'remove']
    );

    /*
    |--------------------------------------------------------------------------
    | TOGGLE ASSIGNMENT
    |--------------------------------------------------------------------------
    */

    Route::patch(
        '/users/{user}/services/{serviceId}/toggle',
        [UserServiceAssignmentController::class, 'toggle']
    );

    /*
    |--------------------------------------------------------------------------
    | LIST OFFICERS WITH SERVICES
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/service-officers',
        [UserServiceAssignmentController::class, 'officers']
    );


    // service form route   

    /*
|--------------------------------------------------------------------------
| SERVICE FORMS
|--------------------------------------------------------------------------
*/

Route::get(
    '/services/{service}/forms',
    [ServiceController::class, 'forms']
);

Route::post(
    '/services/{service}/forms',
    [ServiceController::class, 'storeForm']
);

Route::get(
    '/service-forms/{serviceForm}',
    [ServiceController::class, 'showForm']
);

Route::put(
    '/service-forms/{serviceForm}',
    [ServiceController::class, 'updateForm']
);

Route::delete(
    '/service-forms/{serviceForm}',
    [ServiceController::class, 'destroyForm']
);

Route::patch(
    '/service-forms/{serviceForm}/toggle',
    [ServiceController::class, 'toggleForm']
);
});