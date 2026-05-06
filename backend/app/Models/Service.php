<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = [
        'name',
        'description',
        'has_back_officer',
        'service_fee',
        'availability',
        'status',
    ];

    protected $casts = [
        'availability' => 'array',
        'has_back_officer' => 'boolean',
    ];

    /**
     * Windows relation.
     */
    public function windows()
    {
        return $this->belongsToMany(
            Window::class,
            'service_window'
        )
        ->withPivot([
            'step_order',
            'is_required',
        ])
        ->withTimestamps()
        ->orderBy('service_window.step_order');
    }
}