<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\ServiceFormController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\UserServiceAssignmentController;
use App\Http\Controllers\Api\ServiceFormSectionController;
use App\Http\Controllers\Api\ServiceFormFieldController;

// use App\Http\Controllers\Api\ServiceFormController;

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


    /*
|--------------------------------------------------------------------------
| SERVICE FORM SECTIONS
|--------------------------------------------------------------------------
*/

Route::get(
    '/service-form-sections',
    [ServiceFormSectionController::class, 'index']
);

Route::post(
    '/service-form-sections',
    [ServiceFormSectionController::class, 'store']
);

Route::get(
    '/service-form-sections/{serviceFormSection}',
    [ServiceFormSectionController::class, 'show']
);

Route::put(
    '/service-form-sections/{serviceFormSection}',
    [ServiceFormSectionController::class, 'update']
);

Route::delete(
    '/service-form-sections/{serviceFormSection}',
    [ServiceFormSectionController::class, 'destroy']
);



Route::get(
    '/service-form-fields',
    [ServiceFormFieldController::class, 'index']
);

Route::post(
    '/service-form-fields',
    [ServiceFormFieldController::class, 'store']
);

Route::get(
    '/service-form-fields/{serviceFormField}',
    [ServiceFormFieldController::class, 'show']
);

Route::put(
    '/service-form-fields/{serviceFormField}',
    [ServiceFormFieldController::class, 'update']
);

Route::delete(
    '/service-form-fields/{serviceFormField}',
    [ServiceFormFieldController::class, 'destroy']
);
});