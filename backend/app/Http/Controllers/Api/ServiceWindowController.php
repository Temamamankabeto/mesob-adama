<?php

namespace App\Http\Controllers\Api;

use App\Models\Service;

use App\Services\ServiceWindowService;

use App\Http\Controllers\Controller;

use App\Http\Requests\AssignWindowToServiceRequest;

class ServiceWindowController extends Controller
{
    protected ServiceWindowService
        $serviceWindowService;

    public function __construct(
        ServiceWindowService
            $serviceWindowService
    ) {
        $this->serviceWindowService =
            $serviceWindowService;
    }

    /**
     * Assign windows to service.
     */
    public function assign(
        AssignWindowToServiceRequest $request,
        Service $service
    ) {

        $updatedService =
            $this->serviceWindowService
                ->assign(
                    $service,
                    $request->validated()['windows']
                );

        return response()->json([

            'success' => true,

            'message' =>
                'Windows assigned successfully',

            'data' => $updatedService,

        ]);
    }
    public function show(Service $service)
{
    $service->load('windows');

    return response()->json([
        'success' => true,

        'data' => $service,
    ]);
}
}