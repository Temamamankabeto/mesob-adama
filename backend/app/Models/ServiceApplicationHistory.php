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
        'action_type',
        'remark',
        'comment',
        'metadata',
        'actor_id',
    ];

    protected $casts = [
        'application_id' => 'integer',
        'actor_id' => 'integer',
        'metadata' => 'array',
    ];

    public function application()
    {
        return $this->belongsTo(ServiceApplication::class, 'application_id');
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
