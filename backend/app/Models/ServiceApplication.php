<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\Auditable;

class ServiceApplication extends Model
{
    use Auditable;

    protected $fillable = [
        'tracking_number',
        'service_id',
        'customer_id',
        'current_window_id',
        'current_officer_id',
        'status',
        'current_stage',
        'assigned_to',
        'assigned_role',
        'priority',
        'sla_due_at',
        'submitted_at',
        'approved_at',
        'rejected_at',
        'completed_at',
        'rejection_reason',
        'returned_count',
    ];

    protected $casts = [
        'service_id' => 'integer',
        'customer_id' => 'integer',
        'current_window_id' => 'integer',
        'current_officer_id' => 'integer',
        'assigned_to' => 'integer',
        'returned_count' => 'integer',
        'sla_due_at' => 'datetime',
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function data()
    {
        return $this->hasMany(ServiceApplicationData::class, 'application_id');
    }

    public function files()
    {
        return $this->hasMany(ServiceApplicationFile::class, 'application_id');
    }

    public function workflows()
    {
        return $this->hasMany(ServiceApplicationWorkflow::class, 'application_id');
    }

    public function workflow()
    {
        return $this->workflows();
    }

    public function histories()
    {
        return $this->hasMany(ServiceApplicationHistory::class, 'application_id')
            ->latest();
    }

    public function currentWindow()
    {
        return $this->belongsTo(Window::class, 'current_window_id');
    }

    public function currentOfficer()
    {
        return $this->belongsTo(User::class, 'current_officer_id');
    }
}
