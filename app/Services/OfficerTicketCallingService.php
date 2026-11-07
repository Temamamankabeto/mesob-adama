<?php

namespace App\Services;

use App\Models\Ticket;
use App\Models\User;
use App\Support\AppRoles;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

final class OfficerTicketCallingService
{
    private function authorize(User $officer): void
    {
        abort_unless($officer->is_active && !$officer->trashed() && $officer->hasRole(AppRoles::FRONT_OFFICER), 403);
    }

    private function scopedTickets(User $officer): Builder
    {
        $this->authorize($officer);

        return Ticket::query()
            ->whereExists(function ($q) use ($officer) {
                $q->selectRaw('1')->from('officer_window_assignments as owa')
                    ->where('owa.officer_id', $officer->id)->where('owa.is_active', true)
                    ->whereColumn('owa.window_id', 'tickets.window_id')
                    ->whereColumn('owa.assignment_level', 'tickets.administrative_level')
                    ->whereColumn('owa.city_id', 'tickets.city_id')
                    ->whereRaw('owa.subcity_id IS NOT DISTINCT FROM tickets.subcity_id')
                    ->whereRaw('owa.woreda_id IS NOT DISTINCT FROM tickets.woreda_id');
            })
            ->whereExists(function ($q) {
                $q->selectRaw('1')->from('service_window as sw')
                    ->whereColumn('sw.window_id', 'tickets.window_id')
                    ->whereColumn('sw.service_id', 'tickets.service_id')
                    ->whereColumn('sw.assignment_level', 'tickets.administrative_level');
            });
    }

    private function eligibleWaiting(User $officer): Builder
    {
        return $this->scopedTickets($officer)->where('status', 'waiting')
            ->whereExists(function ($q) {
                $q->selectRaw('1')->from('agent_ticket_applications as ata')
                    ->join('service_applications as sa', 'sa.id', '=', 'ata.service_application_id')
                    ->whereColumn('ata.ticket_id', 'tickets.id')
                    ->whereNotIn('sa.status', ['completed', 'rejected', 'cancelled']);
            });
    }

    private function lockWindow(int $windowId): void
    {
        abort_unless(DB::table('windows')->where('id', $windowId)->lockForUpdate()->first(), 404);
    }

    private function state(User $officer, int $windowId): ?object
    {
        return DB::table('officer_ticket_queue_states')
            ->where('officer_id', $officer->id)->where('window_id', $windowId)->first();
    }

    private function ensureActive(User $officer, int $windowId): void
    {
        if ($this->state($officer, $windowId)?->is_paused) {
            throw new ConflictHttpException('Queue is paused. Resume before calling a ticket.');
        }
    }

    private function ensureWindowAssignment(User $officer, int $windowId): void
    {
        $this->authorize($officer);
        abort_unless(DB::table('officer_window_assignments')->where('officer_id', $officer->id)
            ->where('window_id', $windowId)->where('is_active', true)->exists(), 403);
    }

    public function queue(User $officer): array
    {
        $this->authorize($officer);
        $tickets = $this->scopedTickets($officer)
            ->where(function ($q) use ($officer) {
                $q->where(function ($waiting) {
                    $waiting->where('status', 'waiting')->whereExists(function ($eligible) {
                        $eligible->selectRaw('1')->from('agent_ticket_applications as ata')
                            ->join('service_applications as sa', 'sa.id', '=', 'ata.service_application_id')
                            ->whereColumn('ata.ticket_id', 'tickets.id')
                            ->whereNotIn('sa.status', ['completed', 'rejected', 'cancelled']);
                    });
                })->orWhere(function ($active) use ($officer) {
                    $active->whereIn('status', ['called', 'serving'])->where('calling_officer_id', $officer->id);
                });
            })
            ->with([])->orderByRaw("CASE WHEN status = 'serving' THEN 0 WHEN status = 'called' THEN 1 ELSE 2 END")
            ->orderBy('created_at')->limit(100)->get();

        $links = DB::table('agent_ticket_applications')->whereIn('ticket_id', $tickets->pluck('id'))
            ->pluck('service_application_id', 'ticket_id');
        $states = DB::table('officer_ticket_queue_states')->where('officer_id', $officer->id)
            ->get()->keyBy('window_id');
        $assignedWindows = DB::table('officer_window_assignments')->where('officer_id', $officer->id)
            ->where('is_active', true)->distinct()->pluck('window_id');

        return [
            'tickets' => $tickets->map(fn (Ticket $t) => $this->present($t, $links[$t->id] ?? null))->all(),
            'windows' => $assignedWindows->map(fn ($id) => [
                'window_id' => $id, 'is_paused' => (bool) ($states[$id]->is_paused ?? false),
            ])->all(),
        ];
    }

    public function callNext(User $officer, int $windowId): ?array
    {
        return DB::transaction(function () use ($officer, $windowId) {
            $this->lockWindow($windowId);
            $this->ensureWindowAssignment($officer, $windowId);
            $this->ensureActive($officer, $windowId);

            $active = Ticket::query()->where('window_id', $windowId)
                ->whereIn('status', ['called', 'serving'])->lockForUpdate()->get();
            if ($active->count() > 1) throw new ConflictHttpException('Multiple active tickets exist at this window.');
            $current = $active->first();
            if ($current) {
                abort_unless($this->scopedTickets($officer)->whereKey($current->id)->exists(), 403);
                abort_unless((int) $current->calling_officer_id === (int) $officer->id, 403);
                if ($current->status !== 'serving') {
                    throw new ConflictHttpException('Start serving the called ticket before calling next.');
                }
            }

            $next = $this->eligibleWaiting($officer)->where('window_id', $windowId)
                ->orderBy('created_at')->orderBy('id')->lockForUpdate()->first();
            if (!$next && !$current) {
                throw ValidationException::withMessages(['window_id' => ['No eligible waiting ticket is available.']]);
            }
            if ($current) $this->transition($current, $officer, 'complete_next', 'completed');
            return $next ? $this->transition($next, $officer, 'call', 'called') : null;
        });
    }

    public function pause(User $officer, int $windowId): array
    {
        return DB::transaction(function () use ($officer, $windowId) {
            $this->lockWindow($windowId);
            $this->ensureWindowAssignment($officer, $windowId);
            $active = Ticket::query()->where('window_id', $windowId)
                ->whereIn('status', ['called', 'serving'])->lockForUpdate()->get();
            if ($active->count() > 1) throw new ConflictHttpException('Multiple active tickets exist at this window.');
            $current = $active->first();
            if ($current) {
                abort_unless($this->scopedTickets($officer)->whereKey($current->id)->exists(), 403);
                abort_unless((int) $current->calling_officer_id === (int) $officer->id, 403);
                if ($current->status !== 'serving') throw new ConflictHttpException('Start serving the called ticket before pausing.');
                $this->transition($current, $officer, 'complete_pause', 'completed');
            }
            DB::table('officer_ticket_queue_states')->updateOrInsert(
                ['officer_id' => $officer->id, 'window_id' => $windowId],
                ['is_paused' => true, 'paused_at' => now(), 'updated_at' => now()]
            );
            return ['window_id' => $windowId, 'is_paused' => true];
        });
    }

    public function resume(User $officer, int $windowId): array
    {
        return DB::transaction(function () use ($officer, $windowId) {
            $this->lockWindow($windowId);
            $this->ensureWindowAssignment($officer, $windowId);
            DB::table('officer_ticket_queue_states')->updateOrInsert(
                ['officer_id' => $officer->id, 'window_id' => $windowId],
                ['is_paused' => false, 'paused_at' => null, 'updated_at' => now()]
            );
            return ['window_id' => $windowId, 'is_paused' => false];
        });
    }

    public function action(User $officer, int $ticketId, string $action, ?string $reason = null): array
    {
        return DB::transaction(function () use ($officer, $ticketId, $action, $reason) {
            $windowId = Ticket::query()->whereKey($ticketId)->value('window_id');
            abort_unless($windowId, 404);
            $this->lockWindow((int) $windowId);
            $ticket = Ticket::query()->whereKey($ticketId)->lockForUpdate()->firstOrFail();
            abort_unless($this->scopedTickets($officer)->whereKey($ticketId)->exists(), 403);
            $expected = match ($action) { 'call' => 'waiting', 'recall', 'start' => 'called', default => null };
            abort_unless($expected, 404);
            if ($ticket->status !== $expected) throw new ConflictHttpException('Ticket is not in the required state.');
            if ($action === 'call') {
                $this->ensureActive($officer, (int) $windowId);
                abort_unless($this->eligibleWaiting($officer)->whereKey($ticketId)->exists(), 403);
                if (Ticket::query()->where('window_id', $windowId)->whereIn('status', ['called', 'serving'])->exists()) {
                    throw new ConflictHttpException('A ticket is already active at this window.');
                }
            } elseif ((int) $ticket->calling_officer_id !== (int) $officer->id) {
                abort(403);
            }
            return $this->transition($ticket, $officer, $action, $action === 'start' ? 'serving' : 'called');
        });
    }

    private function transition(Ticket $ticket, User $officer, string $action, string $next): array
    {
        $before = $ticket->status;
        $ticket->status = $next;
        if ($action === 'call') { $ticket->calling_officer_id = $officer->id; $ticket->called_at = now(); }
        if ($action === 'recall') $ticket->called_at = now();
        if ($action === 'start') $ticket->serving_at = now();
        if ($next === 'completed') $ticket->completed_at = now();
        $ticket->save();
        DB::table('ticket_call_events')->insert([
            'ticket_id' => $ticket->id, 'officer_id' => $officer->id,
            'window_id' => $ticket->window_id, 'action' => $action,
            'from_status' => $before, 'to_status' => $next,
            'reason' => null, 'created_at' => now(), 'updated_at' => now(),
        ]);
        $applicationId = DB::table('agent_ticket_applications')->where('ticket_id', $ticket->id)->value('service_application_id');
        return $this->present($ticket, $applicationId);
    }

    private function present(Ticket $ticket, ?int $applicationId): array
    {
        return [
            'id' => $ticket->id, 'ticket_number' => $ticket->ticket_number,
            'service_id' => $ticket->service_id, 'service_name' => $ticket->service_name,
            'window_id' => $ticket->window_id, 'status' => $ticket->status,
            'administrative_level' => $ticket->administrative_level,
            'city_id' => $ticket->city_id, 'subcity_id' => $ticket->subcity_id,
            'woreda_id' => $ticket->woreda_id, 'calling_officer_id' => $ticket->calling_officer_id,
            'called_at' => $ticket->called_at, 'serving_at' => $ticket->serving_at,
            'completed_at' => $ticket->completed_at, 'service_application_id' => $applicationId,
        ];
    }
}
