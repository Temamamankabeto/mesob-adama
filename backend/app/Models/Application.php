<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    protected $fillable = [
        'application_number',
        'customer_id',
        'service_id',
        'status',
        'assigned_to',
        'submitted_at',
        'completed_at',
        'remarks',
    ];

    protected $casts = [
        'customer_id' => 'integer',
        'service_id' => 'integer',
        'assigned_to' => 'integer',
        'submitted_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
