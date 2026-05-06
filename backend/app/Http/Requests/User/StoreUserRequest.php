<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            /* BASIC INFO */
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:100', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:20', 'unique:users,phone'],
            'gender' => ['required', 'string', 'in:male,female,other'],
            'password' => ['required', 'string', 'min:6', 'max:255'],

            /* SPATIE ROLE (IMPORTANT FIX) */
            'role' => [
                'required',
                'string',
                Rule::exists('roles', 'name')
                    ->where(fn ($q) => $q->where('guard_name', 'sanctum')),
            ],

            /* EXTRA PROFILE */
            'date_of_birth' => ['nullable', 'date'],
            'address' => ['nullable', 'string', 'max:255'],

            'gender' => ['nullable', 'in:male,female'],

            /* LOCATION */
            'city_id' => ['nullable', 'integer', 'exists:cities,id'],
            'subcity_id' => ['nullable', 'integer', 'exists:subcities,id'],
            'woreda_id' => ['nullable', 'integer', 'exists:woredas,id'],

            /* STATUS */
            'status' => ['nullable', Rule::in(['active', 'disabled'])],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}