<?php

namespace App\Services;

use App\Models\ServiceApplication;

class ApplicationTrackingService
{
    public function track(string $trackingNumber)
    {
        return ServiceApplication::with([
            'service',
            'customer',
            'currentWindow',
            'currentOfficer',
            'data',
            'files',
            'workflow.window',
            'workflow.officer',
            'histories.actor',
        ])
            ->where('tracking_number', $trackingNumber)
            ->first();
    }
}