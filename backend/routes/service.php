<?php
 
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ServiceController;




Route::middleware('auth:sanctum')->group(function () {

    // SERVICES
    Route::get('/services', [ServiceController::class, 'index']);
    Route::post('/services', [ServiceController::class, 'store']);
    Route::put('/services/{service}', [ServiceController::class, 'update']);
    Route::delete('/services/{service}', [ServiceController::class, 'destroy']);

    
});