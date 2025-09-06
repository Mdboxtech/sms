<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Question extends Model
{
    protected $fillable = [
        'subject_id',
        'teacher_id',
        'question_text',
        'question_type',
        'difficulty_level',
        'marks',
        'time_limit',
        'options',
        'correct_answer',
        'explanation',
        'is_active'
    ];

    protected $casts = [
        'options' => 'array',
        'is_active' => 'boolean',
        'marks' => 'integer',
        'time_limit' => 'integer'
    ];

    // Relationships
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function exams(): BelongsToMany
    {
        return $this->belongsToMany(Exam::class, 'exam_questions')
            ->withPivot(['question_order', 'marks_allocated'])
            ->withTimestamps();
    }

    public function studentAnswers(): HasMany
    {
        return $this->hasMany(StudentAnswer::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByDifficulty($query, $difficulty)
    {
        return $query->where('difficulty_level', $difficulty);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('question_type', $type);
    }

    public function scopeBySubject($query, $subjectId)
    {
        return $query->where('subject_id', $subjectId);
    }

    // Methods
    public function isMultipleChoice(): bool
    {
        return $this->question_type === 'multiple_choice';
    }

    public function isTrueFalse(): bool
    {
        return $this->question_type === 'true_false';
    }

    public function isEssay(): bool
    {
        return $this->question_type === 'essay';
    }

    public function isFillBlank(): bool
    {
        return $this->question_type === 'fill_blank';
    }

    public function hasTimeLimit(): bool
    {
        return !is_null($this->time_limit) && $this->time_limit > 0;
    }

    public function getFormattedOptions(): array
    {
        if (!$this->isMultipleChoice() || !$this->options) {
            return [];
        }

        return collect($this->options)->map(function ($option, $key) {
            return [
                'key' => $key,
                'text' => $option,
                'value' => $key
            ];
        })->values()->toArray();
    }

    public function checkAnswer(string $answer): bool
    {
        if ($this->isMultipleChoice() || $this->isTrueFalse()) {
            return strtolower(trim($answer)) === strtolower(trim($this->correct_answer));
        }

        // For essay and fill_blank, we'll need manual grading
        return false;
    }

    public function getStatistics(): array
    {
        $answers = $this->studentAnswers()->get();
        $totalAnswers = $answers->count();

        if ($totalAnswers === 0) {
            return [
                'total_attempts' => 0,
                'correct_answers' => 0,
                'incorrect_answers' => 0,
                'success_rate' => 0,
                'average_time' => 0
            ];
        }

        $correctAnswers = $answers->where('is_correct', true)->count();
        $averageTime = $answers->whereNotNull('time_spent')->avg('time_spent');

        return [
            'total_attempts' => $totalAnswers,
            'correct_answers' => $correctAnswers,
            'incorrect_answers' => $totalAnswers - $correctAnswers,
            'success_rate' => round(($correctAnswers / $totalAnswers) * 100, 2),
            'average_time' => round($averageTime ?? 0, 2)
        ];
    }
}
