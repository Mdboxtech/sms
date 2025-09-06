<?php

namespace App\Http\Controllers\Student\CBT;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentExamAttempt;
use App\Models\Result;
use App\Models\Term;
use App\Models\AcademicSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ResultController extends Controller
{
    /**
     * Display all CBT results for the student
     */
    public function index(Request $request)
    {
        $student = Student::where('user_id', Auth::id())->firstOrFail();
        
        // Get filter parameters
        $termId = $request->get('term_id');
        $academicSessionId = $request->get('academic_session_id');
        
        // Build query for CBT attempts
        $attemptsQuery = StudentExamAttempt::where('student_id', $student->id)
            ->whereIn('status', ['submitted', 'auto_submitted'])
            ->with(['exam.subject', 'exam.term', 'exam.teacher'])
            ->orderBy('end_time', 'desc');
            
        // Apply filters
        if ($termId) {
            $attemptsQuery->whereHas('exam', function($q) use ($termId) {
                $q->where('term_id', $termId);
            });
        }
        
        if ($academicSessionId) {
            $attemptsQuery->whereHas('exam.term', function($q) use ($academicSessionId) {
                $q->where('academic_session_id', $academicSessionId);
            });
        }
        
        $attempts = $attemptsQuery->paginate(10);
        
        // Get filter options
        $terms = Term::orderBy('name')->get();
        $academicSessions = AcademicSession::orderBy('start_date', 'desc')->get();
        
        // Get CBT results (linked to Result model)
        $resultsQuery = Result::where('student_id', $student->id)
            ->where('is_cbt_exam', true)
            ->with(['subject', 'term', 'teacher.user', 'cbtExamAttempt.exam']);
            
        if ($termId) {
            $resultsQuery->where('term_id', $termId);
        }
        
        $results = $resultsQuery->get();
        
        return Inertia::render('Student/CBT/Results/Index', [
            'attempts' => $attempts,
            'results' => $results,
            'terms' => $terms,
            'academicSessions' => $academicSessions,
            'filters' => [
                'term_id' => $termId,
                'academic_session_id' => $academicSessionId,
            ],
            'student' => $student->load('classroom')
        ]);
    }
    
    /**
     * Show detailed result for a specific CBT attempt
     */
    public function show(StudentExamAttempt $attempt)
    {
        $student = Student::where('user_id', Auth::id())->firstOrFail();
        
        // Verify this attempt belongs to the student
        if ($attempt->student_id !== $student->id) {
            abort(403, 'You do not have access to this result');
        }
        
        if ($attempt->status !== 'submitted') {
            return redirect()
                ->route('student.cbt.results.index')
                ->withErrors(['error' => 'This exam has not been completed yet']);
        }
        
        $attempt->load([
            'exam.subject',
            'exam.term', 
            'exam.teacher',
            'answers.question'
        ]);
        
        // Get the associated result if any
        $result = Result::where('cbt_exam_attempt_id', $attempt->id)->first();
        
        return Inertia::render('Student/CBT/Results/Show', [
            'attempt' => $attempt,
            'result' => $result,
            'student' => $student->load('classroom')
        ]);
    }
    
    /**
     * Generate and display report card with CBT results
     */
    public function reportCard(Request $request)
    {
        $student = Student::where('user_id', Auth::id())->firstOrFail();
        
        $termId = $request->get('term_id');
        $academicSessionId = $request->get('academic_session_id');
        
        if (!$termId) {
            return back()->withErrors(['error' => 'Please select a term to generate report card']);
        }
        
        $term = Term::findOrFail($termId);
        $academicSession = $academicSessionId ? AcademicSession::find($academicSessionId) : null;
        
        // Get all results for the term (both CBT and traditional)
        $resultsQuery = Result::where('student_id', $student->id)
            ->where('term_id', $termId)
            ->with(['subject', 'teacher.user', 'cbtExamAttempt']);
            
        if ($academicSessionId) {
            $resultsQuery->whereHas('subject', function($q) use ($academicSessionId) {
                // You might need to adjust this based on your subject-academic session relationship
                // For now, we'll get all results for the term
            });
        }
        
        $results = $resultsQuery->get();
        
        // Separate CBT and traditional results
        $cbtResults = $results->where('is_cbt_exam', true);
        $traditionalResults = $results->where('is_cbt_exam', false);
        
        // Calculate statistics
        $totalSubjects = $results->count();
        $totalScore = $results->sum('total_score');
        $averageScore = $totalSubjects > 0 ? $totalScore / $totalSubjects : 0;
        
        // Get class statistics for comparison (only if student has classroom)
        $classResults = collect();
        $classAverage = 0;
        
        if ($student->classroom_id) {
            $classResults = Result::where('term_id', $termId)
                ->whereHas('student', function($q) use ($student) {
                    $q->where('classroom_id', $student->classroom_id);
                })
                ->get();
                
            $classAverage = $classResults->count() > 0 ? $classResults->avg('total_score') : 0;
        }
        
        return Inertia::render('Student/CBT/Results/ReportCard', [
            'student' => $student->load(['classroom', 'classroom.academicSession']),
            'term' => $term,
            'academicSession' => $academicSession,
            'results' => $results,
            'cbtResults' => $cbtResults,
            'traditionalResults' => $traditionalResults,
            'statistics' => [
                'total_subjects' => $totalSubjects,
                'total_score' => $totalScore,
                'average_score' => round($averageScore, 2),
                'class_average' => round($classAverage, 2),
            ],
            'terms' => Term::orderBy('name')->get(),
            'academicSessions' => AcademicSession::orderBy('start_date', 'desc')->get(),
        ]);
    }
}
