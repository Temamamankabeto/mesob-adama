<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kiosks', function (Blueprint $table) {
            $table->id();

            $table->string('code', 50)->unique();
            $table->string('name', 150);

            $table->enum('administrative_level', [
                'city',
                'subcity',
                'woreda',
            ]);

            $table->foreignId('city_id')
                ->constrained('cities')
                ->restrictOnDelete();

            $table->foreignId('subcity_id')
                ->nullable()
                ->constrained('subcities')
                ->restrictOnDelete();

            $table->foreignId('woreda_id')
                ->nullable()
                ->constrained('woredas')
                ->restrictOnDelete();

            $table->string('credential_hash', 64)->unique();

            $table->boolean('is_active')->default(false);

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('updated_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();

            $table->index([
                'administrative_level',
                'city_id',
                'subcity_id',
                'woreda_id',
            ], 'kiosks_location_idx');
        });

        Schema::create('kiosk_primary_officers', function (Blueprint $table) {
            $table->id();

            $table->foreignId('kiosk_id')
                ->constrained('kiosks')
                ->restrictOnDelete();

            $table->foreignId('service_id')
                ->constrained('services')
                ->restrictOnDelete();

            $table->foreignId('window_id')
                ->constrained('windows')
                ->restrictOnDelete();

            $table->foreignId('officer_id')
                ->constrained('users')
                ->restrictOnDelete();

            $table->foreignId('assigned_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();

            $table->unique(
                ['kiosk_id', 'service_id', 'window_id'],
                'kiosk_primary_officer_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kiosk_primary_officers');
        Schema::dropIfExists('kiosks');
    }
};