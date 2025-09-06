<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index()
    {
        return Inertia::render('Subjects/Index', [
            'subjects' => Subject::with(['classrooms', 'teachers.user'])->get()
        ]);
    }

    public function create()
    {
        return Inertia::render('Subjects/Form', [
            'classrooms' => \App\Models\Classroom::all(),
            'teachers' => \App\Models\Teacher::with('user')->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:subjects',
            'description' => 'nullable|string',
            'classroom_ids' => 'required|array',
            'classroom_ids.*' => 'exists:classrooms,id',
            'teacher_ids' => 'required|array',
            'teacher_ids.*' => 'exists:teachers,id'
        ]);

        $subject = Subject::create([
            'name' => $request->name,
            'code' => $request->code,
            'description' => $request->description,
        ]);

        $subject->classrooms()->attach($request->classroom_ids);
        $subject->teachers()->attach($request->teacher_ids);

        return redirect()->route('admin.subjects.index')
            ->with('success', 'Subject created successfully.');
    }

    public function show(Subject $subject)
    {
        return Inertia::render('Subjects/Show', [
            'subject' => $subject->load(['classrooms', 'teachers.user', 'results.student.user'])
        ]);
    }

    public function edit(Subject $subject)
    {
        return Inertia::render('Subjects/Form', [
            'subject' => $subject->load(['classrooms', 'teachers']),
            'classrooms' => \App\Models\Classroom::all(),
            'teachers' => \App\Models\Teacher::with('user')->get()
        ]);
    }

    public function update(Request $request, Subject $subject)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:subjects,code,' . $subject->id,
            'description' => 'nullable|string',
            'classroom_ids' => 'required|array',
            'classroom_ids.*' => 'exists:classrooms,id',
            'teacher_ids' => 'required|array',
            'teacher_ids.*' => 'exists:teachers,id'
        ]);

        $subject->update([
            'name' => $request->name,
            'code' => $request->code,
            'description' => $request->description,
        ]);

        $subject->classrooms()->sync($request->classroom_ids);
        $subject->teachers()->sync($request->teacher_ids);

        return redirect()->route('admin.subjects.index')
            ->with('success', 'Subject updated successfully.');
    }

    public function destroy(Subject $subject)
    {
        $subject->delete();

        return redirect()->route('subjects.index')
            ->with('success', 'Subject deleted successfully.');
    }

    public function teacherSubjects()
    {
        $teacher = Auth::user()->teacher;
        
        if (!$teacher) {
            return Inertia::render('Teacher/Subjects', [
                'subjects' => collect()
            ]);
        }
        
        $subjects = $teacher->subjects()
            ->with(['classrooms.students.user'])
            ->get()
            ->map(function ($subject) {
                // Calculate total students across all classrooms for this subject
                $totalStudents = $subject->classrooms->sum(function ($classroom) {
                    return $classroom->students->count();
                });
                
                $subject->students_count = $totalStudents;
                return $subject;
            });
        
        return Inertia::render('Teacher/Subjects', [
            'subjects' => $subjects
        ]);
    }
}
