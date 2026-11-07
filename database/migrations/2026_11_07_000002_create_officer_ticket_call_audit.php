<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('tickets', function (Blueprint $table) {
            $table->foreignId('calling_officer_id')->nullable()->constrained('users')->restrictOnDelete();
            $table->index(['calling_officer_id', 'status'], 'tickets_calling_officer_status_idx');
        });
        Schema::create('ticket_call_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained('tickets')->restrictOnDelete();
            $table->foreignId('officer_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('window_id')->constrained('windows')->restrictOnDelete();
            $table->string('action', 32);
            $table->string('from_status', 30)->nullable();
            $table->string('to_status', 30)->nullable();
            $table->text('reason')->nullable();
            $table->timestamps();
            $table->index(['ticket_id', 'created_at']);
            $table->index(['officer_id', 'created_at']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('ticket_call_events');
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropIndex('tickets_calling_officer_status_idx');
            $table->dropConstrainedForeignId('calling_officer_id');
        });
    }
};
