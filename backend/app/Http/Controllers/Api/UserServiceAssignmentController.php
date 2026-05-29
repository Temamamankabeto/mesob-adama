<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssignUserServiceRequest;
use App\Models\User;
use App\Services\UserServiceAssignmentService;
use Illuminate\Http\Request;

class UserServiceAssignmentController extends Controller
{
    public function __construct(
        protected UserServiceAssignmentService $assignmentService
    ) {}

    public function board(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'User service assignment board retrieved successfully',
            'data' => $this->assignmentService->board(
                $request->user(),
                $request->input('level', 'city'),
                $request->integer('subcity_id') ?: null,
                $request->integer('woreda_id') ?: null
            ),
        ]);
    }

    public function assignAdvanced(Request $request)
    {
        $data = $request->validate([
            'service_id' => ['required', 'integer', 'exists:services,id'],
            'officer_id' => ['required', 'integer', 'exists:users,id'],
            'officer_type' => ['required', 'string', 'in:front,back,front_officer,back_officer'],
            'window_id' => ['required', 'integer', 'exists:windows,id'],
            'level' => ['required', 'string', 'in:city,subcity,woreda'],
            'subcity_id' => ['nullable', 'integer', 'exists:subcities,id'],
            'woreda_id' => ['nullable', 'integer', 'exists:woredas,id'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Officer assigned to service successfully',
            'data' => $this->assignmentService->assignAdvanced($request->user(), $data),
        ]);
    }

    public function unassignAdvanced(Request $request)
    {
        $data = $request->validate([
            'service_id' => ['required', 'integer', 'exists:services,id'],
            'officer_id' => ['required', 'integer', 'exists:users,id'],
            'officer_type' => ['required', 'string', 'in:front,back,front_officer,back_officer'],
            'window_id' => ['required', 'integer', 'exists:windows,id'],
            'level' => ['required', 'string', 'in:city,subcity,woreda'],
            'subcity_id' => ['nullable', 'integer', 'exists:subcities,id'],
            'woreda_id' => ['nullable', 'integer', 'exists:woredas,id'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Officer removed from service successfully',
            'data' => $this->assignmentService->unassignAdvanced($request->user(), $data),
        ]);
    }

    public function show(User $user)
    {
        return response()->json([
            'success' => true,
            'message' => 'Assigned services retrieved successfully',
            'data' => $this->assignmentService->getAssignedServices($user),
        ]);
    }

    public function assign(AssignUserServiceRequest $request, User $user)
    {
        return response()->json([
            'success' => true,
            'message' => 'Services assigned successfully',
            'data' => $this->assignmentService->assign($user, $request->validated()['service_ids']),
        ]);
    }

    public function remove(User $user, int $serviceId)
    {
        return response()->json([
            'success' => true,
            'message' => 'Service removed successfully',
            'data' => $this->assignmentService->remove($user, $serviceId),
        ]);
    }

    public function toggle(User $user, int $serviceId)
    {
        return response()->json([
            'success' => true,
            'message' => 'Assignment status updated successfully',
            'data' => $this->assignmentService->toggle($user, $serviceId),
        ]);
    }

    public function officers(Request $request)
    {
        $perPage = min((int) $request->get('per_page', 10), 100);
        $search = trim((string) $request->get('search', ''));
        $level = strtolower((string) $request->get('level', ''));
        $subcityId = $request->integer('subcity_id') ?: null;
        $woredaId = $request->integer('woreda_id') ?: null;
        $role = $request->get('role');

        $officers = User::query()
            ->with([
                'roles:id,name',
                'city:id,name',
                'subcity:id,name,city_id',
                'woreda:id,name,subcity_id',
                'assignedServices' => function ($query) use ($level, $subcityId, $woredaId) {
                    $query
                        ->select('services.id', 'services.name', 'services.has_back_officer')
                        ->with([
                            'windows:id,name,availability',
                        ])
                        ->when($level, function ($query) use ($level) {
                            $query->where('user_service_assignments.assignment_level', $level);
                        })
                        ->when($subcityId, function ($query) use ($subcityId) {
                            $query->where('user_service_assignments.subcity_id', $subcityId);
                        })
                        ->when($woredaId, function ($query) use ($woredaId) {
                            $query->where('user_service_assignments.woreda_id', $woredaId);
                        });
                },
            ])
            ->where('is_active', true)
            ->whereHas('roles', function ($query) use ($role) {
                $allowed = ['front_officer', 'back_officer'];

                if (in_array($role, $allowed, true)) {
                    $allowed = [$role];
                }

                $query->whereIn('name', $allowed);
            })
            ->when($level === 'city', function ($query) {
                $query->whereNotNull('city_id')
                    ->whereNull('subcity_id')
                    ->whereNull('woreda_id');
            })
            ->when($level === 'subcity', function ($query) use ($subcityId) {
                $query->whereNotNull('subcity_id')
                    ->whereNull('woreda_id');

                if ($subcityId) {
                    $query->where('subcity_id', $subcityId);
                }
            })
            ->when($level === 'woreda', function ($query) use ($subcityId, $woredaId) {
                $query->whereNotNull('woreda_id');

                if ($subcityId) {
                    $query->where('subcity_id', $subcityId);
                }

                if ($woredaId) {
                    $query->where('woreda_id', $woredaId);
                }
            })
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhereHas('roles', function ($roleQuery) use ($search) {
                            $roleQuery->where('name', 'like', "%{$search}%");
                        })
                        ->orWhereHas('assignedServices', function ($serviceQuery) use ($search) {
                            $serviceQuery->where('services.name', 'like', "%{$search}%");
                        });
                });
            })
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Officers retrieved successfully',
            'data' => collect($officers->items())->map(function (User $officer) {
                return [
                    'id' => $officer->id,
                    'name' => $officer->name,
                    'email' => $officer->email,
                    'phone' => $officer->phone,
                    'role' => $officer->getRoleNames()->first(),
                    'roles' => $officer->roles,
                    'location_level' => $officer->woreda_id ? 'woreda' : ($officer->subcity_id ? 'subcity' : ($officer->city_id ? 'city' : null)),
                    'city' => $officer->city,
                    'subcity' => $officer->subcity,
                    'woreda' => $officer->woreda,
                    'assigned_services' => $officer->assignedServices->map(function ($service) {
                        return [
                            'id' => $service->id,
                            'name' => $service->name,
                            'has_back_officer' => (bool) $service->has_back_officer,
                            'officer_type' => $service->pivot?->officer_type,
                            'window_id' => $service->pivot?->window_id,
                            'assignment_level' => $service->pivot?->assignment_level,
                            'city_id' => $service->pivot?->city_id,
                            'subcity_id' => $service->pivot?->subcity_id,
                            'woreda_id' => $service->pivot?->woreda_id,
                            'is_active' => (bool) $service->pivot?->is_active,
                            'assigned_at' => $service->pivot?->assigned_at,
                        ];
                    })->values(),
                ];
            })->values(),
            'meta' => [
                'current_page' => $officers->currentPage(),
                'last_page' => $officers->lastPage(),
                'per_page' => $officers->perPage(),
                'total' => $officers->total(),
            ],
        ]);
    }
}
