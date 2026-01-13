<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Fee extends Model
{
    protected $fillable = [
        'name',
        'description',
        'amount',
        'fee_type',
        'payment_frequency',
        'classroom_id',
        'academic_session_id',
        'term_id',
        'is_active',
        'is_mandatory',
        'due_date',
        'late_fee_amount',
        'grace_period_days',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'late_fee_amount' => 'decimal:2',
        'due_date' => 'datetime',
        'is_active' => 'boolean',
        'is_mandatory' => 'boolean',
        'grace_period_days' => 'integer',
    ];

    // Relationships
    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    public function academicSession(): BelongsTo
    {
        return $this->belongsTo(AcademicSession::class);
    }

    public function term(): BelongsTo
    {
        return $this->belongsTo(Term::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function paymentItems(): HasMany
    {
        return $this->hasMany(PaymentItem::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeMandatory($query)
    {
        return $query->where('is_mandatory', true);
    }

    public function scopeForClassroom($query, $classroomId)
    {
        return $query->where(function($q) use ($classroomId) {
            $q->where('classroom_id', $classroomId)
              ->orWhereNull('classroom_id');
        });
    }

    public function scopeForSession($query, $sessionId)
    {
        return $query->where('academic_session_id', $sessionId);
    }

    public function scopeForTerm($query, $termId)
    {
        return $query->where(function($q) use ($termId) {
            $q->where('term_id', $termId)
              ->orWhereNull('term_id');
        });
    }

    // Methods
    public function isOverdue(): bool
    {
        return $this->due_date && $this->due_date->isPast();
    }

    public function getLateFeeAmount(): float
    {
        if (!$this->isOverdue()) {
            return 0;
        }

        $daysOverdue = $this->due_date->diffInDays(now());
        
        // Get grace period from settings, fallback to fee-specific grace period
        $gracePeriod = (int) \App\Models\Setting::getValue('grace_period_days', $this->grace_period_days ?? 7);
        
        if ($daysOverdue <= $gracePeriod) {
            return 0;
        }

        // Check if late fees are enabled in settings
        if (!\App\Models\Setting::getValue('late_fee_enabled', false)) {
            return 0;
        }

        // Calculate late fee from settings
        $lateFeePercentage = (float) \App\Models\Setting::getValue('late_fee_percentage', 5);
        $calculatedLateFee = ($this->amount * $lateFeePercentage) / 100;

        // Use the calculated late fee or the one stored in the fee record (whichever is higher)
        return max((float) $this->late_fee_amount, $calculatedLateFee);
    }

    public function getTotalAmountWithLateFee(): float
    {
        return $this->amount + $this->getLateFeeAmount();
    }

    public function getStatusForStudent($studentId): array
    {
        $totalPaid = $this->payments()
            ->where('student_id', $studentId)
            ->where('status', 'successful')
            ->sum('amount');

        $totalAmount = $this->getTotalAmountWithLateFee();
        $balance = $totalAmount - $totalPaid;

        $status = 'unpaid';
        if ($totalPaid >= $totalAmount) {
            $status = 'paid';
        } elseif ($totalPaid > 0) {
            $status = 'partial';
        }

        return [
            'status' => $status,
            'total_amount' => $totalAmount,
            'paid_amount' => $totalPaid,
            'balance' => max(0, $balance),
            'is_overdue' => $this->isOverdue(),
            'late_fee' => $this->getLateFeeAmount(),
        ];
    }

    // Fee Types
    public static function getFeeTypes(): array
    {
        return [
            'tuition' => 'Tuition Fee',
            'development' => 'Development Levy',
            'sports' => 'Sports Fee',
            'library' => 'Library Fee',
            'laboratory' => 'Laboratory Fee',
            'examination' => 'Examination Fee',
            'uniform' => 'Uniform Fee',
            'transport' => 'Transport Fee',
            'boarding' => 'Boarding Fee',
            'others' => 'Others',
        ];
    }

    // Payment Frequencies
    public static function getPaymentFrequencies(): array
    {
        return [
            'termly' => 'Per Term',
            'yearly' => 'Per Year',
            'monthly' => 'Monthly',
            'one_time' => 'One Time',
        ];
    }
}
