<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'classroom_id',
        'admission_number',
        'date_of_birth',
        'gender',
        'parent_name',
        'parent_phone',
        'address',
        'passport_photo',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    public function results(): HasMany
    {
        return $this->hasMany(Result::class);
    }

    // Attendance Relationship
    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    // CBT Relationships
    public function examAttempts(): HasMany
    {
        return $this->hasMany(StudentExamAttempt::class);
    }

    // Payment Relationships
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function getScheduledExams($termId = null)
    {
        $query = ExamSchedule::where('classroom_id', $this->classroom_id)
            ->with(['exam.subject', 'exam.teacher']);

        if ($termId) {
            $query->where('term_id', $termId);
        }

        return $query->upcoming()->get();
    }

    public function getCompletedExams($termId = null)
    {
        $query = $this->examAttempts()
            ->whereHas('examSchedule', function ($q) use ($termId) {
                if ($termId) {
                    $q->where('term_id', $termId);
                }
            })
            ->with(['examSchedule.exam.subject']);

        return $query->completed()->get();
    }

    // Payment Methods
    public function getOutstandingFees($sessionId = null, $termId = null)
    {
        $query = Fee::active()
            ->forClassroom($this->classroom_id);

        if ($sessionId) {
            $query->forSession($sessionId);
        }

        if ($termId) {
            $query->forTerm($termId);
        }

        return $query->get()->map(function ($fee) {
            return array_merge($fee->toArray(), $fee->getStatusForStudent($this->id));
        });
    }

    public function getTotalOutstandingBalance($sessionId = null, $termId = null): float
    {
        return $this->getOutstandingFees($sessionId, $termId)
            ->sum('balance');
    }

    public function getPaymentHistory($limit = null)
    {
        $query = $this->payments()
            ->with(['fee'])
            ->orderBy('created_at', 'desc');

        if ($limit) {
            $query->limit($limit);
        }

        return $query->get();
    }

    public function hasUnpaidFees($sessionId = null, $termId = null): bool
    {
        return $this->getTotalOutstandingBalance($sessionId, $termId) > 0;
    }
}
