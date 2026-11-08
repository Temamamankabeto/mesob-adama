<?php
namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

final class AgentTicketDisplayController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $input = $request->validate([
            'administrative_level' => ['required', Rule::in(['city', 'subcity', 'woreda'])],
            'city_id' => ['required', 'integer', 'min:1', 'exists:cities,id'],
            'subcity_id' => ['nullable', 'integer', 'min:1', 'exists:subcities,id'],
            'woreda_id' => ['nullable', 'integer', 'min:1', 'exists:woredas,id'],
        ]);
        $level = $input['administrative_level'];
        $city = (int) $input['city_id'];
        $subcity = isset($input['subcity_id']) ? (int) $input['subcity_id'] : null;
        $woreda = isset($input['woreda_id']) ? (int) $input['woreda_id'] : null;
        if (($level === 'city' && ($subcity !== null || $woreda !== null))
            || ($level === 'subcity' && ($subcity === null || $woreda !== null))
            || ($level === 'woreda' && ($subcity === null || $woreda === null))) {
            throw ValidationException::withMessages(['location' => ['Invalid office location scope.']]);
        }
        if ($subcity !== null && ! DB::table('subcities')->where('id', $subcity)->where('city_id', $city)->exists()) {
            throw ValidationException::withMessages(['subcity_id' => ['Subcity does not belong to the selected city.']]);
        }
        if ($woreda !== null && ! DB::table('woredas')->where('id', $woreda)->where('subcity_id', $subcity)->exists()) {
            throw ValidationException::withMessages(['woreda_id' => ['Woreda does not belong to the selected subcity.']]);
        }
        $query = DB::table('tickets as t')
            ->join('agent_window_assignments as awa', function ($join) {
                $join->on('awa.window_id', '=', 't.window_id')
                    ->on('awa.assignment_level', '=', 't.administrative_level')
                    ->on('awa.city_id', '=', 't.city_id')
                    ->where('awa.is_active', true);
            })
            ->join('users as agent', function ($join) {
                $join->on('agent.id', '=', 'awa.agent_id')->where('agent.is_active', true);
            })
            ->where('t.administrative_level', $level)
            ->where('t.city_id', $city)
            ->whereIn('t.status', ['waiting', 'called', 'serving'])
            ->whereNotExists(function ($subquery) {
                $subquery->selectRaw('1')->from('agent_ticket_applications as ata')
                    ->whereColumn('ata.ticket_id', 't.id');
            });
        foreach (['subcity_id' => $subcity, 'woreda_id' => $woreda] as $column => $value) {
            if ($value === null) $query->whereNull('t.'.$column)->whereNull('awa.'.$column);
            else $query->where('t.'.$column, $value)->where('awa.'.$column, $value);
        }
        $records = $query->select('t.id', 't.ticket_number', 't.window_id', 't.created_at',
            'agent.id as agent_id', 'agent.name as agent_name')
            ->orderBy('t.created_at')->orderBy('t.id')->orderBy('agent.name')
            ->limit(1000)->get();
        $tickets = $records->groupBy('id')->map(function ($group) {
            $first = $group->first();
            return [
                'id' => $first->id,
                'ticket_number' => $first->ticket_number,
                'window_id' => $first->window_id,
                'assigned_agents' => $group->unique('agent_id')->pluck('agent_name')->values()->all(),
            ];
        })->values();
        return response()->json([
            'success' => true, 'message' => 'Agent ticket display retrieved.',
            'data' => ['location' => [
                'administrative_level' => $level, 'city_id' => $city,
                'subcity_id' => $subcity, 'woreda_id' => $woreda,
            ], 'tickets' => $tickets],
            'meta' => ['count' => $tickets->count(), 'refresh_interval_seconds' => 3],
        ]);
    }
}
