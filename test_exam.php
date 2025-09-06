<?php

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Test the canTake functionality
$student = App\Models\Student::first();
$exam = App\Models\Exam::find(2);

if (!$student) {
    echo "No student found in database\n";
    exit;
}

if (!$exam) {
    echo "No exam with ID 2 found\n";
    exit;
}

echo "Student: {$student->id} (user: {$student->user_id})\n";
echo "Exam: {$exam->id} - {$exam->title}\n";

$attempt = $exam->studentAttempts()
    ->where('student_id', $student->id)
    ->first();

echo "Existing attempt: " . ($attempt ? "Yes (status: {$attempt->status})" : "No") . "\n";

$examTakingService = new App\Services\ExamTakingService();
$canTake = $examTakingService->canStudentTakeExam($student, $exam);

echo "Can take exam: " . ($canTake ? "Yes" : "No") . "\n";
echo "Current time: " . now() . "\n";
echo "Exam start: " . ($exam->start_time ?: "Not set") . "\n";
echo "Exam end: " . ($exam->end_time ?: "Not set") . "\n";

if ($exam->start_time && $exam->end_time) {
    echo "Time check: " . (now()->between($exam->start_time, $exam->end_time) ? "Within window" : "Outside window") . "\n";
}

// Test the controller helper method
$controller = new App\Http\Controllers\Student\CBT\ExamController($examTakingService);
$reflection = new ReflectionClass($controller);
$method = $reflection->getMethod('getCannotTakeReason');
$method->setAccessible(true);

$reason = $method->invoke($controller, $student, $exam, $attempt);
echo "Cannot take reason: {$reason}\n";
