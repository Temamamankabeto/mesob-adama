<?php

use Illuminate\Support\Facades\Route;

Route::get('/ping', function () {
    return response()->json([
        'success' => true,
        'message' => 'eService User Management API is working',
        'time' => now(),
    ]);
});

require base_path('routes/auth.php');
require base_path('routes/user.php');
