<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('agent_window_assignments')) return;
        Schema::create('agent_window_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('window_id')->constrained('windows')->restrictOnDelete();
            $table->string('assignment_level', 16);
            $table->foreignId('city_id')->nullable()->constrained('cities')->restrictOnDelete();
            $table->foreignId('subcity_id')->nullable()->constrained('subcities')->restrictOnDelete();
            $table->foreignId('woreda_id')->nullable()->constrained('woredas')->restrictOnDelete();
            $table->boolean('is_active')->default(true);
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['agent_id', 'window_id', 'assignment_level'], 'agent_window_level_unique');
            $table->index(['agent_id', 'is_active']);
        });
    }
    public function down(): void { Schema::dropIfExists('agent_window_assignments'); }
};
