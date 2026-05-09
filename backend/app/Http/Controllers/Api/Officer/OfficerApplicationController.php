<?php

namespace App\Http\Controllers\Api\Officer;

use App\Http\Controllers\Controller;
use App\Http\Requests\OfficerApplicationActionRequest;
use App\Models\ServiceApplication;
use App\Services\OfficerApplicationService;

class OfficerApplicationController extends Controller
{
    public function __construct(
        protected OfficerApplicationService $applicationService
    ) {}

    public function queue()
    {
        return response()->json([
            'success' => true,
            'message' => 'Officer queue retrieved successfully',
            'data' => $this->applicationService->queue(
                request()->user()
            ),
        ]);
    }

    public function show(ServiceApplication $application)
    {
        return response()->json([
            'success' => true,
            'message' => 'Application retrieved successfully',
            'data' => $this->applicationService->show($application),
        ]);
    }

    public function approve(
        OfficerApplicationActionRequest $request,
        ServiceApplication $application
    ) {
        return response()->json([
            'success' => true,
            'message' => 'Application approved successfully',
            'data' => $this->applicationService->approve(
                $application,
                $request->user(),
                $request->remark
            ),
        ]);
    }

    public function reject(
        OfficerApplicationActionRequest $request,
        ServiceApplication $application
    ) {
        return response()->json([
            'success' => true,
            'message' => 'Application rejected successfully',
            'data' => $this->applicationService->reject(
                $application,
                $request->user(),
                $request->remark
            ),
        ]);
    }

    public function returnApplication(
        OfficerApplicationActionRequest $request,
        ServiceApplication $application
    ) {
        return response()->json([
            'success' => true,
            'message' => 'Application returned successfully',
            'data' => $this->applicationService->returnApplication(
                $application,
                $request->user(),
                $request->remark
            ),
        ]);
    }

    public function complete(
        OfficerApplicationActionRequest $request,
        ServiceApplication $application
    ) {
        return response()->json([
            'success' => true,
            'message' => 'Application completed successfully',
            'data' => $this->applicationService->complete(
                $application,
                $request->user(),
                $request->remark
            ),
        ]);
    }
}