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

    private function getAdminMetrics()
    {
        return [
            'metrics' => [
                'total_students' => Student::count(),
                'total_classes' => Classroom::count(),
                'total_subjects' => Subject::count(),
                'total_results' => Result::count(),
            ],
            'recent_results' => Result::with(['student.user', 'subject', 'term.academicSession'])
                ->latest()
                ->take(5)
                ->get(),
            'class_distribution' => Classroom::withCount('students')
                ->get()
                ->map(fn($class) => [
                    'name' => $class->name,
                    'student_count' => $class->students_count
                ]),
            'latest_activities' => Result::with(['student.user', 'subject'])
                ->latest()
                ->take(10)
                ->get()
                ->map(fn($result) => [
                    'type' => 'result_added',
                    'message' => "Result added for {$result->student->user->name} in {$result->subject->name}",
                    'date' => $result->created_at
                ])
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
        $teacherClasses = $teacher->classrooms ?? collect();
        
        return [
            'metrics' => [
                'my_subjects' => $teacherSubjects->count(),
                'my_classes' => $teacherClasses->count(),
                'pending_results' => Result::whereIn('subject_id', $teacherSubjects->pluck('id'))
                    ->whereNull('total_score')
                    ->count(),
                'total_students' => Student::whereIn('classroom_id', $teacherClasses->pluck('id'))
                    ->count()
            ],
            'recent_results' => Result::whereIn('subject_id', $teacherSubjects->pluck('id'))
                ->with(['student.user', 'subject', 'term.academicSession'])
                ->latest()
                ->take(5)
                ->get(),
            'my_classes' => $teacherClasses->load(['students.user']),
            'my_subjects' => $teacherSubjects
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
        
        return [
            'student_info' => [
                'classroom' => $student->classroom?->name ?? 'Not Assigned',
                'admission_number' => $student->admission_number ?? 'N/A',
                'current_term' => $student->classroom?->currentTerm?->name ?? 'Not Set',
                'current_session' => $student->classroom?->currentTerm?->academicSession?->name ?? 'Not Set'
            ],
            'current_results' => Result::where('student_id', $student->id)
                ->whereHas('term', function($query) use ($student) {
                    $query->where('id', $student->classroom?->current_term_id);
                })
                ->with(['subject', 'term.academicSession'])
                ->get(),
            'result_history' => Result::where('student_id', $student->id)
                ->with(['subject', 'term.academicSession'])
                ->latest()
                ->get()
                ->groupBy('term.name')
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
