<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('term_results', function (Blueprint $table) {
            $table->decimal('total_score', 8, 2)->nullable()->after('average_score');
            $table->decimal('gpa', 3, 2)->nullable()->after('total_score');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('term_results', function (Blueprint $table) {
            $table->dropColumn(['total_score', 'gpa']);
        });
    }
};
