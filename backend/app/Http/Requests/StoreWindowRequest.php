<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreWindowRequest extends FormRequest
{
    /**
     * Determine if authorized.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Validation rules.
     */
    public function rules(): array
    {
        return [

            'name' => 'required|string|max:255',

            'availability' => 'required|array|min:1',

            'availability.*' => 'in:city,subcity,woreda',

        ];
    }
}