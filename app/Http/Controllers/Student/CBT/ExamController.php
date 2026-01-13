<?php

namespace App\Http\Controllers\Student\CBT;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamSchedule;
use App\Models\StudentExamAttempt;
use App\Models\StudentAnswer;
use App\Models\Student;
use App\Services\ExamTakingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ExamController extends Controller
{
    protected $examTakingService;

    public function __construct(ExamTakingService $examTakingService)
    {
        $this->examTakingService = $examTakingService;
    }

    /**
     * Display available exams for the student
     */
    public function index(Request $request)
    {
        $student = Student::where('user_id', Auth::id())->firstOrFail();
        
        // Get exams available to this student's classroom
        $query = Exam::with(['subject', 'term', 'teacher'])
            ->whereHas('classrooms', function ($q) use ($student) {
                $q->where('classroom_id', $student->classroom_id);
            })
            ->where('is_active', true)
            ->where('is_published', true)
            ->where('status', '!=', 'cancelled')
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        if ($request->filled('status')) {
            if ($request->status === 'attempted') {
                $query->whereHas('studentAttempts', function ($q) use ($student) {
                    $q->where('student_id', $student->id);
                });
            } elseif ($request->status === 'available') {
                $query->whereDoesntHave('studentAttempts', function ($q) use ($student) {
                    $q->where('student_id', $student->id);
                });
            }
        }

        $exams = $query->paginate(15)->withQueryString();

    
        // Add attempt information for each exam
        $exams->getCollection()->transform(function ($exam) use ($student) {
            $attempt = $exam->studentAttempts()
                ->where('student_id', $student->id)
                ->first();
                
                $exam->student_attempt = $attempt;
                $exam->can_take = $this->examTakingService->canStudentTakeExam($student, $exam);
                $exam->time_remaining = $this->examTakingService->getExamTimeRemaining($exam, $attempt);
                $exam->exam_status = $this->examTakingService->getExamStatus($exam);
                $exam->time_until_start = $this->examTakingService->getTimeUntilStart($exam);
                
                return $exam;
            });
            

        return Inertia::render('Student/CBT/Exams/Index', [
            'exams' => $exams,
            'subjects' => $student->classroom->subjects()->orderBy('name')->get(),
            'filters' => $request->only(['search', 'subject_id', 'status']),
            'student' => $student->load('classroom')
        ]);
    }

    /**
     * Show exam timetable for the student
     */
    public function timetable(Request $request)
    {
        $student = Student::where('user_id', Auth::id())->firstOrFail();
        
        // Get scheduled exams for this student's classroom
        $examSchedules = Exam::with(['subject', 'term', 'teacher', 'classrooms'])
            ->whereHas('classrooms', function ($q) use ($student) {
                $q->where('classroom_id', $student->classroom_id);
            })
            ->where('is_active', true)
            ->where('is_published', true)
            ->where('status', '!=', 'cancelled')
            ->whereNotNull('start_time')
            ->orderBy('start_time')
            ->get();

        return Inertia::render('Student/CBT/Exams/Timetable', [
            'examSchedules' => $examSchedules,
            'student' => $student->load('classroom')
        ]);
    }
    /**
     * Show exam details and instructions
     */
    public function show(Exam $exam)
    {
        $student = Student::where('user_id', Auth::id())->firstOrFail();
        
        // Check if student has access to this exam
        if (!$exam->classrooms()->where('classroom_id', $student->classroom_id)->exists()) {
            abort(403, 'You do not have access to this exam');
        }

        $exam->load(['subject', 'term', 'teacher']);
        
        $attempt = $exam->studentAttempts()
            ->where('student_id', $student->id)
            ->first();

        $canTakeResult = $this->examTakingService->canStudentTakeExam($student, $exam);
        $timeRemaining = $this->examTakingService->getExamTimeRemaining($exam, $attempt);
        
        // Create a detailed canTake response
        $canTake = [
            'canTake' => $canTakeResult,
            'reason' => $canTakeResult ? null : $this->getCannotTakeReason($student, $exam, $attempt)
        ];

        return Inertia::render('Student/CBT/Exams/Show', [
            'exam' => $exam,
            'attempt' => $attempt,
            'canTake' => $canTake,
            'timeRemaining' => $timeRemaining,
            'student' => $student->load('classroom')
        ]);
    }

    /**
     * Start or resume an exam
     */
    public function take(Exam $exam)
    {
        $student = Student::where('user_id', Auth::id())->firstOrFail();
        
        // Check if student has access to this exam
        if (!$exam->classrooms()->where('classroom_id', $student->classroom_id)->exists()) {
            abort(403, 'You do not have access to this exam');
        }

        if (!$this->examTakingService->canStudentTakeExam($student, $exam)) {
            return redirect()
                ->route('student.cbt.exam.show', $exam)
                ->withErrors(['error' => 'You cannot take this exam at this time']);
        }

        try {
            $attempt = $this->examTakingService->startOrResumeExam($student, $exam);
            
            return Inertia::render('Student/CBT/Exams/Take', [
                'exam' => $exam->load(['subject', 'term', 'questions']),
                'attempt' => $attempt->load('answers'),
                'timeRemaining' => $this->examTakingService->getExamTimeRemaining($exam, $attempt),
                'student' => $student
            ]);
        } catch (\Exception $e) {
            return redirect()
                ->route('student.cbt.exam.show', $exam)
                ->withErrors(['error' => 'Failed to start exam: ' . $e->getMessage()]);
        }
    }

    /**
     * Save student answer
     */
    public function saveAnswer(Request $request, Exam $exam)
    {
        $student = Student::where('user_id', Auth::id())->firstOrFail();
        
        $request->validate([
            'question_id' => 'required|exists:questions,id',
            'answer' => 'required'
        ]);

        // Check if student has an active attempt
        $attempt = $exam->studentAttempts()
            ->where('student_id', $student->id)
            ->where('student_exam_attempts.status', 'in_progress')
            ->first();

        if (!$attempt) {
            return back()->withErrors(['error' => 'No active exam attempt found']);
        }

        // Check if exam time hasn't expired
        if ($this->examTakingService->getExamTimeRemaining($exam, $attempt) <= 0) {
            return back()->withErrors(['error' => 'Exam time has expired']);
        }

        try {
            $this->examTakingService->saveStudentAnswer(
                $attempt,
                $request->question_id,
                $request->answer
            );

            return back()->with('success', 'Answer saved successfully');
        } catch (\Exception $e) {
            \Log::error('Failed to save answer: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to save answer']);
        }
    }

    /**
     * Show exam result
     */
    public function result(Exam $exam)
    {
        $student = Student::where('user_id', Auth::id())->firstOrFail();
        
        $attempt = $exam->studentAttempts()
            ->where('student_id', $student->id)
            ->where('student_exam_attempts.status', 'completed')
            ->with(['answers.question'])
            ->first();

        if (!$attempt) {
            return redirect()
                ->route('student.cbt.exam.show', $exam)
                ->withErrors(['error' => 'No completed exam attempt found']);
        }

        // Check if results should be shown immediately
        if (!$exam->show_results_immediately && $exam->status !== 'completed') {
            return redirect()
                ->route('student.cbt.exam.show', $exam)
                ->with('info', 'Results will be available after the exam period ends');
        }

        $exam->load(['subject', 'term']);

        return Inertia::render('Student/CBT/Exams/Result', [
            'exam' => $exam,
            'attempt' => $attempt,
            'student' => $student->load('classroom')
        ]);
    }

    /**
     * Review exam (if allowed)
     */
    public function review(Exam $exam)
    {
        $student = Student::where('user_id', Auth::id())->firstOrFail();
        
        if (!$exam->allow_review) {
            return redirect()
                ->route('student.cbt.exams.result', $exam)
                ->withErrors(['error' => 'Review is not allowed for this exam']);
        }

        $attempt = $exam->studentAttempts()
            ->where('student_id', $student->id)
            ->where('student_exam_attempts.status', 'completed')
            ->with(['answers.question'])
            ->first();

        if (!$attempt) {
            return redirect()
                ->route('student.cbt.exam.show', $exam)
                ->withErrors(['error' => 'No completed exam attempt found']);
        }

        $exam->load(['subject', 'questions']);

        return Inertia::render('Student/CBT/Exams/Review', [
            'exam' => $exam,
            'attempt' => $attempt,
            'student' => $student->load('classroom')
        ]);
    }

    /**
     * Get exam timer status
     */
    public function timerStatus(Exam $exam)
    {
        $student = Student::where('user_id', Auth::id())->firstOrFail();
        
        $attempt = $exam->studentAttempts()
            ->where('student_id', $student->id)
            ->where('student_exam_attempts.status', 'in_progress')
            ->first();

        if (!$attempt) {
            return response()->json(['error' => 'No active exam attempt found'], 404);
        }

        $timeRemaining = $this->examTakingService->getExamTimeRemaining($exam, $attempt);

        // Auto-submit if time has expired
        if ($timeRemaining <= 0) {
            try {
                $this->examTakingService->submitExam($attempt);
                return response()->json(['expired' => true]);
            } catch (\Exception $e) {
                return response()->json(['error' => 'Failed to auto-submit exam'], 500);
            }
        }

        return response()->json([
            'timeRemaining' => $timeRemaining,
            'expired' => false
        ]);
    }

    /**
     * Start an exam attempt
     */
    public function start(Request $request, Exam $exam)
    {
        $student = Student::where('user_id', Auth::id())->firstOrFail();
        
        // Check if student has access to this exam
        if (!$exam->classrooms()->where('classroom_id', $student->classroom_id)->exists()) {
            abort(403, 'You do not have access to this exam');
        }

        if (!$this->examTakingService->canStudentTakeExam($student, $exam)) {
            return redirect()
                ->route('student.cbt.exam.show', $exam)
                ->withErrors(['error' => 'You cannot take this exam at this time']);
        }

        try {
            $attempt = $this->examTakingService->startOrResumeExam($student, $exam);
            
            return redirect()->route('student.cbt.exam.take', $exam);
        } catch (\Exception $e) {
            return redirect()
                ->route('student.cbt.exam.show', $exam)
                ->withErrors(['error' => 'Failed to start exam: ' . $e->getMessage()]);
        }
    }

    /**
     * Submit an answer to a question
     */
    public function submitAnswer(Request $request, StudentExamAttempt $attempt)
    {
        $student = Student::where('user_id', Auth::id())->firstOrFail();
        
        // Verify this attempt belongs to the student
        if ($attempt->student_id !== $student->id) {
            abort(403, 'You do not have access to this attempt');
        }

        // Load the exam relationship
        $attempt->load('exam');
        
        // Fallback: Get exam directly if relationship doesn't work
        if (!$attempt->exam && $attempt->exam_id) {
            $exam = Exam::find($attempt->exam_id);
        } else {
            $exam = $attempt->exam;
        }

        $request->validate([
            'question_id' => 'required|exists:questions,id',
            'answer' => 'required'
        ]);

        if ($attempt->status !== 'in_progress') {
            return back()->withErrors(['error' => 'Exam attempt is not in progress']);
        }

        // Check if exam time hasn't expired
        if ($this->examTakingService->getExamTimeRemaining($exam, $attempt) <= 0) {
            return back()->withErrors(['error' => 'Exam time has expired']);
        }

        try {
            $this->examTakingService->submitAnswer(
                $attempt,
                $request->question_id,
                $request->answer
            );

            return back()->with('success', 'Answer saved successfully');
        } catch (\Exception $e) {
            \Log::error('Failed to save answer: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to save answer']);
        }
    }

    /**
     * Flag/unflag a question for review
     */
    public function flagQuestion(Request $request, StudentExamAttempt $attempt)
    {
        $student = Student::where('user_id', Auth::id())->firstOrFail();
        
        // Verify this attempt belongs to the student
        if ($attempt->student_id !== $student->id) {
            abort(403, 'You do not have access to this attempt');
        }

        // Load the exam relationship
        $attempt->load('exam');

        $request->validate([
            'question_id' => 'required|exists:questions,id',
            'flagged' => 'required|boolean'
        ]);

        if ($attempt->status !== 'in_progress') {
            return back()->withErrors(['error' => 'Exam attempt is not in progress']);
        }

        try {
            if ($request->flagged) {
                $this->examTakingService->flagQuestion($attempt, $request->question_id);
            } else {
                $this->examTakingService->unflagQuestion($attempt, $request->question_id);
            }
            return back()->with('success', 'Question flagged successfully');
        } catch (\Exception $e) {
            \Log::error('Failed to flag question: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to flag question']);
        }
    }

    /**
     * Submit the entire exam
     */
    public function submit(Request $request, StudentExamAttempt $attempt)
    {
        $student = Student::where('user_id', Auth::id())->firstOrFail();
        
        // Verify this attempt belongs to the student
        if ($attempt->student_id !== $student->id) {
            abort(403, 'You do not have access to this attempt');
        }

        // Load the exam relationship
        $attempt->load('exam');
        
        // Fallback: Get exam directly if relationship doesn't work
        if (!$attempt->exam && $attempt->exam_id) {
            $exam = Exam::find($attempt->exam_id);
        } else {
            $exam = $attempt->exam;
        }

        if ($attempt->status !== 'in_progress') {
            return redirect()
                ->route('student.cbt.exam.show', $exam)
                ->withErrors(['error' => 'Exam attempt is not in progress']);
        }

        try {
            $this->examTakingService->submitExam($attempt);

            return redirect()
                ->route('student.cbt.exam.results', $attempt)
                ->with('success', 'Exam submitted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to submit exam: ' . $e->getMessage()]);
        }
    }

    /**
     * Show exam results by exam ID (finds student's most recent attempt)
     */
    public function examResults(Exam $exam)
    {
        $student = Student::where('user_id', Auth::id())->firstOrFail();
        
        // Find the student's most recent completed attempt for this exam
        $attempt = StudentExamAttempt::where('student_id', $student->id)
            ->where(function($query) use ($exam) {
                $query->where('exam_id', $exam->id)
                      ->orWhereHas('examSchedule', function($q) use ($exam) {
                          $q->where('exam_id', $exam->id);
                      });
            })
            ->where('status', 'completed')
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$attempt) {
            return redirect()->route('student.cbt.exam.show', $exam)
                ->with('error', 'No completed exam attempt found.');
        }

        // Redirect to the regular results page with the attempt ID
        return redirect()->route('student.cbt.exam.results', $attempt->id);
    }

    /**
     * Show exam results
     */
    public function results($id)
    {
        // FIXED: Use Student ID lookup instead of User ID
        $student = Student::where('user_id', Auth::id())->firstOrFail();
        
        $attempt = StudentExamAttempt::where('student_id', $student->id)
            ->findOrFail($id);

        // Load student and answers relationships
        $attempt->load(['student', 'answers.question']);

        // Always use direct lookup for exam to avoid relationship issues
        $exam = null;
        if ($attempt->exam_id) {
            $exam = Exam::with(['term', 'subject'])->find($attempt->exam_id);
        } elseif ($attempt->exam_schedule_id) {
            $examSchedule = ExamSchedule::with('exam.term', 'exam.subject')->find($attempt->exam_schedule_id);
            $exam = $examSchedule ? $examSchedule->exam : null;
        }

        return Inertia::render('Student/CBT/Exams/Results', [
            'attempt' => $attempt,
            'exam' => $exam,
            'answers' => $attempt->answers, // Use loaded relationship
        ]);
    }

    /**
     * Show all exam results for the student
     */
    public function allResults(Request $request)
    {
        $student = Student::where('user_id', Auth::id())->firstOrFail();
        
        $query = StudentExamAttempt::with(['exam.subject', 'exam.term'])
            ->where('student_id', $student->id)
            ->where('status', 'completed')
            ->orderBy('completed_at', 'desc');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('exam', function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%");
            });
        }

        if ($request->filled('subject_id')) {
            $query->whereHas('exam', function ($q) use ($request) {
                $q->where('subject_id', $request->subject_id);
            });
        }

        $attempts = $query->paginate(15)->withQueryString();

        return Inertia::render('Student/CBT/Results/Index', [
            'attempts' => $attempts,
            'subjects' => $student->classroom->subjects()->orderBy('name')->get(),
            'filters' => $request->only(['search', 'subject_id']),
            'student' => $student->load('classroom')
        ]);
    }

    private function getCannotTakeReason($student, $exam, $attempt)
    {
        // If already attempted
        if ($attempt) {
            return $attempt->status === 'completed' 
                ? 'You have already completed this exam.' 
                : 'You have already started this exam.';
        }

        // Check if exam is scheduled
        if (!$exam->start_time || !$exam->end_time) {
            return 'This exam has not been scheduled yet.';
        }

        $now = now();
        
        // Check if exam hasn't started yet
        if ($now->lt($exam->start_time)) {
            return 'This exam is not yet available. It will start on ' . 
                   $exam->start_time->format('M j, Y \a\t g:i A');
        }

        // Check if exam has ended
        if ($now->gt($exam->end_time)) {
            return 'This exam has ended. It was available until ' . 
                   $exam->end_time->format('M j, Y \a\t g:i A');
        }

        // If we get here and canTake is false, it might be a permission issue
        return 'You are not authorized to take this exam.';
    }
}
