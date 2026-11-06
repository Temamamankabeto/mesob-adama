<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ticket extends Model
{
    protected $fillable = [
        'ticket_number',
        'request_id',
        'window_id',
        'service_id',
        'service_name',
        'administrative_level',
        'city_id',
        'subcity_id',
        'woreda_id',
        'priority',
        'status',
        'called_at',
        'serving_at',
        'completed_at',
    ];

    protected $casts = [
        'window_id' => 'integer',
        'service_id' => 'integer',
        'city_id' => 'integer',
        'subcity_id' => 'integer',
        'woreda_id' => 'integer',
        'called_at' => 'datetime',
        'serving_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function window(): BelongsTo
    {
        return $this->belongsTo(Window::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}