<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class KioskManagementService
{
    /**
     * Validate a kiosk's administrative level and location hierarchy.
     *
     * @param array<string, mixed> $data
     * @return array<string, int|string|null>
     */
    public function validateLocation(array $data): array
    {
        $level = $data['administrative_level'] ?? null;

        if (! in_array($level, ['city', 'subcity', 'woreda'], true)) {
            throw ValidationException::withMessages([
                'administrative_level' => [
                    'Invalid kiosk administrative level.',
                ],
            ]);
        }

        $cityId = $this->positiveId($data['city_id'] ?? null);
        $subcityId = $this->positiveId($data['subcity_id'] ?? null);
        $woredaId = $this->positiveId($data['woreda_id'] ?? null);

        if (
            $cityId === null ||
            ! DB::table('cities')->where('id', $cityId)->exists()
        ) {
            throw ValidationException::withMessages([
                'city_id' => ['A valid city is required.'],
            ]);
        }

        if ($level === 'city') {
            if ($subcityId !== null || $woredaId !== null) {
                throw ValidationException::withMessages([
                    'administrative_level' => [
                        'City kiosks cannot specify a subcity or woreda.',
                    ],
                ]);
            }

            return [
                'administrative_level' => 'city',
                'city_id' => $cityId,
                'subcity_id' => null,
                'woreda_id' => null,
            ];
        }

        if (
            $subcityId === null ||
            ! DB::table('subcities')
                ->where('id', $subcityId)
                ->where('city_id', $cityId)
                ->exists()
        ) {
            throw ValidationException::withMessages([
                'subcity_id' => [
                    'The selected subcity must belong to the selected city.',
                ],
            ]);
        }

        if ($level === 'subcity') {
            if ($woredaId !== null) {
                throw ValidationException::withMessages([
                    'woreda_id' => [
                        'Subcity kiosks cannot specify a woreda.',
                    ],
                ]);
            }

            return [
                'administrative_level' => 'subcity',
                'city_id' => $cityId,
                'subcity_id' => $subcityId,
                'woreda_id' => null,
            ];
        }

        if (
            $woredaId === null ||
            ! DB::table('woredas')
                ->where('id', $woredaId)
                ->where('subcity_id', $subcityId)
                ->exists()
        ) {
            throw ValidationException::withMessages([
                'woreda_id' => [
                    'The selected woreda must belong to the selected subcity.',
                ],
            ]);
        }

        return [
            'administrative_level' => 'woreda',
            'city_id' => $cityId,
            'subcity_id' => $subcityId,
            'woreda_id' => $woredaId,
        ];
    }

    /**
     * Register a kiosk and return its provisioning credential once.
     *
     * @param array<string, mixed> $data
     * @return array{kiosk: \App\Models\Kiosk, credential: string}
     */
    public function registerKiosk(array $data, int $administratorId): array
    {
        $validated = \Illuminate\Support\Facades\Validator::make(
            $data,
            [
                'code' => [
                    'required',
                    'string',
                    'max:50',
                    'regex:/^[A-Za-z0-9_-]+$/',
                    'unique:kiosks,code',
                ],
                'name' => [
                    'required',
                    'string',
                    'max:150',
                ],
                'administrative_level' => [
                    'required',
                    'in:city,subcity,woreda',
                ],
                'city_id' => [
                    'required',
                    'integer',
                    'min:1',
                ],
                'subcity_id' => [
                    'nullable',
                    'integer',
                    'min:1',
                ],
                'woreda_id' => [
                    'nullable',
                    'integer',
                    'min:1',
                ],
            ]
        )->validate();

        $location = $this->validateLocation($validated);

        $credential = bin2hex(random_bytes(32));

        $kiosk = DB::transaction(function () use (
            $validated,
            $location,
            $credential,
            $administratorId
        ) {
            return \App\Models\Kiosk::create([
                'code' => $validated['code'],
                'name' => $validated['name'],
                ...$location,
                'credential_hash' => hash('sha256', $credential),
                'is_active' => false,
                'created_by' => $administratorId,
                'updated_by' => $administratorId,
            ]);
        });

        return [
            'kiosk' => $kiosk,
            'credential' => $credential,
        ];
    }
    /**
     * Find officers eligible for a kiosk service and window.
     *
     * @return \Illuminate\Support\Collection<int, object>
     */
    public function eligibleFrontOfficers(
        \App\Models\Kiosk $kiosk,
        int $serviceId,
        int $windowId
    ): \Illuminate\Support\Collection {
        $location = $this->validateLocation([
            'administrative_level' => $kiosk->administrative_level,
            'city_id' => $kiosk->city_id,
            'subcity_id' => $kiosk->subcity_id,
            'woreda_id' => $kiosk->woreda_id,
        ]);

        $level = $location['administrative_level'];

        $serviceWindowExists = DB::table('service_window')
            ->where('service_id', $serviceId)
            ->where('window_id', $windowId)
            ->where('assignment_level', $level)
            ->exists();

        if (! $serviceWindowExists) {
            return collect();
        }

        return DB::table('user_service_assignments as usa')
            ->join('users as u', 'u.id', '=', 'usa.user_id')
            ->where('usa.service_id', $serviceId)
            ->where('usa.window_id', $windowId)
            ->where('usa.officer_type', 'front_officer')
            ->where('usa.is_active', true)
            ->where('usa.assignment_level', $level)
            ->where('usa.city_id', $location['city_id'])
            ->where('usa.subcity_id', $location['subcity_id'])
            ->where('usa.woreda_id', $location['woreda_id'])
            ->where('u.is_active', true)
            ->whereNull('u.deleted_at')
            ->whereExists(function ($query) use (
                $windowId,
                $level,
                $location
            ) {
                $query->selectRaw('1')
                    ->from('officer_window_assignments as owa')
                    ->whereColumn('owa.officer_id', 'u.id')
                    ->where('owa.window_id', $windowId)
                    ->where('owa.is_active', true)
                    ->where('owa.assignment_level', $level)
                    ->where('owa.city_id', $location['city_id'])
                    ->where('owa.subcity_id', $location['subcity_id'])
                    ->where('owa.woreda_id', $location['woreda_id']);
            })
            ->select(
                'u.id',
                'u.name',
                'u.officer_code'
            )
            ->distinct()
            ->orderBy('u.name')
            ->get();
    }
    private function positiveId(mixed $value): ?int
    {
        if (
            ! is_int($value) &&
            ! (is_string($value) && ctype_digit($value))
        ) {
            return null;
        }

        $id = filter_var(
            $value,
            FILTER_VALIDATE_INT,
            ['options' => ['min_range' => 1]]
        );

        return $id === false ? null : $id;
    }
}