<?php

namespace App\Services;

use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

final class PublicQueueDisplayService
{
    private function tickets(array $scope): Builder
    {
        $query = DB::table('tickets as t')
            ->where('t.administrative_level', $scope['administrative_level'])
            ->where('t.city_id', $scope['city_id']);

        foreach (['subcity_id', 'woreda_id'] as $column) {
            if (isset($scope[$column])) {
                $query->where('t.'.$column, $scope[$column]);
            } else {
                $query->whereNull('t.'.$column);
            }
        }

        return $query;
    }

    private function present(object $ticket): array
    {
        return [
            'id' => $ticket->id,
            'ticket_number' => $ticket->ticket_number,
            'window_id' => $ticket->window_id,
            'window_name' => $ticket->window_name,
            'window_title' => $ticket->window_title,
            'service_name' => $ticket->service_name,
            'status' => $ticket->status,
            'called_at' => $ticket->called_at,
            'serving_at' => $ticket->serving_at,
        ];
    }

    private function counterNumber(object $event): string
    {
        foreach ([$event->window_name, $event->window_title] as $label) {
            if (is_string($label) && preg_match('/^(?:(?:counter|window|desk|lak\.?|lakk\.?)\s*[-:#]?\s*)?(\d+)$/i', trim($label), $matches)) {
                return $matches[1];
            }
        }

        // Backward-compatible fallback when no public numeric counter label exists.
        return (string) $event->window_id;
    }

    public function get(array $scope, ?int $afterEventId): array
    {
        $base = $this->tickets($scope);
        $active = (clone $base)->leftJoin('windows as w', 'w.id', '=', 't.window_id')
            ->whereIn('t.status', ['called', 'serving'])
            ->select('t.id', 't.ticket_number', 't.window_id', 'w.name as window_name',
                'w.title as window_title', 't.service_name', 't.status', 't.called_at', 't.serving_at')
            ->orderByDesc('t.called_at')->orderByDesc('t.id')->limit(50)->get();

        $waiting = (clone $base)->leftJoin('windows as w', 'w.id', '=', 't.window_id')
            ->where('t.status', 'waiting')
            ->select('t.id', 't.ticket_number', 't.window_id', 'w.name as window_name',
                'w.title as window_title', 't.service_name', 't.status', 't.called_at', 't.serving_at')
            ->orderBy('t.created_at')->orderBy('t.id')->limit(100)->get();

        $eventsQuery = (clone $base)->join('ticket_call_events as e', 'e.ticket_id', '=', 't.id')
            ->whereIn('e.action', ['call', 'recall']);

        // First poll establishes the cursor without replaying historical announcements.
        $latestEventId = (int) (clone $eventsQuery)->max('e.id');
        $events = collect();
        if ($afterEventId !== null) {
            $events = (clone $eventsQuery)->leftJoin('windows as w', 'w.id', '=', 'e.window_id')
                ->where('e.id', '>', $afterEventId)
                ->where('e.id', '<=', $latestEventId)
                ->select('e.id', 'e.action', 'e.created_at', 't.ticket_number',
                    'e.window_id', 'w.name as window_name', 'w.title as window_title')
                ->orderBy('e.id')->limit(100)->get();
        }

        return [
            'location' => $scope,
            'called' => $active->where('status', 'called')->map(fn ($t) => $this->present($t))->values()->all(),
            'serving' => $active->where('status', 'serving')->map(fn ($t) => $this->present($t))->values()->all(),
            'waiting' => $waiting->map(fn ($t) => $this->present($t))->all(),
            'announcements' => $events->map(fn ($e) => [
                'id' => $e->id, 'action' => $e->action, 'ticket_number' => $e->ticket_number,
                'window_id' => $e->window_id, 'window_name' => $e->window_name,
                'window_title' => $e->window_title, 'counter_number' => $this->counterNumber($e),
                'created_at' => $e->created_at,
            ])->all(),
            // When a poll has more than 100 events, advance only through returned events.
            'latest_event_id' => $afterEventId === null
                ? $latestEventId
                : ($events->isNotEmpty() ? (int) $events->last()->id : $afterEventId),
        ];
    }
}
