<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceApplicationData extends Model
{
    protected $table =
        'service_application_data';

    protected $fillable = [

        'application_id',
        'field_name',
        'field_value',
    ];

    public function application()
    {
        return $this->belongsTo(
            ServiceApplication::class,
            'application_id'
        );
    }
}