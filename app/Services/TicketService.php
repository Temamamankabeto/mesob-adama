<?php

namespace App\Services;

use App\Models\Service;
use App\Models\Ticket;
use App\Services\Concerns\ChecksServiceAvailability;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

final class TicketService
{
    use ChecksServiceAvailability;

    private const LEVELS = [
        'city',
        'subcity',
        'woreda',
    ];

    public function issue(array $input): Ticket
    {
        return DB::transaction(function () use ($input): Ticket {
            $level = $input['administrative_level'] ?? null;
            $priority = $input['priority'] ?? 'normal';

            if (! in_array($level, self::LEVELS, true)) {
                throw ValidationException::withMessages([
                    'administrative_level' => 'Invalid administrative level.',
                ]);
            }

            if (! isset(
                $input['request_id'],
                $input['window_id'],
                $input['service_id'],
                $input['city_id']
            )) {
                throw ValidationException::withMessages([
                    'request' => 'Required ticket information is missing.',
                ]);
            }

            $cityId = (int) $input['city_id'];
            $subcityId = isset($input['subcity_id'])
                ? (int) $input['subcity_id']
                : null;
            $woredaId = isset($input['woreda_id'])
                ? (int) $input['woreda_id']
                : null;

            $this->validateLocation(
                $level,
                $cityId,
                $subcityId,
                $woredaId
            );

            $existing = Ticket::query()
                ->where('request_id', $input['request_id'])
                ->first();

            if ($existing) {
                if (
                    (int) $existing->window_id !== (int) $input['window_id']
                    || (int) $existing->service_id !== (int) $input['service_id']
                    || $existing->administrative_level !== $level
                    || $existing->priority !== $priority
                    || (int) $existing->city_id !== $cityId
                    || $existing->subcity_id !== $subcityId
                    || $existing->woreda_id !== $woredaId
                ) {
                    throw new ConflictHttpException(
                        'This request ID belongs to another ticket request.'
                    );
                }

                return $existing;
            }

            $window = DB::table('windows')
                ->where('id', $input['window_id'])
                ->first();

            if (! $window) {
                throw ValidationException::withMessages([
                    'window_id' => 'The selected window does not exist.',
                ]);
            }

            if (
                $window->administrative_level !== null
                && $window->administrative_level !== $level
            ) {
                throw ValidationException::withMessages([
                    'window_id' => 'The window is unavailable at this level.',
                ]);
            }

            foreach (
                [
                    'city_id' => $cityId,
                    'subcity_id' => $subcityId,
                    'woreda_id' => $woredaId,
                ] as $column => $selectedId
            ) {
                if (
                    $window->{$column} !== null
                    && (int) $window->{$column} !== $selectedId
                ) {
                    throw ValidationException::withMessages([
                        'window_id' => 'The window is unavailable at this location.',
                    ]);
                }
            }

            $officerAssigned = DB::table('officer_window_assignments')
                ->where('window_id', $window->id)
                ->where('is_active', true)
                ->where('assignment_level', $level)
                ->where('city_id', $cityId)
                ->where('subcity_id', $subcityId)
                ->where('woreda_id', $woredaId)
                ->exists();

            if (! $officerAssigned) {
                throw ValidationException::withMessages([
                    'window_id' => 'No active officer is assigned to this window at the selected location.',
                ]);
            }

            $service = Service::query()
                ->whereKey($input['service_id'])
                ->where('status', 'active')
                ->first();

            if (! $service) {
                throw ValidationException::withMessages([
                    'service_id' => 'The selected service is unavailable.',
                ]);
            }

            $assigned = DB::table('service_window')
                ->where('window_id', $window->id)
                ->where('service_id', $service->id)
                ->where('assignment_level', $level)
                ->exists();

            if (! $assigned) {
                throw ValidationException::withMessages([
                    'service_id' => 'Service is not assigned to this window at the selected level.',
                ]);
            }

            if (! $this->serviceIsAvailableForSelection(
                $service,
                $level,
                $cityId,
                $subcityId,
                $woredaId
            )) {
                throw ValidationException::withMessages([
                    'service_id' => 'Service is unavailable at the selected location.',
                ]);
            }

            // Preserve the existing sequence lock and idempotency.
            $sequence = DB::table('ticket_sequences')
                ->where('name', 'ticket')
                ->lockForUpdate()
                ->first();

            if (! $sequence) {
                throw new \RuntimeException(
                    'Ticket sequence is not initialized.'
                );
            }

            // Recheck after acquiring the sequence lock: another request may
            // have created this same ticket while we validated the selection.
            $existing = Ticket::query()
                ->where('request_id', $input['request_id'])
                ->first();
            if ($existing) {
                if (
                    (int) $existing->window_id !== (int) $input['window_id']
                    || (int) $existing->service_id !== (int) $input['service_id']
                    || $existing->administrative_level !== $level
                    || $existing->priority !== $priority
                    || (int) $existing->city_id !== $cityId
                    || $existing->subcity_id !== $subcityId
                    || $existing->woreda_id !== $woredaId
                ) {
                    throw new ConflictHttpException(
                        'This request ID belongs to another ticket request.'
                    );
                }
                return $existing;
            }

            $next = (int) $sequence->last_number + 1;

            DB::table('ticket_sequences')
                ->where('name', 'ticket')
                ->update([
                    'last_number' => $next,
                    'updated_at' => now(),
                ]);

            return Ticket::create([
                'ticket_number' => 'T' . str_pad(
                    (string) $next,
                    4,
                    '0',
                    STR_PAD_LEFT
                ),
                'request_id' => $input['request_id'],
                'window_id' => $window->id,
                'service_id' => $service->id,
                'service_name' => $service->name,
                'administrative_level' => $level,
                'city_id' => $cityId,
                'subcity_id' => $subcityId,
                'woreda_id' => $woredaId,
                'priority' => $priority,
                'status' => 'waiting',
            ]);
        }, 3);
    }

    private function validateLocation(
        string $level,
        int $cityId,
        ?int $subcityId,
        ?int $woredaId
    ): void {
        if (
            $cityId <= 0
            || ($level === 'city' && ($subcityId !== null || $woredaId !== null))
            || ($level === 'subcity' && ($subcityId === null || $woredaId !== null))
            || ($level === 'woreda' && ($subcityId === null || $woredaId === null))
        ) {
            throw ValidationException::withMessages([
                'location' => 'Invalid location IDs for the selected administrative level.',
            ]);
        }

        if (! DB::table('cities')->where('id', $cityId)->exists()) {
            throw ValidationException::withMessages([
                'city_id' => 'The selected City does not exist.',
            ]);
        }

        if (
            $subcityId !== null
            && ! DB::table('subcities')
                ->where('id', $subcityId)
                ->where('city_id', $cityId)
                ->exists()
        ) {
            throw ValidationException::withMessages([
                'subcity_id' => 'Subcity does not belong to the selected City.',
            ]);
        }

        if (
            $woredaId !== null
            && ! DB::table('woredas')
                ->where('id', $woredaId)
                ->where('subcity_id', $subcityId)
                ->where(function ($query) use ($cityId) {
                    $query->whereNull('city_id')
                        ->orWhere('city_id', $cityId);
                })
                ->exists()
        ) {
            throw ValidationException::withMessages([
                'woreda_id' => 'Woreda does not belong to the selected location.',
            ]);
        }
    }
}