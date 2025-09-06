<?php

namespace App\Http\Controllers;

use App\Models\AcademicSession;
use App\Models\Term;
use App\Models\Event;
use App\Models\Assignment;
use App\Models\Result;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class CalendarController extends Controller
{
    /**
     * Display the calendar page
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $currentDate = $request->get('date', now()->format('Y-m-d'));
        $viewType = $request->get('view', 'month'); // month, week, day
        
        $startDate = Carbon::parse($currentDate)->startOfMonth();
        $endDate = Carbon::parse($currentDate)->endOfMonth();
        
        // Get events based on user role
        $events = $this->getEventsForUser($user, $startDate, $endDate);
        
        // Get current academic session and term
        $currentSession = AcademicSession::where('is_current', true)->first();
        $currentTerm = null;
        if ($currentSession) {
            $currentTerm = Term::where('academic_session_id', $currentSession->id)
                ->where('is_current', true)
                ->first();
        }
        
        // Get upcoming events (next 7 days)
        $upcomingEvents = $this->getUpcomingEvents($user, 7);
        
        return Inertia::render('Calendar/Index', [
            'events' => $events,
            'currentDate' => $currentDate,
            'viewType' => $viewType,
            'currentSession' => $currentSession,
            'currentTerm' => $currentTerm,
            'upcomingEvents' => $upcomingEvents,
            'userRole' => $user->role->name ?? 'student'
        ]);
    }

    /**
     * Get events for a specific user based on their role
     */
    private function getEventsForUser($user, $startDate, $endDate)
    {
        $events = collect();
        
        // School-wide events (visible to all)
        $schoolEvents = Event::whereBetween('event_date', [$startDate, $endDate])
            ->where('is_active', true)
            ->get()
            ->map(function($event) {
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'date' => $event->event_date,
                    'time' => $event->event_time,
                    'type' => 'school_event',
                    'description' => $event->description,
                    'color' => '#3b82f6', // blue
                    'category' => 'School Event'
                ];
            });
        
        $events = $events->merge($schoolEvents);
        
        // Role-specific events
        switch ($user->role->name ?? '') {
            case 'student':
                $events = $events->merge($this->getStudentEvents($user, $startDate, $endDate));
                break;
            case 'teacher':
                $events = $events->merge($this->getTeacherEvents($user, $startDate, $endDate));
                break;
            case 'admin':
                $events = $events->merge($this->getAdminEvents($user, $startDate, $endDate));
                break;
        }
        
        return $events->sortBy('date')->values();
    }

    /**
     * Get student-specific events
     */
    private function getStudentEvents($user, $startDate, $endDate)
    {
        $events = collect();
        $student = $user->student;
        
        if (!$student) {
            return $events;
        }
        
        // Assignment due dates
        $assignments = Assignment::whereHas('classroom', function($query) use ($student) {
                $query->where('id', $student->classroom_id);
            })
            ->whereBetween('due_date', [$startDate, $endDate])
            ->get()
            ->map(function($assignment) {
                return [
                    'id' => 'assignment_' . $assignment->id,
                    'title' => $assignment->title . ' (Due)',
                    'date' => $assignment->due_date,
                    'time' => '23:59',
                    'type' => 'assignment_due',
                    'description' => $assignment->description,
                    'color' => '#ef4444', // red
                    'category' => 'Assignment Due'
                ];
            });
        
        $events = $events->merge($assignments);
        
        // Exam dates (if stored in results or separate exam table)
        // This is a placeholder - adjust based on your exam scheduling system
        
        return $events;
    }

    /**
     * Get teacher-specific events
     */
    private function getTeacherEvents($user, $startDate, $endDate)
    {
        $events = collect();
        $teacher = $user->teacher;
        
        if (!$teacher) {
            return $events;
        }
        
        // Assignment due dates for classes they teach
        $assignments = Assignment::whereIn('subject_id', $teacher->subjects->pluck('id'))
            ->whereBetween('due_date', [$startDate, $endDate])
            ->get()
            ->map(function($assignment) {
                return [
                    'id' => 'assignment_' . $assignment->id,
                    'title' => $assignment->title . ' (Grading Due)',
                    'date' => $assignment->due_date,
                    'time' => '17:00',
                    'type' => 'assignment_grading',
                    'description' => 'Grade: ' . $assignment->title,
                    'color' => '#f59e0b', // amber
                    'category' => 'Grading'
                ];
            });
        
        $events = $events->merge($assignments);
        
        // Result submission deadlines
        // Add other teacher-specific events here
        
        return $events;
    }

    /**
     * Get admin-specific events
     */
    private function getAdminEvents($user, $startDate, $endDate)
    {
        $events = collect();
        
        // Term start/end dates
        $terms = Term::whereBetween('start_date', [$startDate, $endDate])
            ->orWhereBetween('end_date', [$startDate, $endDate])
            ->get();
        
        foreach ($terms as $term) {
            if ($term->start_date >= $startDate && $term->start_date <= $endDate) {
                $events->push([
                    'id' => 'term_start_' . $term->id,
                    'title' => $term->name . ' Begins',
                    'date' => $term->start_date,
                    'time' => '08:00',
                    'type' => 'term_start',
                    'description' => 'Start of ' . $term->name,
                    'color' => '#10b981', // green
                    'category' => 'Academic'
                ]);
            }
            
            if ($term->end_date >= $startDate && $term->end_date <= $endDate) {
                $events->push([
                    'id' => 'term_end_' . $term->id,
                    'title' => $term->name . ' Ends',
                    'date' => $term->end_date,
                    'time' => '17:00',
                    'type' => 'term_end',
                    'description' => 'End of ' . $term->name,
                    'color' => '#dc2626', // red
                    'category' => 'Academic'
                ]);
            }
        }
        
        return $events;
    }

    /**
     * Get upcoming events for dashboard widget
     */
    private function getUpcomingEvents($user, $days = 7)
    {
        $startDate = now();
        $endDate = now()->addDays($days);
        
        return $this->getEventsForUser($user, $startDate, $endDate)
            ->take(5);
    }

    /**
     * Create a new event (admin only)
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'event_date' => 'required|date',
            'event_time' => 'nullable|string',
            'type' => 'required|string|in:school_event,holiday,exam,meeting,assignment,other',
        ]);

        Event::create([
            'title' => $request->title,
            'description' => $request->description,
            'event_date' => $request->event_date,
            'event_time' => $request->event_time,
            'type' => $request->type,
            'created_by' => Auth::id(),
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', 'Event created successfully.');
    }

    /**
     * Update an existing event
     */
    public function update(Request $request, Event $event)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'event_date' => 'required|date',
            'event_time' => 'nullable|string',
            'type' => 'required|string|in:school_event,holiday,exam,meeting,assignment,other',
        ]);

        $event->update([
            'title' => $request->title,
            'description' => $request->description,
            'event_date' => $request->event_date,
            'event_time' => $request->event_time,
            'type' => $request->type,
        ]);

        return redirect()->back()->with('success', 'Event updated successfully.');
    }

    /**
     * Delete an event
     */
    public function destroy(Event $event)
    {
        $event->delete();
        return redirect()->back()->with('success', 'Event deleted successfully.');
    }

    /**
     * Admin calendar view with additional management features
     */
    public function adminIndex(Request $request)
    {
        $user = Auth::user();
        $currentDate = $request->get('date', now()->format('Y-m-d'));
        $viewType = $request->get('view', 'month');
        
        $startDate = Carbon::parse($currentDate)->startOfMonth();
        $endDate = Carbon::parse($currentDate)->endOfMonth();
        
        // Get all events for admin (no filtering)
        $events = Event::whereBetween('event_date', [$startDate, $endDate])
            ->where('is_active', true)
            ->get()
            ->map(function($event) {
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'event_date' => $event->event_date,
                    'event_time' => $event->event_time,
                    'type' => $event->type,
                    'description' => $event->description,
                    'location' => $event->location,
                    'color' => $event->color ?? '#3b82f6',
                    'all_day' => $event->all_day ?? false,
                    'created_by' => $event->createdBy ? $event->createdBy->name : 'System'
                ];
            });
        
        // Get current academic session and term
        $currentSession = AcademicSession::where('is_current', true)->first();
        $currentTerm = null;
        if ($currentSession) {
            $currentTerm = Term::where('academic_session_id', $currentSession->id)
                ->where('is_current', true)
                ->first();
        }
        
        // Get upcoming events (next 30 days for admin)
        $upcomingEvents = Event::where('event_date', '>=', now()->format('Y-m-d'))
            ->where('event_date', '<=', now()->addDays(30)->format('Y-m-d'))
            ->where('is_active', true)
            ->orderBy('event_date')
            ->orderBy('event_time')
            ->get()
            ->map(function($event) {
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'event_date' => $event->event_date,
                    'event_time' => $event->event_time,
                    'type' => $event->type,
                    'description' => $event->description
                ];
            });
        
        return Inertia::render('Admin/Calendar', [
            'events' => $events,
            'currentDate' => $currentDate,
            'viewType' => $viewType,
            'currentSession' => $currentSession,
            'currentTerm' => $currentTerm,
            'upcomingEvents' => $upcomingEvents,
            'userRole' => 'admin'
        ]);
    }
}
