<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\ServiceApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerServiceApplicationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $applications = ServiceApplication::query()
            ->with(['service', 'city', 'subcity', 'woreda'])
            ->where('customer_id', $request->user()->id)
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->input('status'));
            })
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->input('search');

                $query->where(function ($query) use ($search) {
                    $query->where('tracking_number', 'like', "%{$search}%")
                        ->orWhereHas('service', function ($serviceQuery) use ($search) {
                            $serviceQuery->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->latest('submitted_at')
            ->paginate(min((int) $request->input('per_page', 10), 100));

        return response()->json([
            'success' => true,
            'message' => 'Customer applications retrieved successfully',
            'data' => $applications->items(),
            'meta' => [
                'current_page' => $applications->currentPage(),
                'per_page' => $applications->perPage(),
                'total' => $applications->total(),
                'last_page' => $applications->lastPage(),
            ],
        ]);
    }

    public function show(Request $request, ServiceApplication $application): JsonResponse
    {
        abort_if((int) $application->customer_id !== (int) $request->user()->id, 403);

        return response()->json([
            'success' => true,
            'message' => 'Customer application retrieved successfully',
            'data' => $application->load([
                'service',
                'customer',
                'city',
                'subcity',
                'woreda',
                'data',
                'files',
                'workflows.window',
                'workflows.officer',
                'histories.actor',
            ]),
        ]);
    }
}
