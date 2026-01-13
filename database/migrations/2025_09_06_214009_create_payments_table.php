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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('payment_reference')->unique(); // Paystack reference
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('fee_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 10, 2); // Amount paid
            $table->decimal('fee_amount', 10, 2); // Original fee amount
            $table->string('payment_method')->default('paystack'); // paystack, bank_transfer, cash
            $table->string('status')->default('pending'); // pending, successful, failed, refunded
            $table->string('paystack_reference')->nullable(); // Paystack transaction reference
            $table->string('paystack_access_code')->nullable(); // Paystack access code
            $table->json('paystack_response')->nullable(); // Full Paystack response
            $table->string('currency', 3)->default('NGN');
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->string('receipt_number')->nullable(); // Generated receipt number
            $table->boolean('is_partial_payment')->default(false);
            $table->decimal('balance_before', 10, 2)->default(0); // Balance before this payment
            $table->decimal('balance_after', 10, 2)->default(0); // Balance after this payment
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['student_id', 'fee_id']);
            $table->index(['status', 'payment_method']);
            $table->index(['paystack_reference']);
            $table->index(['paid_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
