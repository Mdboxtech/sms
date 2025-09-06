<?php

namespace App\Http\Controllers\Teacher\CBT;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\Subject;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class QuestionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $teacher = Teacher::where('user_id', Auth::id())->firstOrFail();
        
        $query = Question::with(['subject', 'teacher'])
            ->where('teacher_id', $teacher->user_id)
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('question_text', 'like', "%{$search}%")
                  ->orWhere('explanation', 'like', "%{$search}%");
            });
        }

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        if ($request->filled('question_type')) {
            $query->where('question_type', $request->question_type);
        }

        if ($request->filled('difficulty_level')) {
            $query->where('difficulty_level', $request->difficulty_level);
        }

        $questions = $query->paginate(15)->withQueryString();

        // Get subjects that this teacher teaches
        $teacherSubjects = Subject::whereHas('teachers', function ($q) use ($teacher) {
            $q->where('teacher_id', $teacher->id);
        })->orderBy('name')->get();

        return Inertia::render('Teacher/CBT/Questions/Index', [
            'questions' => $questions,
            'subjects' => $teacherSubjects,
            'filters' => $request->only(['search', 'subject_id', 'question_type', 'difficulty_level']),
            'questionTypes' => [
                'multiple_choice' => 'Multiple Choice',
                'true_false' => 'True/False',
                'essay' => 'Essay',
                'fill_blank' => 'Fill in the Blank'
            ],
            'difficultyLevels' => [
                'easy' => 'Easy',
                'medium' => 'Medium',
                'hard' => 'Hard'
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $teacher = Teacher::where('user_id', Auth::id())->firstOrFail();
        
        // Get subjects that this teacher teaches
        $teacherSubjects = Subject::whereHas('teachers', function ($q) use ($teacher) {
            $q->where('teacher_id', $teacher->id);
        })->orderBy('name')->get();

        // Get classrooms that this teacher teaches
        $teacherClassrooms = $teacher->classrooms()->orderBy('name')->get();

        return Inertia::render('Teacher/CBT/Questions/Create', [
            'subjects' => $teacherSubjects,
            'classrooms' => $teacherClassrooms,
            'questionTypes' => [
                'multiple_choice' => 'Multiple Choice',
                'true_false' => 'True/False',
                'essay' => 'Essay',
                'fill_blank' => 'Fill in the Blank'
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
        $teacher = Teacher::where('user_id', Auth::id())->firstOrFail();
        
        $validator = Validator::make($request->all(), [
            'subject_id' => 'required|exists:subjects,id',
            'question_text' => 'required|string|max:2000',
            'question_type' => 'required|in:multiple_choice,true_false,essay,fill_blank',
            'difficulty_level' => 'required|in:easy,medium,hard',
            'marks' => 'required|integer|min:1|max:100',
            'time_limit' => 'nullable|integer|min:30|max:3600',
            'explanation' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
            'options' => 'required_if:question_type,multiple_choice,true_false|array',
            'options.*.text' => 'required_with:options|string|max:500',
            'options.*.is_correct' => 'required_with:options|boolean'
        ]);

        // Custom validation for options
        if (in_array($request->question_type, ['multiple_choice', 'true_false'])) {
            $validator->after(function ($validator) use ($request) {
                if ($request->has('options')) {
                    $correctAnswers = collect($request->options)->where('is_correct', true)->count();
                    
                    if ($request->question_type === 'multiple_choice' && $correctAnswers !== 1) {
                        $validator->errors()->add('options', 'Multiple choice questions must have exactly one correct answer.');
                    }
                    
                    if ($request->question_type === 'true_false' && $correctAnswers !== 1) {
                        $validator->errors()->add('options', 'True/False questions must have exactly one correct answer.');
                    }

                    // Check if all options have text
                    $emptyOptions = collect($request->options)->where('text', '')->count();
                    if ($emptyOptions > 0) {
                        $validator->errors()->add('options', 'All option texts are required.');
                    }
                }
            });
        }

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $questionData = $validator->validated();
            $questionData['teacher_id'] = $teacher->user_id;

            // Remove options from main data
            $options = $questionData['options'] ?? [];
            unset($questionData['options']);

            $question = Question::create($questionData);

            // Save options for multiple choice and true/false questions
            if (in_array($question->question_type, ['multiple_choice', 'true_false']) && !empty($options)) {
                $question->options = $options;
                $question->save();
            }

            return redirect()
                ->route('teacher.cbt.questions.show', $question)
                ->with('success', 'Question created successfully');
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Failed to create question: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Question $question)
    {
        // Ensure teacher can only view their own questions
        $teacher = Teacher::where('user_id', Auth::id())->firstOrFail();
        if ($question->teacher_id !== $teacher->user_id) {
            abort(403, 'Unauthorized');
        }

        $question->load(['subject', 'teacher']);

        return Inertia::render('Teacher/CBT/Questions/Show', [
            'question' => $question,
            'questionTypes' => [
                'multiple_choice' => 'Multiple Choice',
                'true_false' => 'True/False',
                'essay' => 'Essay',
                'fill_blank' => 'Fill in the Blank'
            ],
            'difficultyLevels' => [
                'easy' => 'Easy',
                'medium' => 'Medium',
                'hard' => 'Hard'
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Question $question)
    {
        // Ensure teacher can only edit their own questions
        $teacher = Teacher::where('user_id', Auth::id())->firstOrFail();
        if ($question->teacher_id !== $teacher->user_id) {
            abort(403, 'Unauthorized');
        }

        // Get subjects that this teacher teaches
        $teacherSubjects = Subject::whereHas('teachers', function ($q) use ($teacher) {
            $q->where('teacher_id', $teacher->id);
        })->orderBy('name')->get();

        // Get classrooms that this teacher teaches
        $teacherClassrooms = $teacher->classrooms()->orderBy('name')->get();

        return Inertia::render('Teacher/CBT/Questions/Edit', [
            'question' => $question,
            'subjects' => $teacherSubjects,
            'classrooms' => $teacherClassrooms,
            'questionTypes' => [
                'multiple_choice' => 'Multiple Choice',
                'true_false' => 'True/False',
                'essay' => 'Essay',
                'fill_blank' => 'Fill in the Blank'
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
    public function update(Request $request, Question $question)
    {
        // Ensure teacher can only update their own questions
        $teacher = Teacher::where('user_id', Auth::id())->firstOrFail();
        if ($question->teacher_id !== $teacher->user_id) {
            abort(403, 'Unauthorized');
        }

        $validator = Validator::make($request->all(), [
            'subject_id' => 'required|exists:subjects,id',
            'question_text' => 'required|string|max:2000',
            'question_type' => 'required|in:multiple_choice,true_false,essay,fill_blank',
            'difficulty_level' => 'required|in:easy,medium,hard',
            'marks' => 'required|integer|min:1|max:100',
            'time_limit' => 'nullable|integer|min:30|max:3600',
            'explanation' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
            'options' => 'required_if:question_type,multiple_choice,true_false|array',
            'options.*.text' => 'required_with:options|string|max:500',
            'options.*.is_correct' => 'required_with:options|boolean'
        ]);

        // Custom validation for options
        if (in_array($request->question_type, ['multiple_choice', 'true_false'])) {
            $validator->after(function ($validator) use ($request) {
                if ($request->has('options')) {
                    $correctAnswers = collect($request->options)->where('is_correct', true)->count();
                    
                    if ($request->question_type === 'multiple_choice' && $correctAnswers !== 1) {
                        $validator->errors()->add('options', 'Multiple choice questions must have exactly one correct answer.');
                    }
                    
                    if ($request->question_type === 'true_false' && $correctAnswers !== 1) {
                        $validator->errors()->add('options', 'True/False questions must have exactly one correct answer.');
                    }

                    // Check if all options have text
                    $emptyOptions = collect($request->options)->where('text', '')->count();
                    if ($emptyOptions > 0) {
                        $validator->errors()->add('options', 'All option texts are required.');
                    }
                }
            });
        }

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $questionData = $validator->validated();

            // Remove options from main data
            $options = $questionData['options'] ?? [];
            unset($questionData['options']);

            $question->update($questionData);

            // Update options for multiple choice and true/false questions
            if (in_array($question->question_type, ['multiple_choice', 'true_false'])) {
                $question->options = $options;
                $question->save();
            } else {
                // Clear options for other question types
                $question->options = null;
                $question->save();
            }

            return redirect()
                ->route('teacher.cbt.questions.show', $question)
                ->with('success', 'Question updated successfully');
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Failed to update question: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Question $question)
    {
        // Ensure teacher can only delete their own questions
        $teacher = Teacher::where('user_id', Auth::id())->firstOrFail();
        if ($question->teacher_id !== $teacher->user_id) {
            abort(403, 'Unauthorized');
        }

        try {
            // Check if question is used in any exams
            if ($question->exams()->count() > 0) {
                return back()->withErrors(['error' => 'Cannot delete question that is used in exams']);
            }

            $question->delete();

            return redirect()
                ->route('teacher.cbt.questions.index')
                ->with('success', 'Question deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete question: ' . $e->getMessage()]);
        }
    }

    /**
     * Get question statistics
     */
    public function statistics(Question $question)
    {
        // Ensure teacher can only view stats for their own questions
        $teacher = Teacher::where('user_id', Auth::id())->firstOrFail();
        if ($question->teacher_id !== $teacher->user_id) {
            abort(403, 'Unauthorized');
        }

        $totalAttempts = $question->studentAnswers()->count();
        $correctAttempts = $question->studentAnswers()
            ->where('is_correct', true)
            ->count();

        $successRate = $totalAttempts > 0 ? round(($correctAttempts / $totalAttempts) * 100, 2) : 0;

        return response()->json([
            'total_attempts' => $totalAttempts,
            'correct_attempts' => $correctAttempts,
            'success_rate' => $successRate
        ]);
    }
}
