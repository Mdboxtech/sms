<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use App\Models\User;
use App\Models\Subject;
use App\Models\Classroom;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class TeacherController extends Controller
{
    public function index(Request $request)
    {
        $query = Teacher::with(['user', 'subjects', 'classrooms'])
            ->when($request->search, function ($query, $search) {
                $query->where(function($subQuery) use ($search) {
                    $subQuery->whereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                                  ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhere('employee_id', 'like', "%{$search}%")
                    ->orWhere('qualification', 'like', "%{$search}%");
                });
            });

        return Inertia::render('Admin/Teachers/Index', [
            'teachers' => $query->latest()->paginate(15)->withQueryString(),
            'subjects' => Subject::all(),
            'classrooms' => Classroom::all(),
            'filters' => $request->only(['search'])
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Teachers/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'employee_id' => 'required|string|max:255|unique:teachers',
            'qualification' => 'nullable|string|max:255',
            'date_joined' => 'nullable|date'
        ]);

        // Create user with teacher role
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => 2, // Assuming 2 is the teacher role ID
        ]);

        // Create teacher profile
        $teacher = Teacher::create([
            'user_id' => $user->id,
            'employee_id' => $request->employee_id,
            'qualification' => $request->qualification,
            'date_joined' => $request->date_joined
        ]);

        return redirect()->route('admin.teachers.index')
            ->with('success', 'Teacher created successfully.');
    }

    public function edit(Teacher $teacher)
    {
        return Inertia::render('Admin/Teachers/Edit', [
            'teacher' => $teacher->load('user')
        ]);
    }

    public function update(Request $request, Teacher $teacher)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $teacher->user_id,
            'employee_id' => 'required|string|max:255|unique:teachers,employee_id,' . $teacher->id,
            'qualification' => 'nullable|string|max:255',
            'date_joined' => 'nullable|date'
        ]);

        // Update user
        $teacher->user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        // Update teacher profile
        $teacher->update([
            'employee_id' => $request->employee_id,
            'qualification' => $request->qualification,
            'date_joined' => $request->date_joined
        ]);

        return redirect()->route('admin.teachers.index')
            ->with('success', 'Teacher updated successfully.');
    }

    public function show(Teacher $teacher)
    {
        return Inertia::render('Admin/Teachers/Show', [
            'teacher' => $teacher->load([
                'user',
                'subjects' => function($query) {
                    $query->with(['classrooms']);
                },
                'classrooms' => function($query) {
                    $query->withCount('students');
                }
            ])
        ]);
    }

    public function destroy(Teacher $teacher)
    {
        // Delete teacher and associated user
        $user = $teacher->user;
        $teacher->delete();
        $user->delete();

        return redirect()->route('admin.teachers.index')
            ->with('success', 'Teacher deleted successfully.');
    }

    public function assignSubject(Request $request)
    {
        $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'subject_id' => 'required|exists:subjects,id',
        ]);

        $teacher = Teacher::findOrFail($request->teacher_id);
        
        // Check if the subject is already assigned to the teacher
        if (!$teacher->subjects->contains($request->subject_id)) {
            $teacher->subjects()->attach($request->subject_id);
        }

        return redirect()->back()->with('success', 'Subject assigned successfully.');
    }

    public function assignClassroom(Request $request)
    {
        $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'classroom_id' => 'required|exists:classrooms,id',
        ]);

        $teacher = Teacher::findOrFail($request->teacher_id);
        
        // Check if the classroom is already assigned to the teacher
        if (!$teacher->classrooms->contains($request->classroom_id)) {
            $teacher->classrooms()->attach($request->classroom_id);
        }

        return redirect()->back()->with('success', 'Classroom assigned successfully.');
    }

    public function removeSubject(Request $request)
    {
        $validated = $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'subject_id' => 'required|exists:subjects,id',
        ]);

        $teacher = Teacher::findOrFail($validated['teacher_id']);
        $teacher->subjects()->detach($validated['subject_id']);

        return redirect()->back()
            ->with('success', 'Subject removed from teacher successfully.');
    }

    public function removeClassroom(Request $request)
    {
        $validated = $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'classroom_id' => 'required|exists:classrooms,id',
        ]);

        $teacher = Teacher::findOrFail($validated['teacher_id']);
        $teacher->classrooms()->detach($validated['classroom_id']);

        return redirect()->back()
            ->with('success', 'Classroom removed from teacher successfully.');
    }
}