<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ticket_sequences', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique();
            $table->unsignedBigInteger('last_number')->default(0);
            $table->timestamps();
        });

        DB::table('ticket_sequences')->insert([
            'name' => 'ticket',
            'last_number' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Schema::create('tickets', function (Blueprint $table) {
            $table->id();

            $table->string('ticket_number', 30)->unique();
            $table->uuid('request_id')->unique();

            $table->foreignId('window_id')
                ->constrained('windows')
                ->restrictOnDelete();

            $table->foreignId('service_id')
                ->constrained('services')
                ->restrictOnDelete();

            $table->string('service_name', 191);

            $table->string('priority', 20)->default('normal');
            $table->string('status', 30)->default('waiting');

            $table->timestamp('called_at')->nullable();
            $table->timestamp('serving_at')->nullable();
            $table->timestamp('completed_at')->nullable();

            $table->timestamps();

            $table->index(['window_id', 'status', 'created_at']);
            $table->index(['service_id', 'status']);
            $table->index(['created_at', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
        Schema::dropIfExists('ticket_sequences');
    }
};