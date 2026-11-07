<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('officer_ticket_queue_states', function (Blueprint $table) {
            $table->id();
            $table->foreignId('officer_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('window_id')->constrained('windows')->restrictOnDelete();
            $table->boolean('is_paused')->default(false);
            $table->timestamp('paused_at')->nullable();
            $table->timestamps();
            $table->unique(['officer_id', 'window_id'], 'officer_queue_state_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('officer_ticket_queue_states');
    }
};
