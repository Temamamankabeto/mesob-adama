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
        'file_category',
        'verification_status',
        'verified_by',
        'verified_at',
    ];

    protected $casts = [
        'application_id' => 'integer',
        'uploaded_by' => 'integer',
        'verified_by' => 'integer',
        'size' => 'integer',
        'verified_at' => 'datetime',
    ];

    public function application()
    {
        return $this->belongsTo(ServiceApplication::class, 'application_id');
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
