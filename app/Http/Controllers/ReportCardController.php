<?php

namespace App\Http\Controllers;

use App\Models\Result;
use App\Models\Student;
use App\Models\Term;
use App\Services\ReportCardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;

class ReportCardController extends Controller
{
    protected $reportCardService;

    public function __construct(ReportCardService $reportCardService)
    {
        $this->reportCardService = $reportCardService;
    }
    public function index(Request $request)
    {
        // Get all terms with academic sessions, not just current ones
        $terms = Term::with('academicSession')
            ->orderBy('created_at', 'desc')
            ->get();

        // Get all students with their classrooms for filtering
        $studentsQuery = Student::with(['user', 'classroom']);
        
        // Apply classroom filter
        if ($request->classroom_id) {
            $studentsQuery->where('classroom_id', $request->classroom_id);
        }
        
        // Apply search filter
        if ($request->search) {
            $search = $request->search;
            $studentsQuery->where(function ($query) use ($search) {
                $query->where('admission_number', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($userQuery) use ($search) {
                          $userQuery->where('name', 'like', "%{$search}%");
                      });
            });
        }
        
        $students = $studentsQuery->orderBy('admission_number')->get();

        // Get all classrooms for filtering
        $classrooms = \App\Models\Classroom::all();

        return Inertia::render('ReportCards/Index', [
            'terms' => $terms,
            'students' => $students,
            'classrooms' => $classrooms,
            'filters' => $request->only(['classroom_id', 'search', 'term_id'])
        ]);
    }

    public function show($studentId, $termId)
    {
        $student = Student::with(['user', 'classroom'])->findOrFail($studentId);
        $term = Term::with('academicSession')->findOrFail($termId);
        
        // Get all results for the student in this term
        $results = Result::where('student_id', $student->id)
            ->where('term_id', $term->id)
            ->with(['subject', 'teacher'])
            ->get();

        // Get or calculate term result
        $termResult = \App\Models\TermResult::where('student_id', $student->id)
            ->where('term_id', $term->id)
            ->first();

        if (!$termResult) {
            // Calculate class statistics
            $classAverage = Result::where('term_id', $term->id)
                ->whereHas('student', function($query) use ($student) {
                    $query->where('classroom_id', $student->classroom_id);
                })
                ->avg('total_score');

            // Calculate student's position
            $position = $this->calculateStudentPosition($student->id, $term->id, $student->classroom_id);

            // Calculate average score
            $averageScore = $results->avg('total_score');

            // Create term result if it doesn't exist
            $termResult = \App\Models\TermResult::create([
                'student_id' => $student->id,
                'term_id' => $term->id,
                'classroom_id' => $student->classroom_id,
                'average_score' => $averageScore,
                'position' => $position,
            ]);
        }

        // Prepare report card data
        $reportCard = [
            'results' => $results,
            'total_score' => $results->sum('total_score'),
            'average_score' => $termResult->average_score,
            'class_average' => round($results->avg('total_score'), 1),
            'position' => $termResult->position,
            'teacher_comment' => $termResult->teacher_comment ?: $this->generateTeacherComment($termResult->average_score),
            'principal_comment' => $termResult->principal_comment ?: $this->generatePrincipalComment($termResult->average_score)
        ];

        return Inertia::render('ReportCards/Show', [
            'student' => $student,
            'term' => $term,
            'reportCard' => $reportCard
        ]);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'term_id' => 'required|exists:terms,id'
        ]);

        return $this->show($request->student_id, $request->term_id);
    }

    protected function calculateStudentPosition($studentId, $termId, $classroomId)
    {
        // Get all students' averages in the class for this term
        $averages = Result::selectRaw('student_id, AVG(total_score) as average_score')
            ->where('term_id', $termId)
            ->whereHas('student', function($query) use ($classroomId) {
                $query->where('classroom_id', $classroomId);
            })
            ->groupBy('student_id')
            ->orderByDesc('average_score')
            ->get();

        // Find the position of our student
        foreach ($averages as $index => $average) {
            if ($average->student_id == $studentId) {
                return $index + 1;
            }
        }

        return 'N/A';
    }

    protected function generateTeacherComment($averageScore)
    {
        if ($averageScore >= 70) {
            return 'Outstanding performance! Keep up the excellent work.';
        } elseif ($averageScore >= 60) {
            return 'Very good performance. Continue to work hard.';
        } elseif ($averageScore >= 50) {
            return 'Good effort, but there is room for improvement.';
        } elseif ($averageScore >= 40) {
            return 'Fair performance. Need to work harder to improve.';
        } else {
            return 'Needs significant improvement. Must work much harder.';
        }
    }

    protected function generatePrincipalComment($averageScore)
    {
        if ($averageScore >= 70) {
            return 'Exceptional achievement. A model student.';
        } elseif ($averageScore >= 60) {
            return 'Commendable performance. Keep striving for excellence.';
        } elseif ($averageScore >= 50) {
            return 'Satisfactory performance. Aim higher.';
        } elseif ($averageScore >= 40) {
            return 'Barely satisfactory. Significant improvement needed.';
        } else {
            return 'Performance below expectations. Urgent intervention required.';
        }
    }

    public function download(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'term_id' => 'required|exists:terms,id',
        ]);

        $student = Student::with(['user', 'classroom.students'])->findOrFail($request->student_id);
        $term = Term::with('academicSession')->findOrFail($request->term_id);
        
        $results = Result::where('student_id', $student->id)
            ->where('term_id', $term->id)
            ->with(['subject', 'teacher'])
            ->get();

        // Add grade information to each result
        $results = $results->map(function($result) {
            $result->grade_info = $this->reportCardService->calculateGrade($result->total_score);
            return $result;
        });

        $classAverage = Result::where('term_id', $term->id)
            ->whereHas('student', function($query) use ($student) {
                $query->where('classroom_id', $student->classroom_id);
            })
            ->avg('total_score');

        $position = $this->calculateStudentPosition($student->id, $term->id, $student->classroom_id);
        $averageScore = $results->avg('total_score');
        
        // Count total students in the class
        $totalStudents = Student::where('classroom_id', $student->classroom_id)->count();

        // Calculate GPA (assuming 4.0 scale)
        $gpa = $this->calculateGPA($averageScore);

        // Calculate attendance (placeholder - you can implement actual attendance logic)
        $attendanceData = $this->calculateAttendance($student->id, $term->id);

        // Get grading scale
        $gradingScale = $this->getGradingScale();

        // Calculate class statistics
        $classStatistics = $this->getClassStatistics($term->id, $student->classroom_id);

        // Get comments
        $comments = $this->getComments(null, $averageScore);

        // Prepare statistics array for the template
        $statistics = [
            'position' => $position,
            'total_students' => $totalStudents,
            'total_subjects' => $results->count(),
            'total_score' => $results->sum('total_score'),
            'average_score' => round($averageScore, 1),
            'class_average' => round($classAverage, 1),
            'highest_score' => $results->max('total_score'),
            'lowest_score' => $results->min('total_score'),
            'gpa' => $gpa,
        ];

        $data = [
            'student' => $student,
            'term' => $term,
            'academic_session' => $term->academicSession,
            'results' => $results,
            'statistics' => $statistics, // Add the statistics array
            'attendance' => $attendanceData, // Add attendance data
            'class_statistics' => $classStatistics,
            'grading_scale' => $gradingScale,
            'comments' => $comments,
            'generated_on' => now()->format('d/m/Y H:i'),
            'total_score' => $results->sum('total_score'),
            'average_score' => round($averageScore, 1),
            'class_average' => round($classAverage, 1),
            'position' => $position,
            'teacher_comment' => $this->generateTeacherComment($averageScore),
            'principal_comment' => $this->generatePrincipalComment($averageScore),
        ];

        $pdf = Pdf::loadView('reports.report-card-optimized', $data);
        
        return $pdf->download("report-card-{$student->admission_number}-{$term->name}.pdf");
    }

    public function studentReportCard($studentId, $termId, $classroomId)
    {
        $student = Student::with(['user', 'classroom'])->findOrFail($studentId);
        $term = Term::with('academicSession')->findOrFail($termId);
        
        // Get all results for the student in this term
        $results = Result::where('student_id', $student->id)
            ->where('term_id', $term->id)
            ->with(['subject', 'teacher'])
            ->get();

        if ($results->isEmpty()) {
            return back()->withErrors(['error' => 'No results found for this student in the selected term.']);
        }

        // Add grade information to each result
        $results = $results->map(function($result) {
            $result->grade_info = $this->reportCardService->calculateGrade($result->total_score);
            return $result;
        });

        // Get or calculate term result
        $termResult = \App\Models\TermResult::where('student_id', $student->id)
            ->where('term_id', $term->id)
            ->first();

        // Calculate basic statistics
        $totalScore = $results->sum('total_score');
        $averageScore = $results->avg('total_score');
        
        // Calculate class statistics
        $classAverage = Result::where('term_id', $term->id)
            ->whereHas('student', function($query) use ($classroomId) {
                $query->where('classroom_id', $classroomId);
            })
            ->avg('total_score');

        // Calculate position
        $position = $this->calculateStudentPosition($student->id, $term->id, $classroomId);
        
        // Count total students in the class
        $totalStudents = Student::where('classroom_id', $classroomId)->count();

        // Calculate GPA (assuming 4.0 scale)
        $gpa = $this->calculateGPA($averageScore);

        // Calculate attendance (placeholder - you can implement actual attendance logic)
        $attendanceData = $this->calculateAttendance($student->id, $term->id);

        // Get grading scale
        $gradingScale = $this->getGradingScale();

        // Calculate class statistics
        $classStatistics = $this->getClassStatistics($term->id, $classroomId);

        // Get comments
        $comments = $this->getComments($termResult, $averageScore);

        // Prepare statistics array for the template
        $statistics = [
            'position' => $position,
            'total_students' => $totalStudents,
            'total_subjects' => $results->count(),
            'total_score' => $totalScore,
            'average_score' => round($averageScore, 1),
            'class_average' => round($classAverage, 1),
            'highest_score' => $results->max('total_score'),
            'lowest_score' => $results->min('total_score'),
            'gpa' => $gpa,
        ];

        // Get app settings for header
        $appSettings = [
            'school_name' => config('app.school_name', 'School Management System'),
            'school_address' => config('app.school_address', ''),
            'school_phone' => config('app.school_phone', ''),
            'school_email' => config('app.school_email', ''),
            'school_logo' => config('app.school_logo', ''),
            'school_tagline' => config('app.school_tagline', 'Nurturing Minds, Building Futures'),
            'school_primary_color' => config('app.school_primary_color', '#2563eb'),
            'school_secondary_color' => config('app.school_secondary_color', '#f59e0b'),
        ];

        // Debug: Log the settings to see what's being retrieved
        \Log::info('App Settings for Report Card:', $appSettings);

        // Pre-format school information for reliable PDF rendering
        $schoolInfo = [
            'name' => $appSettings['school_name'] ?? 'Excellence Academy',
            'address' => $appSettings['school_address'] ?? '',
            'contact_line' => '',
            'tagline' => $appSettings['school_tagline'] ?? '',
        ];

        // Build contact line
        $contactParts = [];
        if (!empty($appSettings['school_phone'])) {
            $contactParts[] = 'Tel: ' . $appSettings['school_phone'];
        }
        if (!empty($appSettings['school_email'])) {
            $contactParts[] = 'Email: ' . $appSettings['school_email'];
        }
        $schoolInfo['contact_line'] = implode(' | ', $contactParts);

        $data = [
            'student' => $student,
            'term' => $term,
            'academic_session' => $term->academicSession, // Add the academic session
            'app_settings' => $appSettings, // Add app settings
            'school_info' => $schoolInfo, // Add pre-formatted school info
            'results' => $results,
            'statistics' => $statistics, // Add the statistics array
            'attendance' => $attendanceData, // Add attendance data
            'class_statistics' => $classStatistics,
            'grading_scale' => $gradingScale,
            'comments' => $comments,
            'generated_on' => now()->format('d/m/Y H:i'),
            'total_score' => $totalScore,
            'average_score' => round($averageScore, 1),
            'class_average' => round($classAverage, 1),
            'position' => $position,
            'teacher_comment' => $termResult?->teacher_comment ?: $this->generateTeacherComment($averageScore),
            'principal_comment' => $termResult?->principal_comment ?: $this->generatePrincipalComment($averageScore),
        ];

        $pdf = Pdf::loadView('reports.report-card-optimized', $data);
        
        return $pdf->download("report-card-{$student->admission_number}-{$term->name}.pdf");
    }

    /**
     * Calculate GPA based on average score (4.0 scale)
     */
    protected function calculateGPA($averageScore)
    {
        if ($averageScore >= 90) return 4.0;
        if ($averageScore >= 80) return 3.5;
        if ($averageScore >= 70) return 3.0;
        if ($averageScore >= 60) return 2.5;
        if ($averageScore >= 50) return 2.0;
        if ($averageScore >= 40) return 1.5;
        if ($averageScore >= 30) return 1.0;
        return 0.0;
    }

    /**
     * Calculate attendance data for a student in a term
     */
    protected function calculateAttendance($studentId, $termId)
    {
        // This is a placeholder implementation
        // You can replace this with actual attendance calculation logic
        // when you implement the attendance module
        
        // For now, we'll return a reasonable default
        return [
            'attendance_percentage' => 95, // Default to 95%
            'days_present' => 190,
            'days_absent' => 10,
            'total_days' => 200
        ];
    }

    /**
     * Get grading scale
     */
    protected function getGradingScale()
    {
        return [
            ['grade' => 'A+', 'range' => '90-100', 'remark' => 'Outstanding'],
            ['grade' => 'A', 'range' => '80-89', 'remark' => 'Excellent'],
            ['grade' => 'B+', 'range' => '70-79', 'remark' => 'Very Good'],
            ['grade' => 'B', 'range' => '60-69', 'remark' => 'Good'],
            ['grade' => 'C+', 'range' => '50-59', 'remark' => 'Fair'],
            ['grade' => 'C', 'range' => '45-49', 'remark' => 'Satisfactory'],
            ['grade' => 'D', 'range' => '40-44', 'remark' => 'Pass'],
            ['grade' => 'F', 'range' => '0-39', 'remark' => 'Fail']
        ];
    }

    /**
     * Get class statistics
     */
    protected function getClassStatistics($termId, $classroomId)
    {
        // Calculate class-wide statistics
        $classResults = Result::where('term_id', $termId)
            ->whereHas('student', function($query) use ($classroomId) {
                $query->where('classroom_id', $classroomId);
            })
            ->get();

        if ($classResults->isEmpty()) {
            return [
                'class_average' => 0,
                'highest_average' => 0,
                'lowest_average' => 0,
                'total_students' => 0
            ];
        }

        return [
            'class_average' => round($classResults->avg('total_score'), 1),
            'highest_average' => round($classResults->max('total_score'), 1),
            'lowest_average' => round($classResults->min('total_score'), 1),
            'total_students' => $classResults->groupBy('student_id')->count()
        ];
    }

    /**
     * Get comments for the report card
     */
    protected function getComments($termResult, $averageScore)
    {
        return [
            'class_teacher' => $termResult?->teacher_comment ?: $this->generateTeacherComment($averageScore),
            'principal' => $termResult?->principal_comment ?: $this->generatePrincipalComment($averageScore)
        ];
    }

}
