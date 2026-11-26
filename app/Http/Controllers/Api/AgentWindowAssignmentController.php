<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AgentWindowAssignment;
use App\Models\User;
use App\Models\Window;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AgentWindowAssignmentController extends Controller
{
    private function assertManager(User $actor): void
    {
        abort_unless(
            $actor->is_active &&
            (
                $actor->hasRole('super_admin') ||
                (
                    $actor->hasRole('admin') &&
                    $actor->can('windows.update')
                )
            ),
            403
        );
    }

    private function locationRules(): array
    {
        return [
            'city_id' => ['sometimes', 'nullable', 'integer', 'exists:cities,id'],
            'subcity_id' => ['sometimes', 'nullable', 'integer', 'exists:subcities,id'],
            'woreda_id' => ['sometimes', 'nullable', 'integer', 'exists:woredas,id'],
        ];
    }

    private function assertHierarchy(array $location): void
    {
        $city = $location['city_id'] ?? null;
        $subcity = $location['subcity_id'] ?? null;
        $woreda = $location['woreda_id'] ?? null;

        if ($subcity && !DB::table('subcities')
            ->where('id', $subcity)
            ->when($city, fn ($q) => $q->where('city_id', $city))
            ->exists()) {
            throw ValidationException::withMessages([
                'subcity_id' => 'Subcity does not belong to the selected city.',
            ]);
        }

        if ($woreda && !DB::table('woredas as w')
            ->join('subcities as s', 's.id', '=', 'w.subcity_id')
            ->where('w.id', $woreda)
            ->when($subcity, fn ($q) => $q->where('w.subcity_id', $subcity))
            ->when($city, fn ($q) => $q->where('s.city_id', $city))
            ->exists()) {
            throw ValidationException::withMessages([
                'woreda_id' => 'Woreda does not belong to the selected location.',
            ]);
        }
    }

    private function assertActorScope(User $actor, array $location): void
    {
        if ($actor->hasRole('super_admin')) {
            return;
        }

        abort_unless($actor->city_id, 403);

        foreach (['city_id', 'subcity_id', 'woreda_id'] as $field) {
            if ($actor->{$field} !== null) {
                abort_unless(
                    (int) $actor->{$field} === (int) ($location[$field] ?? 0),
                    403,
                    'Location is outside your administrative scope.'
                );
            }
        }
    }

    private function scopedAgents(User $actor)
    {
        $query = User::role('agent', 'sanctum')
            ->where('is_active', true);

        if (!$actor->hasRole('super_admin')) {
            abort_unless($actor->city_id, 403);

            $query->where('city_id', $actor->city_id);

            if ($actor->subcity_id) {
                $query->where('subcity_id', $actor->subcity_id);
            }

            if ($actor->woreda_id) {
                $query->where('woreda_id', $actor->woreda_id);
            }
        }

        return $query;
    }

    private function applyLevel($query, ?string $level): void
    {
        if ($level === 'city') {
            $query->whereNotNull('city_id')
                ->whereNull('subcity_id')
                ->whereNull('woreda_id');
        }

        if ($level === 'subcity') {
            $query->whereNotNull('city_id')
                ->whereNotNull('subcity_id')
                ->whereNull('woreda_id');
        }

        if ($level === 'woreda') {
            $query->whereNotNull('city_id')
                ->whereNotNull('subcity_id')
                ->whereNotNull('woreda_id');
        }
    }

    private function agentLocation(User $agent): array
    {
        return [
            'city_id' => $agent->city_id,
            'subcity_id' => $agent->subcity_id,
            'woreda_id' => $agent->woreda_id,
        ];
    }

    private function agentLevel(User $agent): string
    {
        return $agent->woreda_id
            ? 'woreda'
            : ($agent->subcity_id ? 'subcity' : 'city');
    }

    private function windowAvailable(Window $window, string $level): bool
    {
        $availability = $window->availability ?? [];

        $levels = is_array($availability)
            ? ($availability['levels'] ?? $availability)
            : [];

        return (
            is_array($levels) &&
            in_array($level, $levels, true)
        ) || $window->administrative_level === $level;
    }

    private function windowMatchesLocation(
        Window $window,
        array $location
    ): bool {
        foreach (['city_id', 'subcity_id', 'woreda_id'] as $field) {
            if ($window->{$field} !== null &&
                (int) $window->{$field} !== (int) ($location[$field] ?? 0)) {
                return false;
            }
        }

        return true;
    }

    private function assertLocation(
        User $actor,
        User $agent,
        Window $window,
        string $level,
        array $selected = []
    ): void {
        if (!$agent->hasRole('agent') || !$agent->is_active) {
            throw ValidationException::withMessages([
                'agent_id' => 'Select an active user with the Agent role.',
            ]);
        }

        if (!$agent->city_id ||
            ($agent->woreda_id && !$agent->subcity_id) ||
            $this->agentLevel($agent) !== $level) {
            throw ValidationException::withMessages([
                'level' => 'Agent does not belong to the selected administrative level.',
            ]);
        }

        $location = $this->agentLocation($agent);

        $this->assertHierarchy($location);
        $this->assertActorScope($actor, $location);

        foreach ($location as $field => $value) {
            if (array_key_exists($field, $selected) &&
                (int) ($selected[$field] ?? 0) !== (int) ($value ?? 0)) {
                throw ValidationException::withMessages([
                    $field => 'Selected location does not match the Agent location.',
                ]);
            }
        }

        if (!$this->windowAvailable($window, $level)) {
            throw ValidationException::withMessages([
                'window_id' => 'Window is not available at this administrative level.',
            ]);
        }

        if (!$this->windowMatchesLocation($window, $location)) {
            throw ValidationException::withMessages([
                'window_id' => 'Window is outside the Agent administrative location.',
            ]);
        }
    }

    private function scopedLocations(User $actor): array
    {
        $cities = DB::table('cities')->select('id', 'name');
        $subcities = DB::table('subcities')->select('id', 'city_id', 'name');
        $woredas = DB::table('woredas as w')
            ->join('subcities as s', 's.id', '=', 'w.subcity_id')
            ->select('w.id', 'w.subcity_id', 'w.name');

        if (!$actor->hasRole('super_admin')) {
            abort_unless($actor->city_id, 403);
            $cities->where('id', $actor->city_id);
            $subcities->where('city_id', $actor->city_id);
            $woredas->where('s.city_id', $actor->city_id);
            if ($actor->subcity_id) {
                $subcities->where('id', $actor->subcity_id);
                $woredas->where('w.subcity_id', $actor->subcity_id);
            }
            if ($actor->woreda_id) {
                $woredas->where('w.id', $actor->woreda_id);
                $subcities->whereIn('id', DB::table('woredas')
                    ->where('id', $actor->woreda_id)->select('subcity_id'));
            }
        }

        return [
            'cities' => $cities->orderBy('name')->get(),
            'subcities' => $subcities->orderBy('name')->get(),
            'woredas' => $woredas->orderBy('w.name')->get(),
            'levels' => $actor->hasRole('super_admin')
                ? ['city', 'subcity', 'woreda']
                : ($actor->woreda_id ? ['woreda'] : ($actor->subcity_id
                    ? ['subcity', 'woreda'] : ['city', 'subcity', 'woreda'])),
        ];
    }

    public function board(Request $request): JsonResponse
    {
        $actor = $request->user();
        $this->assertManager($actor);

        $filters = $request->validate(array_merge([
            'level' => ['sometimes', 'in:city,subcity,woreda'],
        ], $this->locationRules()));

        $level = $filters['level'] ?? null;

        $this->assertHierarchy($filters);

        if (!$actor->hasRole('super_admin')) {
            foreach (['city_id', 'subcity_id', 'woreda_id'] as $field) {
                if ($actor->{$field} !== null &&
                    array_key_exists($field, $filters) &&
                    (int) ($filters[$field] ?? 0) !== (int) $actor->{$field}) {
                    abort(403, 'Location is outside your administrative scope.');
                }
            }
        }

        $query = $this->scopedAgents($actor);

        $this->applyLevel($query, $level);

        foreach (['city_id', 'subcity_id', 'woreda_id'] as $field) {
            if (array_key_exists($field, $filters)) {
                $query->where($field, $filters[$field]);
            }
        }

        $agents = $query->orderBy('name')->get([
            'id', 'name', 'email',
            'city_id', 'subcity_id', 'woreda_id',
        ]);

        $windows = Window::query()->orderBy('name')->get([
            'id', 'name', 'title',
            'city_title', 'subcity_title', 'woreda_title',
            'administrative_level', 'availability',
            'city_id', 'subcity_id', 'woreda_id',
        ]);

        $windows = $windows->filter(function (Window $window) use ($level, $filters, $actor) {
            if ($level && !$this->windowAvailable($window, $level)) {
                return false;
            }

            foreach (['city_id', 'subcity_id', 'woreda_id'] as $field) {
                if ($window->{$field} === null) {
                    continue;
                }

                if (array_key_exists($field, $filters) &&
                    (int) $window->{$field} !== (int) ($filters[$field] ?? 0)) {
                    return false;
                }

                if (!$actor->hasRole('super_admin') &&
                    $actor->{$field} !== null &&
                    (int) $window->{$field} !== (int) $actor->{$field}) {
                    return false;
                }
            }

            return true;
        })->values();

        $assignmentQuery = AgentWindowAssignment::query()
            ->whereIn('agent_id', $agents->pluck('id'))
            ->whereIn('window_id', $windows->pluck('id'))
            ->where('is_active', true);

        if ($level) {
            $assignmentQuery->where('assignment_level', $level);
        }

        foreach (['city_id', 'subcity_id', 'woreda_id'] as $field) {
            if (array_key_exists($field, $filters)) {
                $assignmentQuery->where($field, $filters[$field]);
            }

            if (!$actor->hasRole('super_admin') &&
                $actor->{$field} !== null) {
                $assignmentQuery->where($field, $actor->{$field});
            }
        }

        $assignments = $assignmentQuery->get();
        $locations = $this->scopedLocations($actor);

        return response()->json([
            'success' => true,
            'message' => 'Agent window assignments retrieved.',
            'data' => compact('agents', 'windows', 'assignments', 'locations'),
            'meta' => (object) [],
        ]);
    }

    public function assign(Request $request): JsonResponse
    {
        $actor = $request->user();
        $this->assertManager($actor);

        $data = $request->validate(array_merge([
            'agent_id' => ['required', 'integer', 'exists:users,id'],
            'window_id' => ['required', 'integer', 'exists:windows,id'],
            'level' => ['required', 'in:city,subcity,woreda'],
        ], $this->locationRules()));

        $assignment = DB::transaction(function () use ($data, $actor) {
            $agent = User::query()
                ->lockForUpdate()
                ->findOrFail($data['agent_id']);

            $window = Window::findOrFail($data['window_id']);

            $this->assertLocation(
                $actor, $agent, $window, $data['level'], $data
            );

            $location = $this->agentLocation($agent);

            $row = AgentWindowAssignment::query()
                ->where('agent_id', $agent->id)
                ->where('window_id', $window->id)
                ->where('assignment_level', $data['level'])
                ->lockForUpdate()
                ->first();

            if ($row && $row->is_active) {
                foreach ($location as $field => $value) {
                    if ((int) ($row->{$field} ?? 0) !== (int) ($value ?? 0)) {
                        throw ValidationException::withMessages([
                            'agent_id' => 'An active assignment exists at a different location.',
                        ]);
                    }
                }

                return $row;
            }

            if (!$row) {
                $row = new AgentWindowAssignment([
                    'agent_id' => $agent->id,
                    'window_id' => $window->id,
                    'assignment_level' => $data['level'],
                ]);
            }

            $row->fill(array_merge($location, [
                'is_active' => true,
                'assigned_by' => $actor->id,
            ]));

            $row->save();

            return $row;
        });

        return response()->json([
            'success' => true,
            'message' => 'Agent assigned to window.',
            'data' => $assignment,
            'meta' => (object) [],
        ]);
    }

    public function unassign(Request $request): JsonResponse
    {
        $actor = $request->user();
        $this->assertManager($actor);

        $data = $request->validate(array_merge([
            'agent_id' => ['required', 'integer', 'exists:users,id'],
            'window_id' => ['required', 'integer', 'exists:windows,id'],
            'level' => ['required', 'in:city,subcity,woreda'],
        ], $this->locationRules()));

        DB::transaction(function () use ($data, $actor) {
            $agent = User::query()
                ->lockForUpdate()
                ->findOrFail($data['agent_id']);

            $window = Window::findOrFail($data['window_id']);

            $this->assertLocation(
                $actor, $agent, $window, $data['level'], $data
            );

            $query = AgentWindowAssignment::query()
                ->where('agent_id', $agent->id)
                ->where('window_id', $window->id)
                ->where('assignment_level', $data['level']);

            foreach ($this->agentLocation($agent) as $field => $value) {
                $query->where($field, $value);
            }

            $query->update(['is_active' => false]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Agent window assignment removed.',
            'data' => null,
            'meta' => (object) [],
        ]);
    }
}
