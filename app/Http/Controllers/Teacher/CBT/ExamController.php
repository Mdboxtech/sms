<?php

namespace App\Http\Controllers\Teacher\CBT;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\Subject;
use App\Models\Term;
use App\Models\Classroom;
use App\Models\Teacher;
use App\Models\Question;
use App\Services\CBTService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ExamController extends Controller
{
    protected $cbtService;

    public function __construct(CBTService $cbtService)
    {
        $this->cbtService = $cbtService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $teacher = Auth::user()->teacher;
        
        if (!$teacher) {
            return back()->withErrors(['error' => 'Teacher profile not found.']);
        }

        $query = Exam::with(['subject', 'term', 'classrooms'])
            ->where('teacher_id', $teacher->user_id)
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
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $exams = $query->paginate(10)->withQueryString();

        // Get teacher's subjects for filter
        $subjects = Subject::whereHas('teachers', function ($q) use ($teacher) {
            $q->where('teacher_id', $teacher->id);
        })->get();

        // Get teacher's classrooms for filter
        $classrooms = Classroom::whereHas('teachers', function ($q) use ($teacher) {
            $q->where('teacher_id', $teacher->id);
        })->get();

        return Inertia::render('Teacher/CBT/Exams/Index', [
            'exams' => $exams,
            'subjects' => $subjects,
            'classrooms' => $classrooms,
            'filters' => $request->only(['search', 'subject_id', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $teacher = Auth::user()->teacher;
        
        if (!$teacher) {
            return back()->withErrors(['error' => 'Teacher profile not found.']);
        }

        // Get teacher's subjects
        $subjects = Subject::whereHas('teachers', function ($q) use ($teacher) {
            $q->where('teacher_id', $teacher->id);
        })->get();

        // Get teacher's classrooms
        $classrooms = Classroom::whereHas('teachers', function ($q) use ($teacher) {
            $q->where('teacher_id', $teacher->id);
        })->get();

        $terms = Term::orderBy('name')->get();

        // Get teacher's questions for exam building
        $questions = Question::where('teacher_id', $teacher->user_id)
            ->with('subject')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Teacher/CBT/Exams/Create', [
            'subjects' => $subjects,
            'classrooms' => $classrooms,
            'terms' => $terms,
            'questions' => $questions,
            'examTypes' => [
                'quiz' => 'Quiz',
                'test' => 'Test',
                'exam' => 'Exam',
                'assignment' => 'Assignment'
            ],
            'difficultyLevels' => [
                'easy' => 'Easy',
                'medium' => 'Medium',
                'hard' => 'Hard'
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $teacher = Auth::user()->teacher;
        
        if (!$teacher) {
            return back()->withErrors(['error' => 'Teacher profile not found.']);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'subject_id' => 'required|exists:subjects,id',
            'term_id' => 'required|exists:terms,id',
            'exam_type' => 'required|in:quiz,test,exam,assignment',
            'duration_minutes' => 'required|integer|min:5|max:600',
            'start_time' => 'nullable|date|after:now',
            'end_time' => 'nullable|date|after:start_time',
            'max_attempts' => 'nullable|integer|min:1|max:10',
            'pass_mark' => 'nullable|numeric|min:0|max:100',
            'show_results_immediately' => 'boolean',
            'randomize_questions' => 'boolean',
            'randomize_options' => 'boolean',
            'prevent_back_navigation' => 'boolean',
            'full_screen_mode' => 'boolean',
            'is_active' => 'boolean',
            'classrooms' => 'required|array|min:1',
            'classrooms.*' => 'exists:classrooms,id',
            'questions' => 'required|array|min:1',
            'questions.*' => 'exists:questions,id'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            // Verify teacher owns all selected questions
            $questionIds = $request->questions;
            $teacherQuestions = Question::where('teacher_id', $teacher->user_id)
                ->whereIn('id', $questionIds)
                ->pluck('id')
                ->toArray();

            if (count($teacherQuestions) !== count($questionIds)) {
                return back()->withErrors(['questions' => 'You can only add your own questions to the exam.']);
            }

            // Calculate total marks
            $totalMarks = Question::whereIn('id', $questionIds)->sum('marks');

            $exam = Exam::create([
                'title' => $request->title,
                'description' => $request->description,
                'subject_id' => $request->subject_id,
                'teacher_id' => $teacher->user_id,
                'term_id' => $request->term_id,
                'exam_type' => $request->exam_type,
                'total_marks' => $totalMarks,
                'duration_minutes' => $request->duration_minutes,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'max_attempts' => $request->max_attempts ?? 1,
                'pass_mark' => $request->pass_mark,
                'show_results_immediately' => $request->show_results_immediately ?? false,
                'randomize_questions' => $request->randomize_questions ?? false,
                'randomize_options' => $request->randomize_options ?? false,
                'prevent_back_navigation' => $request->prevent_back_navigation ?? false,
                'full_screen_mode' => $request->full_screen_mode ?? false,
                'is_active' => $request->is_active ?? true,
            ]);

            // Attach classrooms
            $exam->classrooms()->attach($request->classrooms);

            // Attach questions with order
            $questionData = [];
            foreach ($questionIds as $index => $questionId) {
                $questionData[$questionId] = ['order' => $index + 1];
            }
            $exam->questions()->attach($questionData);

            return redirect()->route('teacher.cbt.exams.show', $exam)
                ->with('success', 'Exam created successfully!');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create exam: ' . $e->getMessage()])->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Exam $exam)
    {
        $teacher = Auth::user()->teacher;
        
        // Verify ownership
        if ($exam->teacher_id !== $teacher->user_id) {
            abort(403, 'Unauthorized access to this exam.');
        }

        $exam->load([
            'subject',
            'term',
            'teacher',
            'classrooms',
            'questions' => function($query) {
                $query->orderBy('exam_questions.order');
            }
        ]);

        return Inertia::render('Teacher/CBT/Exams/Show', [
            'exam' => $exam,
            'examTypes' => [
                'quiz' => 'Quiz',
                'test' => 'Test',
                'exam' => 'Exam',
                'assignment' => 'Assignment'
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Exam $exam)
    {
        $teacher = Auth::user()->teacher;
        
        // Verify ownership
        if ($exam->teacher_id !== $teacher->user_id) {
            abort(403, 'Unauthorized access to this exam.');
        }

        $exam->load(['classrooms', 'questions']);

        // Get teacher's subjects
        $subjects = Subject::whereHas('teachers', function ($q) use ($teacher) {
            $q->where('teacher_id', $teacher->id);
        })->get();

        // Get teacher's classrooms
        $classrooms = Classroom::whereHas('teachers', function ($q) use ($teacher) {
            $q->where('teacher_id', $teacher->id);
        })->get();

        $terms = Term::orderBy('name')->get();

        // Get teacher's questions for exam building
        $questions = Question::where('teacher_id', $teacher->user_id)
            ->with('subject')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Teacher/CBT/Exams/Edit', [
            'exam' => $exam,
            'subjects' => $subjects,
            'classrooms' => $classrooms,
            'terms' => $terms,
            'questions' => $questions,
            'examTypes' => [
                'quiz' => 'Quiz',
                'test' => 'Test',
                'exam' => 'Exam',
                'assignment' => 'Assignment'
            ],
            'difficultyLevels' => [
                'easy' => 'Easy',
                'medium' => 'Medium',
                'hard' => 'Hard'
            ]
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Exam $exam)
    {
        $teacher = Auth::user()->teacher;
        
        // Verify ownership
        if ($exam->teacher_id !== $teacher->user_id) {
            abort(403, 'Unauthorized access to this exam.');
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'subject_id' => 'required|exists:subjects,id',
            'term_id' => 'required|exists:terms,id',
            'exam_type' => 'required|in:quiz,test,exam,assignment',
            'duration_minutes' => 'required|integer|min:5|max:600',
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date|after:start_time',
            'max_attempts' => 'nullable|integer|min:1|max:10',
            'pass_mark' => 'nullable|numeric|min:0|max:100',
            'show_results_immediately' => 'boolean',
            'randomize_questions' => 'boolean',
            'randomize_options' => 'boolean',
            'prevent_back_navigation' => 'boolean',
            'full_screen_mode' => 'boolean',
            'is_active' => 'boolean',
            'classrooms' => 'required|array|min:1',
            'classrooms.*' => 'exists:classrooms,id',
            'questions' => 'required|array|min:1',
            'questions.*' => 'exists:questions,id'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            // Verify teacher owns all selected questions
            $questionIds = $request->questions;
            $teacherQuestions = Question::where('teacher_id', $teacher->user_id)
                ->whereIn('id', $questionIds)
                ->pluck('id')
                ->toArray();

            if (count($teacherQuestions) !== count($questionIds)) {
                return back()->withErrors(['questions' => 'You can only add your own questions to the exam.']);
            }

            // Calculate total marks
            $totalMarks = Question::whereIn('id', $questionIds)->sum('marks');

            $exam->update([
                'title' => $request->title,
                'description' => $request->description,
                'subject_id' => $request->subject_id,
                'term_id' => $request->term_id,
                'exam_type' => $request->exam_type,
                'total_marks' => $totalMarks,
                'duration_minutes' => $request->duration_minutes,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'max_attempts' => $request->max_attempts ?? 1,
                'pass_mark' => $request->pass_mark,
                'show_results_immediately' => $request->show_results_immediately ?? false,
                'randomize_questions' => $request->randomize_questions ?? false,
                'randomize_options' => $request->randomize_options ?? false,
                'prevent_back_navigation' => $request->prevent_back_navigation ?? false,
                'full_screen_mode' => $request->full_screen_mode ?? false,
                'is_active' => $request->is_active ?? true,
            ]);

            // Update classrooms
            $exam->classrooms()->sync($request->classrooms);

            // Update questions with order
            $questionData = [];
            foreach ($questionIds as $index => $questionId) {
                $questionData[$questionId] = ['order' => $index + 1];
            }
            $exam->questions()->sync($questionData);

            return redirect()->route('teacher.cbt.exams.show', $exam)
                ->with('success', 'Exam updated successfully!');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update exam: ' . $e->getMessage()])->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Exam $exam)
    {
        $teacher = Auth::user()->teacher;
        
        // Verify ownership
        if ($exam->teacher_id !== $teacher->user_id) {
            abort(403, 'Unauthorized access to this exam.');
        }

        try {
            $exam->delete();
            return redirect()->route('teacher.cbt.exams.index')
                ->with('success', 'Exam deleted successfully!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete exam: ' . $e->getMessage()]);
        }
    }

    /**
     * Publish an exam
     */
    public function publish(Exam $exam)
    {
        $teacher = Auth::user()->teacher;
        
        // Verify ownership
        if ($exam->teacher_id !== $teacher->user_id) {
            abort(403, 'Unauthorized access to this exam.');
        }

        $exam->update(['is_active' => true]);

        return back()->with('success', 'Exam published successfully!');
    }

    /**
     * Unpublish an exam
     */
    public function unpublish(Exam $exam)
    {
        $teacher = Auth::user()->teacher;
        
        // Verify ownership
        if ($exam->teacher_id !== $teacher->user_id) {
            abort(403, 'Unauthorized access to this exam.');
        }

        $exam->update(['is_active' => false]);

        return back()->with('success', 'Exam unpublished successfully!');
    }

    /**
     * Clone an exam
     */
    public function clone(Exam $exam)
    {
        $teacher = Auth::user()->teacher;
        
        // Verify ownership
        if ($exam->teacher_id !== $teacher->user_id) {
            abort(403, 'Unauthorized access to this exam.');
        }

        try {
            $newExam = $exam->replicate();
            $newExam->title = $exam->title . ' (Copy)';
            $newExam->is_active = false;
            $newExam->save();

            // Copy relationships
            $newExam->classrooms()->attach($exam->classrooms->pluck('id'));
            
            $questionData = [];
            foreach ($exam->questions as $question) {
                $questionData[$question->id] = ['order' => $question->pivot->order];
            }
            $newExam->questions()->attach($questionData);

            return redirect()->route('teacher.cbt.exams.show', $newExam)
                ->with('success', 'Exam cloned successfully!');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to clone exam: ' . $e->getMessage()]);
        }
    }

    /**
     * Show exam analytics
     */
    public function analytics(Exam $exam)
    {
        $teacher = Auth::user()->teacher;
        
        // Verify ownership
        if ($exam->teacher_id !== $teacher->user_id) {
            abort(403, 'Unauthorized access to this exam.');
        }

        $analytics = $this->cbtService->getExamAnalytics($exam);

        return Inertia::render('Teacher/CBT/Exams/Analytics', [
            'exam' => $exam->load(['subject', 'term']),
            'analytics' => $analytics
        ]);
    }

    /**
     * Show exam results
     */
    public function results(Exam $exam)
    {
        $teacher = Auth::user()->teacher;
        
        // Verify ownership
        if ($exam->teacher_id !== $teacher->user_id) {
            abort(403, 'Unauthorized access to this exam.');
        }

        $results = $this->cbtService->getExamResults($exam);

        return Inertia::render('Teacher/CBT/Exams/Results', [
            'exam' => $exam->load(['subject', 'term']),
            'results' => $results
        ]);
    }
}
