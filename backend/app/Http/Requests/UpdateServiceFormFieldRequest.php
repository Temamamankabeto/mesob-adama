<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateServiceFormFieldRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'service_form_id' => [
                'sometimes',
                'exists:service_forms,id',
            ],

            'label' => [
                'sometimes',
                'string',
                'max:255',
            ],

            'name' => [
                'sometimes',
                'string',
                'max:255',
            ],

            'type' => [
                'sometimes',
                'in:text,textarea,number,email,tel,date,select,radio,checkbox,file,image',
            ],

            'options' => [
                'nullable',
                'array',
            ],

            'placeholder' => [
                'nullable',
                'string',
                'max:255',
            ],

            'validation_rules' => [
                'nullable',
                'string',
                'max:255',
            ],

            'is_required' => [
                'nullable',
                'boolean',
            ],

            'sort_order' => [
                'nullable',
                'integer',
                'min:1',
            ],

            'width' => [
                'nullable',
                'in:full,half,third,quarter',
            ],
        ];
    }
}