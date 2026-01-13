<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Carbon\Carbon;

class StudentExamAttempt extends Model
{
    protected $fillable = [
        'exam_schedule_id',
        'exam_id',
        'student_id',
        'start_time',
        'end_time',
        'status',
        'total_score',
        'percentage',
        'time_taken',
        'ip_address',
        'user_agent',
        'browser_info',
        'tab_switches'
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'total_score' => 'decimal:2',
        'percentage' => 'decimal:2',
        'browser_info' => 'array',
        'time_taken' => 'integer',
        'tab_switches' => 'integer'
    ];

    // Relationships
    public function examSchedule(): BelongsTo
    {
        return $this->belongsTo(ExamSchedule::class);
    }

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(StudentAnswer::class, 'attempt_id');
    }

    public function getExamAttribute()
    {
        // Return direct exam if available, otherwise exam from schedule
        if ($this->exam_id) {
            return $this->getRelationValue('exam') ?? Exam::find($this->exam_id);
        }
        
        return $this->examSchedule?->exam;
    }

    public function result(): HasOne
    {
        return $this->hasOne(Result::class, 'cbt_exam_attempt_id');
    }

    // Scopes
    public function scopeNotStarted($query)
    {
        return $query->where('status', 'not_started');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeCompleted($query)
    {
        return $query->whereIn('status', ['completed', 'submitted', 'auto_submitted']);
    }

    public function scopeSubmitted($query)
    {
        return $query->where('status', 'submitted');
    }

    // Methods
    public function isNotStarted(): bool
    {
        return $this->status === 'not_started';
    }

    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    public function isCompleted(): bool
    {
        return in_array($this->status, ['completed', 'submitted', 'auto_submitted']);
    }

    public function isSubmitted(): bool
    {
        return $this->status === 'submitted';
    }

    public function isAutoSubmitted(): bool
    {
        return $this->status === 'auto_submitted';
    }

    public function canStart(): bool
    {
        return $this->isNotStarted() && 
               $this->examSchedule->canStart() && 
               $this->examSchedule->isOngoing();
    }

    public function canSubmit(): bool
    {
        return $this->isInProgress();
    }

    public function start(): void
    {
        if ($this->canStart()) {
            $this->update([
                'status' => 'in_progress',
                'start_time' => now(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'browser_info' => $this->getBrowserInfo()
            ]);
        }
    }

    public function submit(): void
    {
        if ($this->canSubmit()) {
            $this->update([
                'status' => 'submitted',
                'end_time' => now(),
                'time_taken' => $this->calculateTimeTaken()
            ]);

            $this->calculateScore();
            $this->createOrUpdateResult();
        }
    }

    public function autoSubmit(): void
    {
        if ($this->isInProgress()) {
            $this->update([
                'status' => 'auto_submitted',
                'end_time' => now(),
                'time_taken' => $this->calculateTimeTaken()
            ]);

            $this->calculateScore();
            $this->createOrUpdateResult();
        }
    }

    public function recordTabSwitch(): void
    {
        $this->increment('tab_switches');
    }

    protected function calculateTimeTaken(): ?int
    {
        if (!$this->start_time || !$this->end_time) {
            return null;
        }

        return $this->start_time->diffInSeconds($this->end_time ?? now());
    }

    public function calculateScore(): void
    {
        $totalMarks = 0;
        $obtainedMarks = 0;

        foreach ($this->answers as $answer) {
            $question = $answer->question;
            
            // Handle both exam_schedule_id and direct exam_id cases
            $examId = $this->exam_id ?: ($this->examSchedule ? $this->examSchedule->exam_id : null);
            
            if ($examId) {
                $examQuestion = $question->exams()
                    ->where('exam_id', $examId)
                    ->first();
                    
                $marksAllocated = $examQuestion ? $examQuestion->pivot->marks_allocated : $question->marks;
            } else {
                $marksAllocated = $question->marks; // Fallback to question's default marks
            }

            $totalMarks += $marksAllocated;

            if ($answer->is_correct) {
                $obtainedMarks += $marksAllocated;
            } elseif ($answer->marks_obtained > 0) {
                // For manually graded questions
                $obtainedMarks += $answer->marks_obtained;
            }
        }

        $percentage = $totalMarks > 0 ? ($obtainedMarks / $totalMarks) * 100 : 0;

        $this->update([
            'total_score' => $obtainedMarks,
            'percentage' => $percentage
        ]);
    }

    /**
     * Create or update a Result record for this CBT exam attempt
     */
    public function createOrUpdateResult(): void
    {
        $exam = $this->exam;
        if (!$exam || !$exam->subject_id || !$exam->term_id) {
            return; // Cannot create result without subject and term
        }

        $data = [
            'exam_score' => $this->total_score,
            'ca_score' => 0, // CBT exams typically don't have CA scores
            'total_score' => $this->total_score,
            'cbt_exam_attempt_id' => $this->id,
            'is_cbt_exam' => true,
            'cbt_synced_at' => now(),
            'teacher_id' => $exam->teacher_id,
        ];

        // Use updateOrCreate to handle both new and existing results
        Result::updateOrCreate(
            [
                'student_id' => $this->student_id,
                'subject_id' => $exam->subject_id,
                'term_id' => $exam->term_id,
            ],
            $data
        );
    }

    public function getTimeRemaining(): ?int
    {
        if (!$this->isInProgress()) {
            return null;
        }

        // FIXED: Handle both schedule-based and direct exam attempts
        $exam = null;
        if ($this->exam_id) {
            $exam = Exam::find($this->exam_id);
        } elseif ($this->examSchedule) {
            $exam = $this->examSchedule->exam;
        }

        if (!$exam) {
            return null;
        }

        $examDuration = ($exam->duration_minutes ?: $exam->duration) * 60; // Convert to seconds
        $timeElapsed = $this->start_time->diffInSeconds(now());
        
        // For schedule-based exams, also consider schedule end time
        if ($this->examSchedule) {
            $scheduleTimeRemaining = $this->examSchedule->getTimeRemaining() ?? $examDuration;
            return max(0, min($examDuration - $timeElapsed, $scheduleTimeRemaining));
        }

        return max(0, $examDuration - $timeElapsed);
    }

    public function getFormattedDuration(): string
    {
        if (!$this->time_taken) {
            return 'N/A';
        }

        $hours = floor($this->time_taken / 3600);
        $minutes = floor(($this->time_taken % 3600) / 60);
        $seconds = $this->time_taken % 60;

        if ($hours > 0) {
            return sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds);
        }

        return sprintf('%02d:%02d', $minutes, $seconds);
    }

    public function getGrade(): string
    {
        if ($this->percentage >= 90) return 'A+';
        if ($this->percentage >= 80) return 'A';
        if ($this->percentage >= 70) return 'B+';
        if ($this->percentage >= 60) return 'B';
        if ($this->percentage >= 50) return 'C';
        if ($this->percentage >= 40) return 'D';
        return 'F';
    }

    public function isPassed(): bool
    {
        return $this->percentage >= 60; // 60% pass threshold
    }

    protected function getBrowserInfo(): array
    {
        $userAgent = request()->userAgent();
        
        return [
            'user_agent' => $userAgent,
            'platform' => $this->getPlatform($userAgent),
            'browser' => $this->getBrowser($userAgent),
            'timestamp' => now()->toISOString()
        ];
    }

    protected function getPlatform(string $userAgent): string
    {
        if (strpos($userAgent, 'Windows') !== false) return 'Windows';
        if (strpos($userAgent, 'Macintosh') !== false) return 'Mac';
        if (strpos($userAgent, 'Linux') !== false) return 'Linux';
        if (strpos($userAgent, 'Android') !== false) return 'Android';
        if (strpos($userAgent, 'iPhone') !== false) return 'iOS';
        
        return 'Unknown';
    }

    protected function getBrowser(string $userAgent): string
    {
        if (strpos($userAgent, 'Chrome') !== false) return 'Chrome';
        if (strpos($userAgent, 'Firefox') !== false) return 'Firefox';
        if (strpos($userAgent, 'Safari') !== false) return 'Safari';
        if (strpos($userAgent, 'Edge') !== false) return 'Edge';
        
        return 'Unknown';
    }

    public function getAnsweredQuestions(): int
    {
        return $this->answers()->whereNotNull('answer_text')->count();
    }

    public function getTotalQuestions(): int
    {
        return $this->examSchedule->exam->getTotalQuestions();
    }

    public function getProgress(): float
    {
        $total = $this->getTotalQuestions();
        return $total > 0 ? ($this->getAnsweredQuestions() / $total) * 100 : 0;
    }
}
