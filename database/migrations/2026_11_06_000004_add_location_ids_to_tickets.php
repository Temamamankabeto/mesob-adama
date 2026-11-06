<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->foreignId('city_id')
                ->nullable()
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

            $table->index(
                ['administrative_level', 'city_id', 'subcity_id', 'woreda_id', 'status'],
                'tickets_location_queue_index'
            );
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropIndex('tickets_location_queue_index');

            $table->dropConstrainedForeignId('woreda_id');
            $table->dropConstrainedForeignId('subcity_id');
            $table->dropConstrainedForeignId('city_id');
        });
    }
};