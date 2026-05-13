<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\ApplicationDashboardService;

class ApplicationDashboardController extends Controller
{
    public function __construct(protected ApplicationDashboardService $service) {}

    public function stats()
    {
        return $this->summary();
    }

    public function summary()
    {
        return response()->json([
            'success' => true,
            'message' => 'Application summary retrieved successfully',
            'data' => $this->service->stats(),
        ]);
    }
}
