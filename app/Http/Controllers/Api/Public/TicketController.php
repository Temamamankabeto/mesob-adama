<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Services\TicketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

final class TicketController extends Controller
{
    public function __construct(
        private readonly TicketService $ticketService
    ) {}

    public function statistics(): JsonResponse
    {
        // Counts are global across MESOB locations and include all issued statuses.
        // Use the application timezone for the current calendar day.
        $start = now()->startOfDay();
        $end = $start->copy()->addDay();

        return response()->json([
            'success' => true,
            'message' => 'Ticket statistics retrieved successfully.',
            'data' => [
                'total_tickets' => DB::table('tickets')->count(),
                'today_tickets' => DB::table('tickets')
                    ->where('created_at', '>=', $start)
                    ->where('created_at', '<', $end)
                    ->count(),
            ],
            'meta' => [],
        ]);
    }

    public function windows(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'administrative_level' => [
                'required',
                Rule::in(['city', 'subcity', 'woreda']),
            ],
            'city_id' => ['nullable', 'integer', 'exists:cities,id'],
            'subcity_id' => ['nullable', 'integer', 'exists:subcities,id'],
            'woreda_id' => ['nullable', 'integer', 'exists:woredas,id'],
        ]);

        $level = $validated['administrative_level'];
        $cityId = isset($validated['city_id'])
            ? (int) $validated['city_id']
            : null;
        $subcityId = isset($validated['subcity_id'])
            ? (int) $validated['subcity_id']
            : null;
        $woredaId = isset($validated['woreda_id'])
            ? (int) $validated['woreda_id']
            : null;

        $locationSelected = $cityId !== null
            || $subcityId !== null
            || $woredaId !== null;

        if ($locationSelected) {
            if (
                $cityId === null ||
                ($level === 'city' && ($subcityId !== null || $woredaId !== null)) ||
                ($level === 'subcity' && ($subcityId === null || $woredaId !== null)) ||
                ($level === 'woreda' && ($subcityId === null || $woredaId === null))
            ) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'location' => ['Invalid location IDs for the selected administrative level.'],
                ]);
            }

            if ($subcityId !== null) {
                $validSubcity = DB::table('subcities')
                    ->where('id', $subcityId)
                    ->where('city_id', $cityId)
                    ->exists();

                if (! $validSubcity) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'subcity_id' => ['Subcity does not belong to the selected City.'],
                    ]);
                }
            }

            if ($woredaId !== null) {
                $validWoreda = DB::table('woredas')
                    ->where('id', $woredaId)
                    ->where('subcity_id', $subcityId)
                    ->exists();

                if (! $validWoreda) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'woreda_id' => ['Woreda does not belong to the selected Subcity.'],
                    ]);
                }
            }
        }

        $query = DB::table('service_window AS sw')
            ->join('windows AS w', 'w.id', '=', 'sw.window_id')
            ->join('services AS s', 's.id', '=', 'sw.service_id')
            ->where('sw.assignment_level', $level)
            ->where('s.status', 'active')
            ->where(function ($query) use ($level) {
                $query->whereNull('w.administrative_level')
                    ->orWhere('w.administrative_level', $level);
            });

        if ($locationSelected) {
            $query
                ->where(function ($query) use ($cityId) {
                    $query->whereNull('w.city_id')
                        ->orWhere('w.city_id', $cityId);
                })
                ->where(function ($query) use ($subcityId) {
                    if ($subcityId === null) {
                        $query->whereNull('w.subcity_id');
                    } else {
                        $query->whereNull('w.subcity_id')
                            ->orWhere('w.subcity_id', $subcityId);
                    }
                })
                ->where(function ($query) use ($woredaId) {
                    if ($woredaId === null) {
                        $query->whereNull('w.woreda_id');
                    } else {
                        $query->whereNull('w.woreda_id')
                            ->orWhere('w.woreda_id', $woredaId);
                    }
                })
                ->whereExists(function ($query) use (
                    $level,
                    $cityId,
                    $subcityId,
                    $woredaId
                ) {
                    $query->selectRaw('1')
                        ->from('officer_window_assignments AS owa')
                        ->whereColumn('owa.window_id', 'w.id')
                        ->where('owa.is_active', true)
                        ->where('owa.assignment_level', $level)
                        ->where('owa.city_id', $cityId);

                    if ($level === 'subcity' || $level === 'woreda') {
                        $query->where('owa.subcity_id', $subcityId);
                    } else {
                        $query->whereNull('owa.subcity_id');
                    }

                    if ($level === 'woreda') {
                        $query->where('owa.woreda_id', $woredaId);
                    } else {
                        $query->whereNull('owa.woreda_id');
                    }
                });
        }

        $rows = $query
            ->select(
                'w.id AS window_id',
                'w.name AS window_name',
                'w.title AS window_title',
                's.id AS service_id',
                's.name AS service_name',
                'sw.step_order'
            )
            ->orderBy('w.name')
            ->orderBy('sw.step_order')
            ->get();

        if ($locationSelected) {
            $services = \App\Models\Service::query()
                ->whereIn('id', $rows->pluck('service_id')->unique())
                ->get()
                ->keyBy('id');

            $availability = new class {
                use \App\Services\Concerns\ChecksServiceAvailability;

                public function allows(
                    \App\Models\Service $service,
                    string $level,
                    ?int $cityId,
                    ?int $subcityId,
                    ?int $woredaId
                ): bool {
                    return $this->serviceIsAvailableForSelection(
                        $service,
                        $level,
                        $cityId,
                        $subcityId,
                        $woredaId
                    );
                }
            };

            $rows = $rows->filter(function ($row) use (
                $services,
                $availability,
                $level,
                $cityId,
                $subcityId,
                $woredaId
            ) {
                $service = $services->get($row->service_id);

                return $service !== null
                    && $availability->allows(
                        $service,
                        $level,
                        $cityId,
                        $subcityId,
                        $woredaId
                    );
            });
        }

        $windows = $rows
            ->groupBy('window_id')
            ->map(function ($items) {
                $first = $items->first();

                return [
                    'id' => $first->window_id,
                    'name' => $first->window_name,
                    'title' => $first->window_title,
                    'services_count' => $items->count(),
                    'services' => $items->map(fn ($item) => [
                        'id' => $item->service_id,
                        'name' => $item->service_name,
                    ])->values(),
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'message' => 'Ticket windows retrieved successfully.',
            'data' => $windows,
            'meta' => [
                'administrative_level' => $level,
                'total_windows' => $windows->count(),
            ],
        ]);
    }
    public function issue(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'request_id' => ['required', 'uuid'],
            'window_id' => ['required', 'integer', 'exists:windows,id'],
            'service_id' => ['required', 'integer', 'exists:services,id'],
            'administrative_level' => [
                'required',
                Rule::in(['city', 'subcity', 'woreda']),
            ],
            'city_id' => ['required', 'integer', 'exists:cities,id'],
            'subcity_id' => [
                Rule::requiredIf(
                    fn () => in_array(
                        $request->input('administrative_level'),
                        ['subcity', 'woreda'],
                        true
                    )
                ),
                'nullable',
                'integer',
                'exists:subcities,id',
            ],
            'woreda_id' => [
                Rule::requiredIf(
                    fn () => $request->input('administrative_level') === 'woreda'
                ),
                'nullable',
                'integer',
                'exists:woredas,id',
            ],
            'priority' => [
                'sometimes',
                Rule::in(['normal', 'vip', 'elderly', 'pregnant']),
            ],
        ]);

        $validated['priority'] = $validated['priority'] ?? 'normal';

        $ticket = $this->ticketService->issue($validated);

        return response()->json([
            'success' => true,
            'message' => 'Ticket issued successfully.',
            'data' => $this->ticketData($ticket),
            'meta' => [],
        ], 201);
    }

    public function show(string $requestId): JsonResponse
    {
        if (! \Illuminate\Support\Str::isUuid($requestId)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid ticket request ID.',
                'data' => null,
                'meta' => [],
            ], 422);
        }

        $ticket = Ticket::query()
            ->where('request_id', $requestId)
            ->first();

        if (! $ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket not found.',
                'data' => null,
                'meta' => [],
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Ticket retrieved successfully.',
            'data' => $this->ticketData($ticket),
            'meta' => [],
        ]);
    }

    private function ticketData(Ticket $ticket): array
    {
        $ticket->loadMissing('window:id,name,title');

        // The printed officer must be a Front Officer assigned to this service,
        // window and exact administrative location, not just any window officer.
        $assignment = DB::table('user_service_assignments AS usa')
            ->join('users AS u', 'u.id', '=', 'usa.user_id')
            ->where('usa.service_id', $ticket->service_id)
            ->where('usa.window_id', $ticket->window_id)
            ->where('usa.officer_type', 'front_officer')
            ->where('usa.is_active', true)
            ->where('usa.assignment_level', $ticket->administrative_level)
            ->where('usa.city_id', $ticket->city_id)
            ->where('usa.subcity_id', $ticket->subcity_id)
            ->where('usa.woreda_id', $ticket->woreda_id)
            ->where('u.is_active', true)
            ->whereNull('u.deleted_at')
            ->whereExists(function ($query) use ($ticket) {
                $query->selectRaw('1')
                    ->from('officer_window_assignments AS owa')
                    ->whereColumn('owa.officer_id', 'u.id')
                    ->where('owa.window_id', $ticket->window_id)
                    ->where('owa.assignment_level', $ticket->administrative_level)
                    ->where('owa.city_id', $ticket->city_id)
                    ->where('owa.subcity_id', $ticket->subcity_id)
                    ->where('owa.woreda_id', $ticket->woreda_id)
                    ->where('owa.is_active', true);
            });

        // First assigned means earliest assignment record; ID breaks ties.
        $officerCode = $assignment
            ->orderBy('usa.id')
            ->value('u.officer_code');

        return [
            'id' => $ticket->id,
            'ticket_number' => $ticket->ticket_number,
            'request_id' => $ticket->request_id,
            'window_id' => $ticket->window_id,
            'window_name' => $ticket->window?->name,
            'officer_code' => $officerCode,
            'service_id' => $ticket->service_id,
            'service_name' => $ticket->service_name,
            'administrative_level' => $ticket->administrative_level,
            'city_id' => $ticket->city_id,
            'subcity_id' => $ticket->subcity_id,
            'woreda_id' => $ticket->woreda_id,
            'priority' => $ticket->priority,
            'status' => $ticket->status,
            'created_at' => $ticket->created_at?->toIso8601String(),
        ];
    }
}