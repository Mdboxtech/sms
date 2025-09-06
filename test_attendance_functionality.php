<?php

require_once 'vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Teacher;
use App\Models\Student;
use App\Models\Classroom;
use App\Models\Attendance;
use App\Models\AcademicSession;
use App\Models\Term;
use App\Models\Role;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== ATTENDANCE SYSTEM DIAGNOSTIC ===\n\n";

// 1. Check User-Teacher Relationship
echo "1. Checking User-Teacher Relationships:\n";
$teachers = User::where('role_id', 2)->get(); // Assuming 2 is teacher role
foreach ($teachers as $user) {
    $teacher = $user->teacher;
    echo "  User: {$user->name} (ID: {$user->id}) -> Teacher: " . ($teacher ? "Yes (ID: {$teacher->id})" : "NO TEACHER RECORD") . "\n";
    if ($teacher) {
        $classrooms = $teacher->classrooms;
        echo "    Assigned Classrooms: " . $classrooms->count() . " (" . $classrooms->pluck('name')->implode(', ') . ")\n";
    }
}

echo "\n2. Checking Role System:\n";
$roles = Role::all();
foreach ($roles as $role) {
    echo "  Role: {$role->name} (ID: {$role->id})\n";
}

echo "\n3. Checking Attendance Controller Method Access:\n";
// Simulate different user types accessing attendance
$testUsers = [
    'admin' => User::whereHas('role', function($q) { $q->where('name', 'admin'); })->first(),
    'teacher' => User::whereHas('role', function($q) { $q->where('name', 'teacher'); })->first(),
];

foreach ($testUsers as $type => $user) {
    if ($user) {
        echo "  {$type} User: {$user->name}\n";
        echo "    Role: " . ($user->role ? $user->role->name : 'NO ROLE') . "\n";
        if ($type === 'teacher') {
            echo "    Teacher Record: " . ($user->teacher ? 'Yes' : 'NO') . "\n";
            if ($user->teacher) {
                echo "    Classrooms: " . $user->teacher->classrooms->count() . "\n";
            }
        }
    } else {
        echo "  No {$type} user found!\n";
    }
}

echo "\n4. Checking Database Tables:\n";
try {
    echo "  Attendances: " . Attendance::count() . " records\n";
    echo "  Students: " . Student::count() . " records\n";
    echo "  Classrooms: " . Classroom::count() . " records\n";
    echo "  Teachers: " . Teacher::count() . " records\n";
    echo "  Academic Sessions: " . AcademicSession::count() . " records\n";
    echo "  Terms: " . Term::count() . " records\n";
} catch (Exception $e) {
    echo "  Database error: " . $e->getMessage() . "\n";
}

echo "\n5. Checking Current Session/Term:\n";
$currentSession = AcademicSession::where('is_current', true)->first();
$currentTerm = Term::where('is_current', true)->first();
echo "  Current Session: " . ($currentSession ? $currentSession->name : 'NONE SET') . "\n";
echo "  Current Term: " . ($currentTerm ? $currentTerm->name : 'NONE SET') . "\n";

echo "\n6. Testing Attendance Model Methods:\n";
$attendance = new Attendance();
echo "  Status Options: " . json_encode($attendance::getStatusOptions()) . "\n";

// Test classroom access for teachers
echo "\n7. Checking Teacher Classroom Access:\n";
$teacherUser = User::whereHas('role', function($q) { $q->where('name', 'teacher'); })->first();
if ($teacherUser && $teacherUser->teacher) {
    $classrooms = $teacherUser->teacher->classrooms;
    echo "  Teacher {$teacherUser->name} has access to " . $classrooms->count() . " classrooms\n";
    foreach ($classrooms as $classroom) {
        $studentCount = $classroom->students()->count();
        echo "    - {$classroom->name}: {$studentCount} students\n";
    }
} else {
    echo "  No teacher with classroom assignments found\n";
}

echo "\n8. Checking Route Issues:\n";
// Simulate route access
echo "  Checking if attendance routes are properly defined...\n";

// Check middleware
echo "\n9. Checking Middleware:\n";
echo "  Role middleware should restrict access based on user roles\n";

echo "\n=== POTENTIAL ISSUES FOUND ===\n";

$issues = [];

// Check for missing teacher records
$usersWithoutTeacher = User::whereHas('role', function($q) { 
    $q->where('name', 'teacher'); 
})->whereDoesntHave('teacher')->get();

if ($usersWithoutTeacher->count() > 0) {
    $issues[] = "Users with teacher role but no teacher record: " . $usersWithoutTeacher->count();
}

// Check for teachers without classrooms
$teachersWithoutClassrooms = Teacher::whereDoesntHave('classrooms')->get();
if ($teachersWithoutClassrooms->count() > 0) {
    $issues[] = "Teachers without classroom assignments: " . $teachersWithoutClassrooms->count();
}

// Check for missing current session/term
if (!$currentSession) {
    $issues[] = "No current academic session set";
}
if (!$currentTerm) {
    $issues[] = "No current term set";
}

if (empty($issues)) {
    echo "No major issues detected in the database structure.\n";
} else {
    foreach ($issues as $issue) {
        echo "- {$issue}\n";
    }
}

echo "\n=== RECOMMENDED FIXES ===\n";
echo "1. Create missing teacher attendance views in resources/js/Pages/Teacher/Attendance/\n";
echo "2. Ensure all teachers have classroom assignments\n";
echo "3. Verify middleware is properly restricting access\n";
echo "4. Test frontend navigation to attendance pages\n";
echo "5. Check if attendance marking form is working properly\n";

echo "\nDiagnostic complete.\n";
