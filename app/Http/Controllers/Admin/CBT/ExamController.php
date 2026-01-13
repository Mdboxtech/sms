<?php

namespace App\Http\Controllers\Admin\CBT;

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
        $query = Exam::with(['subject', 'teacher', 'schedules'])
            ->withCount('questions')
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

        if ($request->filled('teacher_id')) {
            $query->where('teacher_id', $request->teacher_id);
        }

        $exams = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/CBT/Exams/Index', [
            'exams' => $exams,
            'subjects' => Subject::orderBy('name')->get(),
            'teachers' => Teacher::with('user')->get(),
            'filters' => $request->only(['search', 'subject_id', 'teacher_id']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/CBT/Exams/Create', [
            'subjects' => Subject::orderBy('name')->get(),
            'teachers' => Teacher::with('user')->get(),
            'terms' => Term::orderBy('name')->get(),
            'classrooms' => Classroom::orderBy('name')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'subject_id' => 'required|exists:subjects,id',
            'term_id' => 'required|exists:terms,id',
            'teacher_id' => 'required|exists:users,id',
            'exam_type' => 'required|in:test,exam,quiz,assignment',
            'total_marks' => 'required|integer|min:1',
            'duration_minutes' => 'required|integer|min:1',
            'passing_marks' => 'required|integer|min:0',
            'instructions' => 'nullable|string',
            'start_time' => 'nullable|date',
            // 'start_time' => 'nullable|date|after:now',
            'end_time' => 'nullable|date|after:start_time',
            'is_active' => 'boolean',
            'is_published' => 'boolean',
            'allow_review' => 'boolean',
            'show_results_immediately' => 'boolean',
            'randomize_questions' => 'boolean',
            'randomize_options' => 'boolean',
            'classroom_ids' => 'required|array|min:1',
            'classroom_ids.*' => 'exists:classrooms,id'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $examData = $validator->validated();
            $classroomIds = $examData['classroom_ids'];
            unset($examData['classroom_ids']);

            $exam = Exam::create($examData);
            $exam->classrooms()->attach($classroomIds);

            return redirect()
                ->route('admin.cbt.exams.show', $exam)
                ->with('success', 'Exam created successfully');
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Failed to create exam: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Exam $exam)
    {
        // Refresh exam data to ensure we have the latest from database
        $exam->refresh();
        
        $exam->load([
            'subject',
            'term',
            'teacher',
            'questions.subject',
            'schedules',
            'classrooms'
        ]);

        // Get available questions (not already in this exam)
        $availableQuestions = Question::with(['subject'])
            ->where('subject_id', $exam->subject_id)
            ->whereNotIn('id', $exam->questions->pluck('id'))
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get();

        $statistics = $this->cbtService->getExamStatistics($exam);

        return Inertia::render('Admin/CBT/Exams/Show', [
            'exam' => $exam,
            'questions' => $exam->questions,
            'availableQuestions' => $availableQuestions,
            'statistics' => $statistics,
            'questionTypes' => [
                'multiple_choice' => 'Multiple Choice',
                'true_false' => 'True/False',
                'essay' => 'Essay',
                'fill_blank' => 'Fill in the Blank',
                'short_answer' => 'Short Answer'
            ],
            'difficultyLevels' => [
                'easy' => 'Easy',
                'medium' => 'Medium',
                'hard' => 'Hard'
            ],
            'examTypes' => [
                'test' => 'Test',
                'exam' => 'Exam',
                'quiz' => 'Quiz',
                'assignment' => 'Assignment'
            ],
            'examStatuses' => [
                'draft' => 'Draft',
                'scheduled' => 'Scheduled',
                'active' => 'Active',
                'completed' => 'Completed',
                'cancelled' => 'Cancelled'
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Exam $exam)
    {
        $exam->load(['classrooms']);

        return Inertia::render('Admin/CBT/Exams/Edit', [
            'exam' => $exam,
            'subjects' => Subject::orderBy('name')->get(),
            'terms' => Term::select('id', 'name')->distinct()->orderBy('name')->get(),
            'teachers' => Teacher::with('user')->get(),
            'classrooms' => Classroom::orderBy('name')->get(),
            'examTypes' => [
                'test' => 'Test',
                'exam' => 'Exam',
                'quiz' => 'Quiz',
                'assignment' => 'Assignment'
            ],
            'examStatuses' => [
                'draft' => 'Draft',
                'scheduled' => 'Scheduled',
                'active' => 'Active',
                'completed' => 'Completed',
                'cancelled' => 'Cancelled'
            ]
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Exam $exam)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'subject_id' => 'required|exists:subjects,id',
            'term_id' => 'required|exists:terms,id',
            'teacher_id' => 'required|exists:users,id',
            'exam_type' => 'required|in:test,exam,quiz,assignment',
            'total_marks' => 'required|integer|min:1',
            'duration_minutes' => 'required|integer|min:1',
            'passing_marks' => 'required|integer|min:0',
            'instructions' => 'nullable|string',
            'status' => 'required|in:draft,scheduled,active,completed,cancelled',
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date|after:start_time',
            'is_active' => 'boolean',
            'allow_review' => 'boolean',
            'enable_proctoring' => 'boolean',
            'show_results_immediately' => 'boolean',
            'randomize_questions' => 'boolean',
            'randomize_options' => 'boolean',
            'questions_per_page' => 'nullable|integer|min:1',
            'attempts_allowed' => 'nullable|integer|min:1',
            'auto_submit' => 'boolean',
            'classroom_ids' => 'required|array|min:1',
            'classroom_ids.*' => 'exists:classrooms,id'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $examData = $validator->validated();
            $classroomIds = $examData['classroom_ids'];
            unset($examData['classroom_ids']);

            $exam->update($examData);
            $exam->classrooms()->sync($classroomIds);
            
            // Refresh the exam model to get the latest data
            $exam->refresh();

            return redirect()
                ->route('admin.cbt.exams.show', $exam)
                ->with('success', 'Exam updated successfully');
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Failed to update exam: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Exam $exam)
    {
        try {
            // Check if exam has student attempts
            if ($exam->studentAttempts()->count() > 0) {
                return back()->withErrors(['error' => 'Cannot delete exam with student attempts']);
            }

            $exam->classrooms()->detach();
            $exam->questions()->detach();
            $exam->delete();

            return redirect()
                ->route('admin.cbt.exams.index')
                ->with('success', 'Exam deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete exam: ' . $e->getMessage()]);
        }
    }

    /**
     * Add questions to exam
     */
    public function addQuestions(Request $request, Exam $exam)
    {
        $validator = Validator::make($request->all(), [
            'question_ids' => 'required|array|min:1',
            'question_ids.*' => 'exists:questions,id'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        try {
            $questions = Question::whereIn('id', $request->question_ids)
                ->where('subject_id', $exam->subject_id)
                ->where('is_active', true)
                ->get();

            $exam->questions()->syncWithoutDetaching($questions->pluck('id'));

            // Update total marks
            $totalMarks = $exam->questions()->sum('marks');
            $exam->update(['total_marks' => $totalMarks]);

            return back()->with('success', 'Questions added to exam successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to add questions: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove question from exam
     */
    public function removeQuestion(Exam $exam, Question $question)
    {
        try {
            $exam->questions()->detach($question->id);

            // Update total marks
            $totalMarks = $exam->questions()->sum('marks');
            $exam->update(['total_marks' => $totalMarks]);

            return back()->with('success', 'Question removed from exam successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to remove question: ' . $e->getMessage()]);
        }
    }

    /**
     * Publish an exam
     */
    public function publish(Exam $exam)
    {
        try {
            $exam->update([
                'is_published' => true,
                'status' => 'active'
            ]);

            return back()->with('success', 'Exam published successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to publish exam: ' . $e->getMessage()]);
        }
    }

    /**
     * Unpublish an exam
     */
    public function unpublish(Exam $exam)
    {
        try {
            $exam->update([
                'is_published' => false,
                'status' => 'draft'
            ]);

            return back()->with('success', 'Exam unpublished successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to unpublish exam: ' . $e->getMessage()]);
        }
    }

    /**
     * Get exam statistics
     */
    public function statistics(Exam $exam)
    {
        $statistics = $this->cbtService->getExamStatistics($exam);

        return response()->json($statistics);
    }

    /**
     * Display CBT analytics dashboard
     */
    public function analytics(Request $request)
    {
        // Get overall statistics
        $totalExams = Exam::count();
        $totalQuestions = Question::count();
        $activeExams = Exam::where('is_active', true)->count();
        $completedExams = Exam::where('status', 'completed')->count();

        // Get exam statistics by subject
        $examsBySubject = Exam::with('subject')
            ->selectRaw('subject_id, COUNT(*) as count')
            ->groupBy('subject_id')
            ->get()
            ->map(function ($exam) {
                return [
                    'subject' => $exam->subject->name ?? 'Unknown',
                    'count' => $exam->count
                ];
            });

        // Get recent exams
        $recentExams = Exam::with(['subject', 'teacher'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get question distribution by difficulty
        $questionsByDifficulty = Question::selectRaw('difficulty_level, COUNT(*) as count')
            ->groupBy('difficulty_level')
            ->get()
            ->map(function ($question) {
                return [
                    'difficulty' => ucfirst($question->difficulty_level),
                    'count' => $question->count
                ];
            });

        // Get question distribution by type
        $questionsByType = Question::selectRaw('question_type, COUNT(*) as count')
            ->groupBy('question_type')
            ->get()
            ->map(function ($question) {
                return [
                    'type' => ucfirst(str_replace('_', ' ', $question->question_type)),
                    'count' => $question->count
                ];
            });

        return Inertia::render('Admin/CBT/Analytics', [
            'analytics' => [
                'overview' => [
                    'totalExams' => $totalExams,
                    'totalQuestions' => $totalQuestions,
                    'activeExams' => $activeExams,
                    'completedExams' => $completedExams,
                ],
                'examsBySubject' => $examsBySubject,
                'recentExams' => $recentExams,
                'questionsByDifficulty' => $questionsByDifficulty,
                'questionsByType' => $questionsByType,
            ]
        ]);
    }

    /**
     * Attach a question to an exam
     */
    public function attachQuestion(Request $request, Exam $exam)
    {
        $request->validate([
            'question_id' => 'required|exists:questions,id',
            'marks_allocated' => 'nullable|integer|min:1'
        ]);

        $question = Question::find($request->question_id);
        
        // Check if question is already attached
        if ($exam->questions()->where('question_id', $request->question_id)->exists()) {
            return back()->withErrors(['error' => 'Question is already added to this exam.']);
        }

        // Get the next order number
        $nextOrder = $exam->questions()->max('exam_questions.question_order') + 1;

        $exam->questions()->attach($request->question_id, [
            'question_order' => $nextOrder,
            'marks_allocated' => $request->marks_allocated ?? $question->marks
        ]);

        // Update total marks
        $totalMarks = $exam->questions()->sum('exam_questions.marks_allocated');
        $exam->update(['total_marks' => $totalMarks]);

        return back()->with('success', 'Question added to exam successfully.');
    }

    /**
     * Detach a question from an exam
     */
    public function detachQuestion(Exam $exam, Question $question)
    {
        $exam->questions()->detach($question->id);

        // Update total marks
        $totalMarks = $exam->questions()->sum('exam_questions.marks_allocated');
        $exam->update(['total_marks' => $totalMarks]);

        return back()->with('success', 'Question removed from exam successfully.');
    }

    /**
     * Reorder questions in an exam
     */
    public function reorderQuestions(Request $request, Exam $exam)
    {
        $request->validate([
            'question_id' => 'required|exists:questions,id',
            'direction' => 'required|in:up,down'
        ]);

        $currentQuestion = $exam->questions()
            ->where('question_id', $request->question_id)
            ->first();

        if (!$currentQuestion) {
            return back()->withErrors(['error' => 'Question not found in this exam.']);
        }

        $currentOrder = $currentQuestion->pivot->question_order;
        
        if ($request->direction === 'up') {
            $swapOrder = $currentOrder - 1;
        } else {
            $swapOrder = $currentOrder + 1;
        }

        $swapQuestion = $exam->questions()
            ->where('exam_questions.question_order', $swapOrder)
            ->first();

        if ($swapQuestion) {
            // Swap the orders
            $exam->questions()->updateExistingPivot($request->question_id, [
                'question_order' => $swapOrder
            ]);
            
            $exam->questions()->updateExistingPivot($swapQuestion->id, [
                'question_order' => $currentOrder
            ]);
        }

        return back()->with('success', 'Question order updated successfully.');
    }
}
