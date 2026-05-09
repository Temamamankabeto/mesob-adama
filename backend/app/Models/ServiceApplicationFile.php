<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceApplicationFile extends Model
{
    protected $fillable = [
        'application_id',
        'field_name',
        'original_name',
        'stored_name',
        'path',
        'mime_type',
        'size',
        'uploaded_by',
    ];

    public function application()
    {
        return $this->belongsTo(
            ServiceApplication::class,
            'application_id'
        );
    }

    public function uploader()
    {
        return $this->belongsTo(
            User::class,
            'uploaded_by'
        );
    }
}