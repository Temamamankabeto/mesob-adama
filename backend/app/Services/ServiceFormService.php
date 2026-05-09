<?php

namespace App\Services;

use App\Models\ServiceForm;

class ServiceFormService
{
    public function getAll()
    {
        return ServiceForm::with([
            'service',
            'fields',
        ])
        ->latest()
        ->paginate(10);
    }

    public function getOne(
        ServiceForm $serviceForm
    ) {
        return $serviceForm->load([
            'service',
            'fields',
        ]);
    }

    public function create(array $data)
    {
        return ServiceForm::create($data);
    }

    public function update(
        ServiceForm $serviceForm,
        array $data
    ) {
        $serviceForm->update($data);

        return $serviceForm->fresh();
    }

    public function delete(
        ServiceForm $serviceForm
    ) {
        $serviceForm->delete();
    }
}