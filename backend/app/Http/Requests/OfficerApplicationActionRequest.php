<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OfficerApplicationActionRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'remark' => ['nullable','string','max:2000'],
            'reason' => ['nullable','string','max:2000'],
            'note' => ['nullable','string','max:2000'],
            'officer_id' => ['nullable','integer','exists:users,id'],
            'front_officer_id' => ['nullable','integer','exists:users,id'],
            'back_officer_id' => ['nullable','integer','exists:users,id'],
            'manager_id' => ['nullable','integer','exists:users,id'],
            'window_id' => ['nullable','integer','exists:windows,id'],
            'to_window_id' => ['nullable','integer','exists:windows,id'],
            'documents' => ['nullable','array'],
            'documents.*' => ['file','max:10240'],
        ];
    }
}
