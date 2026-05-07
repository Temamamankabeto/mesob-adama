<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\Public\HomeController;
use App\Http\Controllers\Api\Public\PublicServiceController;
use App\Http\Controllers\Api\Public\ApplicationTrackingController;

/*
|--------------------------------------------------------------------------
| PUBLIC HOMEPAGE
|--------------------------------------------------------------------------
*/

Route::prefix('public')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | HOMEPAGE
    |--------------------------------------------------------------------------
    */

    Route::get('/homepage', [
        HomeController::class,
        'index'
    ]);

    /*
    |--------------------------------------------------------------------------
    | SERVICES
    |--------------------------------------------------------------------------
    */

    Route::get('/services', [
        PublicServiceController::class,
        'index'
    ]);

    Route::get('/services/featured', [
        PublicServiceController::class,
        'featured'
    ]);

    Route::get('/services/{service}', [
        PublicServiceController::class,
        'show'
    ]);

    /*
    |--------------------------------------------------------------------------
    | TRACK APPLICATION
    |--------------------------------------------------------------------------
    */

    Route::post('/track-application', [
        ApplicationTrackingController::class,
        'track'
    ]);
});