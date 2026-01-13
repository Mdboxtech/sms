<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Result;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Term;
use App\Models\Teacher;
use App\Models\Classroom;
use App\Http\Requests\StoreResultRequest;
use App\Http\Requests\UpdateResultRequest;
use App\Http\Requests\BulkStoreResultRequest;
use App\Services\ResultCompilerService;
use App\Services\ClassTeacherService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;

class ResultController extends Controller
{
    use AuthorizesRequests;

    protected $classTeacherService;

    public function __construct(ClassTeacherService $classTeacherService)
    {
        $this->classTeacherService = $classTeacherService;
    }

    /**
     * Display results for the authenticated teacher
     */
    public function index(Request $request)
    {
        $teacher = Auth::user()->teacher;
        
        if (!$teacher) {
            return redirect()->route('teacher.dashboard')
                ->with('error', 'Teacher profile not found.');
        }

        // Get all manageable subjects for all assigned classrooms
        $manageableSubjects = collect();
        $teacherClassrooms = $this->classTeacherService->getTeacherClassrooms($teacher->id);
        
        foreach ($teacherClassrooms as $classroom) {
            $classroomSubjects = $this->classTeacherService->getTeacherManageableSubjects($teacher->id, $classroom->id);
            $manageableSubjects = $manageableSubjects->merge($classroomSubjects);
        }
        
        // Add directly assigned subjects if not already included
        $directSubjects = $teacher->subjects;
        $manageableSubjects = $manageableSubjects->merge($directSubjects)->unique('id');
        
        $manageableSubjectIds = $manageableSubjects->pluck('id');

        // Build query to get all manageable results
        $query = Result::query();
        
        // Apply class-based filtering: only results for students in teacher's classes OR subjects teacher is assigned to
        $query->where(function ($q) use ($teacher, $teacherClassrooms, $manageableSubjectIds) {
            // Results for students in teacher's assigned classrooms
            if ($teacherClassrooms->isNotEmpty()) {
                $classroomIds = $teacherClassrooms->pluck('id');
                $q->whereHas('student', function ($studentQuery) use ($classroomIds) {
                    $studentQuery->whereIn('classroom_id', $classroomIds);
                });
            }
            
            // OR results for subjects teacher is directly assigned to (regardless of classroom)
            if ($manageableSubjectIds->isNotEmpty()) {
                $q->orWhereIn('subject_id', $manageableSubjectIds);
            }
        });
        
        $query->with(['student.user', 'student.classroom', 'subject', 'term.academicSession'])
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
            ->latest();

        return Inertia::render('Teacher/Results/Index', [
            'results' => $query->paginate(20)->withQueryString(),
            'subjects' => $manageableSubjects,
            'classrooms' => $teacherClassrooms,
            'terms' => Term::with('academicSession')->get(),
            'filters' => $request->only(['subject_id', 'classroom_id', 'term_id'])
        ]);
    }

    /**
     * Show form for creating new result
     */
    public function create(Request $request)
    {
        $teacher = Auth::user()->teacher;
        
        if (!$teacher) {
            return redirect()->route('teacher.dashboard')
                ->with('error', 'Teacher profile not found.');
        }

        // Get classrooms from Class Teacher assignments
        $classTeacherClassrooms = $this->classTeacherService->getTeacherClassrooms($teacher->id);
        
        // Get classrooms from Subject Teacher assignments (subjects the teacher teaches)
        $subjectTeacherClassrooms = $teacher->subjects()
            ->with('classrooms')
            ->get()
            ->pluck('classrooms')
            ->flatten()
            ->unique('id');
        
        // Merge both and remove duplicates
        $teacherClassrooms = $classTeacherClassrooms->merge($subjectTeacherClassrooms)->unique('id')->values();
        
        // Get all manageable subjects across all accessible classrooms
        $manageableSubjects = collect();
        foreach ($teacherClassrooms as $classroom) {
            $classroomSubjects = $this->classTeacherService->getTeacherManageableSubjects($teacher->id, $classroom->id);
            $manageableSubjects = $manageableSubjects->merge($classroomSubjects);
        }
        
        // Remove duplicates and get unique subjects
        $subjects = $manageableSubjects->unique('id')->values();
        $students = collect();
        
        // If a classroom is selected, get its students and filter subjects
        if ($request->classroom_id) {
            $students = Student::with('user')
                ->where('classroom_id', $request->classroom_id)
                ->orderBy('admission_number')
                ->get();
                
            // Get subjects for this specific classroom
            $subjects = $this->classTeacherService->getTeacherManageableSubjects($teacher->id, $request->classroom_id);
        }

        return Inertia::render('Teacher/Results/Create', [
            'subjects' => $subjects,
            'students' => $students,
            'classrooms' => $teacherClassrooms,
            'terms' => Term::with('academicSession')
                ->whereHas('academicSession', function($query) {
                    $query->where('is_current', true);
                })
                ->get(),
            'selected_classroom' => $request->classroom_id
        ]);
    }

    /**
     * Store a new result
     */
    public function store(StoreResultRequest $request)
    {
        $teacher = Auth::user()->teacher;
        
        // Verify teacher can create result for this subject
        $canCreate = false;

        // 1. Check if directly assigned to subject
        if ($teacher->subjects->contains($request->subject_id)) {
            $canCreate = true;
        } 
        // 2. Check if class teacher and subject belongs to class
        else {
            $student = Student::find($request->student_id);
            if ($student && $this->classTeacherService->isTeacherAssignedToClass($teacher->id, $student->classroom_id)) {
                 $classroomSubjects = $this->classTeacherService->getClassroomSubjects($student->classroom_id);
                 if ($classroomSubjects->contains('id', $request->subject_id)) {
                     $canCreate = true;
                 }
            }
        }

        if (!$canCreate) {
            return redirect()->back()
                ->withErrors(['subject_id' => 'You are not authorized to create results for this subject.']);
        }

        // Check for duplicate result
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

        // Create result
        $result = Result::create([
            'student_id' => $request->student_id,
            'subject_id' => $request->subject_id,
            'term_id' => $request->term_id,
            'ca_score' => $request->ca_score,
            'exam_score' => $request->exam_score,
            'total_score' => $request->ca_score + $request->exam_score,
            'teacher_id' => Auth::id()
        ]);

        return redirect()->route('teacher.results.index')
            ->with('success', 'Result recorded successfully.');
    }

    /**
     * Show form for bulk creating results
     */
    public function bulkCreate(Request $request)
    {
        $teacher = Auth::user()->teacher;
        
        if (!$teacher) {
            return redirect()->route('teacher.dashboard')
                ->with('error', 'Teacher profile not found.');
        }

        $subjects = $teacher->subjects;
        $students = collect();
        
        // Get classrooms that teach the teacher's subjects
        $classrooms = $teacher->subjects()
            ->with('classrooms')
            ->get()
            ->pluck('classrooms')
            ->flatten()
            ->unique('id')
            ->values();
        
        // If a classroom is selected, get its students
        if ($request->classroom_id) {
            $students = Student::with('user')
                ->where('classroom_id', $request->classroom_id)
                ->orderBy('admission_number')
                ->get();
        }

        return Inertia::render('Teacher/Results/BulkCreate', [
            'subjects' => $subjects,
            'students' => $students,
            'classrooms' => $classrooms,
            'terms' => Term::with('academicSession')
                ->whereHas('academicSession', function($query) {
                    $query->where('is_current', true);
                })
                ->get(),
            'selected_classroom' => $request->classroom_id,
            'selected_subject' => $request->subject_id,
            'selected_term' => $request->term_id
        ]);
    }

    /**
     * Store bulk results
     */
    public function bulkStore(BulkStoreResultRequest $request)
    {
        $teacher = Auth::user()->teacher;
        
        $created = 0;
        $skipped = 0;
        
        try {
            foreach ($request->results as $resultData) {
                // Verify teacher can create result for this subject
                $canCreate = false;

                // 1. Check if directly assigned to subject
                if ($teacher->subjects->contains($resultData['subject_id'])) {
                    $canCreate = true;
                } 
                // 2. Check if class teacher and subject belongs to class
                else {
                    $student = Student::find($resultData['student_id']);
                    if ($student && $this->classTeacherService->isTeacherAssignedToClass($teacher->id, $student->classroom_id)) {
                         $classroomSubjects = $this->classTeacherService->getClassroomSubjects($student->classroom_id);
                         if ($classroomSubjects->contains('id', $resultData['subject_id'])) {
                             $canCreate = true;
                         }
                    }
                }

                if (!$canCreate) {
                    $skipped++;
                    continue;
                }
                
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
                    $created++;
                } else {
                    $skipped++;
                }
            }

            $message = "Created {$created} results.";
            if ($skipped > 0) {
                $message .= " Skipped {$skipped} duplicate(s).";
            }

            return redirect()->back()->with('success', $message);
            
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to save results: ' . $e->getMessage());
        }
    }

    /**
     * Show edit form for a result
     */
    public function edit(Result $result)
    {
        $this->authorize('update', $result);

        $teacher = Auth::user()->teacher;
        
        return Inertia::render('Teacher/Results/Edit', [
            'result' => $result->load([
                'student.user',
                'student.classroom',
                'subject',
                'term.academicSession'
            ]),
            'subjects' => $this->classTeacherService->getTeacherManageableSubjects(
                $teacher->id, 
                $result->student->classroom_id
            ),
            'students' => Student::with('user')
                ->where('classroom_id', $result->student->classroom_id)
                ->orderBy('admission_number')
                ->get(),
            'terms' => Term::with('academicSession')->get()
        ]);
    }

    /**
     * Update a result
     */
    public function update(UpdateResultRequest $request, Result $result)
    {
        $this->authorize('update', $result);

        $result->update([
            'ca_score' => $request->ca_score,
            'exam_score' => $request->exam_score,
            'total_score' => $request->ca_score + $request->exam_score,
        ]);

        return redirect()->route('teacher.results.index')
            ->with('success', 'Result updated successfully.');
    }

    /**
     * Delete a result
     */
    public function destroy(Result $result)
    {
        $this->authorize('delete', $result);

        $result->delete();

        return redirect()->route('teacher.results.index')
            ->with('success', 'Result deleted successfully.');
    }

    /**
     * Get students for a classroom (AJAX)
     */
    /**
     * Get students and subjects for a classroom (AJAX)
     */
    public function getClassroomStudents($classroomId)
    {
        $teacher = Auth::user()->teacher;
        \Illuminate\Support\Facades\Log::info('getClassroomStudents: Request', ['teacher_id' => $teacher->id, 'classroom_id' => $classroomId]);
        
        // Check if teacher has access to this classroom (either as class teacher or subject teacher)
        $isClassTeacher = $this->classTeacherService->isTeacherAssignedToClass($teacher->id, $classroomId);
        
        $hasSubjectAssignment = $teacher->subjects()->whereHas('classrooms', function($q) use ($classroomId) {
            $q->where('classrooms.id', $classroomId); 
        })->exists();

        \Illuminate\Support\Facades\Log::info('getClassroomStudents: Permissions', [
            'isClassTeacher' => $isClassTeacher, 
            'hasSubjectAssignment' => $hasSubjectAssignment
        ]);

        if (!$isClassTeacher && !$hasSubjectAssignment) {
            \Illuminate\Support\Facades\Log::warning('getClassroomStudents: Unauthorized');
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $students = Student::with('user')
            ->where('classroom_id', $classroomId)
            ->orderBy('admission_number')
            ->get();

        // Get subjects available for this teacher in this classroom
        $subjects = $this->classTeacherService->getTeacherManageableSubjects($teacher->id, $classroomId);
        
        \Illuminate\Support\Facades\Log::info('getClassroomStudents: Data Found', [
            'students_count' => $students->count(),
            'subjects_count' => $subjects->count()
        ]);

        return response()->json([
            'students' => $students,
            'subjects' => $subjects
        ]);
    }

    /**
     * Show the compilation form
     */
    public function compileIndex()
    {
        $teacher = Auth::user()->teacher;
        
        if (!$teacher) {
            return redirect()->route('teacher.dashboard')
                ->with('error', 'Teacher profile not found.');
        }

        // Get classrooms that teach the teacher's subjects
        $classrooms = $teacher->subjects()
            ->with('classrooms')
            ->get()
            ->pluck('classrooms')
            ->flatten()
            ->unique('id')
            ->values();

        $terms = Term::with('academicSession')->get();

        return Inertia::render('Teacher/Results/Compile', [
            'classrooms' => $classrooms,
            'terms' => $terms,
        ]);
    }

    /**
     * Compile results for a classroom and term
     */
    public function compile(Request $request)
    {
        $request->validate([
            'classroom_id' => 'required|exists:classrooms,id',
            'term_id' => 'required|exists:terms,id',
        ]);

        $teacher = Auth::user()->teacher;
        
        if (!$teacher) {
            return redirect()->route('teacher.dashboard')
                ->with('error', 'Teacher profile not found.');
        }

        // Check if teacher teaches any subjects in this classroom
        $classroomSubjects = Subject::whereHas('classrooms', function ($query) use ($request) {
            $query->where('classrooms.id', $request->classroom_id);
        })->pluck('id');

        $teacherSubjects = $teacher->subjects()->pluck('subjects.id');
        
        $hasPermission = $teacherSubjects->intersect($classroomSubjects)->isNotEmpty();
        
        if (!$hasPermission) {
            return back()->withErrors(['classroom' => 'You do not teach any subjects in this classroom.']);
        }

        try {
            $compilerService = new ResultCompilerService();
            
            // Get compiled results for the teacher's subjects only
            $allCompiledResults = $compilerService->compileResults($request->classroom_id, $request->term_id);
            
            // Filter to show only results for subjects the teacher teaches
            $teacherCompiledResults = collect($allCompiledResults)->map(function ($studentResult) use ($teacherSubjects) {
                $studentResult['subjects'] = collect($studentResult['subjects'])->filter(function ($subject) use ($teacherSubjects) {
                    return $teacherSubjects->contains($subject['subject_id']);
                })->values()->toArray();
                
                return $studentResult;
            })->filter(function ($studentResult) {
                return count($studentResult['subjects']) > 0;
            })->values()->toArray();

            $classroom = Classroom::find($request->classroom_id);
            $term = Term::with('academicSession')->find($request->term_id);

            return Inertia::render('Teacher/Results/Compile', [
                'classrooms' => $teacher->subjects()
                    ->with('classrooms')
                    ->get()
                    ->pluck('classrooms')
                    ->flatten()
                    ->unique('id')
                    ->values(),
                'terms' => Term::with('academicSession')->get(),
                'compiledResults' => $teacherCompiledResults,
                'selectedClassroom' => $classroom,
                'selectedTerm' => $term,
                'statistics' => [
                    'total_students' => count($teacherCompiledResults),
                    'subjects_taught' => $teacherSubjects->count(),
                ]
            ]);
            
        } catch (\Exception $e) {
            return back()->withErrors(['compilation' => 'Error compiling results: ' . $e->getMessage()]);
        }
    }
}
