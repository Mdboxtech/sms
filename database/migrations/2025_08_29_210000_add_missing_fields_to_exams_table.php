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
        Schema::table('exams', function (Blueprint $table) {
            // Add missing fields required by the controller
            $table->integer('passing_marks')->default(50)->after('total_marks');
            $table->enum('status', ['draft', 'scheduled', 'active', 'completed', 'cancelled'])->default('draft')->after('is_published');
            
            // Add duration_minutes and keep duration for compatibility
            $table->integer('duration_minutes')->default(60)->after('duration');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            $table->dropColumn(['passing_marks', 'status', 'duration_minutes']);
        });
    }
};
