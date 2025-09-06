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
        Schema::create('student_exam_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_schedule_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->timestamp('start_time')->nullable();
            $table->timestamp('end_time')->nullable();
            $table->enum('status', ['not_started', 'in_progress', 'completed', 'submitted', 'auto_submitted'])->default('not_started');
            $table->decimal('total_score', 8, 2)->default(0);
            $table->decimal('percentage', 5, 2)->default(0);
            $table->integer('time_taken')->nullable(); // seconds
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->json('browser_info')->nullable();
            $table->integer('tab_switches')->default(0);
            $table->timestamps();
            
            $table->unique(['exam_schedule_id', 'student_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_exam_attempts');
    }
};
