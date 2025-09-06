<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Disable foreign key checks temporarily
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        Schema::table('student_exam_attempts', function (Blueprint $table) {
            // Drop the unique constraint that included exam_schedule_id
            $table->dropUnique('student_exam_attempts_exam_schedule_id_student_id_unique');
            
            // Make exam_schedule_id nullable to support direct exam attempts
            $table->foreignId('exam_schedule_id')->nullable()->change();
            
            // Add exam_id field for direct exam attempts
            $table->foreignId('exam_id')->nullable()->constrained()->onDelete('cascade')->after('exam_schedule_id');
        });
        
        // Add new unique constraints
        Schema::table('student_exam_attempts', function (Blueprint $table) {
            // Unique constraint for exam schedule attempts
            $table->unique(['exam_schedule_id', 'student_id'], 'unique_schedule_student');
            
            // Unique constraint for direct exam attempts  
            $table->unique(['exam_id', 'student_id'], 'unique_exam_student');
        });
        
        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Disable foreign key checks temporarily
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        Schema::table('student_exam_attempts', function (Blueprint $table) {
            // Drop the new unique constraints
            $table->dropUnique('unique_schedule_student');
            $table->dropUnique('unique_exam_student');
            
            // Remove exam_id field
            $table->dropForeign(['exam_id']);
            $table->dropColumn('exam_id');
            
            // Make exam_schedule_id required again
            $table->foreignId('exam_schedule_id')->change();
            
            // Restore original unique constraint
            $table->unique(['exam_schedule_id', 'student_id']);
        });
        
        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
};
