<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\Auditable;

class Window extends Model
{
    use Auditable;

    protected $fillable = [
        'name',
        'availability',
    ];

    protected $casts = [
        'availability' => 'array',
    ];

    public function services()
    {
        return $this->belongsToMany(Service::class, 'service_window')
            ->withPivot([
                'assignment_level',
                'step_order',
                'is_required',
            ])
            ->withTimestamps()
            ->orderBy('service_window.step_order');
    }
}
