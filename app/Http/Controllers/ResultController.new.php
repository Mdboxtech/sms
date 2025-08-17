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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
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
