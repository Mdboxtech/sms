<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('term_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('term_id')->constrained()->onDelete('cascade');
            $table->foreignId('classroom_id')->constrained()->onDelete('cascade');
            $table->decimal('average_score', 5, 2)->default(0);
            $table->integer('position')->nullable();
            $table->text('teacher_comment')->nullable();
            $table->text('principal_comment')->nullable();
            $table->foreignId('teacher_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('principal_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            // Ensure a student can't have multiple term results for the same term
            $table->unique(['student_id', 'term_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('term_results');
    }
};
