<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceApplicationWorkflow extends Model
{
    protected $table =
        'service_application_workflow';

    protected $fillable = [

        'application_id',
        'window_id',
        'officer_id',
        'status',
        'remark',
        'acted_at',
    ];

    public function application()
    {
        return $this->belongsTo(
            ServiceApplication::class,
            'application_id'
        );
    }

    public function window()
    {
        return $this->belongsTo(
            Window::class
        );
    }

    public function officer()
    {
        return $this->belongsTo(
            User::class,
            'officer_id'
        );
    }
}