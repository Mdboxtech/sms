<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentAnswer extends Model
{
    protected $fillable = [
        'attempt_id',
        'question_id',
        'answer_text',
        'is_correct',
        'marks_obtained',
        'time_spent',
        'is_flagged'
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'marks_obtained' => 'decimal:2',
        'time_spent' => 'integer',
        'is_flagged' => 'boolean'
    ];

    // Relationships
    public function attempt(): BelongsTo
    {
        return $this->belongsTo(StudentExamAttempt::class, 'attempt_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    // Scopes
    public function scopeCorrect($query)
    {
        return $query->where('is_correct', true);
    }

    public function scopeIncorrect($query)
    {
        return $query->where('is_correct', false);
    }

    public function scopeFlagged($query)
    {
        return $query->where('is_flagged', true);
    }

    public function scopeAnswered($query)
    {
        return $query->whereNotNull('answer_text');
    }

    public function scopeUnanswered($query)
    {
        return $query->whereNull('answer_text');
    }

    // Methods
    public function isCorrect(): bool
    {
        return $this->is_correct === true;
    }

    public function isIncorrect(): bool
    {
        return $this->is_correct === false;
    }

    public function isAnswered(): bool
    {
        return !is_null($this->answer_text) && trim($this->answer_text) !== '';
    }

    public function isFlagged(): bool
    {
        return $this->is_flagged;
    }

    public function flag(): void
    {
        $this->update(['is_flagged' => true]);
    }

    public function unflag(): void
    {
        $this->update(['is_flagged' => false]);
    }

    public function saveAnswer(string $answer, int $timeSpent = null): void
    {
        $this->update([
            'answer_text' => $answer,
            'time_spent' => $timeSpent
        ]);

        // Auto-grade if possible
        if ($this->question->isMultipleChoice() || $this->question->isTrueFalse()) {
            $this->autoGrade();
        }
    }

    public function autoGrade(): void
    {
        if (!$this->isAnswered()) {
            return;
        }

        $isCorrect = $this->question->checkAnswer($this->answer_text);
        
        $this->update([
            'is_correct' => $isCorrect,
            'marks_obtained' => $isCorrect ? $this->getMaxMarks() : 0
        ]);
    }

    public function manualGrade(float $marks, bool $isCorrect = null): void
    {
        $maxMarks = $this->getMaxMarks();
        $marks = min($marks, $maxMarks); // Ensure marks don't exceed maximum

        $this->update([
            'marks_obtained' => $marks,
            'is_correct' => $isCorrect ?? ($marks > 0)
        ]);
    }

    public function getMaxMarks(): float
    {
        // Handle both exam_schedule_id and direct exam_id cases
        $examId = $this->attempt->exam_id ?: ($this->attempt->examSchedule ? $this->attempt->examSchedule->exam_id : null);
        
        if (!$examId) {
            return $this->question->marks ?? 1; // Fallback to question's default marks
        }
        
        $examQuestion = $this->question->exams()
            ->where('exam_id', $examId)
            ->first();
            
        return $examQuestion ? $examQuestion->pivot->marks_allocated : ($this->question->marks ?? 1);
    }

    public function getFormattedAnswer(): string
    {
        if (!$this->isAnswered()) {
            return 'Not answered';
        }

        if ($this->question->isMultipleChoice()) {
            $options = $this->question->getFormattedOptions();
            $selectedOption = collect($options)->firstWhere('key', $this->answer_text);
            
            return $selectedOption ? $selectedOption['text'] : $this->answer_text;
        }

        if ($this->question->isTrueFalse()) {
            return ucfirst($this->answer_text);
        }

        // For essay and fill_blank questions
        return $this->answer_text;
    }

    public function getCorrectAnswer(): string
    {
        if ($this->question->isMultipleChoice()) {
            $options = $this->question->getFormattedOptions();
            $correctOption = collect($options)->firstWhere('key', $this->question->correct_answer);
            
            return $correctOption ? $correctOption['text'] : $this->question->correct_answer;
        }

        return $this->question->correct_answer ?? 'No correct answer defined';
    }

    public function needsManualGrading(): bool
    {
        return $this->isAnswered() && 
               ($this->question->isEssay() || $this->question->isFillBlank()) && 
               is_null($this->is_correct);
    }

    public function getTimeTakenFormatted(): string
    {
        if (!$this->time_spent) {
            return 'N/A';
        }

        $minutes = floor($this->time_spent / 60);
        $seconds = $this->time_spent % 60;

        if ($minutes > 0) {
            return sprintf('%d:%02d', $minutes, $seconds);
        }

        return sprintf('%ds', $seconds);
    }

    public function getStatusBadge(): array
    {
        if (!$this->isAnswered()) {
            return ['text' => 'Not Answered', 'color' => 'gray'];
        }

        if ($this->needsManualGrading()) {
            return ['text' => 'Pending Review', 'color' => 'yellow'];
        }

        if ($this->isCorrect()) {
            return ['text' => 'Correct', 'color' => 'green'];
        }

        return ['text' => 'Incorrect', 'color' => 'red'];
    }
}
