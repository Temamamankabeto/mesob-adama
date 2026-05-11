<?php

namespace App\Services;

use App\Models\ServiceApplication;

class ApplicationDashboardService
{
    public function stats(): array
    {
        return [
            'total' => ServiceApplication::count(),
            'submitted' => ServiceApplication::where('status', 'submitted')->count(),
            'approved' => ServiceApplication::where('status', 'approved')->count(),
            'rejected' => ServiceApplication::where('status', 'rejected')->count(),
            'completed' => ServiceApplication::where('status', 'completed')->count(),
        ];
    }
}
