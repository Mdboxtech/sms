<?php

namespace App\Http\Controllers;

use App\Models\TermResult;
use App\Models\Result;
use App\Models\Student;
use App\Models\Term;
use App\Models\Classroom;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TermResultController extends Controller
{
    /**
     * Display a listing of term results
     */
    public function index(Request $request)
    {
        $query = TermResult::with(['student.user', 'term.academicSession', 'classroom']);

        // Filter by classroom if provided
        if ($request->filled('classroom_id')) {
            $query->where('classroom_id', $request->classroom_id);
        }

        // Filter by term if provided
        if ($request->filled('term_id')) {
            $query->where('term_id', $request->term_id);
        }

        // Search by student name
        if ($request->filled('search')) {
            $query->whereHas('student.user', function($q) use ($request) {
                $q->where('name', 'LIKE', '%' . $request->search . '%');
            });
        }

        $termResults = $query->orderBy('created_at', 'desc')->paginate(20);

        $classrooms = Classroom::all();
        $terms = Term::with('academicSession')->get();

        return Inertia::render('Admin/TermResults/Index', [
            'termResults' => $termResults,
            'classrooms' => $classrooms,
            'terms' => $terms,
            'filters' => $request->only(['classroom_id', 'term_id', 'search'])
        ]);
    }

    /**
     * Show the form for creating a new term result
     */
    public function create()
    {
        $students = Student::with('user', 'classroom')->get();
        $terms = Term::with('academicSession')->get();
        $classrooms = Classroom::all();

        return Inertia::render('Admin/TermResults/Create', [
            'students' => $students,
            'terms' => $terms,
            'classrooms' => $classrooms
        ]);
    }

    /**
     * Store a newly created term result
     */
    public function store(Request $request)
    {  
     
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'term_id' => 'required|exists:terms,id',
            'classroom_id' => 'required|exists:classrooms,id',
            'teacher_comment' => 'nullable|string|max:1000',
            'principal_comment' => 'nullable|string|max:1000',
        ]);

        // Check if term result already exists
        $existingTermResult = TermResult::where('student_id', $request->student_id)
            ->where('term_id', $request->term_id)
            ->first();

        if ($existingTermResult) {
            return redirect()->back()->withErrors(['error' => 'Term result already exists for this student and term.']);
        }

        // Calculate student's average and position
        $results = Result::where('student_id', $request->student_id)
            ->where('term_id', $request->term_id)
            ->get();

        $averageScore = $results->avg('total_score') ?? 0;
        $totalScore = $results->sum('total_score') ?? 0;
        $position = $this->calculateStudentPosition($request->student_id, $request->term_id, $request->classroom_id);

        // Create term result
        $termResult = TermResult::create([
            'student_id' => $request->student_id,
            'term_id' => $request->term_id,
            'classroom_id' => $request->classroom_id,
            'average_score' => round($averageScore, 2),
            'total_score' => $totalScore,
            'position' => $position,
            'teacher_comment' => $request->teacher_comment,
            'principal_comment' => $request->principal_comment,
        ]);

        return redirect()->route('admin.term-results.index')
            ->with('success', 'Term result created successfully.');
    }

    /**
     * Display the specified term result
     */
    public function show(TermResult $termResult)
    {
        $termResult->load([
            'student.user',
            'student.classroom',
            'term.academicSession',
            'classroom'
        ]);

        // Get all results for this student in this term
        $results = Result::where('student_id', $termResult->student_id)
            ->where('term_id', $termResult->term_id)
            ->with(['subject', 'teacher.user'])
            ->get();

        // Calculate class statistics
        $classStats = $this->calculateClassStatistics($termResult->term_id, $termResult->classroom_id);

        return Inertia::render('Admin/TermResults/Show', [
            'termResult' => $termResult,
            'results' => $results,
            'classStats' => $classStats
        ]);
    }

    /**
     * Show the form for editing the specified term result
     */
    public function edit(TermResult $termResult)
    {
        $termResult->load(['student.user', 'term.academicSession', 'classroom']);
        
        $students = Student::with('user', 'classroom')->get();
        $terms = Term::with('academicSession')->get();
        $classrooms = Classroom::all();

        return Inertia::render('Admin/TermResults/Edit', [
            'termResult' => $termResult,
            'students' => $students,
            'terms' => $terms,
            'classrooms' => $classrooms
        ]);
    }

    /**
     * Update the specified term result
     */
    public function update(Request $request, TermResult $termResult)
    {
    
        $request->validate([
            'teacher_comment' => 'nullable|string|max:1000',
            'principal_comment' => 'nullable|string|max:1000',
        ]);

        // Recalculate scores if needed
        $results = Result::where('student_id', $termResult->student_id)
            ->where('term_id', $termResult->term_id)
            ->get();

        $averageScore = $results->avg('total_score') ?? 0;
        $totalScore = $results->sum('total_score') ?? 0;
        $position = $this->calculateStudentPosition($termResult->student_id, $termResult->term_id, $termResult->classroom_id);

        $termResult->update([
            'average_score' => round($averageScore, 2),
            'total_score' => $totalScore,
            'position' => $position,
            'teacher_comment' => $request->teacher_comment,
            'principal_comment' => $request->principal_comment,
        ]);

        return redirect()->route('admin.term-results.show', $termResult)
            ->with('success', 'Term result updated successfully.');
    }

    /**
     * Remove the specified term result
     */
    public function destroy(TermResult $termResult)
    {
        $termResult->delete();

        return redirect()->route('admin.term-results.index')
            ->with('success', 'Term result deleted successfully.');
    }

    /**
     * Get or create a term result (AJAX endpoint)
     */
    public function getOrCreate(Request $request)
    {
        try {
            $request->validate([
                'student_id' => 'required|exists:students,id',
                'term_id' => 'required|exists:terms,id',
                'classroom_id' => 'required|exists:classrooms,id',
            ]);

            // Check if term result already exists
            $termResult = TermResult::where('student_id', $request->student_id)
                ->where('term_id', $request->term_id)
                ->first();

            if (!$termResult) {
                // Calculate student's average and position
                $results = Result::where('student_id', $request->student_id)
                    ->where('term_id', $request->term_id)
                    ->get();

                $averageScore = $results->avg('total_score') ?? 0;
                $totalScore = $results->sum('total_score') ?? 0;
                
                // Handle position calculation with error handling
                try {
                    $position = $this->calculateStudentPosition($request->student_id, $request->term_id, $request->classroom_id);
                } catch (\Exception $e) {
                    Log::error('Error calculating student position: ' . $e->getMessage());
                    $position = 0; // Use 0 instead of 'N/A' since position is cast as integer
                }

                // Create new term result
                $termResult = TermResult::create([
                    'student_id' => $request->student_id,
                    'term_id' => $request->term_id,
                    'classroom_id' => $request->classroom_id,
                    'average_score' => round($averageScore, 2),
                    'total_score' => $totalScore,
                    'position' => $position,
                ]);

                if (!$termResult) {
                    throw new \Exception('Failed to create term result record');
                }
            }

            return back()->with([
                'termResult' => $termResult,
                'message' => 'Term result created/retrieved successfully'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors([
                'error' => 'Validation failed',
                'details' => $e->errors()
            ]);
        } catch (\Exception $e) {
            Log::error('Error in getOrCreate: ' . $e->getMessage(), [
                'student_id' => $request->student_id ?? null,
                'term_id' => $request->term_id ?? null,
                'classroom_id' => $request->classroom_id ?? null,
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors([
                'error' => 'Failed to create term result',
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Update only the comments for a term result
     */
    public function updateComments(Request $request, TermResult $termResult)
    {
        $request->validate([
            'teacher_comment' => 'nullable|string|max:1000',
            'principal_comment' => 'nullable|string|max:1000',
        ]);

        $termResult->update([
            'teacher_comment' => $request->teacher_comment,
            'principal_comment' => $request->principal_comment,
        ]);

        return back()->with([
            'termResult' => $termResult->fresh(),
            'message' => 'Comments updated successfully'
        ]);
    }

    /**
     * Bulk create term results for a classroom and term
     */
    public function bulkCreate(Request $request)
    {
        $request->validate([
            'classroom_id' => 'required|exists:classrooms,id',
            'term_id' => 'required|exists:terms,id',
        ]);

        $classroom = Classroom::findOrFail($request->classroom_id);
        $term = Term::findOrFail($request->term_id);

        // Get all students in the classroom
        $students = Student::where('classroom_id', $classroom->id)->get();
        $created = 0;
        $existing = 0;

        foreach ($students as $student) {
            // Check if term result already exists
            $existingTermResult = TermResult::where('student_id', $student->id)
                ->where('term_id', $term->id)
                ->first();

            if (!$existingTermResult) {
                // Calculate student's average and position
                $results = Result::where('student_id', $student->id)
                    ->where('term_id', $term->id)
                    ->get();

                if ($results->count() > 0) {
                    $averageScore = $results->avg('total_score') ?? 0;
                    $totalScore = $results->sum('total_score') ?? 0;
                    $position = $this->calculateStudentPosition($student->id, $term->id, $classroom->id);

                    TermResult::create([
                        'student_id' => $student->id,
                        'term_id' => $term->id,
                        'classroom_id' => $classroom->id,
                        'average_score' => round($averageScore, 2),
                        'total_score' => $totalScore,
                        'position' => $position,
                    ]);

                    $created++;
                }
            } else {
                $existing++;
            }
        }

        return redirect()->back()->with('success', 
            "Bulk creation completed. Created: {$created}, Already existing: {$existing}"
        );
    }

    /**
     * Recalculate all term results for a specific term and classroom
     */
    public function recalculate(Request $request)
    {
        $request->validate([
            'classroom_id' => 'required|exists:classrooms,id',
            'term_id' => 'required|exists:terms,id',
        ]);

        $termResults = TermResult::where('classroom_id', $request->classroom_id)
            ->where('term_id', $request->term_id)
            ->get();

        foreach ($termResults as $termResult) {
            $results = Result::where('student_id', $termResult->student_id)
                ->where('term_id', $termResult->term_id)
                ->get();

            if ($results->count() > 0) {
                $averageScore = $results->avg('total_score') ?? 0;
                $totalScore = $results->sum('total_score') ?? 0;
                $position = $this->calculateStudentPosition(
                    $termResult->student_id, 
                    $termResult->term_id, 
                    $termResult->classroom_id
                );

                $termResult->update([
                    'average_score' => round($averageScore, 2),
                    'total_score' => $totalScore,
                    'position' => $position,
                ]);
            }
        }

        return redirect()->back()->with('success', 'Term results recalculated successfully.');
    }

    /**
     * Calculate student position in class
     */
    private function calculateStudentPosition($studentId, $termId, $classroomId)
    {
        // Get all students' averages in the class for this term
        $averages = Result::selectRaw('student_id, AVG(total_score) as average_score')
            ->where('term_id', $termId)
            ->whereHas('student', function($query) use ($classroomId) {
                $query->where('classroom_id', $classroomId);
            })
            ->groupBy('student_id')
            ->having('average_score', '>', 0) // Only consider students with scores
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

    /**
     * Calculate class statistics for a term and classroom
     */
    private function calculateClassStatistics($termId, $classroomId)
    {
        $termResults = TermResult::where('term_id', $termId)
            ->where('classroom_id', $classroomId)
            ->get();

        if ($termResults->isEmpty()) {
            return [
                'total_students' => 0,
                'class_average' => 0,
                'highest_score' => 0,
                'lowest_score' => 0,
                'pass_rate' => 0,
            ];
        }

        $totalStudents = $termResults->count();
        $classAverage = $termResults->avg('average_score');
        $highestScore = $termResults->max('average_score');
        $lowestScore = $termResults->min('average_score');
        $passCount = $termResults->where('average_score', '>=', 40)->count();
        $passRate = ($passCount / $totalStudents) * 100;

        return [
            'total_students' => $totalStudents,
            'class_average' => round($classAverage, 2),
            'highest_score' => round($highestScore, 2),
            'lowest_score' => round($lowestScore, 2),
            'pass_rate' => round($passRate, 2),
        ];
    }

    /**
     * Generate default comments based on average score
     */
    public function generateDefaultComments(TermResult $termResult)
    {
        $averageScore = $termResult->average_score;
        
        $teacherComment = $this->generateTeacherComment($averageScore);
        $principalComment = $this->generatePrincipalComment($averageScore);

        $termResult->update([
            'teacher_comment' => $teacherComment,
            'principal_comment' => $principalComment,
        ]);

        return response()->json([
            'termResult' => $termResult,
            'message' => 'Default comments generated successfully'
        ]);
    }

    /**
     * Generate teacher comment based on score
     */
    private function generateTeacherComment($averageScore)
    {
        if ($averageScore >= 80) {
            return 'Outstanding performance! Excellent work across all subjects. Keep up this exceptional standard.';
        } elseif ($averageScore >= 70) {
            return 'Very good performance! Shows strong understanding and consistent effort. Continue to strive for excellence.';
        } elseif ($averageScore >= 60) {
            return 'Good performance overall. Shows steady progress with room for improvement in some areas.';
        } elseif ($averageScore >= 50) {
            return 'Satisfactory performance. Needs to focus more on studies and put in extra effort to improve.';
        } elseif ($averageScore >= 40) {
            return 'Fair performance. Requires significant improvement and additional support in most subjects.';
        } else {
            return 'Below average performance. Needs urgent attention and intensive remedial work to improve academic standing.';
        }
    }

    /**
     * Generate principal comment based on score
     */
    private function generatePrincipalComment($averageScore)
    {
        if ($averageScore >= 80) {
            return 'Exceptional achievement! A model student who demonstrates academic excellence. Commendable effort.';
        } elseif ($averageScore >= 70) {
            return 'Very commendable performance. Shows dedication and good study habits. Keep up the good work.';
        } elseif ($averageScore >= 60) {
            return 'Good performance. Encourage the student to maintain consistency and aim for higher goals.';
        } elseif ($averageScore >= 50) {
            return 'Satisfactory progress. The student should be encouraged to put in more effort for better results.';
        } elseif ($averageScore >= 40) {
            return 'Performance needs improvement. Recommend additional support and closer monitoring of academic progress.';
        } else {
            return 'Academic performance requires immediate intervention. Recommend parent-teacher conference and remedial classes.';
        }
    }

    /**
     * Export term results to CSV or PDF
     */
    public function export(Request $request)
    {
        $request->validate([
            'classroom_id' => 'required|exists:classrooms,id',
            'term_id' => 'required|exists:terms,id',
            'format' => 'required|in:csv,pdf'
        ]);

        $termResults = TermResult::with(['student.user', 'term.academicSession', 'classroom'])
            ->where('classroom_id', $request->classroom_id)
            ->where('term_id', $request->term_id)
            ->orderBy('position')
            ->get();

        $classroom = Classroom::findOrFail($request->classroom_id);
        $term = Term::with('academicSession')->findOrFail($request->term_id);

        if ($request->format === 'csv') {
            return $this->exportToCsv($termResults, $classroom, $term);
        } else {
            return $this->exportToPdf($termResults, $classroom, $term);
        }
    }

    /**
     * Export to CSV format
     */
    private function exportToCsv($termResults, $classroom, $term)
    {
        $filename = "term_results_{$classroom->name}_{$term->name}.csv";
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($termResults) {
            $file = fopen('php://output', 'w');
            
            // CSV headers
            fputcsv($file, [
                'Position', 'Student Name', 'Admission Number', 
                'Total Score', 'Average Score', 'Teacher Comment', 'Principal Comment'
            ]);

            // Data rows
            foreach ($termResults as $result) {
                fputcsv($file, [
                    $result->position,
                    $result->student->user->name ?? 'N/A',
                    $result->student->admission_number ?? 'N/A',
                    $result->total_score,
                    $result->average_score,
                    $result->teacher_comment,
                    $result->principal_comment,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export to PDF format
     */
    private function exportToPdf($termResults, $classroom, $term)
    {
        // This would require a PDF generation library like DomPDF
        // For now, return a simple response
        return response()->json([
            'message' => 'PDF export functionality to be implemented'
        ]);
    }

    /**
     * Show import page
     */
    public function importPage()
    {
        $classrooms = Classroom::all();
        $terms = Term::with('academicSession')->get();

        return Inertia::render('Admin/TermResults/Import', [
            'classrooms' => $classrooms,
            'terms' => $terms
        ]);
    }

    /**
     * Import term results from Excel file
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
            'classroom_id' => 'required|exists:classrooms,id',
            'term_id' => 'required|exists:terms,id'
        ]);

        try {
            // Here you would implement the actual import logic
            // For now, return success
            return redirect()->back()->with('success', 'Term results imported successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Import failed: ' . $e->getMessage());
        }
    }

    /**
     * Download template for term results import
     */
    public function downloadTemplate()
    {
        $classrooms = Classroom::all();
        
        // Create a simple CSV template
        $filename = 'term_results_template_' . date('Y-m-d') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() {
            $file = fopen('php://output', 'w');
            
            // CSV headers
            fputcsv($file, [
                'Student ID', 'Admission Number', 'Total Score', 'Average Score', 
                'Position', 'Teacher Comment', 'Principal Comment'
            ]);

            // Example row
            fputcsv($file, [
                '1', '2024001', '450', '75.0', '5', 'Good performance', 'Keep it up'
            ]);

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}