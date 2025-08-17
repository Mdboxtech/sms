<?php

namespace App\Http\Controllers;

use App\Models\Result;
use App\Models\Student;
use App\Models\Term;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;

class ReportCardController extends Controller
{
    public function index()
    {
        $terms = Term::with('academicSession')
            ->whereHas('academicSession', function($query) {
                $query->where('is_current', true);
            })
            ->get();

        $students = Student::with('user', 'classroom')->get();

        return Inertia::render('ReportCards/Index', [
            'terms' => $terms,
            'students' => $students
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

        $classAverage = Result::where('term_id', $term->id)
            ->whereHas('student', function($query) use ($student) {
                $query->where('classroom_id', $student->classroom_id);
            })
            ->avg('total_score');

        $position = $this->calculateStudentPosition($student->id, $term->id, $student->classroom_id);
        $averageScore = $results->avg('total_score');

        $data = [
            'student' => $student,
            'term' => $term,
            'results' => $results,
            'total_score' => $results->sum('total_score'),
            'average_score' => round($averageScore, 1),
            'class_average' => round($classAverage, 1),
            'position' => $position,
            'teacher_comment' => $this->generateTeacherComment($averageScore),
            'principal_comment' => $this->generatePrincipalComment($averageScore),
        ];

        $pdf = Pdf::loadView('reports.report-card', $data);
        
        return $pdf->download("report-card-{$student->admission_number}-{$term->name}.pdf");
    }

}
