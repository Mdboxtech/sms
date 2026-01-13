<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use Carbon\Carbon;

class Invoice extends Model
{
    protected $fillable = [
        'invoice_number',
        'student_id',
        'academic_session_id',
        'term_id',
        'total_amount',
        'paid_amount',
        'balance_amount',
        'status',
        'due_date',
        'issue_date',
        'notes',
        'is_overdue',
        'paid_at',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'balance_amount' => 'decimal:2',
        'due_date' => 'datetime',
        'issue_date' => 'datetime',
        'paid_at' => 'datetime',
        'is_overdue' => 'boolean',
    ];

    // Relationships
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function academicSession(): BelongsTo
    {
        return $this->belongsTo(AcademicSession::class);
    }

    public function term(): BelongsTo
    {
        return $this->belongsTo(Term::class);
    }

    public function paymentItems(): HasMany
    {
        return $this->hasMany(PaymentItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'fee_id', 'id')
            ->whereIn('fee_id', function($query) {
                $query->select('fee_id')
                    ->from('payment_items')
                    ->where('invoice_id', $this->id);
            });
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

    public function scopeOverdue($query)
    {
        return $query->where('is_overdue', true);
    }

    public function scopeForStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    public function scopeForSession($query, $sessionId)
    {
        return $query->where('academic_session_id', $sessionId);
    }

    public function scopeForTerm($query, $termId)
    {
        return $query->where('term_id', $termId);
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

    public function isOverdue(): bool
    {
        return $this->due_date < now()->toDateString() && !$this->isPaid();
    }

    public function updatePaymentStatus(): void
    {
        $totalPaid = $this->paymentItems()->sum('paid_amount');
        
        $status = 'unpaid';
        if ($totalPaid >= $this->total_amount) {
            $status = 'paid';
            $this->paid_at = now();
        } elseif ($totalPaid > 0) {
            $status = 'partial';
        }

        $this->update([
            'paid_amount' => $totalPaid,
            'balance_amount' => max(0, $this->total_amount - $totalPaid),
            'status' => $status,
            'is_overdue' => $this->isOverdue(),
        ]);
    }

    public function generateInvoiceNumber(): string
    {
        $prefix = 'INV';
        $year = now()->year;
        $month = now()->format('m');
        $sequence = str_pad($this->id ?? 1, 4, '0', STR_PAD_LEFT);
        
        return "{$prefix}{$year}{$month}{$sequence}";
    }

    public function addFeeItem(Fee $fee): PaymentItem
    {
        return $this->paymentItems()->create([
            'fee_id' => $fee->id,
            'fee_name' => $fee->name,
            'fee_amount' => $fee->getTotalAmountWithLateFee(),
            'balance_amount' => $fee->getTotalAmountWithLateFee(),
            'status' => 'unpaid',
        ]);
    }

    public function getFormattedDueDate(): string
    {
        return $this->due_date ? $this->due_date->format('M d, Y') : '';
    }

    public function getFormattedIssueDate(): string
    {
        return $this->issue_date ? $this->issue_date->format('M d, Y') : '';
    }

    public function getDaysUntilDue(): int
    {
        if (!$this->due_date) {
            return 0;
        }

        return max(0, Carbon::parse($this->due_date)->diffInDays(now(), false));
    }

    public function getDaysOverdue(): int
    {
        if (!$this->due_date || !$this->isOverdue()) {
            return 0;
        }

        return Carbon::parse($this->due_date)->diffInDays(now());
    }

    // Boot method to handle model events
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($invoice) {
            if (empty($invoice->invoice_number)) {
                // Generate temporary number, will be updated after save
                $invoice->invoice_number = 'TEMP_' . time();
            }
            
            if (empty($invoice->issue_date)) {
                $invoice->issue_date = now()->toDateString();
            }
        });

        static::created(function ($invoice) {
            // Update with proper invoice number after ID is available
            $invoice->update([
                'invoice_number' => $invoice->generateInvoiceNumber()
            ]);
        });
    }

    // Invoice Status Options
    public static function getStatusOptions(): array
    {
        return [
            'unpaid' => 'Unpaid',
            'partial' => 'Partially Paid',
            'paid' => 'Fully Paid',
            'overdue' => 'Overdue',
        ];
    }
}
