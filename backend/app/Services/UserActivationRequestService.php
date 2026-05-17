<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use App\Models\UserActivationRequest;
use App\Support\AppRoles;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UserActivationRequestService
{
    public function paginate(array $filters, User $actor): LengthAwarePaginator
    {
        $perPage = max(1, min((int) ($filters['per_page'] ?? 10), 100));
        $status = $filters['status'] ?? null;
        $search = trim((string) ($filters['search'] ?? ''));

        $query = UserActivationRequest::query()
            ->with(['user.roles', 'user.city', 'user.subcity', 'user.woreda', 'requester', 'verifier', 'approver'])
            ->latest();

        $this->applyActorScope($query, $actor);

        if ($status) {
            $query->where('status', $status);
        }

        if ($search !== '') {
            $query->whereHas('user', function ($userQuery) use ($search) {
                $userQuery->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        return $query->paginate($perPage);
    }

    public function transform(LengthAwarePaginator $requests): array
    {
        return [
            'success' => true,
            'message' => 'Activation requests retrieved successfully',
            'data' => collect($requests->items())->map(fn ($request) => $this->payload($request))->values(),
            'meta' => [
                'current_page' => $requests->currentPage(),
                'per_page' => $requests->perPage(),
                'total' => $requests->total(),
                'last_page' => $requests->lastPage(),
            ],
        ];
    }

    public function createForUser(User $user, User $requester, string $note = 'Officer activation requested.'): ?UserActivationRequest
    {
        if (! $user->hasAnyRole([AppRoles::FRONT_OFFICER, AppRoles::BACK_OFFICER])) {
            return null;
        }

        $creatorLevel = AppRoles::userLevel($requester);

        if ($requester->hasRole(AppRoles::ADMIN) && $creatorLevel === AppRoles::LEVEL_CITY) {
            return null;
        }

        $status = $creatorLevel === AppRoles::LEVEL_WOREDA
            ? 'pending_subcity_verification'
            : 'pending_city_approval';

        $request = UserActivationRequest::updateOrCreate(
            [
                'user_id' => $user->id,
                'status' => $status,
            ],
            [
                'requested_by' => $requester->id,
                'request_level' => AppRoles::userLevel($user),
                'city_id' => $user->city_id,
                'subcity_id' => $user->subcity_id,
                'woreda_id' => $user->woreda_id,
                'request_note' => $note,
            ]
        );

        $this->audit($requester, 'activation_requested', $request, 'Activation request created.');

        return $request;
    }

    public function verify(UserActivationRequest $request, User $actor, ?string $note = null): UserActivationRequest
    {
        $this->assertCanVerify($request, $actor);

        if ($request->status !== 'pending_subcity_verification') {
            throw ValidationException::withMessages([
                'status' => ['Only requests waiting for subcity verification can be verified.'],
            ]);
        }

        $request->update([
            'status' => 'pending_city_approval',
            'verified_by' => $actor->id,
            'verified_at' => now(),
            'verification_note' => $note,
        ]);

        $this->audit($actor, 'activation_verified', $request, 'Activation request verified and forwarded to city admin.');

        return $request->fresh(['user.roles', 'user.city', 'user.subcity', 'user.woreda', 'requester', 'verifier', 'approver']);
    }

    public function approve(UserActivationRequest $request, User $actor, ?string $note = null): UserActivationRequest
    {
        $this->assertCanApprove($request, $actor);

        if ($request->status !== 'pending_city_approval') {
            throw ValidationException::withMessages([
                'status' => ['Only requests waiting for city approval can be approved.'],
            ]);
        }

        return DB::transaction(function () use ($request, $actor, $note) {
            $request->user->update([
                'is_active' => true,
                'status' => 'active',
                'activated_by' => $actor->id,
                'activated_at' => now(),
            ]);

            $request->update([
                'status' => 'approved',
                'approved_by' => $actor->id,
                'approved_at' => now(),
                'approval_note' => $note,
            ]);

            $this->audit($actor, 'activation_approved', $request, 'Officer activated by city admin.');

            return $request->fresh(['user.roles', 'user.city', 'user.subcity', 'user.woreda', 'requester', 'verifier', 'approver']);
        });
    }

    public function bulkApprove(array $ids, User $actor, ?string $note = null): int
    {
        if (! $actor->hasRole(AppRoles::ADMIN) || AppRoles::userLevel($actor) !== AppRoles::LEVEL_CITY) {
            throw ValidationException::withMessages([
                'role' => ['Only city admin can bulk approve activation requests.'],
            ]);
        }

        $requests = UserActivationRequest::query()
            ->with('user.roles')
            ->whereIn('id', $ids)
            ->where('status', 'pending_city_approval')
            ->get();

        if ($requests->isEmpty()) {
            throw ValidationException::withMessages([
                'ids' => ['No pending city approval requests found.'],
            ]);
        }

        $approved = 0;

        DB::transaction(function () use ($requests, $actor, $note, &$approved) {
            foreach ($requests as $request) {
                $this->assertSameCity($request, $actor);

                $request->user->update([
                    'is_active' => true,
                    'status' => 'active',
                    'activated_by' => $actor->id,
                    'activated_at' => now(),
                ]);

                $request->update([
                    'status' => 'approved',
                    'approved_by' => $actor->id,
                    'approved_at' => now(),
                    'approval_note' => $note ?? 'Bulk approved by city admin.',
                ]);

                $this->audit($actor, 'activation_bulk_approved', $request, 'Officer activated by city admin bulk approval.');

                $approved++;
            }
        });

        return $approved;
    }

    public function reject(UserActivationRequest $request, User $actor, string $reason): UserActivationRequest
    {
        if (! $actor->hasRole(AppRoles::ADMIN)) {
            throw ValidationException::withMessages([
                'role' => ['Only admins can reject activation requests.'],
            ]);
        }

        $actorLevel = AppRoles::userLevel($actor);

        if ($actorLevel === AppRoles::LEVEL_CITY) {
            $this->assertSameCity($request, $actor);
        } elseif ($actorLevel === AppRoles::LEVEL_SUBCITY) {
            $this->assertSameSubcity($request, $actor);
        } else {
            throw ValidationException::withMessages([
                'role' => ['Only city and subcity admins can reject activation requests.'],
            ]);
        }

        $request->update([
            'status' => 'rejected',
            'rejection_reason' => $reason,
            'approved_by' => $actor->id,
            'approved_at' => now(),
        ]);

        $this->audit($actor, 'activation_rejected', $request, 'Activation request rejected.');

        return $request->fresh(['user.roles', 'user.city', 'user.subcity', 'user.woreda', 'requester', 'verifier', 'approver']);
    }

    protected function applyActorScope($query, User $actor): void
    {
        if ($actor->hasRole(AppRoles::SUPER_ADMIN)) {
            return;
        }

        $level = AppRoles::userLevel($actor);

        if (! $actor->hasRole(AppRoles::ADMIN)) {
            $query->where('requested_by', $actor->id);
            return;
        }

        if ($level === AppRoles::LEVEL_CITY) {
            $query->where('city_id', $actor->city_id)
                ->whereIn('status', ['pending_city_approval', 'approved', 'rejected']);
            return;
        }

        if ($level === AppRoles::LEVEL_SUBCITY) {
            $query->where('city_id', $actor->city_id)
                ->where('subcity_id', $actor->subcity_id)
                ->whereIn('status', ['pending_subcity_verification', 'pending_city_approval', 'approved', 'rejected']);
            return;
        }

        if ($level === AppRoles::LEVEL_WOREDA) {
            $query->where('requested_by', $actor->id);
        }
    }

    protected function assertCanVerify(UserActivationRequest $request, User $actor): void
    {
        if (! $actor->hasRole(AppRoles::ADMIN) || AppRoles::userLevel($actor) !== AppRoles::LEVEL_SUBCITY) {
            throw ValidationException::withMessages([
                'role' => ['Only the corresponding subcity admin can verify this request.'],
            ]);
        }

        $this->assertSameSubcity($request, $actor);
    }

    protected function assertCanApprove(UserActivationRequest $request, User $actor): void
    {
        if (! $actor->hasRole(AppRoles::ADMIN) || AppRoles::userLevel($actor) !== AppRoles::LEVEL_CITY) {
            throw ValidationException::withMessages([
                'role' => ['Only the corresponding city admin can approve this request.'],
            ]);
        }

        $this->assertSameCity($request, $actor);
    }

    protected function assertSameCity(UserActivationRequest $request, User $actor): void
    {
        if ((int) $request->city_id !== (int) $actor->city_id) {
            throw ValidationException::withMessages([
                'city_id' => ['This request does not belong to your city.'],
            ]);
        }
    }

    protected function assertSameSubcity(UserActivationRequest $request, User $actor): void
    {
        if (
            (int) $request->city_id !== (int) $actor->city_id ||
            (int) $request->subcity_id !== (int) $actor->subcity_id
        ) {
            throw ValidationException::withMessages([
                'subcity_id' => ['This request does not belong to your subcity.'],
            ]);
        }
    }

    protected function audit(User $actor, string $action, UserActivationRequest $request, string $message): void
    {
        AuditLog::create([
            'user_id' => $actor->id,
            'role_name' => $actor->roles()->pluck('name')->first(),
            'ip_address' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
            'entity_type' => 'user_activation_request',
            'entity_id' => $request->id,
            'action' => $action,
            'message' => $message,
            'after' => $this->payload($request->fresh(['user.roles'])),
        ]);
    }

    protected function payload(UserActivationRequest $request): array
    {
        return [
            'id' => $request->id,
            'status' => $request->status,
            'request_level' => $request->request_level,
            'city_id' => $request->city_id,
            'subcity_id' => $request->subcity_id,
            'woreda_id' => $request->woreda_id,
            'request_note' => $request->request_note,
            'verification_note' => $request->verification_note,
            'approval_note' => $request->approval_note,
            'rejection_reason' => $request->rejection_reason,
            'created_at' => $request->created_at,
            'verified_at' => $request->verified_at,
            'approved_at' => $request->approved_at,
            'user' => $request->user,
            'requester' => $request->requester,
            'verifier' => $request->verifier,
            'approver' => $request->approver,
        ];
    }
}
