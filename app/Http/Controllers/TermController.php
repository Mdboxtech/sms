<?php

namespace App\Http\Controllers;

use App\Models\Term;
use App\Models\AcademicSession;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TermController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Terms/Index', [
            'terms' => Term::with('academicSession')->latest()->get()
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Terms/Create', [
            'academicSessions' => AcademicSession::all()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_current' => 'boolean'
        ]);

        if ($request->is_current) {
            Term::where('is_current', true)->update(['is_current' => false]);
        }

        Term::create($request->all());

        return redirect()->route('admin.terms.index')
            ->with('success', 'Term created successfully.');
    }

    public function edit(Term $term)
    {
        return Inertia::render('Admin/Terms/Edit', [
            'term' => $term->load('academicSession'),
            'academicSessions' => AcademicSession::all()
        ]);
    }

    public function update(Request $request, Term $term)
    {
        $request->validate([
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_current' => 'boolean'
        ]);

        if ($request->is_current) {
            Term::where('id', '!=', $term->id)
                ->where('is_current', true)
                ->update(['is_current' => false]);
        }

        $term->update($request->all());

        return redirect()->route('admin.terms.index')
            ->with('success', 'Term updated successfully.');
    }

    public function destroy(Term $term)
    {
        $term->delete();

        return redirect()->route('admin.terms.index')
            ->with('success', 'Term deleted successfully.');
    }
}
