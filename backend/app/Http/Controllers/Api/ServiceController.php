<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreServiceRequest;
use App\Http\Requests\UpdateServiceRequest;
use App\Models\Service;
use App\Services\ServiceService;

class ServiceController extends Controller
{
    protected ServiceService $serviceService;

    public function __construct(ServiceService $serviceService)
    {
        $this->serviceService = $serviceService;
    }

    /**
     * List services
     */
    public function index()
    {
        $this->authorize('viewAny', Service::class);

        $services = $this->serviceService->getAll();

        return response()->json([
            'success' => true,
            'message' => 'Services retrieved successfully',
            'data' => $services,
        ]);
    }

    /**
     * Store service
     */
    public function store(StoreServiceRequest $request)
    {
        $this->authorize('create', Service::class);

        $service = $this->serviceService->create(
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Service created successfully',
            'data' => $service,
        ], 201);
    }

    /**
     * Update service
     */
    public function update(UpdateServiceRequest $request, Service $service)
    {
        $this->authorize('update', $service);

        $updatedService = $this->serviceService->update(
            $service,
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Service updated successfully',
            'data' => $updatedService,
        ]);
    }

    /**
     * Delete service
     */
    public function destroy(Service $service)
    {
        $this->authorize('delete', $service);

        $this->serviceService->delete($service);

        return response()->json([
            'success' => true,
            'message' => 'Service deleted successfully',
        ]);
    }
}