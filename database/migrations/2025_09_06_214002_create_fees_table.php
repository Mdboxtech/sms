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
        Schema::create('fees', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Tuition Fee", "Development Levy"
            $table->text('description')->nullable();
            $table->decimal('amount', 10, 2); // Fee amount
            $table->string('fee_type')->default('tuition'); // tuition, development, sports, etc.
            $table->string('payment_frequency')->default('termly'); // termly, yearly, monthly
            $table->foreignId('classroom_id')->nullable()->constrained()->onDelete('cascade'); // null means applies to all classes
            $table->foreignId('academic_session_id')->constrained()->onDelete('cascade');
            $table->foreignId('term_id')->nullable()->constrained()->onDelete('cascade'); // null means applies to all terms
            $table->boolean('is_active')->default(true);
            $table->boolean('is_mandatory')->default(true);
            $table->date('due_date')->nullable();
            $table->decimal('late_fee_amount', 8, 2)->nullable();
            $table->integer('grace_period_days')->default(0);
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['classroom_id', 'academic_session_id', 'term_id']);
            $table->index(['is_active', 'is_mandatory']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fees');
    }
};
