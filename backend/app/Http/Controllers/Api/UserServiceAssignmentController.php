<?php

namespace App\Http\Controllers\Api;

use App\Models\User;

use App\Http\Controllers\Controller;

use App\Http\Requests\AssignUserServiceRequest;

use App\Services\UserServiceAssignmentService;
use Illuminate\Http\Request;

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

    /*
    |--------------------------------------------------------------------------
    | GET ASSIGNED SERVICES
    |--------------------------------------------------------------------------
    */

    public function show(
        User $user
    ) {

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

    /*
    |--------------------------------------------------------------------------
    | ASSIGN SERVICES
    |--------------------------------------------------------------------------
    */

    public function assign(
        AssignUserServiceRequest $request,
        User $user
    ) {

        /*
        |--------------------------------------------------------------------------
        | VALIDATED
        |--------------------------------------------------------------------------
        */

        $validated =
            $request->validated();

        /*
        |--------------------------------------------------------------------------
        | ASSIGN
        |--------------------------------------------------------------------------
        */

        $updatedUser =
            $this->assignmentService
            ->assign(
                $user,
                $validated['service_ids']
            );

        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([

            'success' => true,

            'message' =>
            'Services assigned successfully',

            'data' => $updatedUser,

        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | REMOVE ASSIGNED SERVICE
    |--------------------------------------------------------------------------
    */

    public function remove(
        User $user,
        int $serviceId
    ) {

        $updatedUser =
            $this->assignmentService
            ->remove(
                $user,
                $serviceId
            );

        return response()->json([

            'success' => true,

            'message' =>
            'Service removed successfully',

            'data' => $updatedUser,

        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | TOGGLE ACTIVE STATUS
    |--------------------------------------------------------------------------
    */

    public function toggle(
        User $user,
        int $serviceId
    ) {

        $updatedUser =
            $this->assignmentService
            ->toggle(
                $user,
                $serviceId
            );

        return response()->json([

            'success' => true,

            'message' =>
            'Assignment status updated successfully',

            'data' => $updatedUser,

        ]);
    }



    /*
|--------------------------------------------------------------------------
| LIST OFFICERS WITH SERVICES
|--------------------------------------------------------------------------
*/

    public function officers(Request $request)
    {
        /*
    |--------------------------------------------------------------------------
    | PAGINATION
    |--------------------------------------------------------------------------
    */

        $perPage =
            $request->get(
                'per_page',
                2
            );

        /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

        $search =
            $request->get(
                'search'
            );

        /*
    |--------------------------------------------------------------------------
    | GET OFFICERS
    |--------------------------------------------------------------------------
    */

        $officers = User::query()

            ->with([

                /*
            |--------------------------------------------------------------------------
            | ASSIGNED SERVICES
            |--------------------------------------------------------------------------
            */

                'assignedServices:id,name',

                /*
            |--------------------------------------------------------------------------
            | ROLES
            |--------------------------------------------------------------------------
            */

                'roles:id,name',
            ])

            /*
        |--------------------------------------------------------------------------
        | ONLY OFFICERS
        |--------------------------------------------------------------------------
        */

            ->whereHas(
                'roles',
                function ($query) {

                    $query->whereIn(
                        'name',
                        [

                            'front_officer',
                            'back_officer',

                        ]
                    );
                }
            )

            /*
        |--------------------------------------------------------------------------
        | SEARCH
        |--------------------------------------------------------------------------
        */

            ->when(
                $search,
                function ($query)
                use ($search) {

                    $query->where(
                        function ($q)
                        use ($search) {

                            $q->where(
                                'name',
                                'like',
                                "%{$search}%"
                            )

                                ->orWhere(
                                    'email',
                                    'like',
                                    "%{$search}%"
                                )

                                ->orWhereHas(
                                    'roles',
                                    function ($roleQuery)
                                    use ($search) {

                                        $roleQuery->where(
                                            'name',
                                            'like',
                                            "%{$search}%"
                                        );
                                    }
                                );
                        }
                    );
                }
            )

            ->latest()

            ->paginate($perPage);

        /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

        return response()->json([

            'success' => true,

            'message' =>
            'Officers retrieved successfully',

            'data' =>
            $officers->items(),

            'meta' => [

                'current_page' =>
                $officers->currentPage(),

                'last_page' =>
                $officers->lastPage(),

                'per_page' =>
                $officers->perPage(),

                'total' =>
                $officers->total(),
            ],
        ]);
    }
}
