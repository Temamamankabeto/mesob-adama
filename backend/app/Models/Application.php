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

    public function statusLogs()
    {
        return $this->hasMany(ApplicationStatusLog::class);
    }

    public function assignments()
    {
        return $this->hasMany(ApplicationAssignment::class);
    }

    public function comments()
    {
        return $this->hasMany(ApplicationComment::class);
    }

    public function documents()
    {
        return $this->hasMany(ApplicationDocument::class);
    }

    public function formValues()
    {
        return $this->hasMany(ApplicationFormValue::class);
    }
}