<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use App\Http\Middleware\SecurityHeaders;

Route::middleware(SecurityHeaders::class)->group(function () {
    Route::get('/', fn () => 'MESOB backend is running');

    // Fallback file server for the "public" disk.
    Route::get('/storage/{path}', function (string $path) {
        abort_unless(Storage::disk('public')->exists($path), 404);

        return Storage::disk('public')->response($path);
    })->where('path', '.*');
});
