<?php

namespace App\Services;

use App\Models\User;

class UserServiceAssignmentService
{
    /*
    |--------------------------------------------------------------------------
    | ASSIGN SERVICES
    |--------------------------------------------------------------------------
    */

    public function assign(
        User $user,
        array $serviceIds
    ): User {

        /*
        |--------------------------------------------------------------------------
        | ATTACH WITHOUT DUPLICATE
        |--------------------------------------------------------------------------
        */

        foreach ($serviceIds as $serviceId) {

            $exists =
                $user
                    ->assignedServices()
                    ->where(
                        'service_id',
                        $serviceId
                    )
                    ->exists();

            /*
            |--------------------------------------------------------------------------
            | SKIP DUPLICATE
            |--------------------------------------------------------------------------
            */

            if ($exists) {
                continue;
            }

            /*
            |--------------------------------------------------------------------------
            | ATTACH
            |--------------------------------------------------------------------------
            */

            $user
                ->assignedServices()
                ->attach(
                    $serviceId,
                    [
                        'is_active' => true,
                    ]
                );
        }

        /*
        |--------------------------------------------------------------------------
        | RETURN USER
        |--------------------------------------------------------------------------
        */

        return $user->load(
            'assignedServices'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | GET ASSIGNED SERVICES
    |--------------------------------------------------------------------------
    */

    public function getAssignedServices(
        User $user
    ): User {

        return $user->load(
            'assignedServices'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | REMOVE SERVICE
    |--------------------------------------------------------------------------
    */

    public function remove(
        User $user,
        int $serviceId
    ): User {

        $user
            ->assignedServices()
            ->detach(
                $serviceId
            );

        return $user->load(
            'assignedServices'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | TOGGLE STATUS
    |--------------------------------------------------------------------------
    */

    public function toggle(
        User $user,
        int $serviceId
    ): User {

        $service =
            $user
                ->assignedServices()
                ->where(
                    'service_id',
                    $serviceId
                )
                ->first();

        if (!$service) {

            return $user->load(
                'assignedServices'
            );
        }

        $currentStatus =
            $service
                ->pivot
                ->is_active;

        $user
            ->assignedServices()
            ->updateExistingPivot(

                $serviceId,

                [
                    'is_active' =>
                        !$currentStatus,
                ]
            );

        return $user->load(
            'assignedServices'
        );
    }
}