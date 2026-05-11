<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\ApplicationDashboardService;

class ApplicationDashboardController extends Controller
{
    public function __construct(
        protected ApplicationDashboardService $service
    ) {}

    public function stats()
    {
        return response()->json([
            'success' => true,
            'message' => 'Dashboard stats retrieved successfully',
            'data' => $this->service->stats(),
        ]);
    }
}
