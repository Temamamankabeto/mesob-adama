<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWindowRequest extends FormRequest
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

            'name' => 'sometimes|required|string|max:255',

            'availability' => 'sometimes|required|array|min:1',

            'availability.*' => 'in:city,subcity,woreda',

        ];
    }
}