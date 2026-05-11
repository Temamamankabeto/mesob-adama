<?php

namespace App\Modules\ServiceForms\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\ServiceForms\Models\ServiceForm;
use App\Modules\ServiceForms\Services\ServiceFormService;
use App\Modules\ServiceForms\Http\Requests\StoreServiceFormRequest;
use App\Modules\ServiceForms\Http\Requests\UpdateServiceFormRequest;
use Illuminate\Http\Request;

class ServiceFormController extends Controller
{
    public function __construct(
        protected ServiceFormService $service
    ) {}

    public function index(Request $request)
    {
        return response()->json(
            $this->service->list($request)
        );
    }

    public function store(StoreServiceFormRequest $request)
    {
        $data = $this->service->create($request->validated());

        return response()->json([
            'message' => 'Created',
            'data' => $data
        ]);
    }

    public function show(ServiceForm $serviceForm)
    {
        return response()->json(
            $serviceForm->load('service')
        );
    }

    public function update(UpdateServiceFormRequest $request, ServiceForm $serviceForm)
    {
        $data = $this->service->update($serviceForm, $request->validated());

        return response()->json([
            'message' => 'Updated',
            'data' => $data
        ]);
    }

    public function destroy(ServiceForm $serviceForm)
    {
        $this->service->delete($serviceForm);

        return response()->json([
            'message' => 'Deleted'
        ]);
    }
}