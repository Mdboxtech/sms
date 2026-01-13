<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Payment extends Model
{
    protected $fillable = [
        'payment_reference',
        'student_id',
        'fee_id',
        'amount',
        'fee_amount',
        'payment_method',
        'status',
        'paystack_reference',
        'paystack_access_code',
        'paystack_response',
        'currency',
        'paid_at',
        'notes',
        'receipt_number',
        'is_partial_payment',
        'balance_before',
        'balance_after',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'fee_amount' => 'decimal:2',
        'balance_before' => 'decimal:2',
        'balance_after' => 'decimal:2',
        'paystack_response' => 'array',
        'paid_at' => 'datetime',
        'is_partial_payment' => 'boolean',
    ];

    // Relationships
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function fee(): BelongsTo
    {
        return $this->belongsTo(Fee::class);
    }

    // Scopes
    public function scopeSuccessful($query)
    {
        return $query->where('status', 'successful');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeForStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    public function scopeByPaymentMethod($query, $method)
    {
        return $query->where('payment_method', $method);
    }

    // Methods
    public function isSuccessful(): bool
    {
        return $this->status === 'successful';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    public function isPartial(): bool
    {
        return $this->is_partial_payment || $this->amount < $this->fee_amount;
    }

    public function markAsSuccessful(array $paystackResponse = []): void
    {
        $this->update([
            'status' => 'successful',
            'paid_at' => now(),
            'paystack_response' => $paystackResponse,
        ]);
    }

    public function markAsFailed(array $paystackResponse = []): void
    {
        $this->update([
            'status' => 'failed',
            'paystack_response' => $paystackResponse,
        ]);
    }

    public function generateReceiptNumber(): string
    {
        $prefix = 'RCT';
        $year = now()->year;
        $month = now()->format('m');
        $random = Str::upper(Str::random(6));
        
        return "{$prefix}{$year}{$month}{$random}";
    }

    // Boot method to handle model events
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($payment) {
            if (empty($payment->payment_reference)) {
                $payment->payment_reference = 'PAY_' . Str::upper(Str::random(12)) . '_' . time();
            }
            
            if (empty($payment->receipt_number)) {
                $payment->receipt_number = $payment->generateReceiptNumber();
            }
        });
    }

    // Payment Status Options
    public static function getStatusOptions(): array
    {
        return [
            'pending' => 'Pending',
            'successful' => 'Successful',
            'failed' => 'Failed',
            'refunded' => 'Refunded',
        ];
    }

    // Payment Method Options
    public static function getPaymentMethods(): array
    {
        return [
            'paystack' => 'Paystack (Card/Bank)',
            'bank_transfer' => 'Bank Transfer',
            'cash' => 'Cash Payment',
            'pos' => 'POS Payment',
        ];
    }
}
