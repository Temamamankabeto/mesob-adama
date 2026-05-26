<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\ServiceApplication;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerServiceApplicationController extends Controller
{
    private const STATUS_GROUPS = [
        'pending' => [
            'pending',
            'submitted',
            'assigned',
            'accepted',
            'forwarded_to_back_officer',
            'waiting_customer_response',
            'waiting_payment',
            'payment_pending',
        ],
        'under_review' => [
            'under_review',
            'in_review',
            'processing',
            'back_officer_review',
            'forwarded',
        ],
        'appointed' => [
            'appointed',
            'appointment_scheduled',
        ],
        'approved' => [
            'approved',
            'verified',
            'back_officer_approved',
            'approved_by_manager',
            'manager_approved',
            'payment_verified',
        ],
        'completed' => [
            'completed',
        ],
        'rejected' => [
            'rejected',
            'rejected_by_manager',
            'back_officer_rejected',
        ],
    ];

    public function index(Request $request): JsonResponse
    {
        $baseQuery = ServiceApplication::query()
            ->where('customer_id', $request->user()->id);

        $this->applySearch($baseQuery, $request);

        $statusCounts = $this->statusCounts(clone $baseQuery);

        $applicationsQuery = (clone $baseQuery)
            ->with(['service', 'city', 'subcity', 'woreda', 'appointments']);

        $this->applyStatusFilter($applicationsQuery, $request->input('status'));

        $applications = $applicationsQuery
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
                'status_counts' => $statusCounts,
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
                'currentWindow',
                'currentOfficer',
                'assignee',
                'data',
                'files.uploader',
                'appointments.scheduler',
                'workflows.window',
                'workflows.officer',
                'histories.actor',
                'histories.sender',
                'histories.receiver',
                'histories.fromWindow',
                'histories.toWindow',
                'shares.sharedFromOfficer',
                'shares.sharedToOfficer',
                'shares.fromWindow',
                'shares.toWindow',
            ]),
        ]);
    }

    private function applySearch(Builder $query, Request $request): void
    {
        $query->when($request->filled('search'), function (Builder $query) use ($request) {
            $search = $request->input('search');

            $query->where(function (Builder $query) use ($search) {
                $query->where('tracking_number', 'like', "%{$search}%")
                    ->orWhereHas('service', function (Builder $serviceQuery) use ($search) {
                        $serviceQuery->where('name', 'like', "%{$search}%");
                    });
            });
        });
    }

    private function applyStatusFilter(Builder $query, ?string $status): void
    {
        if (!$status || $status === 'all') {
            return;
        }

        $query->whereIn('status', self::STATUS_GROUPS[$status] ?? [$status]);
    }

    private function statusCounts(Builder $query): array
    {
        $counts = [
            'total' => (clone $query)->count(),
        ];

        foreach (self::STATUS_GROUPS as $key => $statuses) {
            $counts[$key] = (clone $query)->whereIn('status', $statuses)->count();
        }

        return $counts;
    }
}
