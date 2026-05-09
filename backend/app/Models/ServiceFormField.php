<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceFormField extends Model
{
    protected $fillable = [

        'service_form_id',
        'label',
        'name',
        'type',
        'options',
        'placeholder',
        'validation_rules',
        'is_required',
        'sort_order',
        'width',
    ];

    protected $casts = [

        'options' => 'array',
        'is_required' => 'boolean',
    ];

    public function form()
    {
        return $this->belongsTo(
            ServiceForm::class,
            'service_form_id'
        );
    }
}