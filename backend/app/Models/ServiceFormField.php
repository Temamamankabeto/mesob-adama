<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceFormField extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_form_id',
        'service_form_section_id',
        'label',
        'name',
        'type',
        'placeholder',
        'help_text',
        'default_value',
        'options',
        'validation_rules',
        'is_required',
        'is_active',
        'sort_order',
        'width',
    ];

    protected $casts = [
        'options' => 'array',
        'validation_rules' => 'array',
        'is_required' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'service_form_id' => 'integer',
        'service_form_section_id' => 'integer',
    ];

    public function form()
    {
        return $this->belongsTo(
            ServiceForm::class,
            'service_form_id'
        );
    }

    public function section()
    {
        return $this->belongsTo(
            ServiceFormSection::class,
            'service_form_section_id'
        );
    }
}