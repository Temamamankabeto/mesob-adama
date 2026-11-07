<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

final class PublicOfficerCounterService
{
    public function get(string $officerCode): ?array
    {
        $officer = DB::table('users')
            ->where('officer_code', $officerCode)
            ->whereNull('deleted_at')
            ->first(['id', 'officer_code', 'profile_image', 'updated_at']);

        if ($officer === null) {
            return null;
        }

        $ticket = DB::table('tickets as t')
            ->leftJoin('windows as w', 'w.id', '=', 't.window_id')
            ->where('t.calling_officer_id', $officer->id)
            ->whereIn('t.status', ['called', 'serving'])
            ->orderByRaw("CASE WHEN t.status = 'called' THEN 0 ELSE 1 END")
            ->orderByDesc('t.called_at')
            ->orderByDesc('t.id')
            ->first([
                't.ticket_number', 't.status', 't.called_at', 't.serving_at',
                't.window_id', 'w.name as window_name', 'w.title as window_title',
                't.administrative_level', 't.city_id', 't.subcity_id', 't.woreda_id',
            ]);

        // Only explicitly assigned, active services are shown on the public counter.
        // The existing counter response fields remain unchanged.
        $assignedServices = DB::table('user_service_assignments as usa')
            ->join('services as s', 's.id', '=', 'usa.service_id')
            ->where('usa.user_id', $officer->id)
            ->where('usa.is_active', true)
            ->whereNotNull('s.name')
            ->where('s.name', '<>', '')
            ->orderBy('s.name')
            ->distinct()
            ->pluck('s.name')
            ->values()
            ->all();

        return [
            'officer_code' => $officer->officer_code,
            'assigned_services' => $assignedServices,
            'officer_photo_url' => $officer->profile_image
                ? asset('storage/' . ltrim($officer->profile_image, '/')) . '?v=' . rawurlencode((string) $officer->updated_at)
                : null,
            'current_ticket' => $ticket ? [
                'ticket_number' => $ticket->ticket_number,
                'status' => $ticket->status,
                'called_at' => $ticket->called_at,
                'serving_at' => $ticket->serving_at,
                'window_id' => $ticket->window_id,
                'window_name' => $ticket->window_name,
                'window_title' => $ticket->window_title,
                'administrative_level' => $ticket->administrative_level,
                'city_id' => $ticket->city_id,
                'subcity_id' => $ticket->subcity_id,
                'woreda_id' => $ticket->woreda_id,
            ] : null,
        ];
    }
}
