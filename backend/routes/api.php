<?php

use Illuminate\Support\Facades\Route;

Route::get('/ping', function () {
    return response()->json([
        'success' => true,
        'message' => 'eService API is working',
        'time' => now(),
    ]);
});

require base_path('routes/public.php');
require base_path('routes/auth.php');
require base_path('routes/user.php');
require base_path('routes/service.php');
require base_path('routes/window.php');
require base_path('routes/application.php');