<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [

            // AUTH
            'auth.me',

            // USERS
            'users.read',
            'users.create',
            'users.update',
            'users.delete',
            'users.activate',
            'users.deactivate',
            'users.reset_password',
            'users.assign_role',

            // ROLES
            'roles.read',
            'roles.create',
            'roles.update',
            'roles.delete',
            'roles.assign_permissions',

                // PERMISSIONS
            'permissions.read',
            'permissions.create',
            'permissions.update',
            'permissions.delete',

            // CITIES
            'cities.read',
            'cities.create',
            'cities.update',
            'cities.delete',

            // SUBCITIES
            'subcities.read',
            'subcities.create',
            'subcities.update',
            'subcities.delete',

            // WOREDAS
            'woredas.read',
            'woredas.create',
            'woredas.update',
            'woredas.delete',

            // SERVICES
            'services.read',
            'services.create',
            'services.update',
            'services.delete',

            // AUDIT
            'audit_logs.read',

            // REPORTS
            'reports.city',
            'reports.subcity',
            'reports.woreda',
            'reports.officer',
            'reports.customer',

       // WINDOWS
            'windows.read',
            'windows.create',
            'windows.update',
            'windows.delete',

             //permission
             'permissions.read',  
             'permission.create ',
             'permission.update',
            'permission.delete',
        ];

       



        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'sanctum',
            ]);
        }

        $all = Permission::where(
            'guard_name',
            'sanctum'
        )->pluck('name')->toArray();

        $roleMap = [

            // SUPER ADMIN
            'super_admin' => $all,

            // SUBCITY ADMIN
            'subcity_admin' => [

                'auth.me',

                'users.read',
                'users.create',
                'users.update',
                'users.activate',
                'users.deactivate',
                'users.reset_password',
                'users.assign_role',

                'roles.read',

                'permissions.read',

                'subcities.read',

                'woredas.read',

                // SERVICES
                'services.read',
                'services.create',
                'services.update',

                // WINDOWS
                'windows.read',
                'windows.create',
                'windows.update',
                'windows.delete',

               
             //permission
             'permissions.read',  
             'permission.create ',
             'permission.update',
              'permission.delete',

                'reports.subcity',
                'reports.woreda',

                'audit_logs.read',
            ],

            // WOREDA ADMIN
            'woreda_admin' => [

                'auth.me',

                'users.read',
                'users.create',
                'users.update',
                'users.activate',
                'users.deactivate',
                'users.reset_password',
                'users.assign_role',

                'roles.read',

                'permissions.read',

                'woredas.read',

                // SERVICES
                'services.read',
                'services.create',
                'services.update',

                'reports.woreda',

                'audit_logs.read',
            ],

            // CITY FRONT OFFICER
            'city_front_officer' => [
                'auth.me',

                'users.read',

                // SERVICES
                'services.read',

                'reports.officer',
            ],

            // CITY BACK OFFICER
            'city_back_officer' => [
                'auth.me',

                'users.read',

                // SERVICES
                'services.read',

                'reports.officer',
            ],

            // SUBCITY FRONT OFFICER
            'subcity_front_officer' => [
                'auth.me',

                'users.read',

                // SERVICES
                'services.read',

                'reports.officer',
            ],

            // SUBCITY BACK OFFICER
            'subcity_back_officer' => [
                'auth.me',

                'users.read',

                // SERVICES
                'services.read',

                'reports.officer',
            ],

            // WOREDA FRONT OFFICER
            'woreda_front_officer' => [
                'auth.me',

                'users.read',

                // SERVICES
                'services.read',

                'reports.officer',
            ],

            // WOREDA BACK OFFICER
            'woreda_back_officer' => [
                'auth.me',

                'users.read',

                // SERVICES
                'services.read',

                'reports.officer',
            ],

            // CUSTOMER
            'customer' => [
                'auth.me',

                'reports.customer',
            ],
        ];

        foreach (
            $roleMap as $roleName => $permissionsForRole
        ) {
            $role = Role::firstOrCreate([
                'name' => $roleName,
                'guard_name' => 'sanctum',
            ]);

            $role->syncPermissions(
                $permissionsForRole
            );
        }

        $users = [

            [
                'name' => 'Super Admin',
                'email' => 'superadmin@eservice.com',
                'phone' => '0911000001',
                'role' => 'super_admin',
            ],

            [
                'name' => 'Subcity Admin',
                'email' => 'subcity@eservice.com',
                'phone' => '0911000002',
                'role' => 'subcity_admin',
            ],

            [
                'name' => 'Woreda Admin',
                'email' => 'woreda@eservice.com',
                'phone' => '0911000003',
                'role' => 'woreda_admin',
            ],

            [
                'name' => 'Front Officer',
                'email' => 'frontofficer@eservice.com',
                'phone' => '0911000004',
                'role' => 'woreda_front_officer',
            ],

            [
                'name' => 'Back Officer',
                'email' => 'backofficer@eservice.com',
                'phone' => '0911000005',
                'role' => 'woreda_back_officer',
            ],

            [
                'name' => 'Customer User',
                'email' => 'customer@eservice.com',
                'phone' => '0911000006',
                'role' => 'customer',
            ],
        ];

        foreach ($users as $seedUser) {

            $user = User::updateOrCreate(

                [
                    'email' => $seedUser['email'],
                ],

                [
                    'name' => $seedUser['name'],

                    'phone' => $seedUser['phone'],

                    'password' => Hash::make(
                        'Password@123'
                    ),

                    'is_active' => true,
                ]
            );

            $user->syncRoles([
                $seedUser['role']
            ]);
        }

        app(PermissionRegistrar::class)
            ->forgetCachedPermissions();
    }
}