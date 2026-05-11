<?php

namespace App\Http\Controllers\Api;

use App\Models\Service;
use App\Models\ServiceForm;

use App\Http\Controllers\Controller;

use App\Http\Requests\StoreServiceRequest;

use App\Http\Requests\UpdateServiceRequest;
use Illuminate\Http\Request;
  




use App\Services\ServiceService;

class ServiceController
    extends Controller
{
    protected ServiceService
        $serviceService;

    public function __construct(
        ServiceService $serviceService
    ) {

        $this->serviceService =
            $serviceService;
    }

    /*
    |--------------------------------------------------------------------------
    | LIST SERVICES
    |--------------------------------------------------------------------------
    */

    public function index()
    {
        $this->authorize(
            'viewAny',
            Service::class
        );

        /*
        |--------------------------------------------------------------------------
        | GET SERVICES
        |--------------------------------------------------------------------------
        */

        $services =
            $this->serviceService
                ->getAll();

        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([

            'success' => true,

            'message' =>
                'Services retrieved successfully',

            'data' => $services,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | SHOW SERVICE
    |--------------------------------------------------------------------------
    */

    public function show(
        Service $service
    ) {

        $this->authorize(
            'view',
            $service
        );

        /*
        |--------------------------------------------------------------------------
        | LOAD RELATIONSHIPS
        |--------------------------------------------------------------------------
        */

        $service->load([

            'assignedUsers:id,name,email',

            'windows:id,name',
        ]);

        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([

            'success' => true,

            'message' =>
                'Service retrieved successfully',

            'data' => $service,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | STORE SERVICE
    |--------------------------------------------------------------------------
    */

    public function store(
        StoreServiceRequest $request
    ) {

        $this->authorize(
            'create',
            Service::class
        );

        /*
        |--------------------------------------------------------------------------
        | CREATE
        |--------------------------------------------------------------------------
        */

        $service =
            $this->serviceService
                ->create(
                    $request->validated()
                );

        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([

            'success' => true,

            'message' =>
                'Service created successfully',

            'data' => $service,

        ], 201);
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE SERVICE
    |--------------------------------------------------------------------------
    */

    public function update(
        UpdateServiceRequest $request,
        Service $service
    ) {

        $this->authorize(
            'update',
            $service
        );

        /*
        |--------------------------------------------------------------------------
        | UPDATE
        |--------------------------------------------------------------------------
        */

        $updatedService =
            $this->serviceService
                ->update(
                    $service,
                    $request->validated()
                );

        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([

            'success' => true,

            'message' =>
                'Service updated successfully',

            'data' => $updatedService,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE SERVICE
    |--------------------------------------------------------------------------
    */

    public function destroy(
        Service $service
    ) {

        $this->authorize(
            'delete',
            $service
        );

        /*
        |--------------------------------------------------------------------------
        | DELETE
        |--------------------------------------------------------------------------
        */

        $this->serviceService
            ->delete(
                $service
            );

        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([

            'success' => true,

            'message' =>
                'Service deleted successfully',
        ]);
    }




    /*
|--------------------------------------------------------------------------
| LIST SERVICE FORMS
|--------------------------------------------------------------------------
*/

public function forms(
    Service $service
) {

    $forms =
        $service->forms()
            ->latest()
            ->paginate(10);

    return response()->json([

        'success' => true,

        'message' =>
            'Forms retrieved successfully',

        'data' =>
            $forms->items(),

        'meta' => [

            'current_page' =>
                $forms->currentPage(),

            'last_page' =>
                $forms->lastPage(),

            'per_page' =>
                $forms->perPage(),

            'total' =>
                $forms->total(),
        ],
    ]);
}

/*
|--------------------------------------------------------------------------
| STORE SERVICE FORM
|--------------------------------------------------------------------------
*/

public function storeForm(
    Request $request,
    Service $service
) {

    $validated =
        $request->validate([

            'title' =>
                ['required', 'string'],

            'description' =>
                ['nullable', 'string'],
        ]);

    $form =
        $service->forms()
            ->create($validated);

    return response()->json([

        'success' => true,

        'message' =>
            'Form created successfully',

        'data' => $form,

    ], 201);
}

/*
|--------------------------------------------------------------------------
| SHOW SERVICE FORM
|--------------------------------------------------------------------------
*/

public function showForm(
    ServiceForm $serviceForm
) {

    return response()->json([

        'success' => true,

        'message' =>
            'Form retrieved successfully',

        'data' => $serviceForm,
    ]);
}

/*
|--------------------------------------------------------------------------
| UPDATE SERVICE FORM
|--------------------------------------------------------------------------
*/

public function updateForm(
    Request $request,
    ServiceForm $serviceForm
) {

    $validated =
        $request->validate([

            'title' =>
                ['required', 'string'],

            'description' =>
                ['nullable', 'string'],
        ]);

    $serviceForm->update(
        $validated
    );

    return response()->json([

        'success' => true,

        'message' =>
            'Form updated successfully',

        'data' => $serviceForm,
    ]);
}

/*
|--------------------------------------------------------------------------
| DELETE SERVICE FORM
|--------------------------------------------------------------------------
*/

public function destroyForm(
    ServiceForm $serviceForm
) {

    $serviceForm->delete();

    return response()->json([

        'success' => true,

        'message' =>
            'Form deleted successfully',
    ]);
}

/*
|--------------------------------------------------------------------------
| TOGGLE FORM STATUS
|--------------------------------------------------------------------------
*/

public function toggleForm(
    ServiceForm $serviceForm
) {

    $serviceForm->update([

        'is_active' =>
            !$serviceForm->is_active,
    ]);

    return response()->json([

        'success' => true,

        'message' =>
            'Form status updated successfully',

        'data' => $serviceForm,
    ]);
}
}