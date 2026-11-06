<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->string('administrative_level', 20)->nullable();
            $table->index(
                ['administrative_level', 'window_id', 'status'],
                'tickets_level_window_status_index'
            );
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropIndex('tickets_level_window_status_index');
            $table->dropColumn('administrative_level');
        });
    }
};