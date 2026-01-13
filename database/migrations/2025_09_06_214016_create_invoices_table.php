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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique(); // Generated invoice number
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('academic_session_id')->constrained()->onDelete('cascade');
            $table->foreignId('term_id')->nullable()->constrained()->onDelete('cascade');
            $table->decimal('total_amount', 10, 2); // Total invoice amount
            $table->decimal('paid_amount', 10, 2)->default(0); // Total amount paid
            $table->decimal('balance_amount', 10, 2); // Remaining balance
            $table->string('status')->default('unpaid'); // unpaid, partial, paid, overdue
            $table->date('due_date');
            $table->date('issue_date');
            $table->text('notes')->nullable();
            $table->boolean('is_overdue')->default(false);
            $table->timestamp('paid_at')->nullable(); // When fully paid
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['student_id', 'academic_session_id', 'term_id']);
            $table->index(['status', 'due_date']);
            $table->index(['is_overdue']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
