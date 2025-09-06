<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClassroomController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search');
        
        $classrooms = Classroom::with(['subjects', 'teachers', 'students'])
            ->withCount(['students', 'subjects'])
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('section', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Classrooms/Index', [
            'classrooms' => $classrooms,
            'filters' => [
                'search' => $search,
            ]
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Classrooms/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'section' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
            'description' => 'nullable|string'
        ]);

        Classroom::create($request->all());

        return redirect()->route('admin.classrooms.index')
            ->with('success', 'Classroom created successfully.');
    }

    public function edit(Classroom $classroom)
    {
        return Inertia::render('Admin/Classrooms/Edit', [
            'classroom' => $classroom->load(['subjects', 'teachers', 'students'])
        ]);
    }

    public function update(Request $request, Classroom $classroom)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'section' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
            'description' => 'nullable|string'
        ]);

        $classroom->update($request->all());

        return redirect()->route('classrooms.index')
            ->with('success', 'Classroom updated successfully.');
    }

    public function destroy(Classroom $classroom)
    {
        $classroom->delete();

        return redirect()->route('classrooms.index')
            ->with('success', 'Classroom deleted successfully.');
    }

    public function show(Request $request, Classroom $classroom)
    {
        $studentsPerPage = 10; // Small pagination as requested
        
        // Get paginated students
        $students = $classroom->students()
            ->with('user')
            ->paginate($studentsPerPage, ['*'], 'students_page')
            ->withQueryString();
            
        // Load other relationships normally
        $classroom->load(['teachers.user', 'subjects']);
        
        return Inertia::render('Admin/Classrooms/Show', [
            'classroom' => $classroom,
            'students' => $students,
        ]);
    }
}
