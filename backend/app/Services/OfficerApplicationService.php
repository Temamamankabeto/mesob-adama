<?php

namespace App\Services;

use App\Models\ServiceApplication;
use App\Models\ServiceApplicationHistory;
use App\Models\ServiceApplicationShare;
use App\Models\User;
use App\Models\Window;
use App\Support\AccessScope;
use App\Support\AppRoles;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OfficerApplicationService
{
    public function __construct(
        protected AccessScope $scope,
        protected ApplicationFileService $fileService
    ) {}

    public function queue(User $actor, ?string $bucket = null)
    {
        $query = ServiceApplication::with(['service','customer','currentWindow','currentOfficer'])
            ->where(function ($query) use ($actor) {
                $query->where('assigned_to', $actor->id)
                    ->orWhere('current_officer_id', $actor->id)
                    ->orWhere(function ($q) use ($actor) {
                        $q->whereIn('status', ['submitted','returned_to_front_officer','back_officer_approved'])
                          ->whereHas('service.assignedUsers', fn ($aq) => $aq->where('users.id', $actor->id));
                    });
            });

        $this->scope->applyServiceApplicationScope($query, $actor);

        $map = [
            'new' => ['submitted'],
            'shared' => ['shared_to_front_officer','shared_to_back_officer'],
            'accepted' => ['front_officer_review','back_officer_review'],
            'approved' => ['back_officer_approved','approved'],
            'escalated' => ['escalated_to_manager','assigned_by_manager'],
            'returned' => ['returned_to_front_officer','returned_to_customer'],
            'rejected' => ['rejected','back_officer_rejected'],
            'completed' => ['completed'],
        ];

        if ($bucket && isset($map[$bucket])) {
            $query->whereIn('status', $map[$bucket]);
        }

        return $query->latest()->paginate(10);
    }

    public function managerQueue(User $manager, ?string $bucket = null)
    {
        $query = ServiceApplication::with(['service','customer','currentWindow','currentOfficer'])
            ->where(function ($query) use ($manager) {
                $query->where('assigned_to', $manager->id)
                    ->orWhere('current_officer_id', $manager->id);
            })
            ->whereIn('status', ['escalated_to_manager','manager_review','assigned_by_manager','returned_to_manager','manager_forwarded','manager_resolved','completed']);

        $this->scope->applyServiceApplicationScope($query, $manager);

        if ($bucket) {
            $map = [
                'new' => ['escalated_to_manager'],
                'assigned' => ['assigned_by_manager'],
                'returned' => ['returned_to_manager'],
                'forwarded' => ['manager_forwarded'],
                'resolved' => ['manager_resolved'],
                'completed' => ['completed'],
            ];
            if (isset($map[$bucket])) $query->whereIn('status', $map[$bucket]);
        }

        return $query->latest()->paginate(10);
    }

    public function show(ServiceApplication $application)
    {
        return $application->load([
            'service.windows','customer','currentWindow','currentOfficer','assignee','data','files',
            'workflows.window','workflows.officer','histories.actor','histories.sender','histories.receiver','histories.fromWindow','histories.toWindow','shares.sharedFromOfficer','shares.sharedToOfficer','shares.fromWindow','shares.toWindow',
        ]);
    }

    public function accept(ServiceApplication $application, User $actor, ?string $remark = null)
    {
        $role = $this->actorOfficerRole($actor);
        $status = $role === AppRoles::BACK_OFFICER ? 'back_officer_review' : 'front_officer_review';
        return $this->transition($application, $actor, $status, 'accepted', $remark, receiverId: $actor->id, assignedTo: $actor->id);
    }

    public function share(ServiceApplication $application, User $actor, array $payload)
    {
        $targetId = (int)($payload['officer_id'] ?? $payload['front_officer_id'] ?? $payload['back_officer_id'] ?? 0);
        $windowId = (int)($payload['to_window_id'] ?? $payload['window_id'] ?? $application->current_window_id);
        $target = User::with('roles')->findOrFail($targetId);
        $window = Window::findOrFail($windowId);
        $level = $application->administrative_level ?: AppRoles::userLevel($actor);

        $this->assertSameLevelAndScope($application, $actor, $target, $level);
        $this->assertOfficerWindow($target, $window, $level);

        $status = $target->hasRole(AppRoles::BACK_OFFICER) ? 'shared_to_back_officer' : 'shared_to_front_officer';

        return DB::transaction(function () use ($application, $actor, $target, $window, $level, $payload, $status) {
            ServiceApplicationShare::create([
                'application_id' => $application->id,
                'shared_from_officer_id' => $actor->id,
                'shared_to_officer_id' => $target->id,
                'from_window_id' => $application->current_window_id,
                'to_window_id' => $window->id,
                'administrative_level' => $level,
                'note' => $payload['remark'] ?? $payload['note'] ?? null,
                'shared_at' => now(),
            ]);

            return $this->transition(
                $application, $actor, $status, 'shared_to_officer', $payload['remark'] ?? $payload['note'] ?? null,
                receiverId: $target->id, toWindowId: $window->id, assignedTo: $target->id, metadata: ['share' => true]
            );
        });
    }

    public function forwardToBackOfficer(ServiceApplication $application, User $actor, array $payload)
    {
        if (!$application->service?->has_back_officer) {
            throw ValidationException::withMessages(['service' => ['This service does not require back officer verification.']]);
        }

        $targetId = (int)($payload['back_officer_id'] ?? $payload['officer_id'] ?? 0);
        $target = $targetId ? User::with('roles')->findOrFail($targetId) : $this->firstAssignedOfficer($application, AppRoles::BACK_OFFICER);
        if (!$target || !$target->hasRole(AppRoles::BACK_OFFICER)) {
            throw ValidationException::withMessages(['back_officer_id' => ['No valid back officer selected/found for this service and window.']]);
        }

        $this->assertSameLevelAndScope($application, $actor, $target, $application->administrative_level);

        return $this->transition($application, $actor, 'forwarded_to_back_officer', 'forwarded_to_back_officer', $payload['remark'] ?? null, receiverId: $target->id, assignedTo: $target->id, assignedRole: AppRoles::BACK_OFFICER);
    }

    public function approve(ServiceApplication $application, User $actor, ?string $remark = null)
    {
        if ($actor->hasRole(AppRoles::BACK_OFFICER)) {
            $front = $this->firstAssignedOfficer($application, AppRoles::FRONT_OFFICER);
            return $this->transition($application, $actor, 'back_officer_approved', 'back_officer_approved', $remark, receiverId: $front?->id, assignedTo: $front?->id, assignedRole: AppRoles::FRONT_OFFICER);
        }
        return $this->transition($application, $actor, 'approved', 'approved', $remark, receiverId: $actor->id, assignedTo: $actor->id);
    }

    public function reject(ServiceApplication $application, User $actor, ?string $remark = null)
    {
        if ($actor->hasRole(AppRoles::BACK_OFFICER)) {
            $front = $this->firstAssignedOfficer($application, AppRoles::FRONT_OFFICER);

            return $this->transition(
                $application,
                $actor,
                'back_officer_rejected',
                'back_officer_rejected',
                $remark,
                receiverId: $front?->id,
                assignedTo: $front?->id,
                assignedRole: AppRoles::FRONT_OFFICER,
                extra: [
                    'rejection_reason' => $remark,
                    'rejected_at' => now(),
                ]
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Front Officer rejection means return for correction.
        |--------------------------------------------------------------------------
        */
        return $this->transition(
            $application,
            $actor,
            'returned_to_customer',
            'returned_to_customer_for_correction',
            $remark,
            receiverId: $application->customer_id,
            assignedTo: $application->customer_id,
            extra: [
                'rejection_reason' => $remark,
                'returned_count' => ((int) $application->returned_count) + 1,
            ]
        );
    }

    public function returnApplication(ServiceApplication $application, User $actor, ?string $remark = null)
    {
        if ($actor->hasRole(AppRoles::BACK_OFFICER)) {
            $front = $this->firstAssignedOfficer($application, AppRoles::FRONT_OFFICER);
            return $this->transition($application, $actor, 'returned_to_front_officer', 'returned_to_front_officer', $remark, receiverId: $front?->id, assignedTo: $front?->id, assignedRole: AppRoles::FRONT_OFFICER);
        }
        return $this->transition($application, $actor, 'returned_to_customer', 'returned_to_customer', $remark, receiverId: $application->customer_id, assignedTo: $application->customer_id, extra: ['returned_count' => ((int)$application->returned_count) + 1]);
    }

    public function complete(ServiceApplication $application, User $actor, ?string $remark = null)
    {
        return $this->transition($application, $actor, 'completed', 'completed', $remark, receiverId: $application->customer_id, assignedTo: $actor->id, extra: ['completed_at' => now()]);
    }

    public function escalateToManager(ServiceApplication $application, User $actor, array $payload)
    {
        $managerId = (int)($payload['manager_id'] ?? 0);
        $manager = $managerId ? User::with('roles')->findOrFail($managerId) : $this->firstManagerForApplication($application);
        if (!$manager || !$manager->hasRole(AppRoles::MANAGER)) {
            throw ValidationException::withMessages(['manager_id' => ['No valid manager found for this level/scope.']]);
        }
        return $this->transition($application, $actor, 'escalated_to_manager', 'escalated_to_manager', $payload['remark'] ?? null, receiverId: $manager->id, assignedTo: $manager->id, assignedRole: AppRoles::MANAGER, metadata: ['escalation' => true, 'manager_id' => $manager->id]);
    }

    public function managerAssign(ServiceApplication $application, User $manager, array $payload)
    {
        $officer = User::with('roles')->findOrFail((int)($payload['officer_id'] ?? 0));
        $window = Window::findOrFail((int)($payload['window_id'] ?? $application->current_window_id));
        $this->assertSameLevelAndScope($application, $manager, $officer, $application->administrative_level);
        $this->assertOfficerWindow($officer, $window, $application->administrative_level);
        $role = $officer->hasRole(AppRoles::BACK_OFFICER) ? AppRoles::BACK_OFFICER : AppRoles::FRONT_OFFICER;
        return $this->transition($application, $manager, 'assigned_by_manager', 'assigned_by_manager', $payload['remark'] ?? null, receiverId: $officer->id, toWindowId: $window->id, assignedTo: $officer->id, assignedRole: $role, metadata: ['manager_assignment' => true]);
    }

    public function managerReturn(ServiceApplication $application, User $manager, ?string $remark = null)
    {
        $receiver = $this->firstAssignedOfficer($application, AppRoles::BACK_OFFICER) ?: $this->firstAssignedOfficer($application, AppRoles::FRONT_OFFICER);
        return $this->transition($application, $manager, 'returned_to_back_officer', 'returned_to_officer_by_manager', $remark, receiverId: $receiver?->id, assignedTo: $receiver?->id);
    }

    public function managerEscalateUp(ServiceApplication $application, User $manager, array $payload)
    {
        $upper = $this->upperManager($manager);
        if (!$upper) throw ValidationException::withMessages(['manager' => ['No upper-level manager found.']]);
        return $this->transition($application, $manager, 'manager_forwarded', 'manager_escalated_up', $payload['remark'] ?? null, receiverId: $upper->id, assignedTo: $upper->id, assignedRole: AppRoles::MANAGER, metadata: ['upper_manager_id' => $upper->id]);
    }

    protected function transition(ServiceApplication $app, User $actor, string $status, string $action, ?string $remark, ?int $receiverId = null, ?int $toWindowId = null, ?int $assignedTo = null, ?string $assignedRole = null, array $metadata = [], array $extra = [])
    {
        return DB::transaction(function () use ($app, $actor, $status, $action, $remark, $receiverId, $toWindowId, $assignedTo, $assignedRole, $metadata, $extra) {
            $old = $app->status;
            $fromWindowId = $app->current_window_id;
            $targetWindowId = $toWindowId ?: $fromWindowId;
            $updates = array_merge([
                'status' => $status,
                'current_stage' => $status,
                'current_officer_id' => $assignedTo,
                'assigned_to' => $assignedTo,
                'assigned_role' => $assignedRole,
                'current_window_id' => $targetWindowId,
            ], $extra);
            $app->update($updates);

            $this->storeDocuments($app, $actor);

            ServiceApplicationHistory::create([
                'application_id' => $app->id,
                'from_status' => $old,
                'to_status' => $status,
                'action' => $action,
                'action_type' => $this->actionType($action),
                'remark' => $remark,
                'comment' => $remark,
                'metadata' => $metadata,
                'actor_id' => $actor->id,
                'sender_id' => $actor->id,
                'receiver_id' => $receiverId,
                'from_window_id' => $fromWindowId,
                'to_window_id' => $targetWindowId,
                'administrative_level' => $app->administrative_level,
                'status' => $status,
                'escalation_details' => $metadata['escalation'] ?? false ? $metadata : null,
            ]);

            return $this->show($app->fresh());
        });
    }

    protected function storeDocuments(ServiceApplication $app, User $actor): void
    {
        $files = request()->file('documents', []);
        if (!$files) return;
        $this->fileService->storeFiles($app, ['workflow_documents' => $files], $actor);
    }

    protected function actorOfficerRole(User $actor): string
    {
        return $actor->hasRole(AppRoles::BACK_OFFICER) ? AppRoles::BACK_OFFICER : AppRoles::FRONT_OFFICER;
    }

    protected function actionType(string $action): string
    {
        return str_contains($action, 'manager') || str_contains($action, 'escalat') ? 'manager_escalation' : 'workflow_action';
    }

    protected function firstAssignedOfficer(ServiceApplication $app, string $role): ?User
    {
        return User::query()
            ->where('is_active', true)
            ->whereHas('roles', fn ($q) => $q->where('name', $role))
            ->whereHas('assignedServices', function ($q) use ($app, $role) {
                $q->where('services.id', $app->service_id)
                  ->where('user_service_assignments.assignment_level', $app->administrative_level)
                  ->where('user_service_assignments.window_id', $app->current_window_id)
                  ->where('user_service_assignments.officer_type', $role)
                  ->where('user_service_assignments.is_active', true);
            })
            ->first();
    }

    protected function firstManagerForApplication(ServiceApplication $app): ?User
    {
        return User::role(AppRoles::MANAGER)
            ->where('is_active', true)
            ->when($app->administrative_level === AppRoles::LEVEL_CITY, fn ($q) => $q->where('city_id', $app->city_id)->whereNull('subcity_id')->whereNull('woreda_id'))
            ->when($app->administrative_level === AppRoles::LEVEL_SUBCITY, fn ($q) => $q->where('subcity_id', $app->subcity_id)->whereNull('woreda_id'))
            ->when($app->administrative_level === AppRoles::LEVEL_WOREDA, fn ($q) => $q->where('woreda_id', $app->woreda_id))
            ->first();
    }

    protected function upperManager(User $manager): ?User
    {
        if ($manager->woreda_id) return User::role(AppRoles::MANAGER)->where('subcity_id', $manager->subcity_id)->whereNull('woreda_id')->where('is_active', true)->first();
        if ($manager->subcity_id) return User::role(AppRoles::MANAGER)->where('city_id', $manager->city_id)->whereNull('subcity_id')->where('is_active', true)->first();
        return null;
    }

    protected function assertOfficerWindow(User $officer, Window $window, ?string $level): void
    {
        $assigned = \App\Models\OfficerWindowAssignment::query()
            ->where('officer_id', $officer->id)
            ->where('window_id', $window->id)
            ->where('assignment_level', $level)
            ->where('is_active', true)
            ->exists();
        if (!$assigned) throw ValidationException::withMessages(['window_id' => ['Selected officer is not assigned to this window.']]);
    }

    protected function assertSameLevelAndScope(ServiceApplication $app, User $actor, User $target, ?string $level): void
    {
        if (AppRoles::userLevel($target) !== $level) throw ValidationException::withMessages(['officer_id' => ['Target user is not on the same administrative level.']]);
        if ($level === AppRoles::LEVEL_CITY && (int)$target->city_id !== (int)$app->city_id) throw ValidationException::withMessages(['officer_id' => ['Target city scope mismatch.']]);
        if ($level === AppRoles::LEVEL_SUBCITY && (int)$target->subcity_id !== (int)$app->subcity_id) throw ValidationException::withMessages(['officer_id' => ['Target subcity scope mismatch.']]);
        if ($level === AppRoles::LEVEL_WOREDA && (int)$target->woreda_id !== (int)$app->woreda_id) throw ValidationException::withMessages(['officer_id' => ['Target woreda scope mismatch.']]);
    }
}
