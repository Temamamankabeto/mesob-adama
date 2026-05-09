<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_application_workflow', function (Blueprint $table) {

            $table->id();

            $table->foreignId('application_id')
                ->constrained('service_applications')
                ->cascadeOnDelete();

            $table->foreignId('window_id')
                ->constrained('windows')
                ->cascadeOnDelete();

            $table->foreignId('officer_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->enum('status', [

                'pending',
                'processing',
                'approved',
                'returned',
                'rejected',
                'completed',

            ])->default('pending');

            $table->text('remark')
                ->nullable();

            $table->timestamp('acted_at')
                ->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'service_application_workflow'
        );
    }
};