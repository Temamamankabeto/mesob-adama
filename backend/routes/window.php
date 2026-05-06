<?php

use App\Http\Controllers\Api\WindowController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ServiceWindowController;
 



Route::middleware('auth:sanctum')->group(function () {

     // WINDOWS
    Route::get(
        '/windows',
        [WindowController::class, 'index']
    );

    Route::post(
        '/windows',
        [WindowController::class, 'store']
    );

    Route::put(
        '/windows/{window}',
        [WindowController::class, 'update']
    );

    Route::delete(
        '/windows/{window}',
        [WindowController::class, 'destroy']
    );

    Route::post(
    '/services/{service}/windows',
    [ServiceWindowController::class, 'assign']
);
    Route::get(
    '/services/{service}/windows',
    [ServiceWindowController::class, 'show']
); 
});