<?php

namespace App\Services;

use App\Models\ExamSchedule;
use App\Models\StudentExamAttempt;
use App\Models\StudentAnswer;
use App\Models\Student;
use App\Models\Question;
use App\Models\Exam;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class ExamTakingService
{
    /**
     * Start an exam attempt for a student
     */
    public function startExam(ExamSchedule $examSchedule, Student $student): StudentExamAttempt
    {
        // Check if student can start the exam
        $attempt = $examSchedule->attempts()
            ->where('student_id', $student->id)
            ->first();

        if (!$attempt) {
            throw new \Exception('Student is not registered for this exam');
        }

        if (!$attempt->canStart()) {
            throw new \Exception('Exam cannot be started at this time');
        }

        return DB::transaction(function () use ($attempt, $examSchedule) {
            $attempt->start();

            // Create answer records for all questions
            $this->createAnswerRecords($attempt, $examSchedule->exam);

            // Cache exam session
            $this->cacheExamSession($attempt);

            return $attempt;
        });
    }

    /**
     * Submit an answer for a question
     */
    public function submitAnswer(
        StudentExamAttempt $attempt, 
        int $questionId, 
        string $answer, 
        int $timeSpent = null
    ): StudentAnswer {
        if (!$attempt->isInProgress()) {
            throw new \Exception('Exam is not in progress');
        }

        $studentAnswer = $attempt->answers()
            ->where('question_id', $questionId)
            ->firstOrCreate([
                'question_id' => $questionId,
                'attempt_id' => $attempt->id
            ]);

        $studentAnswer->saveAnswer($answer, $timeSpent);

        // Update cache
        $this->updateExamSessionCache($attempt);

        return $studentAnswer;
    }

    /**
     * Flag a question for review
     */
    public function flagQuestion(StudentExamAttempt $attempt, int $questionId): StudentAnswer
    {
        if (!$attempt->isInProgress()) {
            throw new \Exception('Exam is not in progress');
        }

        $studentAnswer = $attempt->answers()
            ->where('question_id', $questionId)
            ->firstOrCreate([
                'question_id' => $questionId,
                'attempt_id' => $attempt->id
            ]);

        $studentAnswer->flag();

        return $studentAnswer;
    }

    /**
     * Unflag a question
     */
    public function unflagQuestion(StudentExamAttempt $attempt, int $questionId): StudentAnswer
    {
        $studentAnswer = $attempt->answers()
            ->where('question_id', $questionId)
            ->firstOrCreate([
                'question_id' => $questionId,
                'attempt_id' => $attempt->id
            ]);

        $studentAnswer->unflag();

        return $studentAnswer;
    }

    /**
     * Submit the entire exam
     */
    public function submitExam(StudentExamAttempt $attempt): StudentExamAttempt
    {
        if (!$attempt->canSubmit()) {
            throw new \Exception('Exam cannot be submitted');
        }

        return DB::transaction(function () use ($attempt) {
            $attempt->submit();

            // Clear cache
            $this->clearExamSessionCache($attempt);

            return $attempt;
        });
    }

    /**
     * Auto-submit exam when time expires
     */
    public function autoSubmitExam(StudentExamAttempt $attempt): StudentExamAttempt
    {
        return DB::transaction(function () use ($attempt) {
            $attempt->autoSubmit();

            // Clear cache
            $this->clearExamSessionCache($attempt);

            return $attempt;
        });
    }

    /**
     * Get exam session data for student
     */
    public function getExamSession(StudentExamAttempt $attempt): array
    {
        $cacheKey = "exam_session_{$attempt->id}";
        
        return Cache::remember($cacheKey, 300, function () use ($attempt) {
            $exam = $attempt->examSchedule->exam;
            $questions = $exam->getQuestionsForStudent($attempt->student_id);
            
            $answers = $attempt->answers()
                ->with('question')
                ->get()
                ->keyBy('question_id');

            // Add existing answers to questions
            foreach ($questions as &$question) {
                $answer = $answers->get($question['id']);
                $question['answer'] = $answer ? [
                    'text' => $answer->answer_text,
                    'is_flagged' => $answer->is_flagged,
                    'time_spent' => $answer->time_spent
                ] : null;
            }

            return [
                'attempt_id' => $attempt->id,
                'exam' => [
                    'id' => $exam->id,
                    'title' => $exam->title,
                    'subject' => $exam->subject->name,
                    'duration' => $exam->duration,
                    'total_marks' => $exam->total_marks,
                    'instructions' => $exam->instructions,
                    'total_questions' => count($questions)
                ],
                'questions' => $questions,
                'time_remaining' => $attempt->getTimeRemaining(),
                'progress' => $attempt->getProgress(),
                'answered_questions' => $attempt->getAnsweredQuestions(),
                'flagged_questions' => $this->getFlaggedQuestions($attempt)
            ];
        });
    }

    /**
     * Get exam navigation data
     */
    public function getExamNavigation(StudentExamAttempt $attempt): array
    {
        $answers = $attempt->answers()
            ->select('question_id', 'answer_text', 'is_flagged')
            ->get()
            ->keyBy('question_id');

        $questions = $attempt->examSchedule->exam->questions()
            ->select('id')
            ->orderBy('exam_questions.question_order')
            ->get();

        return $questions->map(function ($question, $index) use ($answers) {
            $answer = $answers->get($question->id);
            
            return [
                'question_number' => $index + 1,
                'question_id' => $question->id,
                'is_answered' => $answer && !is_null($answer->answer_text),
                'is_flagged' => $answer && $answer->is_flagged,
                'status' => $this->getQuestionStatus($answer)
            ];
        })->toArray();
    }

    /**
     * Record tab switch event
     */
    public function recordTabSwitch(StudentExamAttempt $attempt): void
    {
        if ($attempt->isInProgress()) {
            $attempt->recordTabSwitch();
        }
    }

    /**
     * Get time remaining for an exam attempt
     */
    public function getTimeRemaining(StudentExamAttempt $attempt): ?int
    {
        return $attempt->getTimeRemaining();
    }

    /**
     * Check if exam should be auto-submitted
     */
    public function shouldAutoSubmit(StudentExamAttempt $attempt): bool
    {
        $timeRemaining = $attempt->getTimeRemaining();
        return $timeRemaining !== null && $timeRemaining <= 0;
    }

    /**
     * Get exam results for student
     */
    public function getExamResults(StudentExamAttempt $attempt): array
    {
        if (!$attempt->isCompleted()) {
            throw new \Exception('Exam is not completed yet');
        }

        $exam = $attempt->examSchedule->exam;
        
        if (!$exam->show_results_immediately && !$attempt->examSchedule->isCompleted()) {
            throw new \Exception('Results are not available yet');
        }

        $answers = $attempt->answers()
            ->with('question')
            ->get();

        return [
            'attempt' => [
                'id' => $attempt->id,
                'status' => $attempt->status,
                'total_score' => $attempt->total_score,
                'percentage' => $attempt->percentage,
                'grade' => $attempt->getGrade(),
                'time_taken' => $attempt->getFormattedDuration(),
                'passed' => $attempt->isPassed(),
                'submitted_at' => $attempt->end_time
            ],
            'exam' => [
                'title' => $exam->title,
                'subject' => $exam->subject->name,
                'total_marks' => $exam->total_marks,
                'total_questions' => $exam->getTotalQuestions()
            ],
            'summary' => [
                'correct_answers' => $answers->where('is_correct', true)->count(),
                'incorrect_answers' => $answers->where('is_correct', false)->count(),
                'unanswered' => $answers->whereNull('answer_text')->count(),
                'flagged' => $answers->where('is_flagged', true)->count()
            ],
            'answers' => $answers->map(function ($answer) {
                return [
                    'question_id' => $answer->question_id,
                    'question_text' => $answer->question->question_text,
                    'question_type' => $answer->question->question_type,
                    'student_answer' => $answer->getFormattedAnswer(),
                    'correct_answer' => $answer->getCorrectAnswer(),
                    'is_correct' => $answer->is_correct,
                    'marks_obtained' => $answer->marks_obtained,
                    'max_marks' => $answer->getMaxMarks(),
                    'explanation' => $answer->question->explanation,
                    'time_spent' => $answer->getTimeTakenFormatted()
                ];
            })->toArray()
        ];
    }

    /**
     * Create answer records for all questions in an exam
     */
    protected function createAnswerRecords(StudentExamAttempt $attempt, $exam): void
    {
        $questions = $exam->questions;
        
        foreach ($questions as $question) {
            StudentAnswer::create([
                'attempt_id' => $attempt->id,
                'question_id' => $question->id
            ]);
        }
    }

    /**
     * Cache exam session data
     */
    protected function cacheExamSession(StudentExamAttempt $attempt): void
    {
        $cacheKey = "exam_session_{$attempt->id}";
        Cache::put($cacheKey, [
            'attempt_id' => $attempt->id,
            'started_at' => $attempt->start_time,
            'expires_at' => $attempt->start_time->addMinutes($attempt->examSchedule->exam->duration)
        ], 300); // Cache for 5 minutes
    }

    /**
     * Update exam session cache
     */
    protected function updateExamSessionCache(StudentExamAttempt $attempt): void
    {
        $cacheKey = "exam_session_{$attempt->id}";
        Cache::forget($cacheKey); // Clear cache to force refresh
    }

    /**
     * Clear exam session cache
     */
    protected function clearExamSessionCache(StudentExamAttempt $attempt): void
    {
        $cacheKey = "exam_session_{$attempt->id}";
        Cache::forget($cacheKey);
    }

    /**
     * Get flagged questions for an attempt
     */
    protected function getFlaggedQuestions(StudentExamAttempt $attempt): array
    {
        return $attempt->answers()
            ->where('is_flagged', true)
            ->pluck('question_id')
            ->toArray();
    }

    /**
     * Get question status for navigation
     */
    protected function getQuestionStatus($answer): string
    {
        if (!$answer) {
            return 'not_visited';
        }

        if ($answer->is_flagged) {
            return 'flagged';
        }

        if (!is_null($answer->answer_text)) {
            return 'answered';
        }

        return 'visited';
    }

    /**
     * Get active exam sessions count
     */
    public function getActiveSessionsCount(): int
    {
        return StudentExamAttempt::inProgress()->count();
    }

    /**
     * Get exam sessions for monitoring
     */
    public function getExamSessionsForMonitoring(ExamSchedule $examSchedule): array
    {
        $attempts = $examSchedule->attempts()
            ->with('student.user')
            ->get();

        return $attempts->map(function ($attempt) {
            return [
                'student_id' => $attempt->student_id,
                'student_name' => $attempt->student->user->name,
                'status' => $attempt->status,
                'start_time' => $attempt->start_time,
                'progress' => $attempt->getProgress(),
                'time_remaining' => $attempt->getTimeRemaining(),
                'tab_switches' => $attempt->tab_switches,
                'ip_address' => $attempt->ip_address,
                'last_activity' => $attempt->updated_at
            ];
        })->toArray();
    }

    /**
     * Force submit all active attempts for an exam schedule
     */
    public function forceSubmitAllAttempts(ExamSchedule $examSchedule): int
    {
        $activeAttempts = $examSchedule->attempts()
            ->inProgress()
            ->get();

        foreach ($activeAttempts as $attempt) {
            $this->autoSubmitExam($attempt);
        }

        return $activeAttempts->count();
    }
    
    /**
     * Check if a student can take an exam
     */
    public function canStudentTakeExam(Student $student, $exam): bool
    {
        // Check if exam is active and published
        if (!$exam->is_active || !$exam->is_published || $exam->status === 'cancelled') {
            return false;
        }
        
        // Check if student's classroom is assigned to this exam
        if (!$exam->classrooms()->where('classroom_id', $student->classroom_id)->exists()) {
            return false;
        }
        
        // Check if student has an in-progress attempt - allow to continue
        $inProgressAttempt = $exam->studentAttempts()
            ->where('student_id', $student->id)
            ->where('student_exam_attempts.status', 'in_progress')
            ->first();
            
        if ($inProgressAttempt) {
            // Check if exam time hasn't expired
            $timeRemaining = $this->getExamTimeRemaining($exam, $inProgressAttempt);
            return $timeRemaining > 0;
        }
        
        // Check if student has already completed the exam
        $completedAttempt = $exam->studentAttempts()
            ->where('student_id', $student->id)
            ->where('student_exam_attempts.status', 'completed')
            ->first();
            
        if ($completedAttempt) {
            return false; // Already completed
        }
        
        // Check attempts limit
        if ($exam->attempts_allowed > 0) {
            $attemptCount = $exam->studentAttempts()
                ->where('student_id', $student->id)
                ->count();
            if ($attemptCount >= $exam->attempts_allowed) {
                return false;
            }
        }
        
        // Check if exam has direct scheduling (start_time/end_time)
        if ($exam->start_time && $exam->end_time) {
            $now = now();
            return $now->between($exam->start_time, $exam->end_time);
        }
        
        // Check if exam is scheduled via exam_schedules table
        if ($exam->status === 'scheduled') {
            $now = now();
            $schedule = $exam->examSchedules()
                ->where('classroom_id', $student->classroom_id)
                ->first();
                
            if ($schedule) {
                return $now->between($schedule->start_time, $schedule->end_time);
            }
        }
        
        return $exam->status === 'active';
    }
    
    /**
     * Start or resume an exam for a student
     */
    public function startOrResumeExam(Student $student, $exam): StudentExamAttempt
    {
        // Check for existing attempt
        $attempt = $exam->studentAttempts()
            ->where('student_id', $student->id)
            ->whereIn('student_exam_attempts.status', ['not_started', 'in_progress'])
            ->first();
            
        if (!$attempt) {
            // Create new attempt
            $attempt = StudentExamAttempt::create([
                'exam_id' => $exam->id,
                'student_id' => $student->id,
                'status' => 'in_progress',
                'start_time' => now(),
                'total_score' => 0,
                'percentage' => 0
            ]);
        } elseif ($attempt->status === 'not_started') {
            // Start the attempt
            $attempt->update([
                'status' => 'in_progress',
                'start_time' => now()
            ]);
        }
        
        return $attempt;
    }
    
    /**
     * Get time remaining for an exam attempt (with exam context)
     */
    public function getExamTimeRemaining($exam, $attempt): int
    {
        // Handle null exam
        if (!$exam) {
            return 0; // No time remaining if no exam
        }
        
        if (!$attempt || !$attempt->start_time) {
            return (int)($exam->duration * 60); // Return full duration in seconds
        }
        
        $elapsed = (int)now()->diffInSeconds($attempt->start_time);
        $totalTime = (int)($exam->duration * 60);
        $remaining = $totalTime - $elapsed;
        
        return max(0, $remaining);
    }
    
    /**
     * Save a student's answer
     */
    public function saveStudentAnswer(StudentExamAttempt $attempt, int $questionId, $answer): void
    {
        $question = Question::findOrFail($questionId);
        
        // Ensure exam is loaded or fetch it directly
        $exam = $attempt->exam ?: Exam::find($attempt->exam_id);
        if (!$exam) {
            throw new \Exception('Exam not found');
        }
        
        // Check if question belongs to the exam
        if (!$exam->questions()->where('question_id', $questionId)->exists()) {
            throw new \Exception('Question does not belong to this exam');
        }
        
        // Determine if answer is correct
        $isCorrect = $this->checkAnswer($question, $answer);
        
        // Save or update the answer
        StudentAnswer::updateOrCreate([
            'attempt_id' => $attempt->id,
            'question_id' => $questionId
        ], [
            'answer_text' => is_array($answer) ? json_encode($answer) : $answer,
            'is_correct' => $isCorrect,
            'marks_obtained' => $isCorrect ? $question->marks : 0
        ]);
        
        // Update attempt total
        $this->updateAttemptScore($attempt);
    }
    
    /**
     * Check if an answer is correct
     */
    private function checkAnswer(Question $question, $answer): bool
    {
        switch ($question->question_type) {
            case 'multiple_choice':
            case 'true_false':
                $correctOption = collect($question->options)
                    ->firstWhere('is_correct', true);
                return $correctOption && $correctOption['text'] === $answer;
                
            case 'essay':
                // Essays require manual grading
                return false;
                
            case 'fill_blank':
                // Simple string comparison for now
                // In a real system, you might want more sophisticated matching
                return strtolower(trim($answer)) === strtolower(trim($question->correct_answer ?? ''));
                
            default:
                return false;
        }
    }
    
    /**
     * Update attempt score
     */
    private function updateAttemptScore(StudentExamAttempt $attempt): void
    {
        $totalMarks = $attempt->answers()->sum('marks_obtained');
        $attempt->update(['obtained_marks' => $totalMarks]);
    }
    
    /**
     * Get exam scheduling status
     */
    public function getExamStatus($exam): string
    {
        if (!$exam->start_time || !$exam->end_time) {
            return 'no_schedule';
        }
        
        $now = now();
        
        if ($now->lt($exam->start_time)) {
            return 'upcoming';
        } elseif ($now->between($exam->start_time, $exam->end_time)) {
            return 'ongoing';
        } else {
            return 'expired';
        }
    }
    
    /**
     * Get time until exam starts (in seconds)
     */
    public function getTimeUntilStart($exam): int
    {
        if (!$exam->start_time) {
            return 0;
        }
        
        $now = now();
        if ($now->gte($exam->start_time)) {
            return 0;
        }
        
        return $now->diffInSeconds($exam->start_time);
    }
}
