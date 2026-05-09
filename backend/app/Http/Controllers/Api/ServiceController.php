<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreServiceRequest;
use App\Http\Requests\UpdateServiceRequest;
use App\Models\Service;
use App\Services\ServiceService;
use Illuminate\Http\Request;

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
    //    */
public function index(Request $request)
{
    $services = Service::query()

        ->when($request->search, function ($q) use ($request) {
            $q->where('name', 'like', '%' . $request->search . '%');
        })

        ->latest()
        ->paginate(10);

    return response()->json([
        'data' => $services->items(),

        'meta' => [
            'current_page' => $services->currentPage(),
            'last_page' => $services->lastPage(),
            'per_page' => $services->perPage(),
            'total' => $services->total(),
        ]
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