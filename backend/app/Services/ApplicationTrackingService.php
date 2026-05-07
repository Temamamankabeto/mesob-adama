<?php

namespace App\Services;

use App\Models\ServiceRequest;

class ApplicationTrackingService
{
    public function track(string $applicationNumber)
    {
        return ServiceRequest::with([
            'customer',
            'officer',
        ])
            ->where('id', $applicationNumber)
            ->first();
    }
}