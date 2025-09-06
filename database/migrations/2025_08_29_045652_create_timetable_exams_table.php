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
        Schema::create('timetable_exams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('timetable_id')->constrained('exam_timetables')->onDelete('cascade');
            $table->foreignId('exam_schedule_id')->constrained()->onDelete('cascade');
            $table->string('time_slot'); // e.g., "9:00 AM - 10:30 AM"
            $table->integer('duration'); // minutes
            $table->integer('order')->default(0);
            $table->timestamps();
            
            $table->unique(['timetable_id', 'exam_schedule_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('timetable_exams');
    }
};
