<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('service_form_fields', function (Blueprint $table) {
            if (!Schema::hasColumn('service_form_fields','section_id')) {
                $table->foreignId('section_id')->nullable()->after('form_id')->constrained('service_form_sections')->nullOnDelete();
            }
            $table->integer('sort_order')->default(0);
            $table->string('placeholder')->nullable();
            $table->json('validation_rules')->nullable();
            $table->json('options')->nullable();
            $table->boolean('is_searchable')->default(false);
        });
    }

    public function down(): void {
        Schema::table('service_form_fields', function (Blueprint $table) {
            $table->dropColumn(['sort_order','placeholder','validation_rules','options','is_searchable']);
        });
    }
};
