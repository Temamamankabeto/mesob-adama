<?php

use App\Http\Controllers\Api\WindowController;
use App\Http\Controllers\Api\ServiceWindowController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    /*
    |--------------------------------------------------------------------------
    | WINDOWS
    |--------------------------------------------------------------------------
    */
    Route::get('/windows', [WindowController::class, 'index']);
    Route::post('/windows', [WindowController::class, 'store']);
    Route::put('/windows/{window}', [WindowController::class, 'update']);
    Route::delete('/windows/{window}', [WindowController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | SERVICE WINDOW DRAG/DROP BOARD
    |--------------------------------------------------------------------------
    */
    Route::get('/service-window/board', [ServiceWindowController::class, 'board']);
    Route::post('/service-window/move', [ServiceWindowController::class, 'move']);
    Route::delete('/service-window/services/{service}', [ServiceWindowController::class, 'unassign']);

    /*
    |--------------------------------------------------------------------------
    | SERVICE WINDOW ASSIGNMENT
    |--------------------------------------------------------------------------
    */
    Route::post('/services/{service}/windows', [ServiceWindowController::class, 'assign']);
    Route::get('/services/{service}/windows', [ServiceWindowController::class, 'show']);
});
