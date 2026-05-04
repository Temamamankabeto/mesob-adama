<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class EserviceRolesSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            'super_admin_city',
            'subcity_admin',
            'woreda_admin',
            'city_front_officer',
            'city_back_officer',
            'subcity_front_officer',
            'subcity_back_officer',
            'woreda_front_officer',
            'woreda_back_officer',
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
