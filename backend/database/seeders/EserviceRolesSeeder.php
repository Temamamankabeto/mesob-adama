<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class EserviceRolesSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            'super_admin',
            'city_admin',
            'subcity_admin',
            'woreda_admin',
            'front_officer',
            'back_officer',
            'customer'
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate([
                'name' => $role,
                'guard_name' => 'sanctum'
            ]);
        }
    }
}
