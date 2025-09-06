<?php

require __DIR__ . '/vendor/autoload.php';

use Illuminate\Foundation\Application;
use App\Models\Student;
use App\Models\Term;
use App\Models\Classroom;
use App\Models\TermResult;
use App\Models\Result;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    echo "=== Testing Term Result Creation ===\n";
    
    // Get a student
    $student = Student::first();
    if (!$student) {
        echo "No students found in database\n";
        exit(1);
    }
    echo "Student: {$student->id} - {$student->user->name}\n";
    
    // Get a term
    $term = Term::first();
    if (!$term) {
        echo "No terms found in database\n";
        exit(1);
    }
    echo "Term: {$term->id} - {$term->name}\n";
    
    // Get a classroom
    $classroom = Classroom::first();
    if (!$classroom) {
        echo "No classrooms found in database\n";
        exit(1);
    }
    echo "Classroom: {$classroom->id} - {$classroom->name}\n";
    
    // Check if term result already exists
    $existingTermResult = TermResult::where('student_id', $student->id)
        ->where('term_id', $term->id)
        ->first();
    
    if ($existingTermResult) {
        echo "Term result already exists: {$existingTermResult->id}\n";
    } else {
        echo "Creating new term result...\n";
        
        // Get results for this student and term
        $results = Result::where('student_id', $student->id)
            ->where('term_id', $term->id)
            ->get();
        
        echo "Found {$results->count()} results for this student/term\n";
        
        $averageScore = $results->avg('total_score') ?? 0;
        $totalScore = $results->sum('total_score') ?? 0;
        
        echo "Average Score: $averageScore\n";
        echo "Total Score: $totalScore\n";
        
        // Try to create term result
        $termResult = TermResult::create([
            'student_id' => $student->id,
            'term_id' => $term->id,
            'classroom_id' => $classroom->id,
            'average_score' => round($averageScore, 2),
            'total_score' => $totalScore,
            'position' => 1,
        ]);
        
        if ($termResult) {
            echo "Term result created successfully: {$termResult->id}\n";
        } else {
            echo "Failed to create term result\n";
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
