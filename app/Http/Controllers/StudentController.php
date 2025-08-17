<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\StudentsExport;
use App\Imports\StudentsImport;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::with(['user', 'classroom'])
            ->when($request->search, function ($query, $search) {
                $query->whereHas('user', function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhere('admission_number', 'like', "%{$search}%")
                ->orWhere('parent_name', 'like', "%{$search}%")
                ->orWhere('parent_phone', 'like', "%{$search}%");
            })
            ->when($request->classroom_id, function ($query, $classroom_id) {
                $query->where('classroom_id', $classroom_id);
            })
            ->when($request->gender, function ($query, $gender) {
                $query->where('gender', $gender);
            });

        // Get students data based on grouping
        if ($request->groupBy === 'classroom') {
            $students = $query->get()->groupBy('classroom.name');
            return Inertia::render('Students/Index', [
                'students' => $students,
                'isGrouped' => true,
                'classrooms' => \App\Models\Classroom::orderBy('name')->get(),
                'filters' => $request->only(['search', 'classroom_id', 'gender', 'groupBy'])
            ]);
        }

        return Inertia::render('Students/Index', [
            'students' => $query->latest()->paginate(10)->withQueryString(),
            'isGrouped' => false,
            'classrooms' => \App\Models\Classroom::orderBy('name')->get(),
            'filters' => $request->only(['search', 'classroom_id', 'gender', 'groupBy'])
        ]);
    }

    public function create()
    {
        return Inertia::render('Students/Create', [
            'classrooms' => \App\Models\Classroom::all()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'admission_number' => 'required|string|max:255|unique:students',
            'classroom_id' => 'required|exists:classrooms,id',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female',
            'parent_name' => 'required|string|max:255',
            'parent_phone' => 'required|string|max:255',
            'address' => 'nullable|string'
        ]);

        // Create user account
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make('password'), // Default password
            'role' => 'student'
        ]);

        // Create student record
        $student = $user->student()->create([
            'classroom_id' => $request->classroom_id,
            'admission_number' => $request->admission_number,
            'date_of_birth' => $request->date_of_birth,
            'gender' => $request->gender,
            'parent_name' => $request->parent_name,
            'parent_phone' => $request->parent_phone,
            'address' => $request->address
        ]);

        return redirect()->route('students.index')
            ->with('success', 'Student created successfully.');
    }

    public function edit(Student $student)
    {
        return Inertia::render('Students/Edit', [
            'student' => $student->load(['user', 'classroom']),
            'classrooms' => \App\Models\Classroom::all()
        ]);
    }

    public function update(Request $request, Student $student)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $student->user_id,
            'admission_number' => 'required|string|max:255|unique:students,admission_number,' . $student->id,
            'classroom_id' => 'required|exists:classrooms,id',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female',
            'parent_name' => 'required|string|max:255',
            'parent_phone' => 'required|string|max:255',
            'address' => 'nullable|string'
        ]);

        // Update user
        $student->user->update([
            'name' => $request->name,
            'email' => $request->email
        ]);

        // Update student
        $student->update([
            'classroom_id' => $request->classroom_id,
            'admission_number' => $request->admission_number,
            'date_of_birth' => $request->date_of_birth,
            'gender' => $request->gender,
            'parent_name' => $request->parent_name,
            'parent_phone' => $request->parent_phone,
            'address' => $request->address
        ]);

        return redirect()->route('students.index')
            ->with('success', 'Student updated successfully.');
    }

    public function destroy(Student $student)
    {
        $student->user->delete(); // Will cascade delete student record

        return redirect()->route('students.index')
            ->with('success', 'Student deleted successfully.');
    }

    public function teacherStudents()
    {
        $user = auth()->user();
        $teacher = $user->teacher;
        
        if (!$teacher) {
            return Inertia::render('Teacher/Students', [
                'students' => collect()
            ]);
        }
        
        $students = Student::whereIn('classroom_id', $teacher->classrooms->pluck('id'))
            ->with(['user', 'classroom', 'subjects'])
            ->get();
        
        return Inertia::render('Teacher/Students', [
            'students' => $students
        ]);
    }

    public function export()
    {
        return Excel::download(new StudentsExport, 'students.xlsx');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls',
        ]);

        try {
            Excel::import(new StudentsImport, $request->file('file'));
            return back()->with('success', 'Students imported successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Error importing students: ' . $e->getMessage());
        }
    }
}
