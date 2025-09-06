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
            $table->integer('questions_per_page')->default(1)->after('duration_minutes');
            $table->boolean('allow_review')->default(false)->after('show_results_immediately');
            $table->boolean('enable_proctoring')->default(false)->after('allow_review');
            $table->integer('attempts_allowed')->default(1)->after('enable_proctoring');
            $table->boolean('auto_submit')->default(true)->after('attempts_allowed');
            $table->boolean('is_active')->default(true)->after('auto_submit');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            $table->dropColumn([
                'questions_per_page',
                'allow_review', 
                'enable_proctoring',
                'attempts_allowed',
                'auto_submit',
                'is_active'
            ]);
        });
    }
};
