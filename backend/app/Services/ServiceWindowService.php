<?php

namespace App\Services;

use App\Models\Service;
use App\Models\User;
use App\Models\Window;
use App\Support\AppRoles;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ServiceWindowService
{
    public function board(?User $actor): array
    {
        $windows = $this->scopedWindows($actor)
            ->map(function (Window $window) use ($actor) {
                $services = $window->services
                    ->filter(fn (Service $service) => $this->serviceAllowedForActor($service, $actor))
                    ->values()
                    ->map(fn (Service $service) => $this->servicePayload($service));

                return [
                    'id' => $window->id,
                    'name' => $window->name,
                    'availability' => $window->availability,
                    'services' => $services,
                ];
            })
            ->values();

        $assignedServiceIds = $windows
            ->flatMap(fn (array $window) => collect($window['services'])->pluck('id'))
            ->unique()
            ->values()
            ->all();

        $unassignedServices = $this->scopedServices($actor)
            ->reject(fn (Service $service) => in_array($service->id, $assignedServiceIds, true))
            ->values()
            ->map(fn (Service $service) => $this->servicePayload($service));

        return [
            'unassigned_services' => $unassignedServices,
            'services' => $unassignedServices,
            'windows' => $windows,
            'scope' => [
                'level' => $this->actorLevel($actor),
                'label' => $this->scopeLabel($actor),
                'city_id' => $actor?->city_id,
                'subcity_id' => $actor?->subcity_id,
                'woreda_id' => $actor?->woreda_id,
            ],
        ];
    }

    public function assign(User $actor, Service $service, array $windows): Service
    {
        $syncData = [];

        foreach ($windows as $window) {
            $windowModel = Window::findOrFail($window['window_id']);

            $this->assertAllowed($actor, $service, $windowModel);

            $syncData[$window['window_id']] = [
                'step_order' => $window['step_order'] ?? 1,
                'is_required' => $window['is_required'] ?? true,
            ];
        }

        $service->windows()->sync($syncData);

        return $service->load('windows');
    }

    public function move(
        User $actor,
        int $serviceId,
        int $windowId,
        int $stepOrder = 1,
        bool $isRequired = true
    ): Service {
        $service = Service::findOrFail($serviceId);
        $window = Window::findOrFail($windowId);

        $this->assertAllowed($actor, $service, $window);

        DB::transaction(function () use ($service, $window, $stepOrder, $isRequired) {
            /*
            |--------------------------------------------------------------------------
            | One service belongs to one window in this workflow.
            |--------------------------------------------------------------------------
            | Moving service to another window detaches it from the old window first.
            */
            $service->windows()->sync([
                $window->id => [
                    'step_order' => $stepOrder,
                    'is_required' => $isRequired,
                ],
            ]);
        });

        audit_log(
            'service_window_moved',
            'Service moved to window within admin scope.',
            'service',
            $service->id,
            null,
            [
                'service_id' => $service->id,
                'window_id' => $window->id,
                'scope' => $this->scopeLabel($actor),
            ]
        );

        return $service->fresh()->load('windows');
    }

    public function unassign(User $actor, Service $service): void
    {
        if (!$this->serviceAllowedForActor($service, $actor)) {
            throw ValidationException::withMessages([
                'service_id' => ['This service is not available in your administrative scope.'],
            ]);
        }

        $service->windows()->detach();

        audit_log(
            'service_window_unassigned',
            'Service removed from assigned window within admin scope.',
            'service',
            $service->id,
            null,
            [
                'service_id' => $service->id,
                'scope' => $this->scopeLabel($actor),
            ]
        );
    }

    public function show(User $actor, Service $service): Service
    {
        if (!$this->serviceAllowedForActor($service, $actor)) {
            abort(403, 'This service is not available in your administrative scope.');
        }

        $allowedWindowIds = $this->scopedWindows($actor)->pluck('id')->all();

        return $service->load([
            'windows' => fn ($query) => $query->whereIn('windows.id', $allowedWindowIds),
        ]);
    }

    protected function assertAllowed(User $actor, Service $service, Window $window): void
    {
        if (!$this->serviceAllowedForActor($service, $actor)) {
            throw ValidationException::withMessages([
                'service_id' => ['This service is not available in your administrative scope.'],
            ]);
        }

        if (!$this->windowAllowedForActor($window, $actor)) {
            throw ValidationException::withMessages([
                'window_id' => ['This window is not available in your administrative scope.'],
            ]);
        }
    }

    protected function scopedServices(?User $actor): Collection
    {
        return Service::query()
            ->with('windows')
            ->where('status', 'active')
            ->orderBy('name')
            ->get()
            ->filter(fn (Service $service) => $this->serviceAllowedForActor($service, $actor))
            ->values();
    }

    protected function scopedWindows(?User $actor): Collection
    {
        return Window::query()
            ->with([
                'services' => fn ($query) => $query
                    ->where('services.status', 'active')
                    ->orderBy('service_window.step_order')
                    ->orderBy('services.name'),
            ])
            ->orderBy('name')
            ->get()
            ->filter(fn (Window $window) => $this->windowAllowedForActor($window, $actor))
            ->values();
    }

    protected function serviceAllowedForActor(Service $service, ?User $actor): bool
    {
        if (!$actor || $actor->hasRole(AppRoles::SUPER_ADMIN)) {
            return true;
        }

        $level = $this->actorLevel($actor);

        if (!$level) {
            return false;
        }

        $availability = $this->normalizeAvailability($service->availability);

        if (!$availability || !in_array($level, $availability['levels'], true)) {
            return false;
        }

        return match ($level) {
            AppRoles::LEVEL_CITY => $this->idAllowed($availability['city_ids'], $actor->city_id),
            AppRoles::LEVEL_SUBCITY => $this->idAllowed($availability['subcity_ids'], $actor->subcity_id),
            AppRoles::LEVEL_WOREDA => $this->idAllowed($availability['woreda_ids'], $actor->woreda_id),
            default => false,
        };
    }

    protected function windowAllowedForActor(Window $window, ?User $actor): bool
    {
        if (!$actor || $actor->hasRole(AppRoles::SUPER_ADMIN)) {
            return true;
        }

        $level = $this->actorLevel($actor);

        if (!$level) {
            return false;
        }

        $availability = $this->normalizeAvailability($window->availability);

        return $availability && in_array($level, $availability['levels'], true);
    }

    protected function actorLevel(?User $actor): ?string
    {
        if (!$actor || $actor->hasRole(AppRoles::SUPER_ADMIN)) {
            return null;
        }

        return AppRoles::userLevel($actor);
    }

    protected function scopeLabel(?User $actor): string
    {
        if (!$actor || $actor->hasRole(AppRoles::SUPER_ADMIN)) {
            return 'All administrative levels';
        }

        return match (AppRoles::userLevel($actor)) {
            AppRoles::LEVEL_CITY => 'City level: ' . ($actor->city?->name ?? 'Assigned city'),
            AppRoles::LEVEL_SUBCITY => 'Subcity level: ' . ($actor->subcity?->name ?? 'Assigned subcity'),
            AppRoles::LEVEL_WOREDA => 'Woreda level: ' . ($actor->woreda?->name ?? 'Assigned woreda'),
            default => 'No administrative scope',
        };
    }

    protected function servicePayload(Service $service): array
    {
        return [
            'id' => $service->id,
            'name' => $service->name,
            'description' => $service->description,
            'service_fee' => $service->service_fee,
            'availability' => $service->availability,
            'status' => $service->status,
        ];
    }

    protected function normalizeAvailability(mixed $availability): ?array
    {
        if (!$availability) {
            return null;
        }

        if (is_string($availability)) {
            $decoded = json_decode($availability, true);
            $availability = json_last_error() === JSON_ERROR_NONE ? $decoded : null;
        }

        if (!is_array($availability)) {
            return null;
        }

        if (array_key_exists('levels', $availability) || array_key_exists('administrative_levels', $availability)) {
            return [
                'levels' => $this->normalizeLevels($availability['levels'] ?? $availability['administrative_levels'] ?? []),
                'city_ids' => $this->normalizeIds($availability['city_ids'] ?? null),
                'subcity_ids' => $this->normalizeIds($availability['subcity_ids'] ?? null),
                'woreda_ids' => $this->normalizeIds($availability['woreda_ids'] ?? null),
            ];
        }

        if (array_is_list($availability)) {
            return [
                'levels' => $this->normalizeLevels($availability),
                'city_ids' => [],
                'subcity_ids' => [],
                'woreda_ids' => [],
            ];
        }

        $levels = [];

        foreach ([AppRoles::LEVEL_CITY, AppRoles::LEVEL_SUBCITY, AppRoles::LEVEL_WOREDA] as $level) {
            if (($availability[$level] ?? false) === true) {
                $levels[] = $level;
            }
        }

        return $levels ? [
            'levels' => $levels,
            'city_ids' => $this->normalizeIds($availability['city_ids'] ?? null),
            'subcity_ids' => $this->normalizeIds($availability['subcity_ids'] ?? null),
            'woreda_ids' => $this->normalizeIds($availability['woreda_ids'] ?? null),
        ] : null;
    }

    protected function normalizeLevels(mixed $levels): array
    {
        if (is_string($levels)) {
            $levels = [$levels];
        }

        if (!is_array($levels)) {
            return [];
        }

        return collect($levels)
            ->map(fn ($level) => strtolower(trim((string) $level)))
            ->filter(fn ($level) => in_array($level, [AppRoles::LEVEL_CITY, AppRoles::LEVEL_SUBCITY, AppRoles::LEVEL_WOREDA], true))
            ->unique()
            ->values()
            ->all();
    }

    protected function normalizeIds(mixed $ids): array
    {
        if (!$ids) {
            return [];
        }

        if (is_string($ids) || is_numeric($ids)) {
            $ids = [$ids];
        }

        if (!is_array($ids)) {
            return [];
        }

        return collect($ids)
            ->map(fn ($id) => (int) $id)
            ->filter(fn ($id) => $id > 0)
            ->unique()
            ->values()
            ->all();
    }

    protected function idAllowed(array $allowedIds, mixed $selectedId): bool
    {
        if (count($allowedIds) === 0) {
            return true;
        }

        return in_array((int) $selectedId, $allowedIds, true);
    }
}
