<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatbotConversation extends Model
{
    protected $fillable = [
        'user_id',
        'session_id',
        'source',
        'intent',
        'role',
        'scope',
        'language',
        'question',
        'answer',
        'source_context',
    ];

    protected $casts = [
        'source_context' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
