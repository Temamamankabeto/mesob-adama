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
        abort_unless($actor->hasRole('super_admin') || ($actor->hasRole('admin') && $actor->can('windows.update')), 403);
    }

    private function scopedAgents(User $actor)
    {
        $query = User::role('agent', 'sanctum')->where('is_active', true);
        if (!$actor->hasRole('super_admin')) {
            $query->where('city_id', $actor->city_id);
            if ($actor->woreda_id) $query->where('woreda_id', $actor->woreda_id);
            elseif ($actor->subcity_id) $query->where('subcity_id', $actor->subcity_id);
        }
        return $query;
    }

    private function assertLocation(User $actor, User $agent, Window $window, string $level): void
    {
        if (!$agent->hasRole('agent')) throw ValidationException::withMessages(['agent_id' => 'Selected user is not an Agent.']);
        if (!$agent->is_active) throw ValidationException::withMessages(['agent_id' => 'Agent account is inactive.']);
        if (!$agent->city_id) throw ValidationException::withMessages(['agent_id' => 'Agent must have an assigned city.']);
        if ($level === 'subcity' && !$agent->subcity_id || $level === 'woreda' && !$agent->woreda_id) {
            throw ValidationException::withMessages(['level' => 'Agent does not belong to the selected administrative level.']);
        }
        $availability = $window->availability ?? [];
        $levels = is_array($availability) ? ($availability['levels'] ?? $availability) : [];
        if (!in_array($level, $levels, true) && $window->administrative_level !== $level) {
            throw ValidationException::withMessages(['window_id' => 'Window is not available at this administrative level.']);
        }
        foreach (['city_id', 'subcity_id', 'woreda_id'] as $field) {
            if ($window->$field !== null && (int) $window->$field !== (int) $agent->$field) {
                throw ValidationException::withMessages(['window_id' => 'Window is outside the Agent administrative location.']);
            }
        }
        if (!$actor->hasRole('super_admin')) {
            if (!$actor->city_id || (int)$actor->city_id !== (int)$agent->city_id) abort(403);
            if ($actor->subcity_id && (int)$actor->subcity_id !== (int)$agent->subcity_id) abort(403);
            if ($actor->woreda_id && (int)$actor->woreda_id !== (int)$agent->woreda_id) abort(403);
        }
    }

    public function board(Request $request): JsonResponse
    {
        $actor = $request->user();
        $this->assertManager($actor);
        $agents = $this->scopedAgents($actor)->orderBy('name')->get(['id','name','email','city_id','subcity_id','woreda_id']);
        $windows = Window::query()->orderBy('name')->get(['id','name','title','city_title','subcity_title','woreda_title','administrative_level','availability','city_id','subcity_id','woreda_id']);
        $assignments = AgentWindowAssignment::query()->whereIn('agent_id', $agents->pluck('id'))->where('is_active', true)->get();
        return response()->json(['success'=>true,'message'=>'Agent window assignments retrieved.','data'=>compact('agents','windows','assignments'),'meta'=>(object)[]]);
    }

    public function assign(Request $request): JsonResponse
    {
        $actor = $request->user(); $this->assertManager($actor);
        $data = $request->validate(['agent_id'=>'required|integer|exists:users,id','window_id'=>'required|integer|exists:windows,id','level'=>'required|in:city,subcity,woreda']);
        $agent = User::findOrFail($data['agent_id']); $window = Window::findOrFail($data['window_id']);
        $this->assertLocation($actor, $agent, $window, $data['level']);
        $assignment = DB::transaction(function () use ($data, $actor, $agent) {
            $row = AgentWindowAssignment::query()->where('agent_id',$agent->id)->where('window_id',$data['window_id'])->where('assignment_level',$data['level'])->lockForUpdate()->first();
            if (!$row) $row = new AgentWindowAssignment(['agent_id'=>$agent->id,'window_id'=>$data['window_id'],'assignment_level'=>$data['level']]);
            $row->fill(['city_id'=>$agent->city_id,'subcity_id'=>$agent->subcity_id,'woreda_id'=>$agent->woreda_id,'is_active'=>true,'assigned_by'=>$actor->id]);
            $row->save(); return $row;
        });
        return response()->json(['success'=>true,'message'=>'Agent assigned to window.','data'=>$assignment,'meta'=>(object)[]]);
    }

    public function unassign(Request $request): JsonResponse
    {
        $actor = $request->user(); $this->assertManager($actor);
        $data = $request->validate(['agent_id'=>'required|integer|exists:users,id','window_id'=>'required|integer|exists:windows,id','level'=>'required|in:city,subcity,woreda']);
        $agent = User::findOrFail($data['agent_id']); $window = Window::findOrFail($data['window_id']);
        $this->assertLocation($actor,$agent,$window,$data['level']);
        AgentWindowAssignment::query()->where('agent_id',$agent->id)->where('window_id',$window->id)->where('assignment_level',$data['level'])->update(['is_active'=>false]);
        return response()->json(['success'=>true,'message'=>'Agent window assignment removed.','data'=>null,'meta'=>(object)[]]);
    }
}
