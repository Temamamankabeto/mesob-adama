<?php

namespace App\Http\Controllers\Api;

use App\Models\User;

use App\Services\UserServiceAssignmentService;

use App\Http\Controllers\Controller;

use App\Http\Requests\AssignUserServiceRequest;

class UserServiceAssignmentController
    extends Controller
{
    protected
        UserServiceAssignmentService
        $assignmentService;

    public function __construct(
        UserServiceAssignmentService
            $assignmentService
    ) {
        $this->assignmentService =
            $assignmentService;
    }

    /**
     * Get assigned services.
     */
    public function show(User $user)
    {
        $user =
            $this->assignmentService
                ->getAssignedServices(
                    $user
                );

        return response()->json([

            'success' => true,

            'message' =>
                'Assigned services retrieved successfully',

            'data' => $user,

        ]);
    }

    /**
     * Assign services.
     */
    public function assign(
        AssignUserServiceRequest $request,
        User $user
    ) {

        $updatedUser =
            $this->assignmentService
                ->assign(
                    $user,
                    $request->validated()['service_ids']
                );

        return response()->json([

            'success' => true,

            'message' =>
                'Services assigned successfully',

            'data' => $updatedUser,

        ]);
    }
}