<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceApplicationHistory extends Model
{
    protected $fillable = [
        'application_id',
        'from_status',
        'to_status',
        'action',
        'remark',
        'actor_id',
    ];

    public function application()
    {
        return $this->belongsTo(
            ServiceApplication::class,
            'application_id'
        );
    }

    public function actor()
    {
        return $this->belongsTo(
            User::class,
            'actor_id'
        );
    }
}