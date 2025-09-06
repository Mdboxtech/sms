<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Exam extends Model
{
    protected $fillable = [
        'title',
        'subject_id',
        'term_id',
        'start_time',
        'end_time',
        'teacher_id',
        'description',
        'exam_type',
        'total_marks',
        'passing_marks',
        'duration',
        'duration_minutes',
        'instructions',
        'is_published',
        'status',
        'randomize_questions',
        'randomize_options',
        'show_results_immediately',
        'questions_per_page',
        'allow_review',
        'enable_proctoring',
        'attempts_allowed',
        'auto_submit',
        'is_active'
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'randomize_questions' => 'boolean',
        'randomize_options' => 'boolean',
        'show_results_immediately' => 'boolean',
        'allow_review' => 'boolean',
        'enable_proctoring' => 'boolean',
        'auto_submit' => 'boolean',
        'is_active' => 'boolean',
        'total_marks' => 'integer',
        'passing_marks' => 'integer',
        'duration' => 'integer',
        'duration_minutes' => 'integer',
        'questions_per_page' => 'integer',
        'attempts_allowed' => 'integer',
        'start_time' => 'datetime',
        'end_time' => 'datetime'
    ];

    // Relationships
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function term(): BelongsTo
    {
        return $this->belongsTo(Term::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function questions(): BelongsToMany
    {
        return $this->belongsToMany(Question::class, 'exam_questions')
            ->withPivot(['question_order', 'marks_allocated'])
            ->withTimestamps()
            ->orderBy('exam_questions.question_order');
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(ExamSchedule::class);
    }

    public function classrooms(): BelongsToMany
    {
        return $this->belongsToMany(Classroom::class, 'exam_classrooms')
            ->withTimestamps();
    }

    public function attempts(): HasManyThrough
    {
        return $this->hasManyThrough(StudentExamAttempt::class, ExamSchedule::class);
    }

    public function studentAttempts(): HasMany
    {
        return $this->hasMany(StudentExamAttempt::class);
    }

    public function studentAttemptsViaSchedule(): HasManyThrough
    {
        return $this->hasManyThrough(StudentExamAttempt::class, ExamSchedule::class);
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('exam_type', $type);
    }

    public function scopeBySubject($query, $subjectId)
    {
        return $query->where('subject_id', $subjectId);
    }

    public function scopeByTeacher($query, $teacherId)
    {
        return $query->where('teacher_id', $teacherId);
    }

    // Methods
    public function isPublished(): bool
    {
        return $this->is_published;
    }

    public function hasQuestions(): bool
    {
        return $this->questions()->count() > 0;
    }

    public function getTotalQuestions(): int
    {
        return $this->questions()->count();
    }

    public function calculateTotalMarks(): int
    {
        return $this->questions()->sum('exam_questions.marks_allocated');
    }

    public function updateTotalMarks(): void
    {
        $this->update(['total_marks' => $this->calculateTotalMarks()]);
    }

    public function addQuestion(Question $question, int $marksAllocated, int $order = null): void
    {
        $order = $order ?? $this->questions()->count() + 1;
        
        $this->questions()->attach($question->id, [
            'marks_allocated' => $marksAllocated,
            'question_order' => $order
        ]);

        $this->updateTotalMarks();
    }

    public function removeQuestion(Question $question): void
    {
        $this->questions()->detach($question->id);
        $this->updateTotalMarks();
        $this->reorderQuestions();
    }

    public function reorderQuestions(): void
    {
        $questions = $this->questions()->orderBy('exam_questions.question_order')->get();
        
        foreach ($questions as $index => $question) {
            $this->questions()->updateExistingPivot($question->id, [
                'question_order' => $index + 1
            ]);
        }
    }

    public function getQuestionsForStudent(int $studentId = null): array
    {
        $questions = $this->questions()->with('subject')->get();

        if ($this->randomize_questions) {
            $questions = $questions->shuffle();
        }

        return $questions->map(function ($question) {
            $questionData = [
                'id' => $question->id,
                'question_text' => $question->question_text,
                'question_type' => $question->question_type,
                'marks' => $question->pivot->marks_allocated,
                'time_limit' => $question->time_limit
            ];

            if ($question->isMultipleChoice()) {
                $options = $question->getFormattedOptions();
                if ($this->randomize_options) {
                    $options = collect($options)->shuffle()->values()->toArray();
                }
                $questionData['options'] = $options;
            }

            return $questionData;
        })->toArray();
    }

    public function getAttemptStatistics(): array
    {
        $attempts = $this->attempts()->where('status', 'submitted')->get();
        $totalAttempts = $attempts->count();

        if ($totalAttempts === 0) {
            return [
                'total_attempts' => 0,
                'average_score' => 0,
                'highest_score' => 0,
                'lowest_score' => 0,
                'pass_rate' => 0,
                'average_time' => 0
            ];
        }

        $scores = $attempts->pluck('total_score');
        $times = $attempts->whereNotNull('time_taken')->pluck('time_taken');
        $passThreshold = $this->total_marks * 0.6; // 60% pass rate
        $passCount = $attempts->where('total_score', '>=', $passThreshold)->count();

        return [
            'total_attempts' => $totalAttempts,
            'average_score' => round($scores->avg(), 2),
            'highest_score' => $scores->max(),
            'lowest_score' => $scores->min(),
            'pass_rate' => round(($passCount / $totalAttempts) * 100, 2),
            'average_time' => round($times->avg() / 60, 2) // in minutes
        ];
    }

    public function canBeScheduled(): bool
    {
        return $this->isPublished() && $this->hasQuestions();
    }
}
