<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentItem extends Model
{
    protected $fillable = [
        'invoice_id',
        'fee_id',
        'fee_name',
        'fee_amount',
        'paid_amount',
        'balance_amount',
        'status',
    ];

    protected $casts = [
        'fee_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'balance_amount' => 'decimal:2',
    ];

    // Relationships
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function fee(): BelongsTo
    {
        return $this->belongsTo(Fee::class);
    }

    // Scopes
    public function scopeUnpaid($query)
    {
        return $query->where('status', 'unpaid');
    }

    public function scopePartial($query)
    {
        return $query->where('status', 'partial');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    // Methods
    public function isUnpaid(): bool
    {
        return $this->status === 'unpaid';
    }

    public function isPartial(): bool
    {
        return $this->status === 'partial';
    }

    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    public function getRemainingBalance(): float
    {
        return max(0, $this->fee_amount - $this->paid_amount);
    }

    public function getPaymentPercentage(): float
    {
        if ($this->fee_amount <= 0) {
            return 0;
        }

        return min(100, ($this->paid_amount / $this->fee_amount) * 100);
    }

    public function addPayment(float $amount): void
    {
        $newPaidAmount = min($this->fee_amount, $this->paid_amount + $amount);
        $newBalance = max(0, $this->fee_amount - $newPaidAmount);
        
        $status = 'unpaid';
        if ($newPaidAmount >= $this->fee_amount) {
            $status = 'paid';
        } elseif ($newPaidAmount > 0) {
            $status = 'partial';
        }

        $this->update([
            'paid_amount' => $newPaidAmount,
            'balance_amount' => $newBalance,
            'status' => $status,
        ]);
    }

    public function canAcceptPayment(float $amount): bool
    {
        return $amount > 0 && ($this->paid_amount + $amount) <= $this->fee_amount;
    }

    public function getMaxPaymentAmount(): float
    {
        return max(0, $this->fee_amount - $this->paid_amount);
    }

    // Status Options
    public static function getStatusOptions(): array
    {
        return [
            'unpaid' => 'Unpaid',
            'partial' => 'Partially Paid',
            'paid' => 'Fully Paid',
        ];
    }
}
