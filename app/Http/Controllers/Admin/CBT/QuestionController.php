<?php

namespace App\Http\Controllers\Admin\CBT;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\Subject;
use App\Models\Teacher;
use App\Services\CBTService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class QuestionController extends Controller
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
        $filters = $request->only(['subject_id', 'teacher_id', 'question_type', 'difficulty_level', 'search']);
        
        $query = Question::with(['subject', 'teacher'])
            ->when($filters['subject_id'] ?? null, fn($q, $subjectId) => $q->where('subject_id', $subjectId))
            ->when($filters['teacher_id'] ?? null, fn($q, $teacherId) => $q->where('teacher_id', $teacherId))
            ->when($filters['question_type'] ?? null, fn($q, $type) => $q->where('question_type', $type))
            ->when($filters['difficulty_level'] ?? null, fn($q, $level) => $q->where('difficulty_level', $level))
            ->when($filters['search'] ?? null, fn($q, $search) => 
                $q->where('question_text', 'like', "%{$search}%")
            );

        $questions = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('Admin/CBT/Questions/Index', [
            'questions' => $questions,
            'subjects' => Subject::orderBy('name')->get(['id', 'name']),
            'teachers' => Teacher::with('user:id,name')->get(['id', 'user_id']),
            'filters' => $filters,
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
        return Inertia::render('Admin/CBT/Questions/Create', [
            'subjects' => Subject::orderBy('name')->get(['id', 'name']),
            'teachers' => Teacher::with('user:id,name')->get(['id', 'user_id']),
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
        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:users,id',
            'question_text' => 'required|string',
            'question_type' => ['required', Rule::in(['multiple_choice', 'true_false', 'essay', 'fill_blank'])],
            'difficulty_level' => ['required', Rule::in(['easy', 'medium', 'hard'])],
            'marks' => 'required|integer|min:1|max:100',
            'time_limit' => 'nullable|integer|min:1',
            'options' => 'required_if:question_type,multiple_choice|array|min:2',
            'options.*' => 'required_with:options|string',
            'correct_answer' => 'required_unless:question_type,essay',
            'explanation' => 'nullable|string'
        ]);

        // Store options as simple array for multiple choice
        if ($validated['question_type'] === 'multiple_choice') {
            // Assume options are already in the correct format as array of strings
            // If they're objects, extract text
            if (isset($validated['options'][0]) && is_array($validated['options'][0]) && isset($validated['options'][0]['text'])) {
                $options = [];
                foreach ($validated['options'] as $option) {
                    $options[] = $option['text'];
                }
                $validated['options'] = $options;
            }
        } else {
            $validated['options'] = null;
        }

        Question::create($validated);

        return redirect()->route('admin.cbt.questions.index')
            ->with('success', 'Question created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Question $question)
    {
        $question->load(['subject', 'teacher', 'exams']);

        return Inertia::render('Admin/CBT/Questions/Show', [
            'question' => $question,
            'statistics' => $question->getStatistics(),
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
        return Inertia::render('Admin/CBT/Questions/Edit', [
            'question' => $question,
            'subjects' => Subject::orderBy('name')->get(['id', 'name']),
            'teachers' => Teacher::with('user:id,name')->get(['id', 'user_id']),
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
        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:users,id',
            'question_text' => 'required|string',
            'question_type' => ['required', Rule::in(['multiple_choice', 'true_false', 'essay', 'fill_blank'])],
            'difficulty_level' => ['required', Rule::in(['easy', 'medium', 'hard'])],
            'marks' => 'required|integer|min:1|max:100',
            'time_limit' => 'nullable|integer|min:1',
            'options' => 'required_if:question_type,multiple_choice,true_false|array|min:2',
            'options.*.text' => 'required_with:options|string',
            'options.*.is_correct' => 'required_with:options|boolean',
            'correct_answer' => 'required_unless:question_type,essay,fill_blank',
            'explanation' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        // Store options as simple array for multiple choice and true/false
        if ($validated['question_type'] === 'multiple_choice' || $validated['question_type'] === 'true_false') {
            $options = [];
            foreach ($validated['options'] as $option) {
                $options[] = $option['text'];
            }
            $validated['options'] = $options;
        } else {
            $validated['options'] = null;
        }

        $question->update($validated);

        return redirect()->route('admin.cbt.questions.index')
            ->with('success', 'Question updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Question $question)
    {
        // Check if question is used in any exams
        if ($question->exams()->exists()) {
            return back()->with('error', 'Cannot delete question that is used in exams.');
        }

        $question->delete();

        return back()->with('success', 'Question deleted successfully.');
    }

    /**
     * Show the import page
     */
    public function importPage()
    {
        return Inertia::render('Admin/CBT/Questions/Import', [
            'subjects' => Subject::orderBy('name')->get(['id', 'name']),
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
     * Download import template
     */
    public function downloadTemplate()
    {
        $headers = [
            'question_text',
            'question_type',
            'difficulty_level',
            'marks',
            'option_a',
            'option_b',
            'option_c',
            'option_d',
            'correct_answer',
            'explanation'
        ];

        $exampleRow = [
            'What is 2 + 2?',
            'multiple_choice',
            'easy',
            '5',
            '3',
            '4',
            '5',
            '6',
            'B',
            '2 + 2 = 4'
        ];

        $callback = function() use ($headers, $exampleRow) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $headers);
            fputcsv($file, $exampleRow);
            fclose($file);
        };

        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="questions_import_template.csv"',
        ]);
    }

    /**
     * Process the import
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt,xlsx,xls|max:10240',
            'subject_id' => 'required|exists:subjects,id',
        ]);

        $file = $request->file('file');
        $subjectId = $request->subject_id;
        $teacherId = auth()->id();

        $imported = 0;
        $errors = [];
        $row = 0;

        // Open and parse CSV
        if (($handle = fopen($file->getPathname(), 'r')) !== false) {
            // Skip header row
            $headers = fgetcsv($handle);
            
            while (($data = fgetcsv($handle)) !== false) {
                $row++;
                
                if (count($data) < 9) {
                    $errors[] = "Row {$row}: Insufficient columns";
                    continue;
                }

                try {
                    $questionText = trim($data[0] ?? '');
                    $questionType = strtolower(trim($data[1] ?? 'multiple_choice'));
                    $difficultyLevel = strtolower(trim($data[2] ?? 'medium'));
                    $marks = intval($data[3] ?? 5);
                    $optionA = trim($data[4] ?? '');
                    $optionB = trim($data[5] ?? '');
                    $optionC = trim($data[6] ?? '');
                    $optionD = trim($data[7] ?? '');
                    $correctAnswer = strtoupper(trim($data[8] ?? 'A'));
                    $explanation = trim($data[9] ?? '');

                    if (empty($questionText)) {
                        $errors[] = "Row {$row}: Question text is required";
                        continue;
                    }

                    // Build options array
                    $options = null;
                    $correctAnswerValue = '';
                    
                    if ($questionType === 'multiple_choice') {
                        $options = array_filter([$optionA, $optionB, $optionC, $optionD]);
                        // Map A, B, C, D to the actual answer text
                        $answerMap = ['A' => $optionA, 'B' => $optionB, 'C' => $optionC, 'D' => $optionD];
                        $correctAnswerValue = $answerMap[$correctAnswer] ?? $optionA;
                    } elseif ($questionType === 'true_false') {
                        $options = ['True', 'False'];
                        $correctAnswerValue = in_array(strtolower($correctAnswer), ['true', 't', 'a']) ? 'True' : 'False';
                    } else {
                        $correctAnswerValue = $correctAnswer;
                    }

                    // Validate question type
                    if (!in_array($questionType, ['multiple_choice', 'true_false', 'essay', 'fill_blank'])) {
                        $questionType = 'multiple_choice';
                    }

                    // Validate difficulty
                    if (!in_array($difficultyLevel, ['easy', 'medium', 'hard'])) {
                        $difficultyLevel = 'medium';
                    }

                    Question::create([
                        'subject_id' => $subjectId,
                        'teacher_id' => $teacherId,
                        'question_text' => $questionText,
                        'question_type' => $questionType,
                        'difficulty_level' => $difficultyLevel,
                        'marks' => $marks,
                        'options' => $options,
                        'correct_answer' => $correctAnswerValue,
                        'explanation' => $explanation ?: null,
                        'is_active' => true,
                    ]);

                    $imported++;
                } catch (\Exception $e) {
                    $errors[] = "Row {$row}: " . $e->getMessage();
                }
            }
            fclose($handle);
        }

        $message = "{$imported} questions imported successfully.";
        if (count($errors) > 0) {
            $message .= " " . count($errors) . " rows had errors.";
        }

        return redirect()->route('admin.cbt.questions.index')
            ->with('success', $message)
            ->with('import_errors', array_slice($errors, 0, 10)); // Limit errors shown
    }
}
