<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\Auditable;
class ServiceApplication extends Model
{
      // ✅ ENABLE AUDIT
    use Auditable;

    protected $fillable = [

        'tracking_number',
        'service_id',
        'customer_id',
        'current_window_id',
        'current_officer_id',
        'status',
        'submitted_at',
        'approved_at',
        'rejected_at',
    ];

    public function service()
    {
        return $this->belongsTo(
            Service::class
        );
    }

    public function customer()
    {
        return $this->belongsTo(
            User::class,
            'customer_id'
        );
    }

    public function data()
    {
        return $this->hasMany(
            ServiceApplicationData::class,
            'application_id'
        );
    }

    public function workflow()
    {
        return $this->hasMany(
            ServiceApplicationWorkflow::class,
            'application_id'
        );
    }

    public function files()
{
    return $this->hasMany(
        ServiceApplicationFile::class,
        'application_id'
    );
}

public function histories()
{
    return $this->hasMany(
        ServiceApplicationHistory::class,
        'application_id'
    )->latest();
}

public function currentWindow()
{
    return $this->belongsTo(
        Window::class,
        'current_window_id'
    );
}

public function currentOfficer()
{
    return $this->belongsTo(
        User::class,
        'current_officer_id'
    );
}
}