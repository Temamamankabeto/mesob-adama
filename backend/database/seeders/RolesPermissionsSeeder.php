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
            'admin' => [

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
            'manager' => [

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

           
            // CITY FRONT OFFICER
            'front_officer' => [
                'auth.me',

                'users.read',

                // SERVICES
                'services.read',

                'reports.officer',
            ],

            // CITY BACK OFFICER
            'back_officer' => [
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
                'name' => 'Admin',
                'email' => 'admin@eservice.com',
                'phone' => '0911000002',
                'role' => 'admin',
            ],

           
            [
                'name' => 'Front Officer',
                'email' => 'frontofficer@eservice.com',
                'phone' => '0911000004',
                'role' => 'front_officer',
            ],

            [
                'name' => 'Back Officer',
                'email' => 'backofficer@eservice.com',
                'phone' => '0911000005',
                'role' => 'back_officer',
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