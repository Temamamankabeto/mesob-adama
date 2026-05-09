<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceForm extends Model
{
    protected $fillable = [

        'service_id',
        'title',
        'description',
        'is_active',
    ];

    public function service()
    {
        return $this->belongsTo(
            Service::class
        );
    }

    public function fields()
    {
        return $this->hasMany(
            ServiceFormField::class
        )->orderBy('sort_order');
    }
}