<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Subcity;
use App\Models\User;
use App\Models\Woreda;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class ScopedUserSeeder extends Seeder
{
    private const PASSWORD = 'Password@123';

    private int $phoneSequence = 92000000;

    public function run(): void
    {
        $this->ensureRoles();

        /*
        |--------------------------------------------------------------------------
        | SUPER ADMIN
        |--------------------------------------------------------------------------
        */

        $this->createScopedUser(
            name: 'Super Admin',
            email: 'superadmin@mesob.local',
            role: 'super_admin',
            cityId: null,
            subcityId: null,
            woredaId: null
        );

        $city = City::query()->orderBy('id')->first();

        if (!$city) {
            $this->command?->error('No city found. Run LocationSeeder first.');
            return;
        }

        $created = 1;

        /*
        |--------------------------------------------------------------------------
        | CITY LEVEL
        |--------------------------------------------------------------------------
        */

        $created += $this->seedScope(
            scope: 'city',
            label: $this->slug($city->name),
            cityId: $city->id,
            subcityId: null,
            woredaId: null,
            displayName: $city->name
        );

        /*
        |--------------------------------------------------------------------------
        | SUBCITY LEVEL
        |--------------------------------------------------------------------------
        */

        Subcity::query()
            ->with('city')
            ->orderBy('id')
            ->get()
            ->each(function (Subcity $subcity) use (&$created) {
                $created += $this->seedScope(
                    scope: 'subcity',
                    label: 'subcity-' . $subcity->id . '-' . $this->slug($subcity->name),
                    cityId: $subcity->city_id,
                    subcityId: $subcity->id,
                    woredaId: null,
                    displayName: $subcity->name
                );
            });

        /*
        |--------------------------------------------------------------------------
        | WOREDA LEVEL
        |--------------------------------------------------------------------------
        */

        Woreda::query()
            ->with('subcity')
            ->orderBy('id')
            ->get()
            ->each(function (Woreda $woreda) use (&$created) {
                $created += $this->seedScope(
                    scope: 'woreda',
                    label: 'woreda-' . $woreda->id . '-' . $this->slug($woreda->name),
                    cityId: $woreda->city_id ?? $woreda->subcity?->city_id,
                    subcityId: $woreda->subcity_id,
                    woredaId: $woreda->id,
                    displayName: $woreda->name
                );
            });

        $this->command?->info("Scoped users seeded successfully. Total created/updated: {$created}");
        $this->command?->info('Default password for all seeded users: ' . self::PASSWORD);
    }

    private function ensureRoles(): void
    {
        foreach ([
            'super_admin',
            'manager',
            'admin',
            'front_officer',
            'back_officer',
            'customer',
        ] as $role) {
            Role::firstOrCreate([
                'name' => $role,
                'guard_name' => 'sanctum',
            ]);
        }
    }

    private function seedScope(
        string $scope,
        string $label,
        int $cityId,
        ?int $subcityId,
        ?int $woredaId,
        string $displayName
    ): int {
        $count = 0;

        /*
        |--------------------------------------------------------------------------
        | MANAGER
        |--------------------------------------------------------------------------
        */

        $this->createScopedUser(
            name: "{$displayName} Manager",
            email: "{$scope}.{$label}.manager@mesob.local",
            role: 'manager',
            cityId: $cityId,
            subcityId: $subcityId,
            woredaId: $woredaId
        );

        $count++;

        /*
        |--------------------------------------------------------------------------
        | ADMIN
        |--------------------------------------------------------------------------
        */

        $this->createScopedUser(
            name: "{$displayName} Admin",
            email: "{$scope}.{$label}.admin@mesob.local",
            role: 'admin',
            cityId: $cityId,
            subcityId: $subcityId,
            woredaId: $woredaId
        );

        $count++;

        /*
        |--------------------------------------------------------------------------
        | FRONT OFFICER
        |--------------------------------------------------------------------------
        */

        $this->createScopedUser(
            name: "{$displayName} Front Officer",
            email: "{$scope}.{$label}.front-officer@mesob.local",
            role: 'front_officer',
            cityId: $cityId,
            subcityId: $subcityId,
            woredaId: $woredaId
        );

        $count++;

        /*
        |--------------------------------------------------------------------------
        | BACK OFFICER
        |--------------------------------------------------------------------------
        */

        $this->createScopedUser(
            name: "{$displayName} Back Officer",
            email: "{$scope}.{$label}.back-officer@mesob.local",
            role: 'back_officer',
            cityId: $cityId,
            subcityId: $subcityId,
            woredaId: $woredaId
        );

        $count++;

        return $count;
    }

    private function createScopedUser(
        string $name,
        string $email,
        string $role,
        ?int $cityId,
        ?int $subcityId,
        ?int $woredaId
    ): User {
        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'phone' => $this->uniquePhoneFor($email),
                'gender' => 'other',
                'password' => Hash::make(self::PASSWORD),
                'is_active' => true,
                'status' => 'active',
                'city_id' => $cityId,
                'subcity_id' => $subcityId,
                'woreda_id' => $woredaId,
            ]
        );

        $user->syncRoles([$role]);

        return $user;
    }

    private function uniquePhoneFor(string $email): string
    {
        $existing = User::query()
            ->where('email', $email)
            ->value('phone');

        if ($existing) {
            return $existing;
        }

        do {
            $phone = '09' . str_pad((string) $this->phoneSequence, 8, '0', STR_PAD_LEFT);
            $this->phoneSequence++;
        } while (User::query()->where('phone', $phone)->exists());

        return $phone;
    }

    private function slug(string $value): string
    {
        $value = strtolower(trim($value));
        $value = preg_replace('/[^a-z0-9]+/i', '-', $value);
        $value = trim($value, '-');

        return $value ?: 'location';
    }
}