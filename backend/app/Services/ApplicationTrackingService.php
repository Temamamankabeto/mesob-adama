<?php

namespace App\Services;

use App\Models\Application;

class ApplicationTrackingService
{
    /**
     * Track application.
     */
    public function track(
        string $applicationNumber
    ) {
        return Application::with([
            'service',
            'customer',
        ])
        ->where(
            'application_number',
            $applicationNumber
        )
        ->first();
    }
}