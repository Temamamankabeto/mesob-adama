<?php

namespace App\Http\Controllers\Api\Officer;

use App\Http\Controllers\Controller;
use App\Http\Requests\OfficerApplicationActionRequest;
use App\Models\ServiceApplication;
use App\Services\OfficerApplicationService;
use Illuminate\Http\Request;

class OfficerApplicationController extends Controller
{
    public function __construct(protected OfficerApplicationService $applicationService) {}

    public function notifications(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Officer notifications retrieved successfully',
            'data' => $this->applicationService->notificationSummary($request->user()),
        ]);
    }

    public function queue(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Officer queue retrieved successfully',
            'data' => $this->applicationService->queue($request->user(), $request->query('bucket'), $request->query('search')),
        ]);
    }

    public function show(ServiceApplication $application)
    {
        return response()->json(['success' => true,'message' => 'Application retrieved successfully','data' => $this->applicationService->show($application)]);
    }

    public function accept(OfficerApplicationActionRequest $request, ServiceApplication $application)
    {
        return response()->json(['success'=>true,'message'=>'Application accepted successfully','data'=>$this->applicationService->accept($application,$request->user(),$request->remark)]);
    }

    public function appointment(OfficerApplicationActionRequest $request, ServiceApplication $application)
    {
        return response()->json(['success'=>true,'message'=>'Appointment scheduled successfully','data'=>$this->applicationService->appointment($application,$request->user(),$request->validated())]);
    }

    public function share(OfficerApplicationActionRequest $request, ServiceApplication $application)
    {
        return response()->json(['success'=>true,'message'=>'Application shared successfully','data'=>$this->applicationService->share($application,$request->user(),$request->validated())]);
    }

    public function forwardToBackOfficer(OfficerApplicationActionRequest $request, ServiceApplication $application)
    {
        return response()->json(['success'=>true,'message'=>'Application forwarded to back officer successfully','data'=>$this->applicationService->forwardToBackOfficer($application,$request->user(),$request->validated())]);
    }

    public function approve(OfficerApplicationActionRequest $request, ServiceApplication $application)
    {
        return response()->json(['success'=>true,'message'=>'Application approved successfully','data'=>$this->applicationService->approve($application,$request->user(),$request->remark)]);
    }

    public function reject(OfficerApplicationActionRequest $request, ServiceApplication $application)
    {
        return response()->json(['success'=>true,'message'=>'Application rejected successfully','data'=>$this->applicationService->reject($application,$request->user(),$request->remark ?? $request->reason)]);
    }

    public function returnApplication(OfficerApplicationActionRequest $request, ServiceApplication $application)
    {
        return response()->json(['success'=>true,'message'=>'Application returned successfully','data'=>$this->applicationService->returnApplication($application,$request->user(),$request->remark)]);
    }

    public function complete(OfficerApplicationActionRequest $request, ServiceApplication $application)
    {
        return response()->json(['success'=>true,'message'=>'Application completed successfully','data'=>$this->applicationService->complete($application,$request->user(),$request->remark)]);
    }

    public function escalateToManager(OfficerApplicationActionRequest $request, ServiceApplication $application)
    {
        return response()->json(['success'=>true,'message'=>'Application escalated to manager successfully','data'=>$this->applicationService->escalateToManager($application,$request->user(),$request->validated())]);
    }
}
