<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\Public\HomeController;
use App\Http\Controllers\Api\Public\PublicLocationController;
use App\Http\Controllers\Api\Public\PublicServiceController;
use App\Http\Controllers\Api\Public\ApplicationTrackingController;

Route::prefix('public')->group(function () {
    Route::get('/homepage', [
        HomeController::class,
        'index',
    ]);

    Route::get('/locations', [
        PublicLocationController::class,
        'index',
    ]);

    Route::get('/services', [
        PublicServiceController::class,
        'index',
    ]);

    Route::get('/services/featured', [
        PublicServiceController::class,
        'featured',
    ]);

    Route::get('/window-services', [
        PublicServiceController::class,
        'windowServices',
    ]);

    Route::get('/services/{service}', [
        PublicServiceController::class,
        'show',
    ]);

    Route::post('/track-application', [
        ApplicationTrackingController::class,
        'track',
    ]);
});
