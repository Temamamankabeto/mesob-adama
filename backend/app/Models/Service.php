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

    /**
 * Assigned users.
 */
public function assignedUsers()
{
    return $this->belongsToMany(
        User::class,
        'user_service_assignments'
    )
    ->withPivot([
        'is_active',
    ])
    ->withTimestamps();
}

/**
 * Front officers.
 */
public function frontOfficers()
{
    return $this->assignedUsers()
        ->role([
            'city_front_officer',
            'subcity_front_officer',
            'woreda_front_officer',
        ]);
}

/**
 * Back officers.
 */
public function backOfficers()
{
    return $this->assignedUsers()
        ->role([
            'city_back_officer',
            'subcity_back_officer',
            'woreda_back_officer',
        ]);
}
}