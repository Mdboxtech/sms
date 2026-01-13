<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Result;
use App\Models\Term;
use App\Services\ReportCardService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ResultController extends Controller
{
    /**
     * Display results for the authenticated student
     */
    public function index(Request $request)
    {
        $student = Auth::user()->student;
        
        if (!$student) {
            return redirect()->route('student.dashboard')
                ->with('error', 'Student profile not found.');
        }

        $query = Result::where('student_id', $student->id)
            ->with(['subject', 'term.academicSession', 'teacher.user'])
            ->when($request->term_id, function ($query, $term_id) {
                return $query->where('term_id', $term_id);
            })
            ->when($request->subject_id, function ($query, $subject_id) {
                return $query->where('subject_id', $subject_id);
            })
            ->latest();

        $reportCardService = new ReportCardService();

        // Get results with grades
        $results = $query->get()->map(function ($result) use ($reportCardService) {
            $gradeInfo = $reportCardService->calculateGrade($result->total_score);
            $result->grade_info = $gradeInfo;
            return $result;
        });

        // Group results by term for better organization
        $resultsByTerm = $results->groupBy(function ($result) {
            return $result->term->name . ' - ' . $result->term->academicSession->name;
        });

        return Inertia::render('Student/Results/Index', [
            'results_by_term' => $resultsByTerm,
            'terms' => Term::with('academicSession')->get(),
            'subjects' => $student->classroom->subjects ?? collect(),
            'filters' => $request->only(['term_id', 'subject_id']),
            'student' => $student->load(['user', 'classroom'])
        ]);
    }

    /**
     * Show detailed view of results for a specific term
     */
    public function showTerm(Term $term)
    {
        $student = Auth::user()->student;
        
        if (!$student) {
            return redirect()->route('student.dashboard')
                ->with('error', 'Student profile not found.');
        }

        $results = Result::where('student_id', $student->id)
            ->where('term_id', $term->id)
            ->with(['subject', 'teacher.user'])
            ->orderBy('subject_id')
            ->get();

        $reportCardService = new ReportCardService();

        // Calculate statistics
        $statistics = [
            'total_subjects' => $results->count(),
            'total_score' => $results->sum('total_score'),
            'average_score' => $results->avg('total_score'),
            'highest_score' => $results->max('total_score'),
            'lowest_score' => $results->min('total_score'),
        ];

        // Add grade information to each result
        $results = $results->map(function ($result) use ($reportCardService) {
            $gradeInfo = $reportCardService->calculateGrade($result->total_score);
            $result->grade_info = $gradeInfo;
            return $result;
        });

        // Get class average for comparison (if available)
        $classAverage = Result::where('term_id', $term->id)
            ->whereHas('student', function($query) use ($student) {
                $query->where('classroom_id', $student->classroom_id);
            })
            ->avg('total_score');

        return Inertia::render('Student/Results/TermView', [
            'results' => $results,
            'term' => $term->load('academicSession'),
            'statistics' => $statistics,
            'class_average' => $classAverage,
            'student' => $student->load(['user', 'classroom'])
        ]);
    }

    /**
     * Generate and download report card for a specific term
     */
    public function downloadReportCard(Term $term)
    {
        // Add debug info at the start
        \Log::info('Report Card Route accessed', [
            'term_id' => $term->id,
            'term_name' => $term->name,
            'user_id' => Auth::id(),
            'url' => request()->url()
        ]);

        $student = Auth::user()->student;
        
        if (!$student) {
            \Log::error('Report Card Error: Student profile not found for user ID: ' . Auth::id());
            
            // Return JSON response for debugging if this is an AJAX request
            if (request()->expectsJson()) {
                return response()->json(['error' => 'Student profile not found', 'user_id' => Auth::id()], 404);
            }
            
            return redirect()->back()
                ->with('error', 'Student profile not found. Please contact administrator.');
        }

        \Log::info('Student found', [
            'student_id' => $student->id,
            'admission_number' => $student->admission_number
        ]);

        // Check if student has results for this term
        $resultsCount = Result::where('student_id', $student->id)
            ->where('term_id', $term->id)
            ->count();
        
        \Log::info('Results check', [
            'student_id' => $student->id,
            'term_id' => $term->id,
            'results_count' => $resultsCount
        ]);

        if ($resultsCount === 0) {
            \Log::error('Report Card Error: No results found for student ID: ' . $student->id . ', term ID: ' . $term->id);
            
            // Return JSON response for debugging if this is an AJAX request
            if (request()->expectsJson()) {
                return response()->json(['error' => 'No results found', 'student_id' => $student->id, 'term_id' => $term->id], 404);
            }
            
            return redirect()->back()
                ->with('error', 'No results found for this term. Please contact your teacher.');
        }

        try {
            \Log::info('Report Card: Starting generation for student ID: ' . $student->id . ', term ID: ' . $term->id);
            $reportCardService = new ReportCardService();
            $pdf = $reportCardService->generateReportCard($student, $term);
            
            $fileName = "report_card_{$student->admission_number}_{$term->name}.pdf";
            \Log::info('Report Card: Successfully generated PDF for: ' . $fileName);
            
            return $pdf->download($fileName);
            
        } catch (\Exception $e) {
            \Log::error('Report Card Generation Error: ' . $e->getMessage(), [
                'student_id' => $student->id,
                'term_id' => $term->id,
                'error_message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'stack_trace' => $e->getTraceAsString()
            ]);
            
            // Return JSON response for debugging if this is an AJAX request
            if (request()->expectsJson()) {
                return response()->json([
                    'error' => 'Failed to generate report card', 
                    'message' => $e->getMessage(),
                    'student_id' => $student->id,
                    'term_id' => $term->id
                ], 500);
            }
            
            return redirect()->back()
                ->with('error', 'Failed to generate report card: ' . $e->getMessage());
        }
    }

    /**
     * Show academic progress over time
     */
    public function progress()
    {
        $student = Auth::user()->student;
        
        if (!$student) {
            return redirect()->route('student.dashboard')
                ->with('error', 'Student profile not found.');
        }

        // Get results grouped by term
        $results = Result::where('student_id', $student->id)
            ->with(['subject', 'term.academicSession'])
            ->orderBy('term_id')
            ->get()
            ->groupBy('term_id');

        $progressData = [];
        $reportCardService = new ReportCardService();

        foreach ($results as $termId => $termResults) {
            $term = $termResults->first()->term;
            $averageScore = $termResults->avg('total_score');
            $totalSubjects = $termResults->count();
            
            $progressData[] = [
                'term' => $term->name . ' - ' . $term->academicSession->name,
                'term_id' => $termId,
                'average_score' => round($averageScore, 2),
                'total_subjects' => $totalSubjects,
                'grade_info' => $reportCardService->calculateGrade($averageScore),
                'results_count' => $termResults->count()
            ];
        }

        return Inertia::render('Student/Results/Progress', [
            'progress_data' => $progressData,
            'student' => $student->load(['user', 'classroom'])
        ]);
    }
}
