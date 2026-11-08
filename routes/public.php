<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Public\TicketController;
use App\Http\Controllers\Api\Public\PublicQueueDisplayController;
use App\Http\Controllers\Api\Public\PublicOfficerCounterController;

use App\Http\Controllers\Api\Public\HomeController;
use App\Http\Controllers\Api\Public\PublicLocationController;
use App\Http\Controllers\Api\Public\PublicServiceController;
use App\Http\Controllers\Api\Public\ApplicationTrackingController;
use App\Http\Controllers\Api\Public\ContactController;
use App\Http\Controllers\Api\Public\PublicReportController;
use App\Http\Controllers\Api\Public\PublicNewsController;
use App\Http\Controllers\Api\Chatbot\PublicChatbotController;

Route::prefix('public')->group(function () {

    // Read-only counter display; officer codes are unique in the existing users table.
    Route::get('/counter/{officerCode}', [PublicOfficerCounterController::class, 'show'])
        ->where('officerCode', '[A-Za-z0-9-]{1,10}')
        ->middleware('throttle:60,1');

    // Read-only agent incoming-ticket TV; no ticket calling or state mutation.
    Route::get('/agent-ticket-display', [\App\Http\Controllers\Api\Public\AgentTicketDisplayController::class, 'index'])
        ->middleware('throttle:60,1');

    // Read-only, office-scoped public TV queue.
    Route::get('/queue-display', [PublicQueueDisplayController::class, 'index'])
        ->middleware('throttle:60,1');

    // Native MESOB ticket kiosk.
    Route::get('/ticket/statistics', [TicketController::class, 'statistics'])
        ->middleware('throttle:60,1');

    Route::get('/ticket/windows', [TicketController::class, 'windows'])
        ->middleware('throttle:60,1');

    Route::post('/ticket/issue', [TicketController::class, 'issue']);

    Route::get('/ticket/{requestId}', [TicketController::class, 'show'])
        ->whereUuid('requestId')
        ->middleware('throttle:30,1');
    Route::get('/homepage', [HomeController::class, 'index']);
    Route::get('/locations', [PublicLocationController::class, 'index']);
    Route::get('/services', [PublicServiceController::class, 'index']);
    Route::get('/services/featured', [PublicServiceController::class, 'featured']);
    Route::get('/window-services', [PublicServiceController::class, 'windowServices']);
    Route::get('/feedback-windows', [PublicServiceController::class, 'feedbackWindows']);
    Route::get('/services/{service}', [PublicServiceController::class, 'show']);
    Route::post('/contact', [ContactController::class, 'store']);
    Route::post('/chatbot/message', [PublicChatbotController::class, 'message']);
    Route::get('/reports/dashboard', [PublicReportController::class, 'dashboard']);
    Route::get('/news', [PublicNewsController::class, 'index']);
});
