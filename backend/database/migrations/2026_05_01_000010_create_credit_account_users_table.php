<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // eService Phase 1 cleanup: restaurant credit-account tables are disabled.
        // Keep this migration as a safe no-op so old local copies do not break migrate:fresh.
    }

    public function down(): void
    {
        Schema::dropIfExists('credit_account_users');
    }
};
