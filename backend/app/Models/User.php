<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use App\Models\City;
use App\Models\Subcity;
use App\Models\Woreda;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles, SoftDeletes;

    protected $guard_name = 'sanctum';

    protected $fillable = [
        'name', 'email', 'phone', 'gender', 'profile_image', 'password', 'address',
        'user_type', 'status', 'is_active', 'city_id', 'subcity_id', 'woreda_id',
        'phone_verified_at', 'last_login_at','date_of_birth'
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'phone_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
    ];

    protected $appends = ['profile_image_url'];

    public function customer()
    {
        return $this->hasOne(Customer::class);
    }

    public function serviceRequests()
    {
        return $this->hasMany(ServiceRequest::class, 'customer_id');
    }

    public function assignedServiceRequests()
    {
        return $this->hasMany(ServiceRequest::class, 'assigned_officer_id');
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }

    public function getProfileImageUrlAttribute(): ?string
    {
        return $this->profile_image ? asset('storage/' . $this->profile_image) : null;
    }
    /**
 * Assigned services.
 */
public function assignedServices()
{
    return $this->belongsToMany(
        Service::class,
        'user_service_assignments'
    )
    ->withPivot([
        'is_active',
    ])
    ->withTimestamps();
}

// city
    public function city()
    {
        return $this->belongsTo(City::class);
    }

    public function subcity()
    {
        return $this->belongsTo(Subcity::class);
    }

    public function woreda()
    {
        return $this->belongsTo(Woreda::class);
    }

}
