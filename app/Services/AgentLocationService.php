<?php

namespace App\Services;

use App\Models\User;
use App\Support\AppRoles;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

class AgentLocationService
{
    public function level(User $agent): ?string
    {
        if (!$agent->city_id) {
            return null;
        }

        if ($agent->woreda_id) {
            return $agent->subcity_id ? 'woreda' : null;
        }

        return $agent->subcity_id ? 'subcity' : 'city';
    }

    public function hasValidLocation(User $agent): bool
    {
        if ($this->level($agent) === null) {
            return false;
        }

        if (!DB::table('cities')
            ->where('id', $agent->city_id)
            ->exists()) {
            return false;
        }

        if ($agent->subcity_id && !DB::table('subcities')
            ->where('id', $agent->subcity_id)
            ->where('city_id', $agent->city_id)
            ->exists()) {
            return false;
        }

        if ($agent->woreda_id && !DB::table('woredas')
            ->where('id', $agent->woreda_id)
            ->where('subcity_id', $agent->subcity_id)
            ->exists()) {
            return false;
        }

        return true;
    }

    public function canAccess(User $agent): bool
    {
        return !$agent->trashed()
            && $agent->is_active
            && $agent->hasRole(AppRoles::AGENT)
            && $this->hasValidLocation($agent);
    }

    public function constrain(
        Builder $query,
        User $agent,
        string $alias = 'awa'
    ): Builder {
        if (!$this->canAccess($agent)) {
            return $query->whereRaw('1 = 0');
        }

        $prefix = $alias !== '' ? $alias . '.' : '';

        $query
            ->where($prefix . 'agent_id', $agent->id)
            ->where($prefix . 'is_active', true)
            ->where($prefix . 'assignment_level', $this->level($agent));

        foreach (['city_id', 'subcity_id', 'woreda_id'] as $column) {
            $value = $agent->{$column};

            if ($value === null) {
                $query->whereNull($prefix . $column);
            } else {
                $query->where($prefix . $column, $value);
            }
        }

        return $query;
    }

    public function activeAssignments(User $agent): Builder
    {
        return $this->constrain(
            DB::table('agent_window_assignments'),
            $agent,
            ''
        );
    }

    public function deactivateStaleAssignments(User $agent): int
    {
        $query = DB::table('agent_window_assignments')
            ->where('agent_id', $agent->id)
            ->where('is_active', true);

        if ($this->canAccess($agent)) {
            $query->where(function (Builder $stale) use ($agent) {
                $stale
                    ->whereNull('assignment_level')
                    ->orWhere('assignment_level', '!=', $this->level($agent));

                foreach (['city_id', 'subcity_id', 'woreda_id'] as $column) {
                    $value = $agent->{$column};

                    if ($value === null) {
                        $stale->orWhereNotNull($column);
                    } else {
                        $stale->orWhere(function (Builder $location) use ($column, $value) {
                            $location
                                ->whereNull($column)
                                ->orWhere($column, '!=', $value);
                        });
                    }
                }
            });
        }

        return $query->update([
            'is_active' => false,
            'updated_at' => now(),
        ]);
    }
}