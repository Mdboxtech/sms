<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->foreignId('term_id')->constrained()->onDelete('cascade');
            $table->decimal('ca_score', 5, 2)->default(0); // Continuous Assessment
            $table->decimal('exam_score', 5, 2)->default(0);
            $table->decimal('total_score', 5, 2)->default(0);
            $table->integer('position')->nullable();
            $table->text('remark')->nullable();
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            // Ensure a student can't have multiple results for same subject in same term
            $table->unique(['student_id', 'subject_id', 'term_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('results');
    }
};
