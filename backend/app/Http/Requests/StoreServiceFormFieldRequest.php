<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceFormFieldRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'service_form_id' => [
                'required',
                'exists:service_forms,id',
            ],

            'label' => [
                'required',
                'string',
                'max:255',
            ],

            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'type' => [
                'required',
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