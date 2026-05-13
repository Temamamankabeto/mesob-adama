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
            'manager', //(at all level)
            'admin', //(at all level)
            'front_officer',  //(at all level)
            'back_officer', //(at all level)
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
