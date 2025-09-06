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
        Schema::table('results', function (Blueprint $table) {
            // Add foreign key to link with CBT exam attempts
            $table->foreignId('cbt_exam_attempt_id')->nullable()
                  ->constrained('student_exam_attempts')
                  ->onDelete('set null')
                  ->after('term_id');
            
            // Flag to indicate if exam score is from CBT
            $table->boolean('is_cbt_exam')->default(false)->after('cbt_exam_attempt_id');
            
            // Store original manual exam score before CBT override
            $table->decimal('manual_exam_score', 5, 2)->nullable()->after('is_cbt_exam');
            
            // Timestamp when CBT score was last synced
            $table->timestamp('cbt_synced_at')->nullable()->after('manual_exam_score');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('results', function (Blueprint $table) {
            $table->dropForeign(['cbt_exam_attempt_id']);
            $table->dropColumn([
                'cbt_exam_attempt_id',
                'is_cbt_exam',
                'manual_exam_score',
                'cbt_synced_at'
            ]);
        });
    }
};
