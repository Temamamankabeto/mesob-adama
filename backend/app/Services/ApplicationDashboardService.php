<?php

namespace App\Services;

use App\Models\ServiceApplication;

class ApplicationDashboardService
{
    public function summary()
    {
        return [
            'total' => ServiceApplication::count(),

            'submitted' => ServiceApplication::where(
                'status',
                'submitted'
            )->count(),

            'under_review' => ServiceApplication::where(
                'status',
                'under_review'
            )->count(),

            'returned' => ServiceApplication::where(
                'status',
                'returned'
            )->count(),

            'approved' => ServiceApplication::where(
                'status',
                'approved'
            )->count(),

            'rejected' => ServiceApplication::where(
                'status',
                'rejected'
            )->count(),

            'completed' => ServiceApplication::where(
                'status',
                'completed'
            )->count(),
        ];
    }
}