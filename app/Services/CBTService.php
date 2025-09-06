<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\Question;
use App\Models\ExamSchedule;
use App\Models\Classroom;
use App\Models\Subject;
use App\Models\Term;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class CBTService
{
    /**
     * Create a new exam
     */
    public function createExam(array $data): Exam
    {
        return DB::transaction(function () use ($data) {
            $exam = Exam::create([
                'title' => $data['title'],
                'subject_id' => $data['subject_id'],
                'teacher_id' => $data['teacher_id'],
                'description' => $data['description'] ?? null,
                'exam_type' => $data['exam_type'] ?? 'test',
                'duration' => $data['duration'] ?? 60,
                'instructions' => $data['instructions'] ?? null,
                'randomize_questions' => $data['randomize_questions'] ?? false,
                'randomize_options' => $data['randomize_options'] ?? false,
                'show_results_immediately' => $data['show_results_immediately'] ?? false,
                'is_published' => false
            ]);

            // Add questions if provided
            if (isset($data['questions']) && is_array($data['questions'])) {
                $this->addQuestionsToExam($exam, $data['questions']);
            }

            return $exam;
        });
    }

    /**
     * Update an existing exam
     */
    public function updateExam(Exam $exam, array $data): Exam
    {
        return DB::transaction(function () use ($exam, $data) {
            $exam->update([
                'title' => $data['title'] ?? $exam->title,
                'description' => $data['description'] ?? $exam->description,
                'exam_type' => $data['exam_type'] ?? $exam->exam_type,
                'duration' => $data['duration'] ?? $exam->duration,
                'instructions' => $data['instructions'] ?? $exam->instructions,
                'randomize_questions' => $data['randomize_questions'] ?? $exam->randomize_questions,
                'randomize_options' => $data['randomize_options'] ?? $exam->randomize_options,
                'show_results_immediately' => $data['show_results_immediately'] ?? $exam->show_results_immediately,
            ]);

            // Update questions if provided
            if (isset($data['questions']) && is_array($data['questions'])) {
                $exam->questions()->detach();
                $this->addQuestionsToExam($exam, $data['questions']);
            }

            return $exam;
        });
    }

    /**
     * Add questions to an exam
     */
    public function addQuestionsToExam(Exam $exam, array $questions): void
    {
        foreach ($questions as $index => $questionData) {
            $questionId = is_array($questionData) ? $questionData['question_id'] : $questionData;
            $marksAllocated = is_array($questionData) ? ($questionData['marks'] ?? 1) : 1;
            
            $exam->addQuestion(
                Question::findOrFail($questionId), 
                $marksAllocated, 
                $index + 1
            );
        }
    }

    /**
     * Publish an exam
     */
    public function publishExam(Exam $exam): bool
    {
        if (!$exam->hasQuestions()) {
            throw new \Exception('Cannot publish exam without questions');
        }

        $exam->update(['is_published' => true]);
        return true;
    }

    /**
     * Unpublish an exam
     */
    public function unpublishExam(Exam $exam): bool
    {
        $exam->update(['is_published' => false]);
        return true;
    }

    /**
     * Schedule an exam for a classroom
     */
    public function scheduleExam(array $data): ExamSchedule
    {
        $exam = Exam::findOrFail($data['exam_id']);
        
        if (!$exam->canBeScheduled()) {
            throw new \Exception('Exam cannot be scheduled. Make sure it is published and has questions.');
        }

        return DB::transaction(function () use ($data) {
            $schedule = ExamSchedule::create([
                'exam_id' => $data['exam_id'],
                'classroom_id' => $data['classroom_id'],
                'term_id' => $data['term_id'],
                'scheduled_date' => $data['scheduled_date'],
                'start_time' => $data['start_time'],
                'end_time' => $data['end_time'],
                'created_by' => $data['created_by'],
                'special_instructions' => $data['special_instructions'] ?? null
            ]);

            // Create attempts for all students in the classroom
            $schedule->createAttemptsForStudents();

            return $schedule;
        });
    }

    /**
     * Get available exams for a teacher
     */
    public function getTeacherExams(int $teacherId, array $filters = []): Collection
    {
        $query = Exam::where('teacher_id', $teacherId)
            ->with(['subject', 'questions']);

        if (isset($filters['subject_id'])) {
            $query->where('subject_id', $filters['subject_id']);
        }

        if (isset($filters['exam_type'])) {
            $query->where('exam_type', $filters['exam_type']);
        }

        if (isset($filters['is_published'])) {
            $query->where('is_published', $filters['is_published']);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get questions for a teacher
     */
    public function getTeacherQuestions(int $teacherId, array $filters = []): Collection
    {
        $query = Question::where('teacher_id', $teacherId)
            ->with(['subject'])
            ->active();

        if (isset($filters['subject_id'])) {
            $query->where('subject_id', $filters['subject_id']);
        }

        if (isset($filters['question_type'])) {
            $query->where('question_type', $filters['question_type']);
        }

        if (isset($filters['difficulty_level'])) {
            $query->where('difficulty_level', $filters['difficulty_level']);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get scheduled exams for a classroom
     */
    public function getClassroomScheduledExams(int $classroomId, int $termId = null): Collection
    {
        $query = ExamSchedule::where('classroom_id', $classroomId)
            ->with(['exam.subject', 'exam.teacher']);

        if ($termId) {
            $query->where('term_id', $termId);
        }

        return $query->upcoming()
            ->orderBy('scheduled_date')
            ->orderBy('start_time')
            ->get();
    }

    /**
     * Get exam statistics for admin dashboard
     */
    public function getExamStatistics($exam = null): array
    {
        if ($exam) {
            // Return statistics for a specific exam
            return $this->getSpecificExamStatistics($exam);
        }
        
        // Return general statistics
        $totalExams = Exam::count();
        $publishedExams = Exam::published()->count();
        $scheduledExams = ExamSchedule::scheduled()->count();
        $ongoingExams = ExamSchedule::ongoing()->count();
        $completedExams = ExamSchedule::completed()->count();
        $totalQuestions = Question::active()->count();

        return [
            'total_exams' => $totalExams,
            'published_exams' => $publishedExams,
            'scheduled_exams' => $scheduledExams,
            'ongoing_exams' => $ongoingExams,
            'completed_exams' => $completedExams,
            'total_questions' => $totalQuestions,
            'exam_types' => $this->getExamTypeDistribution(),
            'subject_distribution' => $this->getSubjectDistribution()
        ];
    }

    /**
     * Get statistics for a specific exam
     */
    protected function getSpecificExamStatistics($exam): array
    {
        $totalStudents = $exam->classrooms()
            ->withCount('students')
            ->get()
            ->sum('students_count');
            
        $totalAttempts = $exam->studentAttempts()->count();
        $completedAttempts = $exam->studentAttempts()->where('student_exam_attempts.status', 'completed')->count();
        $inProgressAttempts = $exam->studentAttempts()->where('student_exam_attempts.status', 'in_progress')->count();
        
        $averageScore = $exam->studentAttempts()
            ->where('student_exam_attempts.status', 'completed')
            ->avg('student_exam_attempts.total_score');
            
        // Calculate passed students (assuming 60% is passing)
        $passingScore = $exam->total_marks * 0.6;
        $passedStudents = $exam->studentAttempts()
            ->where('student_exam_attempts.status', 'completed')
            ->where('student_exam_attempts.total_score', '>=', $passingScore)
            ->count();
            
        $passRate = $completedAttempts > 0 ? ($passedStudents / $completedAttempts) * 100 : 0;

        return [
            'total_students' => $totalStudents,
            'total_attempts' => $totalAttempts,
            'completed_attempts' => $completedAttempts,
            'in_progress_attempts' => $inProgressAttempts,
            'average_score' => round($averageScore ?? 0, 2),
            'passed_students' => $passedStudents,
            'pass_rate' => round($passRate, 2),
            'highest_score' => $exam->studentAttempts()
                ->where('student_exam_attempts.status', 'completed')
                ->max('student_exam_attempts.total_score') ?? 0,
            'lowest_score' => $exam->studentAttempts()
                ->where('student_exam_attempts.status', 'completed')
                ->min('student_exam_attempts.total_score') ?? 0
        ];
    }

    /**
     * Get exam type distribution
     */
    protected function getExamTypeDistribution(): array
    {
        return Exam::select('exam_type', DB::raw('count(*) as count'))
            ->groupBy('exam_type')
            ->pluck('count', 'exam_type')
            ->toArray();
    }

    /**
     * Get subject distribution for exams
     */
    protected function getSubjectDistribution(): array
    {
        return Exam::join('subjects', 'exams.subject_id', '=', 'subjects.id')
            ->select('subjects.name', DB::raw('count(*) as count'))
            ->groupBy('subjects.id', 'subjects.name')
            ->pluck('count', 'name')
            ->toArray();
    }

    /**
     * Bulk import questions from array
     */
    public function bulkImportQuestions(array $questionsData, int $teacherId): array
    {
        $imported = [];
        $errors = [];

        DB::transaction(function () use ($questionsData, $teacherId, &$imported, &$errors) {
            foreach ($questionsData as $index => $questionData) {
                try {
                    $question = Question::create([
                        'subject_id' => $questionData['subject_id'],
                        'teacher_id' => $teacherId,
                        'question_text' => $questionData['question_text'],
                        'question_type' => $questionData['question_type'],
                        'difficulty_level' => $questionData['difficulty_level'] ?? 'medium',
                        'marks' => $questionData['marks'] ?? 1,
                        'time_limit' => $questionData['time_limit'] ?? null,
                        'options' => $questionData['options'] ?? null,
                        'correct_answer' => $questionData['correct_answer'] ?? null,
                        'explanation' => $questionData['explanation'] ?? null,
                    ]);

                    $imported[] = $question;
                } catch (\Exception $e) {
                    $errors[] = [
                        'row' => $index + 1,
                        'error' => $e->getMessage()
                    ];
                }
            }
        });

        return [
            'imported' => count($imported),
            'errors' => $errors,
            'questions' => $imported
        ];
    }

    /**
     * Clone an exam
     */
    public function cloneExam(Exam $exam, array $overrides = []): Exam
    {
        return DB::transaction(function () use ($exam, $overrides) {
            $newExam = Exam::create(array_merge([
                'title' => ($overrides['title'] ?? $exam->title) . ' (Copy)',
                'subject_id' => $exam->subject_id,
                'teacher_id' => $exam->teacher_id,
                'description' => $exam->description,
                'exam_type' => $exam->exam_type,
                'duration' => $exam->duration,
                'instructions' => $exam->instructions,
                'randomize_questions' => $exam->randomize_questions,
                'randomize_options' => $exam->randomize_options,
                'show_results_immediately' => $exam->show_results_immediately,
                'is_published' => false
            ], $overrides));

            // Copy questions
            foreach ($exam->questions as $question) {
                $newExam->addQuestion(
                    $question,
                    $question->pivot->marks_allocated,
                    $question->pivot->question_order
                );
            }

            return $newExam;
        });
    }

    /**
     * Delete an exam (soft delete if it has attempts)
     */
    public function deleteExam(Exam $exam): bool
    {
        if ($exam->attempts()->exists()) {
            // If exam has attempts, we might want to implement soft delete
            throw new \Exception('Cannot delete exam that has student attempts');
        }

        return $exam->delete();
    }

    /**
     * Get exam performance analytics
     */
    public function getExamPerformanceAnalytics(Exam $exam): array
    {
        $attempts = $exam->attempts()->submitted()->with('student.user')->get();
        
        if ($attempts->isEmpty()) {
            return [
                'total_attempts' => 0,
                'completion_rate' => 0,
                'average_score' => 0,
                'score_distribution' => [],
                'top_performers' => [],
                'improvement_areas' => []
            ];
        }

        $scores = $attempts->pluck('percentage');
        $totalPossibleAttempts = $exam->schedules()
            ->with('classroom.students')
            ->get()
            ->sum(fn($schedule) => $schedule->classroom->students->count());

        return [
            'total_attempts' => $attempts->count(),
            'completion_rate' => $totalPossibleAttempts > 0 ? 
                round(($attempts->count() / $totalPossibleAttempts) * 100, 2) : 0,
            'average_score' => round($scores->avg(), 2),
            'highest_score' => $scores->max(),
            'lowest_score' => $scores->min(),
            'score_distribution' => $this->getScoreDistribution($scores),
            'top_performers' => $this->getTopPerformers($attempts),
            'question_analytics' => $this->getQuestionAnalytics($exam)
        ];
    }

    /**
     * Get score distribution for analytics
     */
    protected function getScoreDistribution($scores): array
    {
        $ranges = [
            '90-100' => 0, '80-89' => 0, '70-79' => 0,
            '60-69' => 0, '50-59' => 0, '0-49' => 0
        ];

        foreach ($scores as $score) {
            if ($score >= 90) $ranges['90-100']++;
            elseif ($score >= 80) $ranges['80-89']++;
            elseif ($score >= 70) $ranges['70-79']++;
            elseif ($score >= 60) $ranges['60-69']++;
            elseif ($score >= 50) $ranges['50-59']++;
            else $ranges['0-49']++;
        }

        return $ranges;
    }

    /**
     * Get top performers for an exam
     */
    protected function getTopPerformers($attempts): array
    {
        return $attempts->sortByDesc('percentage')
            ->take(5)
            ->map(function ($attempt) {
                return [
                    'student_name' => $attempt->student->user->name,
                    'percentage' => $attempt->percentage,
                    'grade' => $attempt->getGrade(),
                    'time_taken' => $attempt->getFormattedDuration()
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * Get question-wise analytics for an exam
     */
    protected function getQuestionAnalytics(Exam $exam): array
    {
        return $exam->questions->map(function ($question) {
            $stats = $question->getStatistics();
            return [
                'question_id' => $question->id,
                'question_text' => substr($question->question_text, 0, 100) . '...',
                'question_type' => $question->question_type,
                'difficulty' => $question->difficulty_level,
                'success_rate' => $stats['success_rate'],
                'total_attempts' => $stats['total_attempts'],
                'average_time' => $stats['average_time']
            ];
        })->toArray();
    }

    /**
     * Get exam analytics for teachers
     */
    public function getExamAnalytics(Exam $exam): array
    {
        // For now, return basic analytics structure
        // This can be expanded with actual analytics data
        return [
            'overview' => [
                'total_questions' => $exam->questions()->count(),
                'total_students' => $exam->classrooms()->withCount('students')->get()->sum('students_count'),
                'attempts_count' => 0, // TODO: implement when student attempts are tracked
                'average_score' => 0, // TODO: implement when results are available
                'completion_rate' => 0, // TODO: implement when attempts are tracked
            ],
            'question_performance' => [],
            'student_performance' => [],
            'time_analytics' => [
                'average_duration' => $exam->duration_minutes,
                'fastest_completion' => 0,
                'slowest_completion' => 0,
            ]
        ];
    }

    /**
     * Get exam results for teachers
     */
    public function getExamResults(Exam $exam): array
    {
        // For now, return basic results structure
        // This can be expanded with actual results data
        return [
            'exam' => [
                'id' => $exam->id,
                'title' => $exam->title,
                'total_marks' => $exam->total_marks,
                'duration_minutes' => $exam->duration_minutes,
            ],
            'students' => [], // TODO: implement when student attempts are tracked
            'statistics' => [
                'total_attempts' => 0,
                'completed_attempts' => 0,
                'pending_attempts' => 0,
                'average_score' => 0,
                'highest_score' => 0,
                'lowest_score' => 0,
                'pass_rate' => 0,
            ],
            'grade_distribution' => []
        ];
    }
}
