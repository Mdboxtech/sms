<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Models\Result;
use App\Models\Student;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $data = [
            'auth' => [
                'user' => $user,
            ]
        ];
        switch ($user->role) {
            case 'admin':
                $data = array_merge($data, $this->getAdminMetrics());
                break;
            case 'teacher':
                $data = array_merge($data, $this->getTeacherMetrics($user));
                break;
            case 'student':
                $data = array_merge($data, $this->getStudentMetrics($user));
                break;
        }

        return Inertia::render('Dashboard', $data);
    }

    /**
     * Get current term (helper method)
     */
    private function getCurrentTerm()
    {
        $currentSession = \App\Models\AcademicSession::where('is_current', true)->first();
        if (!$currentSession) {
            return null;
        }
        return \App\Models\Term::where('academic_session_id', $currentSession->id)
            ->where('is_current', true)
            ->first();
    }

    private function getAdminMetrics()
    {
        $currentTerm = $this->getCurrentTerm();
        
        // Build query for current term results
        $recentResultsQuery = Result::with(['student.user', 'subject', 'term.academicSession']);
        $latestActivitiesQuery = Result::with(['student.user', 'subject']);
        
        if ($currentTerm) {
            $recentResultsQuery->where('term_id', $currentTerm->id);
            $latestActivitiesQuery->where('term_id', $currentTerm->id);
        }
        
        return [
            'metrics' => [
                'total_students' => Student::count(),
                'total_classes' => Classroom::count(),
                'total_subjects' => Subject::count(),
                'total_results' => $currentTerm 
                    ? Result::where('term_id', $currentTerm->id)->count() 
                    : Result::count(),
            ],
            'recent_results' => $recentResultsQuery
                ->latest()
                ->take(5)
                ->get(),
            'class_distribution' => Classroom::withCount('students')
                ->get()
                ->map(fn($class) => [
                    'name' => $class->name,
                    'student_count' => $class->students_count
                ]),
            'latest_activities' => $latestActivitiesQuery
                ->latest()
                ->take(10)
                ->get()
                ->map(fn($result) => [
                    'type' => 'result_added',
                    'message' => "Result added for {$result->student->user->name} in {$result->subject->name}",
                    'date' => $result->created_at
                ]),
            'current_term' => $currentTerm?->name ?? 'Not Set',
            'current_session' => $currentTerm?->academicSession?->name ?? 'Not Set'
        ];
    }

    private function getTeacherMetrics($user)
    {
        $teacher = $user->teacher;
        
        if (!$teacher) {
            return [
                'metrics' => [
                    'my_subjects' => 0,
                    'my_classes' => 0,
                    'pending_results' => 0,
                    'total_students' => 0
                ],
                'recent_results' => collect(),
                'my_classes' => collect(),
                'my_subjects' => collect()
            ];
        }
        
        $teacherSubjects = $teacher->subjects ?? collect();
        
        // Get classrooms through subjects
        $teacherClasses = $teacherSubjects->count() > 0 
            ? $teacher->subjects()
                ->with('classrooms.students.user')
                ->get()
                ->pluck('classrooms')
                ->flatten()
                ->unique('id')
                ->values()
            : collect();
        
        $currentTerm = $this->getCurrentTerm();
        
        // Build query for pending and recent results - filter by current term
        $pendingResultsQuery = Result::whereIn('subject_id', $teacherSubjects->pluck('id'))
            ->whereNull('total_score');
        $recentResultsQuery = Result::whereIn('subject_id', $teacherSubjects->pluck('id'))
            ->with(['student.user', 'subject', 'term.academicSession']);
        
        if ($currentTerm) {
            $pendingResultsQuery->where('term_id', $currentTerm->id);
            $recentResultsQuery->where('term_id', $currentTerm->id);
        }
        
        return [
            'metrics' => [
                'my_subjects' => $teacherSubjects->count(),
                'my_classes' => $teacherClasses->count(),
                'pending_results' => $pendingResultsQuery->count(),
                'total_students' => Student::whereIn('classroom_id', $teacherClasses->pluck('id'))
                    ->count()
            ],
            'recent_results' => $recentResultsQuery
                ->latest()
                ->take(5)
                ->get(),
            'my_classes' => $teacherClasses,
            'my_subjects' => $teacherSubjects,
            'current_term' => $currentTerm?->name ?? 'Not Set'
        ];
    }

    private function getStudentMetrics($user)
    {
        $student = $user->student;
        
        if (!$student) {
            return [
                'student_info' => [
                    'classroom' => 'Not Assigned',
                    'admission_number' => 'N/A',
                    'current_term' => 'Not Set',
                    'current_session' => 'Not Set'
                ],
                'current_results' => collect(),
                'result_history' => collect()
            ];
        }

        // Get current academic session and term
        $currentSession = \App\Models\AcademicSession::where('is_current', true)->first();
        $currentTerm = null;
        if ($currentSession) {
            $currentTerm = \App\Models\Term::where('academic_session_id', $currentSession->id)
                ->where('is_current', true)
                ->first();
        }

        $currentResults = collect();
        if ($currentTerm) {
            $currentResults = Result::where('student_id', $student->id)
                ->where('term_id', $currentTerm->id)
                ->with(['subject', 'term.academicSession'])
                ->get();
        }
        
        return [
            'student_info' => [
                'classroom' => $student->classroom?->name ?? 'Not Assigned',
                'admission_number' => $student->admission_number ?? 'N/A',
                'current_term' => $currentTerm?->name ?? 'Not Set',
                'current_session' => $currentSession?->name ?? 'Not Set'
            ],
            'current_results' => $currentResults
            // result_history removed - each term is a fresh start
        ];
    }

    public function adminDashboard()
    {
        $data = [
            'auth' => [
                'user' => Auth::user(),
            ]
        ];
        
        return Inertia::render('Admin/Dashboard', array_merge($data, $this->getAdminMetrics()));
    }

    public function teacherDashboard()
    {
        $user = Auth::user();
        $data = [
            'auth' => [
                'user' => $user,
            ]
        ];
        
        return Inertia::render('Teacher/Dashboard', array_merge($data, $this->getTeacherMetrics($user)));
    }

    public function studentDashboard()
    {
        $user = Auth::user();
        $data = [
            'auth' => [
                'user' => $user,
            ]
        ];
        
        return Inertia::render('Student/Dashboard', array_merge($data, $this->getStudentMetrics($user)));
    }
}
