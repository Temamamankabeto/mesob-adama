<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('must_change_password')->default(false);
        });
        Schema::create('agent_ticket_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->unique()->constrained('tickets')->restrictOnDelete();
            $table->foreignId('service_application_id')->unique()->constrained('service_applications')->restrictOnDelete();
            $table->foreignId('agent_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('customer_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('window_id')->constrained('windows')->restrictOnDelete();
            $table->timestamps();
            $table->index(['agent_id', 'created_at']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('agent_ticket_applications');
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn('must_change_password'));
    }
};
