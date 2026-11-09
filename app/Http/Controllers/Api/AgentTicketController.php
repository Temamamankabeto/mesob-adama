<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\Service;
use App\Http\Requests\ApplyServiceRequest;
use Illuminate\Support\Str;
use App\Services\PublicApplicationService;
use App\Models\User;
use App\Support\AppRoles;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AgentTicketController extends Controller
{
    private function agent(Request $request): User
    {
        $user = $request->user();
        abort_unless($user && $user->is_active && $user->hasRole(AppRoles::AGENT), 403);
        return $user;
    }

    /** Ticket metrics scoped to the Agent's active window/location assignments. */
    public function dashboard(Request $request): JsonResponse
    {
        $agent = $this->agent($request);
        abort_unless($agent->can('applications.create') && $agent->can('service_forms.read'), 403);

        $assigned = DB::table('agent_window_assignments as awa')
            ->where('awa.agent_id', $agent->id)
            ->where('awa.is_active', true)
            ->select('awa.window_id', 'awa.assignment_level', 'awa.city_id', 'awa.subcity_id', 'awa.woreda_id')
            ->distinct();

        $windows = DB::query()->fromSub($assigned, 'assigned')
            ->join('windows as w', 'w.id', '=', 'assigned.window_id')
            ->select('assigned.window_id', 'assigned.assignment_level', 'assigned.city_id',
                'assigned.subcity_id', 'assigned.woreda_id', 'w.name as window_name')
            ->orderBy('w.name')->get();

        $scope = function ($query) use ($agent) {
            $query->whereExists(function ($sub) use ($agent) {
                $sub->selectRaw('1')->from('agent_window_assignments as awa')
                    ->whereColumn('awa.window_id', 'tickets.window_id')
                    ->whereColumn('awa.assignment_level', 'tickets.administrative_level')
                    ->whereColumn('awa.city_id', 'tickets.city_id')
                    ->where(function ($q) {
                        $q->whereColumn('awa.subcity_id', 'tickets.subcity_id')
                          ->orWhere(fn ($q) => $q->whereNull('awa.subcity_id')->whereNull('tickets.subcity_id'));
                    })
                    ->where(function ($q) {
                        $q->whereColumn('awa.woreda_id', 'tickets.woreda_id')
                          ->orWhere(fn ($q) => $q->whereNull('awa.woreda_id')->whereNull('tickets.woreda_id'));
                    })
                    ->where('awa.agent_id', $agent->id)->where('awa.is_active', true);
            });
        };

        $incoming = Ticket::query();
        $scope($incoming);
        $incoming->whereIn('tickets.status', ['waiting', 'called', 'serving'])
            ->whereNotExists(function ($q) {
                $q->selectRaw('1')->from('agent_ticket_applications as ata')
                    ->whereColumn('ata.ticket_id', 'tickets.id');
            });

        $incomingByWindow = (clone $incoming)
            ->select('tickets.window_id', 'tickets.administrative_level', 'tickets.city_id',
                'tickets.subcity_id', 'tickets.woreda_id')
            ->selectRaw('COUNT(*) as ticket_count')
            ->groupBy('tickets.window_id', 'tickets.administrative_level', 'tickets.city_id',
                'tickets.subcity_id', 'tickets.woreda_id')->get();

        $windowData = $windows->map(function ($window) use ($incomingByWindow) {
            $count = $incomingByWindow->first(fn ($item) =>
                (string) $item->window_id === (string) $window->window_id &&
                $item->administrative_level === $window->assignment_level &&
                (string) $item->city_id === (string) $window->city_id &&
                (string) $item->subcity_id === (string) $window->subcity_id &&
                (string) $item->woreda_id === (string) $window->woreda_id
            );
            return [
                'window_id' => (int) $window->window_id,
                'window_name' => $window->window_name ?: 'Window '.$window->window_id,
                'assignment_level' => $window->assignment_level,
                'incoming' => (int) ($count?->ticket_count ?? 0),
            ];
        });

        $processed = DB::table('agent_ticket_applications')
            ->where('agent_id', $agent->id)->count();
        $incomingCount = (clone $incoming)->count();

        return response()->json([
            'success' => true,
            'message' => 'Agent dashboard statistics retrieved.',
            'data' => [
                'assigned_windows' => $windows->count(),
                'incoming_tickets' => $incomingCount,
                'processed_tickets' => $processed,
                'total_tickets' => $incomingCount + $processed,
                'windows' => $windowData,
            ],
            'meta' => [],
        ]);
    }

    public function windows(Request $request): JsonResponse
    {
        $agent = $this->agent($request);
        $windows = DB::table('agent_window_assignments as awa')
            ->join('windows as w', 'w.id', '=', 'awa.window_id')
            ->where('awa.agent_id', $agent->id)->where('awa.is_active', true)
            ->select('w.id', 'w.name', 'w.title')->orderBy('w.name')->get();
        return response()->json(['success'=>true,'message'=>'Assigned windows retrieved.','data'=>$windows,'meta'=>[]]);
    }

    public function incoming(Request $request): JsonResponse
    {
        $agent = $this->agent($request);
        $tickets = Ticket::query()
            ->join('agent_window_assignments as awa', function ($join) use ($agent) {
                $join->on('awa.window_id', '=', 'tickets.window_id')
                    ->on('awa.assignment_level', '=', 'tickets.administrative_level')
                    ->where('awa.agent_id', '=', $agent->id)
                    ->where('awa.is_active', '=', true);
            })
            ->whereColumn('awa.city_id', 'tickets.city_id')
            ->where(function ($q) {
                $q->whereColumn('awa.subcity_id', 'tickets.subcity_id')
                  ->orWhere(fn ($q) => $q->whereNull('awa.subcity_id')->whereNull('tickets.subcity_id'));
            })
            ->where(function ($q) {
                $q->whereColumn('awa.woreda_id', 'tickets.woreda_id')
                  ->orWhere(fn ($q) => $q->whereNull('awa.woreda_id')->whereNull('tickets.woreda_id'));
            })
            ->whereIn('tickets.status', ['waiting', 'called', 'serving'])
            ->whereNotIn('tickets.id', DB::table('agent_ticket_applications')->select('ticket_id'))
            ->select('tickets.id', 'tickets.ticket_number', 'tickets.service_id', 'tickets.service_name',
                'tickets.window_id', 'tickets.status', 'tickets.created_at', 'tickets.administrative_level',
                'tickets.city_id', 'tickets.subcity_id', 'tickets.woreda_id')
            ->distinct()
            ->orderByDesc('tickets.created_at')
            ->orderByDesc('tickets.id')
            ->limit(100)
            ->get();

        $officers = DB::table('officer_window_assignments as owa')
            ->join('users as u', 'u.id', '=', 'owa.officer_id')
            ->where('owa.is_active', true)->where('u.is_active', true)
            ->orderBy('owa.id')
            ->select('owa.window_id', 'owa.assignment_level', 'owa.city_id', 'owa.subcity_id',
                'owa.woreda_id', 'u.officer_code')->get();

        $data = $tickets->map(function ($ticket) use ($officers) {
            $officer = $officers->first(fn ($o) =>
                (int) $o->window_id === (int) $ticket->window_id &&
                $o->assignment_level === $ticket->administrative_level &&
                (string) $o->city_id === (string) $ticket->city_id &&
                (string) $o->subcity_id === (string) $ticket->subcity_id &&
                (string) $o->woreda_id === (string) $ticket->woreda_id
            );
            return [
                'ticket_number' => $ticket->ticket_number,
                'service_id' => $ticket->service_id,
                'service_name' => $ticket->service_name,
                'window_id' => $ticket->window_id,
                'officer_code' => $officer?->officer_code,
                'status' => $ticket->status,
                'created_at' => $ticket->created_at,
            ];
        });

        return response()->json(['success' => true, 'message' => 'Incoming tickets retrieved.',
            'data' => $data, 'meta' => ['count' => $data->count()]]);
    }

    public function verify(Request $request): JsonResponse
    {
        $agent = $this->agent($request);
        $input = $request->validate(['ticket_number'=>['required','string','max:30']]);
        $ticket = Ticket::query()->where('ticket_number', trim($input['ticket_number']))->first();
        if (!$ticket) {
            return response()->json(['success'=>false,'message'=>'Ticket not found.','data'=>null,'meta'=>[]],404);
        }
        $allowed = DB::table('agent_window_assignments')
            ->where('agent_id', $agent->id)->where('window_id', $ticket->window_id)
            ->where('is_active', true)->exists();
        abort_unless($allowed, 403, 'Ticket does not belong to an assigned window.');
        $officer = DB::table('officer_window_assignments as owa')
            ->join('users as u', 'u.id', '=', 'owa.officer_id')
            ->where('owa.window_id', $ticket->window_id)
            ->where('owa.assignment_level', $ticket->administrative_level)
            ->where('owa.city_id', $ticket->city_id)
            ->where('owa.is_active', true)
            ->where('u.is_active', true);
        foreach (['subcity_id','woreda_id'] as $column) {
            $ticket->{$column} === null ? $officer->whereNull('owa.'.$column) : $officer->where('owa.'.$column, $ticket->{$column});
        }
        $officerCode = $officer->orderBy('owa.id')->value('u.officer_code');
        return response()->json([
            'success'=>true,'message'=>'Ticket verified for assigned window.',
            'data'=>[
                'ticket_number'=>$ticket->ticket_number,
                'service_id'=>$ticket->service_id,
                'service_name'=>$ticket->service_name,
                'window_id'=>$ticket->window_id,
                'officer_code'=>$officerCode,
                'status'=>$ticket->status,
                'administrative_level'=>$ticket->administrative_level,
            ],'meta'=>[],
        ]);
    }

    /**
     * Authorize an Agent to open a dynamic form for a ticket from an assigned
     * window. This endpoint does not submit or create an application.
     */
    public function applicationForm(
        Request $request,
        Service $service,
        PublicApplicationService $applications
    ): JsonResponse {
        $agent = $this->agent($request);
        abort_unless($agent->can('service_forms.read') && $agent->can('applications.create'), 403,
            'Agent does not have application processing permissions.');

        $validated = $request->validate([
            'ticket_number' => ['required', 'string', 'max:30'],
        ]);

        $ticket = Ticket::query()
            ->where('ticket_number', trim($validated['ticket_number']))
            ->where('service_id', $service->id)
            ->whereIn('status', ['waiting', 'called', 'serving'])
            ->first();

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'An eligible ticket for this service was not found.',
                'data' => null,
                'meta' => [],
            ], 404);
        }

        $assignment = DB::table('agent_window_assignments')
            ->where('agent_id', $agent->id)
            ->where('window_id', $ticket->window_id)
            ->where('assignment_level', $ticket->administrative_level)
            ->where('is_active', true)
            ->where('city_id', $ticket->city_id);

        foreach (['subcity_id', 'woreda_id'] as $column) {
            if ($ticket->{$column} === null) {
                $assignment->whereNull($column);
            } else {
                $assignment->where($column, $ticket->{$column});
            }
        }

        abort_unless($assignment->exists(), 403,
            'Ticket is outside the Agent assigned windows or location.');

        $form = $applications->getForm($service);
        if (!$form) {
            return response()->json([
                'success' => false,
                'message' => 'No active form found for this service.',
                'data' => null,
                'meta' => [],
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Agent authorized to open the service application form.',
            'data' => [
                'form' => $form,
                'ticket' => [
                    'ticket_number' => $ticket->ticket_number,
                    'service_id' => $ticket->service_id,
                    'service_name' => $ticket->service_name,
                    'window_id' => $ticket->window_id,
                    'administrative_level' => $ticket->administrative_level,
                    'city_id' => $ticket->city_id,
                    'subcity_id' => $ticket->subcity_id,
                    'woreda_id' => $ticket->woreda_id,
                ],
            ],
            'meta' => [],
        ]);
    }


    /** Submit on behalf of the ticket holder, never on behalf of the Agent. */
    public function submitApplication(
        ApplyServiceRequest $request,
        Service $service,
        PublicApplicationService $applications
    ): JsonResponse {
        $agent = $this->agent($request);
        abort_unless($agent->can('applications.create') && $agent->can('service_forms.read'), 403);
        $extra = $request->validate([
            'ticket_number' => ['required', 'string', 'max:30'],
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_phone' => ['required', 'regex:/^\+?[0-9]{9,15}$/'],
        ]);

        $result = DB::transaction(function () use ($agent, $service, $applications, $request, $extra) {
            $ticket = Ticket::query()->where('ticket_number', trim($extra['ticket_number']))
                ->lockForUpdate()->first();
            if (!$ticket || (int) $ticket->service_id !== (int) $service->id
                || !in_array($ticket->status, ['waiting', 'called', 'serving'], true)) {
                throw ValidationException::withMessages(['ticket_number' => ['Ticket is not eligible for this service.']]);
            }
            $assignment = DB::table('agent_window_assignments')
                ->where('agent_id', $agent->id)->where('window_id', $ticket->window_id)
                ->where('assignment_level', $ticket->administrative_level)
                ->where('city_id', $ticket->city_id)->where('is_active', true);
            foreach (['subcity_id', 'woreda_id'] as $field) {
                $ticket->{$field} === null ? $assignment->whereNull($field) : $assignment->where($field, $ticket->{$field});
            }
            abort_unless($assignment->exists(), 403, 'Ticket is outside assigned Agent windows.');
            if (DB::table('agent_ticket_applications')->where('ticket_id', $ticket->id)->exists()) {
                throw ValidationException::withMessages(['ticket_number' => ['An application has already been submitted for this ticket.']]);
            }
            $payload = $request->validated();
            foreach (['administrative_level', 'city_id', 'subcity_id', 'woreda_id'] as $field) {
                if (($payload[$field] ?? null) != $ticket->{$field}) {
                    throw ValidationException::withMessages([$field => ['Application location must match the ticket.']]);
                }
            }
            $phone = preg_replace('/\s+/', '', $extra['customer_phone']);
            $customer = User::withTrashed()->where('phone', $phone)->lockForUpdate()->first();
            if ($customer) {
                if ($customer->trashed() || !$customer->is_active || !$customer->hasRole(AppRoles::CUSTOMER)) {
                    throw ValidationException::withMessages(['customer_phone' => ['This phone belongs to an unavailable or non-customer account.']]);
                }
            } else {
                $customer = User::create([
                    'name' => trim($extra['customer_name']),
                    'phone' => $phone,
                    'email' => 'customer-'.Str::lower(Str::random(32)).'@accounts.invalid',
                    'password' => Str::random(64),
                    'user_type' => 'customer', 'status' => 'active', 'is_active' => true,
                    'city_id' => $ticket->city_id, 'subcity_id' => $ticket->subcity_id,
                    'woreda_id' => $ticket->woreda_id, 'created_by' => $agent->id,
                    'must_change_password' => true,
                ]);
                $customer->assignRole(AppRoles::CUSTOMER);
            }
            $application = $applications->apply($service, $customer, $payload);
            DB::table('agent_ticket_applications')->insert([
                'ticket_id' => $ticket->id, 'service_application_id' => $application->id,
                'agent_id' => $agent->id, 'customer_id' => $customer->id,
                'window_id' => $ticket->window_id, 'created_at' => now(), 'updated_at' => now(),
            ]);
            return ['application' => $application, 'ticket_number' => $ticket->ticket_number,
                'customer_id' => $customer->id];
        });
        return response()->json(['success' => true, 'message' => 'Application submitted successfully.',
            'data' => $result, 'meta' => []], 201);
    }

    public function assign(Request $request): JsonResponse
    {
        $actor = $request->user();
        abort_unless($actor && $actor->is_active && $actor->hasAnyRole([AppRoles::SUPER_ADMIN,AppRoles::ADMIN]),403);
        $data = $request->validate([
            'agent_id'=>['required','integer','exists:users,id'],
            'window_id'=>['required','integer','exists:windows,id'],
            'is_active'=>['sometimes','boolean'],
        ]);
        $agent = User::findOrFail($data['agent_id']);
        if (!$agent->is_active || !$agent->hasRole(AppRoles::AGENT)) {
            throw ValidationException::withMessages(['agent_id'=>'Select an active user with the Agent role.']);
        }
        // Administrators may only assign windows within their own location.
        if (!$actor->hasRole(AppRoles::SUPER_ADMIN)) {
            $window = DB::table('windows')->where('id',$data['window_id'])->first();
            foreach (['city_id','subcity_id','woreda_id'] as $column) {
                if ($window->{$column} !== null && (int)$window->{$column} !== (int)$actor->{$column}) {
                    abort(403, 'Window is outside your administrative location.');
                }
            }
            if ((int)$agent->city_id !== (int)$actor->city_id) abort(403);
        }
        DB::table('agent_window_assignments')->updateOrInsert(
            ['agent_id'=>$agent->id,'window_id'=>$data['window_id']],
            ['is_active'=>$data['is_active']??true,'assigned_by'=>$actor->id,'created_at'=>now(),'updated_at'=>now()]
        );
        return response()->json(['success'=>true,'message'=>'Agent window assignment saved.','data'=>$data,'meta'=>[]]);
    }
}
