<?php

namespace App\Services;

use App\Models\ServiceFormField;

class ServiceFormFieldService
{
    public function getAll()
    {
        return ServiceFormField::with([
            'form',
        ])
        ->orderBy('sort_order')
        ->paginate(20);
    }

    public function create(array $data)
    {
        return ServiceFormField::create($data);
    }

    public function update(
        ServiceFormField $field,
        array $data
    ) {
        $field->update($data);

        return $field->fresh();
    }

    public function delete(
        ServiceFormField $field
    ) {
        $field->delete();
    }
}