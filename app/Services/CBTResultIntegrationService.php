<?php

namespace App\Services;

use App\Models\Result;
use App\Models\StudentExamAttempt;
use App\Models\Exam;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Term;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CBTResultIntegrationService
{
    /**
     * Sync CBT exam attempt score to traditional result system
     */
    public function syncCBTToResult(StudentExamAttempt $attempt): ?Result
    {
        try {
            DB::beginTransaction();

            // Get the exam details
            $exam = $attempt->exam;
            if (!$exam) {
                Log::warning("CBT Attempt {$attempt->id} has no associated exam");
                return null;
            }

            // Get student and validate
            $student = $attempt->student;
            if (!$student) {
                Log::warning("CBT Attempt {$attempt->id} has no associated student");
                return null;
            }

            // Get the current active term
            $activeTerm = Term::where('is_current', true)->first();
            if (!$activeTerm) {
                Log::warning("No active term found for CBT sync");
                return null;
            }

            // Calculate the exam score out of 60 (traditional exam score scale)
            $examScore = $this->calculateExamScore($attempt, $exam);

            // Find or create result record
            $result = Result::where([
                'student_id' => $student->id,
                'subject_id' => $exam->subject_id,
                'term_id' => $activeTerm->id,
            ])->first();

            if ($result) {
                // Update existing result
                $this->updateExistingResult($result, $attempt, $examScore);
            } else {
                // Create new result
                $result = $this->createNewResult($student, $exam, $activeTerm, $attempt, $examScore);
            }

            DB::commit();
            
            Log::info("CBT score synced successfully for Student {$student->id}, Subject {$exam->subject_id}, Attempt {$attempt->id}");
            
            return $result;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to sync CBT score: " . $e->getMessage(), [
                'attempt_id' => $attempt->id,
                'student_id' => $attempt->student_id,
                'exam_id' => $attempt->exam->id ?? null,
            ]);
            throw $e;
        }
    }

    /**
     * Calculate exam score on traditional scale (out of 60)
     */
    private function calculateExamScore(StudentExamAttempt $attempt, Exam $exam): float
    {
        // Convert percentage to exam score out of 60
        $percentage = $attempt->percentage ?? 0;
        return round(($percentage / 100) * 60, 2);
    }

    /**
     * Update existing result with CBT score
     */
    private function updateExistingResult(Result $result, StudentExamAttempt $attempt, float $examScore): void
    {
        // Store the original manual exam score if this is the first CBT sync
        if (!$result->is_cbt_exam && $result->exam_score > 0) {
            $result->manual_exam_score = $result->exam_score;
        }

        // Update with CBT score
        $result->update([
            'exam_score' => $examScore,
            'cbt_exam_attempt_id' => $attempt->id,
            'is_cbt_exam' => true,
            'cbt_synced_at' => Carbon::now(),
            'total_score' => $result->ca_score + $examScore,
        ]);
    }

    /**
     * Create new result with CBT score
     */
    private function createNewResult(Student $student, Exam $exam, Term $term, StudentExamAttempt $attempt, float $examScore): Result
    {
        return Result::create([
            'student_id' => $student->id,
            'subject_id' => $exam->subject_id,
            'term_id' => $term->id,
            'ca_score' => 0, // Can be updated manually later
            'exam_score' => $examScore,
            'total_score' => $examScore, // Will be recalculated when CA is added
            'cbt_exam_attempt_id' => $attempt->id,
            'is_cbt_exam' => true,
            'cbt_synced_at' => Carbon::now(),
            'teacher_id' => $exam->teacher_id,
        ]);
    }

    /**
     * Revert CBT score and restore manual score
     */
    public function revertCBTScore(Result $result): bool
    {
        try {
            if (!$result->is_cbt_exam) {
                return false; // Not a CBT result
            }

            DB::beginTransaction();

            // Restore manual exam score or set to 0
            $examScore = $result->manual_exam_score ?? 0;

            $result->update([
                'exam_score' => $examScore,
                'total_score' => $result->ca_score + $examScore,
                'cbt_exam_attempt_id' => null,
                'is_cbt_exam' => false,
                'manual_exam_score' => null,
                'cbt_synced_at' => null,
            ]);

            DB::commit();
            
            Log::info("CBT score reverted for Result {$result->id}");
            
            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to revert CBT score: " . $e->getMessage(), [
                'result_id' => $result->id,
            ]);
            return false;
        }
    }

    /**
     * Manually override CBT score with manual score
     */
    public function overrideCBTScore(Result $result, float $manualExamScore): bool
    {
        try {
            if (!$result->is_cbt_exam) {
                return false; // Not a CBT result
            }

            DB::beginTransaction();

            $result->update([
                'exam_score' => $manualExamScore,
                'total_score' => $result->ca_score + $manualExamScore,
                'manual_exam_score' => $manualExamScore,
                'cbt_synced_at' => Carbon::now(),
            ]);

            DB::commit();
            
            Log::info("CBT score manually overridden for Result {$result->id}");
            
            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to override CBT score: " . $e->getMessage(), [
                'result_id' => $result->id,
            ]);
            return false;
        }
    }

    /**
     * Get all results that are linked to CBT exams
     */
    public function getCBTLinkedResults(array $filters = []): \Illuminate\Database\Eloquent\Collection
    {
        $query = Result::where('is_cbt_exam', true)
            ->with(['student.user', 'subject', 'term', 'cbtExamAttempt.exam']);

        if (isset($filters['term_id'])) {
            $query->where('term_id', $filters['term_id']);
        }

        if (isset($filters['subject_id'])) {
            $query->where('subject_id', $filters['subject_id']);
        }

        if (isset($filters['student_id'])) {
            $query->where('student_id', $filters['student_id']);
        }

        return $query->get();
    }

    /**
     * Sync all completed CBT attempts for a specific term/subject
     */
    public function bulkSyncCBTResults(int $termId, ?int $subjectId = null): array
    {
        $query = StudentExamAttempt::where('status', 'completed')
            ->whereHas('exam', function ($q) use ($subjectId) {
                if ($subjectId) {
                    $q->where('subject_id', $subjectId);
                }
            })
            ->whereDoesntHave('result'); // Only sync attempts not already linked

        $attempts = $query->get();
        $synced = [];
        $failed = [];

        foreach ($attempts as $attempt) {
            try {
                $result = $this->syncCBTToResult($attempt);
                if ($result) {
                    $synced[] = $attempt->id;
                }
            } catch (\Exception $e) {
                $failed[] = [
                    'attempt_id' => $attempt->id,
                    'error' => $e->getMessage()
                ];
            }
        }

        return [
            'synced' => $synced,
            'failed' => $failed,
            'total_processed' => count($attempts)
        ];
    }

    /**
     * Check if a CBT exam has been completed by a student for a subject/term
     */
    public function hasCBTScore(int $studentId, int $subjectId, int $termId): bool
    {
        return Result::where([
            'student_id' => $studentId,
            'subject_id' => $subjectId,
            'term_id' => $termId,
            'is_cbt_exam' => true,
        ])->exists();
    }
}
