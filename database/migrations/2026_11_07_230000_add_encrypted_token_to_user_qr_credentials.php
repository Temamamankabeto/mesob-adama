<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('user_qr_credentials', function (Blueprint $table) {
            $table->text('encrypted_token')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('user_qr_credentials', function (Blueprint $table) {
            $table->dropColumn('encrypted_token');
        });
    }
};
