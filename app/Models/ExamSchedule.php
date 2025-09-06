<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class ExamSchedule extends Model
{
    protected $fillable = [
        'exam_id',
        'classroom_id',
        'term_id',
        'scheduled_date',
        'start_time',
        'end_time',
        'status',
        'created_by',
        'special_instructions'
    ];

    protected $casts = [
        'scheduled_date' => 'datetime',
        'start_time' => 'datetime',
        'end_time' => 'datetime'
    ];

    // Relationships
    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    public function term(): BelongsTo
    {
        return $this->belongsTo(Term::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(StudentExamAttempt::class);
    }

    public function timetables(): BelongsToMany
    {
        return $this->belongsToMany(ExamTimetable::class, 'timetable_exams')
            ->withPivot(['time_slot', 'duration', 'order'])
            ->withTimestamps();
    }

    // Scopes
    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    public function scopeOngoing($query)
    {
        return $query->where('status', 'ongoing');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeToday($query)
    {
        return $query->whereDate('scheduled_date', today());
    }

    public function scopeUpcoming($query)
    {
        return $query->where('scheduled_date', '>=', today());
    }

    public function scopeForClassroom($query, $classroomId)
    {
        return $query->where('classroom_id', $classroomId);
    }

    // Methods
    public function isScheduled(): bool
    {
        return $this->status === 'scheduled';
    }

    public function isOngoing(): bool
    {
        return $this->status === 'ongoing';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function canStart(): bool
    {
        $now = now();
        $scheduledStart = Carbon::parse($this->scheduled_date->format('Y-m-d') . ' ' . $this->start_time->format('H:i:s'));
        
        return $this->isScheduled() && $now->gte($scheduledStart);
    }

    public function shouldAutoEnd(): bool
    {
        $now = now();
        $scheduledEnd = Carbon::parse($this->scheduled_date->format('Y-m-d') . ' ' . $this->end_time->format('H:i:s'));
        
        return $this->isOngoing() && $now->gte($scheduledEnd);
    }

    public function getTimeRemaining(): ?int
    {
        if (!$this->isOngoing()) {
            return null;
        }

        $now = now();
        $scheduledEnd = Carbon::parse($this->scheduled_date->format('Y-m-d') . ' ' . $this->end_time->format('H:i:s'));
        
        return max(0, $scheduledEnd->diffInSeconds($now));
    }

    public function start(): void
    {
        if ($this->canStart()) {
            $this->update(['status' => 'ongoing']);
        }
    }

    public function complete(): void
    {
        if ($this->isOngoing()) {
            $this->update(['status' => 'completed']);
            
            // Auto-submit all in-progress attempts
            $this->attempts()
                ->where('status', 'in_progress')
                ->update(['status' => 'auto_submitted']);
        }
    }

    public function cancel(): void
    {
        if ($this->isScheduled()) {
            $this->update(['status' => 'cancelled']);
        }
    }

    public function getEligibleStudents(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->classroom->students()->get();
    }

    public function createAttemptsForStudents(): void
    {
        $students = $this->getEligibleStudents();
        
        foreach ($students as $student) {
            $this->attempts()->firstOrCreate([
                'student_id' => $student->id
            ], [
                'status' => 'not_started'
            ]);
        }
    }

    public function getStatistics(): array
    {
        $attempts = $this->attempts()->get();
        $totalStudents = $this->getEligibleStudents()->count();
        
        $notStarted = $attempts->where('status', 'not_started')->count();
        $inProgress = $attempts->where('status', 'in_progress')->count();
        $completed = $attempts->whereIn('status', ['completed', 'submitted', 'auto_submitted'])->count();
        
        return [
            'total_students' => $totalStudents,
            'not_started' => $notStarted,
            'in_progress' => $inProgress,
            'completed' => $completed,
            'completion_rate' => $totalStudents > 0 ? round(($completed / $totalStudents) * 100, 2) : 0
        ];
    }

    public function getFormattedDateTime(): string
    {
        return $this->scheduled_date->format('M j, Y') . ' at ' . $this->start_time->format('g:i A');
    }

    public function getDuration(): int
    {
        $start = Carbon::parse($this->start_time);
        $end = Carbon::parse($this->end_time);
        
        return $end->diffInMinutes($start);
    }
}
