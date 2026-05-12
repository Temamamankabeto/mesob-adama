<?php

namespace App\Services;
use App\Models\Traits\Auditable;
use App\Models\ServiceForm;

class ServiceFormService
{
    /*
    |--------------------------------------------------------------------------
    | LIST
    |--------------------------------------------------------------------------
    */

    public function list()
    {
        return ServiceForm::with([
            'service',
            'fields',
        ])
        ->latest()
        ->paginate(10);
    }

    /*
    |--------------------------------------------------------------------------
    | SHOW
    |--------------------------------------------------------------------------
    */

    public function show(
        ServiceForm $serviceForm
    ) {

        return $serviceForm->load([
            'service',
            'fields',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */

    public function create(
        array $data
    ) {

        return ServiceForm::create(
            $data
        );
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */

    public function update(
        ServiceForm $serviceForm,
        array $data
    ) {

        $serviceForm->update(
            $data
        );

        return $serviceForm->fresh();
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */

    public function delete(
        ServiceForm $serviceForm
    ) {

        $serviceForm->delete();
    }
}