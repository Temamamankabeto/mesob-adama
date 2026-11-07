<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgentWindowAssignment extends Model
{
    protected $fillable = ['agent_id', 'window_id', 'assignment_level', 'city_id', 'subcity_id', 'woreda_id', 'is_active', 'assigned_by'];
    protected $casts = ['is_active' => 'boolean'];
    public function agent() { return $this->belongsTo(User::class, 'agent_id'); }
    public function window() { return $this->belongsTo(Window::class); }
}
