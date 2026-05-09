<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\ApplicationDashboardService;

class ApplicationDashboardController extends Controller
{
    public function __construct(
        protected ApplicationDashboardService $dashboardService
    ) {}

    public function summary()
    {
        return response()->json([
            'success' => true,
            'message' => 'Application dashboard summary retrieved successfully',
            'data' => $this->dashboardService->summary(),
        ]);
    }
}