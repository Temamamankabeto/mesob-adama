<?php

namespace App\Services;

use App\Models\User;

class UserServiceAssignmentService
{
    /**
     * Assign services to user.
     */
    public function assign(
        User $user,
        array $serviceIds
    ): User {

        $syncData = [];

        foreach ($serviceIds as $serviceId) {

            $syncData[$serviceId] = [

                'is_active' => true,
            ];
        }

        $user->assignedServices()
            ->sync($syncData);

        return $user->load(
            'assignedServices'
        );
    }

    /**
     * Get assigned services.
     */
    public function getAssignedServices(
        User $user
    ): User {

        return $user->load(
            'assignedServices'
        );
    }
}