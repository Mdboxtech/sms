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
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            
            // Core relationships
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('classroom_id')->constrained()->onDelete('cascade');
            $table->foreignId('academic_session_id')->constrained()->onDelete('cascade');
            $table->foreignId('term_id')->constrained()->onDelete('cascade');
            
            // Attendance details
            $table->date('date');
            $table->enum('status', ['present', 'absent', 'late', 'excused'])->default('present');
            $table->time('arrival_time')->nullable();
            $table->text('notes')->nullable();
            
            // Tracking information
            $table->foreignId('marked_by')->constrained('users')->onDelete('cascade'); // Teacher who marked
            $table->timestamp('marked_at')->useCurrent();
            
            // Audit trail
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps(); // This will handle created_at and updated_at properly
            
            // Indexes for performance
            $table->index(['student_id', 'date']);
            $table->index(['classroom_id', 'date']);
            $table->index(['academic_session_id', 'term_id', 'date']);
            $table->index(['date', 'status']);
            
            // Unique constraint to prevent duplicate entries
            $table->unique(['student_id', 'date'], 'unique_student_date_attendance');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
