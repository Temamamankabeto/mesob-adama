<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Kiosk extends Model
{
    protected $table = 'kiosks';

    protected $fillable = [
        'code',
        'name',
        'administrative_level',
        'city_id',
        'subcity_id',
        'woreda_id',
        'credential_hash',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $hidden = [
        'credential_hash',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'city_id' => 'integer',
        'subcity_id' => 'integer',
        'woreda_id' => 'integer',
    ];

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function subcity(): BelongsTo
    {
        return $this->belongsTo(Subcity::class);
    }

    public function woreda(): BelongsTo
    {
        return $this->belongsTo(Woreda::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function primaryOfficerAssignments(): HasMany
    {
        return $this->hasMany(KioskPrimaryOfficer::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}