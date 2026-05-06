<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Window extends Model
{
    protected $fillable = [
        'name',
        'availability',
    ];

    protected $casts = [
        'availability' => 'array',
    ];

    /**
     * Services relation.
     */
    public function services()
    {
        return $this->belongsToMany(
            Service::class,
            'service_window'
        )
        ->withPivot([
            'step_order',
            'is_required',
        ])
        ->withTimestamps();
    }
}