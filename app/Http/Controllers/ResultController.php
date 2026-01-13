<?php

namespace App\Http\Controllers;

use App\Models\Result;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Term;
use App\Models\Classroom;
use App\Models\User;
use App\Exports\ResultsExport;
use App\Imports\ResultsImport;
use App\Exports\ResultTemplateExport;
use App\Services\ResultCompilerService;
use App\Services\ClassTeacherService;
use App\Http\Requests\StoreResultRequest;
use App\Http\Requests\UpdateResultRequest;
use App\Http\Requests\BulkStoreResultRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Handles all result-related operations including:
 * - Basic CRUD for individual results
 * - Bulk operations for multiple results
 * - Import/Export functionality
 * - Role-specific views
 * - Analysis and compilation features
 */
class ResultController extends Controller
{
    use AuthorizesRequests;
    
    protected $classTeacherService;

    public function __construct(ClassTeacherService $classTeacherService)
    {
        $this->classTeacherService = $classTeacherService;
    }
    
    // Basic CRUD operations
    public function index(Request $request)
    {
        $query = Result::with(['student.user', 'student.classroom', 'subject', 'term.academicSession', 'teacher', 'termResult'])
            ->when($request->student_id, function ($query, $student_id) {
                return $query->where('student_id', $student_id);
            })
            ->when($request->subject_id, function ($query, $subject_id) {
                return $query->where('subject_id', $subject_id);
            })
            ->when($request->classroom_id, function ($query, $classroom_id) {
                return $query->whereHas('student', function ($q) use ($classroom_id) {
                    $q->where('classroom_id', $classroom_id);
                });
            })
            ->when($request->term_id, function ($query, $term_id) {
                return $query->where('term_id', $term_id);
            })
            ->when($request->teacher_id, function ($query, $teacher_id) {
                return $query->where('teacher_id', $teacher_id);
            })
            ->when($request->min_score, function ($query, $min_score) {
                return $query->where('total_score', '>=', $min_score);
            })
            ->when($request->max_score, function ($query, $max_score) {
                return $query->where('total_score', '<=', $max_score);
            })
            ->distinct() // Add this to prevent duplicates
            ->latest();

        // Students will be fetched dynamically based on classroom selection
        $students = [];
        if ($request->classroom_id) {
            $students = Student::with('user')
                ->where('classroom_id', $request->classroom_id)
                ->orderBy('admission_number')
                ->get();
        }

        return Inertia::render('Results/Index', [
            'auth' => [
                'user' => $request->user(),
            ],
            'results' => $query->paginate(20)->withQueryString(),
            'students' => $students,
            'subjects' => Subject::all(),
            'classrooms' => Classroom::all(),
            'terms' => Term::with('academicSession')->get(),
            'teachers' => User::whereHas('role', function($q) {
                $q->where('name', 'teacher');
            })->get(),
            'filters' => $request->only(['student_id', 'subject_id', 'classroom_id', 'term_id', 'teacher_id', 'min_score', 'max_score'])
        ]);
    }

    /**
     * Get students for a specific classroom
     * 
     * @param Classroom $classroom
     * @return \Illuminate\Http\JsonResponse
     */
    public function getStudentsByClassroom(Classroom $classroom)
    {
        $students = Student::with('user')
            ->where('classroom_id', $classroom->id)
            ->orderBy('admission_number')
            ->get();

        return response()->json($students);
    }

    /**
     * Get manageable subjects for the current teacher in a specific classroom
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getManageableSubjects(Request $request)
    {
        $user = Auth::user();
        if (!$user || !$user->teacher) {
            return response()->json(['error' => 'Not authorized'], 403);
        }

        $classroomId = $request->get('classroom_id');
        if (!$classroomId) {
            return response()->json(['error' => 'Classroom ID required'], 400);
        }

        $subjects = $this->classTeacherService->getTeacherManageableSubjects(
            $user->teacher->id, 
            $classroomId
        );

        return response()->json($subjects);
    }

    /**
     * Get teacher permission information for a specific result context
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getTeacherPermissions(Request $request)
    {
        $user = Auth::user();
        if (!$user || !$user->teacher) {
            return response()->json(['error' => 'Not authorized'], 403);
        }

        $studentId = $request->get('student_id');
        $subjectId = $request->get('subject_id');

        if (!$studentId || !$subjectId) {
            return response()->json(['error' => 'Student ID and Subject ID required'], 400);
        }

        $permissionType = $this->classTeacherService->getTeacherPermissionType(
            $user->teacher->id,
            $subjectId,
            $studentId
        );

        $canManage = $this->classTeacherService->canTeacherManageSubjectResult(
            $user->teacher->id,
            $subjectId,
            $studentId
        );

        return response()->json([
            'can_manage' => $canManage,
            'permission_type' => $permissionType,
            'is_class_teacher' => $permissionType === 'class_assignment'
        ]);
    }

    public function create()
    {
        return Inertia::render('Results/Create', [
            'students' => Student::with('user')->get(),
            'subjects' => Subject::all(),
            'terms' => Term::with('academicSession')
                ->whereHas('academicSession', function($query) {
                    $query->where('is_current', true);
                })
                ->get()
        ]);
    }

    public function store(StoreResultRequest $request)
    {
        $this->authorize('create', Result::class);
        
        // Additional authorization check for specific student and subject
        $this->authorize('createForStudentSubject', [Result::class, $request->student_id, $request->subject_id]);

        // Check for duplicate result to prevent duplicates during creation
        $existingResult = Result::where([
            'student_id' => $request->student_id,
            'subject_id' => $request->subject_id,
            'term_id' => $request->term_id,
        ])->first();

        if ($existingResult) {
            return redirect()->back()
                ->withErrors(['duplicate' => 'A result for this student, subject, and term already exists.'])
                ->withInput();
        }

        // Calculate total score
        $totalScore = $request->ca_score + $request->exam_score;

        // Create result
        $result = Result::create([
            'student_id' => $request->student_id,
            'subject_id' => $request->subject_id,
            'term_id' => $request->term_id,
            'ca_score' => $request->ca_score,
            'exam_score' => $request->exam_score,
            'total_score' => $totalScore,
            'teacher_id' => Auth::id()
        ]);

        // Generate AI-powered remark
        if ($request->generate_remark) {
            $remark = $this->generateAIRemark($result);
            $result->update(['remark' => $remark]);
        }

        return redirect()->route('admin.results.index')
            ->with('success', 'Result recorded successfully.');
    }

    public function show(Result $result)
    {
        return Inertia::render('Results/Show', [
            'result' => $result->load([
                'student.user',
                'subject',
                'term.academicSession',
                'teacher'
            ])
        ]);
    }

    public function edit(Result $result)
    {
        return Inertia::render('Results/Edit', [
            'result' => $result->load([
                'student.user',
                'subject',
                'term.academicSession'
            ]),
            'students' => Student::with('user')->get(),
            'subjects' => Subject::all(),
            'terms' => Term::with('academicSession')->get()
        ]);
    }

    public function update(UpdateResultRequest $request, Result $result)
    {
        $this->authorize('update', $result);

        $totalScore = $request->ca_score + $request->exam_score;

        $result->update([
            'ca_score' => $request->ca_score,
            'exam_score' => $request->exam_score,
            'total_score' => $totalScore,
        ]);

        if ($request->generate_remark) {
            $remark = $this->generateAIRemark($result);
            $result->update(['remark' => $remark]);
        }

        return redirect()->route('results.show', $result)
            ->with('success', 'Result updated successfully.');
    }

    public function destroy(Result $result)
    {
        $result->delete();

        return redirect()->route('results.index')
            ->with('success', 'Result deleted successfully.');
    }

    // Bulk operations
    public function bulkCreate()
    {
        return Inertia::render('Results/BulkCreate', [
            'students' => Student::with('user')->get(),
            'subjects' => Subject::all(),
            'terms' => Term::with('academicSession')
                ->whereHas('academicSession', function($query) {
                    $query->where('is_current', true);
                })
                ->get()
        ]);
    }

    public function bulkStore(BulkStoreResultRequest $request)
    {
        $this->authorize('bulkCreate', Result::class);

        try {
            foreach ($request->results as $resultData) {
                // Check for duplicate before creating
                $existingResult = Result::where([
                    'student_id' => $resultData['student_id'],
                    'subject_id' => $resultData['subject_id'],
                    'term_id' => $request->term_id,
                ])->first();

                if (!$existingResult) {
                    Result::create([
                        'student_id' => $resultData['student_id'],
                        'subject_id' => $resultData['subject_id'],
                        'term_id' => $request->term_id,
                        'ca_score' => $resultData['ca_score'],
                        'exam_score' => $resultData['exam_score'],
                        'total_score' => $resultData['ca_score'] + $resultData['exam_score'],
                        'teacher_id' => Auth::id()
                    ]);
                }
            }

            return redirect()->back()->with('success', 'Results saved successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to save results: ' . $e->getMessage());
        }
    }

    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'results' => 'required|array',
            'results.*.id' => 'required|exists:results,id',
            'results.*.ca_score' => 'required|numeric|min:0|max:40',
            'results.*.exam_score' => 'required|numeric|min:0|max:60',
        ]);

        foreach ($request->results as $resultData) {
            $result = Result::find($resultData['id']);
            $result->update([
                'ca_score' => $resultData['ca_score'],
                'exam_score' => $resultData['exam_score'],
                'total_score' => $resultData['ca_score'] + $resultData['exam_score']
            ]);
        }

        return redirect()->back()->with('success', 'Results updated successfully.');
    }

    // Role-specific views
    public function teacherResults1()
    {
        $teacher = Auth::user()->teacher;
        
        if (!$teacher) {
            return Inertia::render('Teacher/ViewResults', [
                'results' => collect()
            ]);
        }
        
        $results = Result::whereIn('subject_id', $teacher->subjects->pluck('id'))
            ->with(['student.user', 'subject', 'term.academicSession'])
            ->distinct()
            ->latest()
            ->get();
        
        return Inertia::render('Teacher/ViewResults', [
            'results' => $results
        ]);
    }

    public function studentResults1()
    {
        $student = Auth::user()->student;
        
        if (!$student) {
            return Inertia::render('Student/Results', [
                'results' => collect()
            ]);
        }
        
        $results = Result::where('student_id', $student->id)
            ->with(['subject', 'term.academicSession'])
            ->distinct()
            ->latest()
            ->get();
        
        return Inertia::render('Student/Results', [
            'results' => $results
        ]);
    }

    public function classResults($classroom)
    {
        $classroom = Classroom::findOrFail($classroom);
        
        $results = Result::whereHas('student', function($query) use ($classroom) {
            $query->where('classroom_id', $classroom->id);
        })
        ->with(['student.user', 'subject', 'term.academicSession', 'teacher.user'])
        ->distinct()
        ->latest()
        ->get();
        
        return Inertia::render('Results/Classroom', [
            'classroom' => $classroom,
            'results' => $results
        ]);
    }
    
    public function studentResults($student)
    {
        $student = Student::with('user', 'classroom')->findOrFail($student);
        
        $results = Result::where('student_id', $student->id)
            ->with(['subject', 'term.academicSession', 'teacher.user'])
            ->distinct()
            ->latest()
            ->get();
        
        return Inertia::render('Results/Student', [
            'student' => $student,
            'results' => $results
        ]);
    }
    
    public function subjectResults($subject)
    {
        $subject = Subject::findOrFail($subject);
        
        $results = Result::where('subject_id', $subject->id)
            ->with(['student.user', 'student.classroom', 'term.academicSession', 'teacher.user'])
            ->distinct()
            ->latest()
            ->get();
        
        return Inertia::render('Results/Subject', [
            'subject' => $subject,
            'results' => $results
        ]);
    }
    
    public function termResults($term)
    {
        $term = Term::with('academicSession')->findOrFail($term);
        
        $results = Result::where('term_id', $term->id)
            ->with(['student.user', 'student.classroom', 'subject', 'teacher.user'])
            ->distinct()
            ->latest()
            ->get();
        
        return Inertia::render('Results/Term', [
            'term' => $term,
            'results' => $results
        ]);
    }
    
    public function teacherResults($teacher = null)
    {
        if (!$teacher) {
            $teacher = Auth::id();
        } else {
            $teacher = User::findOrFail($teacher);
        }
        
        $results = Result::where('teacher_id', $teacher instanceof User ? $teacher->id : $teacher)
            ->with(['student.user', 'student.classroom', 'subject', 'term.academicSession'])
            ->distinct()
            ->latest()
            ->get();
        
        return Inertia::render('Results/Teacher', [
            'teacher' => $teacher instanceof User ? $teacher : User::find($teacher),
            'results' => $results
        ]);
    }

    // Analysis and Compilation
    public function analysis()
    {
        $results = Result::with(['student.user', 'subject', 'term.academicSession'])
            ->distinct()
            ->latest()
            ->get();

        $statistics = [
            'total_results' => $results->count(),
            'average_score' => $results->avg('total_score'),
            'highest_score' => $results->max('total_score'),
            'lowest_score' => $results->min('total_score'),
            'pass_rate' => $results->count() > 0 
                ? $results->where('total_score', '>=', 40)->count() / $results->count() * 100 
                : 0,
        ];

        return Inertia::render('Results/Analysis', [
            'results' => $results,
            'statistics' => $statistics
        ]);
    }

    public function compileIndex()
    {
        try {
            // Simple test implementation
            $classrooms = Classroom::with('students')->get();
            $terms = Term::with('academicSession')->get();
            
            return Inertia::render('Results/Compile', [
                'auth' => [
                    'user' => Auth::user(),
                ],
                'classrooms' => $classrooms,
                'terms' => $terms,
                'results' => null,
                'students' => [],
                'selected_classroom' => null,
                'selected_term' => null,
                'filters' => []
            ]);
        } catch (\Exception $e) {
            Log::error('CompileIndex Error: ' . $e->getMessage());
            return redirect()->route('admin.results.index')->with('error', 'Unable to access compile page: ' . $e->getMessage());
        }
    }

    public function compile(Request $request)
    {
        $request->validate([
            'classroom_id' => 'required|exists:classrooms,id',
            'term_id' => 'required|exists:terms,id'
        ]);

        // Authorize compilation for this specific classroom
        $this->authorize('compile', [Result::class, $request->classroom_id]);
        
        $compilerService = new ResultCompilerService();
        
        // Check if compilation can be performed
        $canCompile = $compilerService->canCompile($request->classroom_id, $request->term_id);
        
        if (!$canCompile['can_compile']) {
            return redirect()->back()
                ->withErrors(['compilation' => $canCompile['message']]);
        }

        try {
            // Compile the results
            $compiledResults = $compilerService->compileResults($request->classroom_id, $request->term_id);
            
            // Get class statistics
            $statistics = $compilerService->getClassStatistics($request->classroom_id, $request->term_id);
            
            $user = User::with('role')->find(Auth::id());
            
            return Inertia::render('Results/Compile', [
                'auth' => [
                    'user' => $user,
                ],
                'compiled_results' => $compiledResults,
                'statistics' => $statistics,
                'classrooms' => Classroom::with('students')->get(),
                'terms' => Term::with('academicSession')->get(),
                'selected_classroom' => $request->classroom_id,
                'selected_term' => $request->term_id,
                'compilation_success' => true
            ]);
            
        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['compilation' => 'Failed to compile results: ' . $e->getMessage()]);
        }
    }

    // AI Remarks
    public function generateRemarks(Request $request)
    {
        $request->validate([
            'result_ids' => 'required|array',
            'result_ids.*' => 'exists:results,id'
        ]);

        $results = Result::whereIn('id', $request->result_ids)->get();
        $generatedCount = 0;

        foreach ($results as $result) {
            try {
                $remark = $this->generateAIRemark($result);
                $result->update(['remark' => $remark]);
                $generatedCount++;
            } catch (\Exception $e) {
                // Log error but continue with other results
                continue;
            }
        }

        return redirect()->back()->with('success', "Generated remarks for {$generatedCount} results successfully.");
    }
    
    public function generateRemark(Request $request)
    {
        $request->validate([
            'result_id' => 'required|exists:results,id'
        ]);

        $result = Result::findOrFail($request->result_id);
        
        try {
            $remark = $this->generateAIRemark($result);
            $result->update(['remark' => $remark]);
            return redirect()->back()->with('success', 'Remark generated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to generate remark: ' . $e->getMessage());
        }
    }

    protected function generateAIRemark(Result $result)
    {
        $student = $result->student->user->name;
        $subject = $result->subject->name;
        $score = $result->total_score;
        
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . config('services.openai.api_key'),
            'Content-Type' => 'application/json',
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-3.5-turbo',
            'messages' => [[
                'role' => 'system',
                'content' => 'You are a helpful teacher writing a constructive remark for a student\'s result.'
            ], [
                'role' => 'user',
                'content' => sprintf("Generate a short, constructive remark for %s who scored %.1f%% in %s. Keep it positive and motivating.", $student, $score, $subject)
            ]],
            'max_tokens' => 100,
            'temperature' => 0.7,
        ]);

        if ($response->successful()) {
            return $response->json()['choices'][0]['message']['content'];
        }

        return "Keep up the good work!"; // Fallback remark
    }

    // Import/Export functionality
    public function importPage()
    {
        return Inertia::render('Results/Import', [
            'auth' => [
                'user' => Auth::user(),
            ],
            'terms' => Term::with('academicSession')->get(),
            'classrooms' => Classroom::all(),
            'subjects' => Subject::all()
        ]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240', // Max 10MB
            'term_id' => 'required|exists:terms,id'
        ]);

        try {
            $file = $request->file('file');
            $filename = 'results_import_' . time() . '.' . $file->getClientOriginalExtension();
            
            // Store file temporarily
            $path = $file->storeAs('temp', $filename);
            
            DB::beginTransaction();
            
            $import = new ResultsImport($request->term_id);
            Excel::import($import, storage_path('app/' . $path));
            
            // Clean up temporary file
            Storage::delete($path);
            
            DB::commit();
            
            return redirect()->route('admin.results.import')
                ->with('success', 'Results imported successfully! Please verify the imported data.');
                
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            DB::rollBack();
            
            $failures = $e->failures();
            $errors = [];
            
            foreach ($failures as $failure) {
                $errors[] = "Row {$failure->row()}: " . implode(', ', $failure->errors());
            }
            
            return redirect()->route('admin.results.import')
                ->with('error', 'Import validation failed: ' . implode(' | ', array_slice($errors, 0, 5)));
                
        } catch (\Exception $e) {
            DB::rollBack();
            
            // Clean up temporary file if it exists
            if (isset($path)) {
                Storage::delete($path);
            }
            
            Log::error('Results import failed: ' . $e->getMessage());
            return redirect()->route('admin.results.import')
                ->with('error', 'Import failed: ' . $e->getMessage());
        }
    }

    public function export(Request $request)
    {
        try {
            $filters = [
                'term_id' => $request->term_id,
                'classroom_id' => $request->classroom_id,
                'subject_id' => $request->subject_id,
                'teacher_id' => $request->teacher_id,
                'min_score' => $request->min_score,
                'max_score' => $request->max_score,
            ];

            // Remove empty filters
            $filters = array_filter($filters, function($value) {
                return !empty($value);
            });

            $filename = 'results_export_' . date('Y-m-d_H-i-s') . '.xlsx';
            
            return Excel::download(new ResultsExport($filters), $filename);
            
        } catch (\Exception $e) {
            Log::error('Results export failed: ' . $e->getMessage());
            return back()->with('error', 'Export failed: ' . $e->getMessage());
        }
    }

    public function downloadTemplate(Request $request)
    {
        try {
            // Get the current active term or the first available term
            $termId = $request->term_id;
            
            if (!$termId) {
                // Try to get the current active term
                $activeTerm = \App\Models\Term::where('is_current', true)->first();
                if ($activeTerm) {
                    $termId = $activeTerm->id;
                } else {
                    // Fallback to the first term
                    $firstTerm = \App\Models\Term::first();
                    $termId = $firstTerm ? $firstTerm->id : 1;
                }
            }

            $filename = 'results_template_' . date('Y-m-d') . '.xlsx';
            return Excel::download(new ResultTemplateExport($termId), $filename);
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to download template: ' . $e->getMessage());
        }
    }

    public function updateComments(Request $request, Result $result)
    {

        // dd('ok');
        $request->validate([
            'teacher_comment' => 'nullable|string|max:500',
            'principal_comment' => 'nullable|string|max:500',
        ]);

        $user = User::with('role')->find(Auth::id());
        $data = [];

        if ($user->isTeacher() || $user->isAdmin()) {
            $data['teacher_comment'] = $request->teacher_comment;
            if (!$result->teacher_id) {
                $data['teacher_id'] = $user->id;
            }
        }

        if ($user->isAdmin()) {
            $data['principal_comment'] = $request->principal_comment;
            $data['principal_id'] = $user->id;
        }

        $result->update($data);

        return redirect()->back()->with('success', 'Comments updated successfully');
    }
}