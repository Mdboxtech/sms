<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ExamTimetable extends Model
{
    protected $fillable = [
        'classroom_id',
        'term_id',
        'exam_date',
        'title',
        'description',
        'is_published',
        'created_by'
    ];

    protected $casts = [
        'exam_date' => 'datetime',
        'is_published' => 'boolean'
    ];

    // Relationships
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

    public function examSchedules(): BelongsToMany
    {
        return $this->belongsToMany(ExamSchedule::class, 'timetable_exams')
            ->withPivot(['time_slot', 'duration', 'order'])
            ->withTimestamps()
            ->orderBy('timetable_exams.order');
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeForClassroom($query, $classroomId)
    {
        return $query->where('classroom_id', $classroomId);
    }

    public function scopeForTerm($query, $termId)
    {
        return $query->where('term_id', $termId);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('exam_date', today());
    }

    public function scopeUpcoming($query)
    {
        return $query->where('exam_date', '>=', today());
    }

    // Methods
    public function isPublished(): bool
    {
        return $this->is_published;
    }

    public function publish(): void
    {
        $this->update(['is_published' => true]);
    }

    public function unpublish(): void
    {
        $this->update(['is_published' => false]);
    }

    public function addExam(ExamSchedule $examSchedule, string $timeSlot, int $duration, int $order = null): void
    {
        $order = $order ?? $this->examSchedules()->count() + 1;
        
        $this->examSchedules()->attach($examSchedule->id, [
            'time_slot' => $timeSlot,
            'duration' => $duration,
            'order' => $order
        ]);
    }

    public function removeExam(ExamSchedule $examSchedule): void
    {
        $this->examSchedules()->detach($examSchedule->id);
        $this->reorderExams();
    }

    public function reorderExams(): void
    {
        $exams = $this->examSchedules()->orderBy('timetable_exams.order')->get();
        
        foreach ($exams as $index => $exam) {
            $this->examSchedules()->updateExistingPivot($exam->id, [
                'order' => $index + 1
            ]);
        }
    }

    public function getFormattedDate(): string
    {
        return $this->exam_date->format('l, F j, Y');
    }

    public function hasExams(): bool
    {
        return $this->examSchedules()->count() > 0;
    }

    public function getTotalDuration(): int
    {
        return $this->examSchedules()->sum('timetable_exams.duration');
    }

    public function getExamCount(): int
    {
        return $this->examSchedules()->count();
    }

    public function getSubjects(): array
    {
        return $this->examSchedules()
            ->with('exam.subject')
            ->get()
            ->pluck('exam.subject.name')
            ->unique()
            ->values()
            ->toArray();
    }

    public function canBePublished(): bool
    {
        return $this->hasExams() && $this->exam_date->isFuture();
    }

    public function getTimeSlots(): array
    {
        return $this->examSchedules()
            ->orderBy('timetable_exams.order')
            ->get()
            ->map(function ($schedule) {
                return [
                    'exam_id' => $schedule->id,
                    'subject' => $schedule->exam->subject->name,
                    'time_slot' => $schedule->pivot->time_slot,
                    'duration' => $schedule->pivot->duration,
                    'order' => $schedule->pivot->order
                ];
            })
            ->toArray();
    }

    public function getStudentView(): array
    {
        if (!$this->isPublished()) {
            return [];
        }

        return [
            'date' => $this->getFormattedDate(),
            'title' => $this->title,
            'description' => $this->description,
            'classroom' => $this->classroom->name,
            'exams' => $this->examSchedules()
                ->with(['exam.subject'])
                ->orderBy('timetable_exams.order')
                ->get()
                ->map(function ($schedule) {
                    return [
                        'subject' => $schedule->exam->subject->name,
                        'time_slot' => $schedule->pivot->time_slot,
                        'duration' => $schedule->pivot->duration . ' minutes',
                        'exam_type' => ucfirst($schedule->exam->exam_type),
                        'total_marks' => $schedule->exam->total_marks
                    ];
                })
                ->toArray()
        ];
    }
}
