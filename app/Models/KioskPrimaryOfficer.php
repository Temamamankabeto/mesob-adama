<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KioskPrimaryOfficer extends Model
{
    protected $table = 'kiosk_primary_officers';

    protected $fillable = [
        'kiosk_id',
        'service_id',
        'window_id',
        'officer_id',
        'assigned_by',
    ];

    protected $casts = [
        'kiosk_id' => 'integer',
        'service_id' => 'integer',
        'window_id' => 'integer',
        'officer_id' => 'integer',
        'assigned_by' => 'integer',
    ];

    public function kiosk(): BelongsTo
    {
        return $this->belongsTo(Kiosk::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function window(): BelongsTo
    {
        return $this->belongsTo(Window::class);
    }

    public function officer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'officer_id');
    }

    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }
}