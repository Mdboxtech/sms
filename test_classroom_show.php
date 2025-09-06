<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Classroom;
use Illuminate\Http\Request;

try {
    echo "=== Testing Classroom Show Data Structure ===\n";
    
    // Get the first classroom
    $classroom = Classroom::first();
    
    if (!$classroom) {
        echo "No classrooms found in database.\n";
        exit;
    }
    
    echo "Testing Classroom: {$classroom->name}\n\n";
    
    // Test paginated students
    $students = $classroom->students()
        ->with('user')
        ->paginate(10, ['*'], 'students_page');
        
    echo "=== Students Pagination ===\n";
    echo "Total students: " . $students->total() . "\n";
    echo "Per page: " . $students->perPage() . "\n";
    echo "Current page: " . $students->currentPage() . "\n";
    echo "Data count: " . count($students->items()) . "\n";
    
    if (!empty($students->items())) {
        echo "\nFirst student structure:\n";
        $firstStudent = $students->items()[0];
        echo "- ID: " . $firstStudent->id . "\n";
        echo "- Admission Number: " . $firstStudent->admission_number . "\n";
        echo "- User Name: " . ($firstStudent->user ? $firstStudent->user->name : 'No user') . "\n";
    }
    
    // Test teachers
    $classroom->load(['teachers.user', 'subjects']);
    
    echo "\n=== Teachers ===\n";
    echo "Teachers count: " . $classroom->teachers->count() . "\n";
    
    if ($classroom->teachers->count() > 0) {
        foreach ($classroom->teachers as $teacher) {
            echo "- Teacher ID: " . $teacher->id . "\n";
            echo "- Teacher Name (direct): " . ($teacher->name ?? 'None') . "\n";
            echo "- Teacher User Name: " . ($teacher->user ? $teacher->user->name : 'No user') . "\n";
        }
    }
    
    echo "\n=== Subjects ===\n";
    echo "Subjects count: " . $classroom->subjects->count() . "\n";
    
    if ($classroom->subjects->count() > 0) {
        foreach ($classroom->subjects as $subject) {
            echo "- Subject: " . $subject->name . " (Code: " . $subject->code . ")\n";
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
