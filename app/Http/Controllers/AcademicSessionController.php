<?php

namespace App\Http\Controllers;

use App\Models\AcademicSession;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AcademicSessionController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Sessions/Index', [
            'sessions' => AcademicSession::with('terms')->latest()->get()
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Sessions/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:academic_sessions',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_current' => 'boolean'
        ]);

        if ($request->is_current) {
            AcademicSession::where('is_current', true)->update(['is_current' => false]);
        }

        AcademicSession::create($request->all());

        return redirect()->route('admin.sessions.index')
            ->with('success', 'Academic Session created successfully.');
    }

    public function edit(AcademicSession $session)
    {
        return Inertia::render('Admin/Sessions/Edit', [
            'session' => $session->load('terms')
        ]);
    }

    public function update(Request $request, AcademicSession $session)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:academic_sessions,name,' . $session->id,
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_current' => 'boolean'
        ]);

        if ($request->is_current) {
            AcademicSession::where('is_current', true)
                ->where('id', '!=', $session->id)
                ->update(['is_current' => false]);
        }

        $session->update($request->all());

        return redirect()->route('admin.sessions.index')
            ->with('success', 'Academic Session updated successfully.');
    }

    public function destroy(AcademicSession $session)
    {
        // Check if session has any related records before deleting
        if ($session->terms()->exists()) {
            return back()->with('error', 'Cannot delete session. It has associated terms.');
        }

        $session->delete();
        return redirect()->route('admin.sessions.index')
            ->with('success', 'Academic Session deleted successfully.');
    }

    public function toggle(AcademicSession $session)
    {
        if (!$session->is_current) {
            // If setting this session as current, deactivate all other sessions
            AcademicSession::where('is_current', true)
                ->where('id', '!=', $session->id)
                ->update(['is_current' => false]);
            $session->update(['is_current' => true]);
            $message = 'Session set as current.';
        } else {
            // If deactivating the current session
            $session->update(['is_current' => false]);
            $message = 'Session deactivated.';
        }

        return back()->with('success', $message);
    }
}
