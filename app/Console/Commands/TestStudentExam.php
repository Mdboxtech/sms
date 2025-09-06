<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Student;
use App\Models\Exam;
use App\Services\ExamTakingService;
use App\Http\Controllers\Student\CBT\ExamController;
use Illuminate\Support\Facades\Auth;
use ReflectionClass;

class TestStudentExam extends Command
{
    protected $signature = 'test:student-exam {exam_id=2}';
    protected $description = 'Test student exam functionality';

    public function handle()
    {
        $examId = $this->argument('exam_id');
        $exam = Exam::find($examId);
        
        if (!$exam) {
            $this->error("Exam with ID {$examId} not found");
            return 1;
        }

        $student = Student::first();
        if (!$student) {
            $this->error("No student found in database");
            return 1;
        }

        $this->info("Testing with Student ID: {$student->id} (User ID: {$student->user_id})");
        $this->info("Exam: {$exam->title}");

        $attempt = $exam->studentAttempts()
            ->where('student_id', $student->id)
            ->first();

        $this->info("Existing attempt: " . ($attempt ? "Yes (status: {$attempt->status})" : "No"));

        $examTakingService = new ExamTakingService();
        $canTake = $examTakingService->canStudentTakeExam($student, $exam);

        $this->info("Can take exam: " . ($canTake ? "Yes" : "No"));
        $this->info("Current time: " . now());
        $this->info("Exam start: " . ($exam->start_time ?: "Not set"));
        $this->info("Exam end: " . ($exam->end_time ?: "Not set"));

        if ($exam->start_time && $exam->end_time) {
            $this->info("Time check: " . (now()->between($exam->start_time, $exam->end_time) ? "Within window" : "Outside window"));
        }

        // Test the controller helper method
        $controller = new ExamController($examTakingService);
        $reflection = new ReflectionClass($controller);
        $method = $reflection->getMethod('getCannotTakeReason');
        $method->setAccessible(true);

        $reason = $method->invoke($controller, $student, $exam, $attempt);
        $this->info("Cannot take reason: {$reason}");

        // Test the full canTake response structure
        $canTakeResponse = [
            'canTake' => $canTake,
            'reason' => $canTake ? null : $reason
        ];

        $this->info("Full canTake response:");
        $this->info(json_encode($canTakeResponse, JSON_PRETTY_PRINT));

        return 0;
    }
}
