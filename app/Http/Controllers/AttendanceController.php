<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Student;
use App\Models\Classroom;
use App\Models\AcademicSession;
use App\Models\Term;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    /**
     * Display attendance index page
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Debug: Log user info to see what's happening
        Log::info('Attendance access', [
            'user_id' => $user->id,
            'user_role' => $user->role ? $user->role->name : 'no role',
            'has_teacher' => $user->teacher ? 'yes' : 'no',
        ]);
        
        if ($user->role && $user->role->name === 'teacher' && !$user->teacher) {
            return Inertia::render('Errors/TeacherLink', [
                'message' => 'Your account is not linked to a teacher profile. Please contact the administrator.'
            ]);
        }
        
        $currentSession = AcademicSession::where('is_current', true)->first();
        $currentTerm = Term::where('is_current', true)->first();
        
        // Get filters
        $selectedDate = $request->get('date', now()->format('Y-m-d'));
        $selectedClassroom = $request->get('classroom_id');
        $selectedTerm = $request->get('term_id', $currentTerm?->id);
        $selectedSession = $request->get('academic_session_id', $currentSession?->id);
        
        // Get classrooms based on user role
        $classrooms = $this->getAccessibleClassrooms($user);
        
        // Get attendance data
        $attendanceData = $this->getAttendanceData(
            $selectedDate,
            $selectedClassroom,
            $selectedTerm,
            $selectedSession,
            $user,
            $request
        );
        
        // Determine which view to render based on user role
        $viewPath = $user->role && $user->role->name === 'teacher' 
            ? 'Teacher/Attendance/Index' 
            : 'Admin/Attendance/Index';
        
        return Inertia::render($viewPath, [
            'attendances' => $attendanceData,
            'classrooms' => $classrooms,
            'terms' => Term::with('academicSession')->get(),
            'sessions' => AcademicSession::all(),
            'filters' => [
                'date' => $selectedDate,
                'classroom_id' => $selectedClassroom,
                'term_id' => $selectedTerm,
                'academic_session_id' => $selectedSession,
            ],
            'currentSession' => $currentSession,
            'currentTerm' => $currentTerm,
            'statusOptions' => Attendance::getStatusOptions(),
        ]);
    }

    /**
     * Show daily attendance marking form
     */
    public function create(Request $request)
    {
        $user = Auth::user();
        $currentSession = AcademicSession::where('is_current', true)->first();
        $currentTerm = Term::where('is_current', true)->first();
        
        $selectedDate = $request->get('date', now()->format('Y-m-d'));
        $selectedClassroom = $request->get('classroom_id');
        
        // Get accessible classrooms
        $classrooms = $this->getAccessibleClassrooms($user);
        
        // If no classroom selected and user is teacher, default to first accessible classroom
        if (!$selectedClassroom && $user->role && $user->role->name === 'teacher' && $classrooms->isNotEmpty()) {
            $selectedClassroom = $classrooms->first()->id;
        }
        
        $students = collect();
        $existingAttendance = collect();
        
        if ($selectedClassroom) {
            // Get students in the selected classroom
            $students = Student::with('user')
                ->where('classroom_id', $selectedClassroom)
                ->orderBy('admission_number')
                ->get();
            
            // Get existing attendance for the selected date
            $existingAttendance = Attendance::with(['student.user'])
                ->where('classroom_id', $selectedClassroom)
                ->where('date', $selectedDate)
                ->where('academic_session_id', $currentSession?->id)
                ->where('term_id', $currentTerm?->id)
                ->get()
                ->keyBy('student_id');
        }
        
        // Determine which view to render based on user role
        $viewPath = $user->role && $user->role->name === 'teacher' 
            ? 'Teacher/Attendance/Create' 
            : 'Admin/Attendance/Create';
        
        return Inertia::render($viewPath, [
            'classrooms' => $classrooms,
            'students' => $students,
            'existingAttendance' => $existingAttendance,
            'selectedDate' => $selectedDate,
            'selectedClassroom' => $selectedClassroom,
            'currentSession' => $currentSession,
            'currentTerm' => $currentTerm,
            'statusOptions' => Attendance::getStatusOptions(),
        ]);
    }

    /**
     * Store attendance records
     */
    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'classroom_id' => 'required|exists:classrooms,id',
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'term_id' => 'required|exists:terms,id',
            'attendances' => 'required|array',
            'attendances.*.student_id' => 'required|exists:students,id',
            'attendances.*.status' => ['required', Rule::in(['present', 'absent', 'late', 'excused'])],
            'attendances.*.arrival_time' => 'nullable|date_format:H:i',
            'attendances.*.notes' => 'nullable|string|max:500',
        ]);

        $user = Auth::user();
        $attendanceData = [];
        
        foreach ($request->attendances as $attendance) {
            $attendanceData[] = [
                'student_id' => $attendance['student_id'],
                'classroom_id' => $request->classroom_id,
                'academic_session_id' => $request->academic_session_id,
                'term_id' => $request->term_id,
                'date' => $request->date,
                'status' => $attendance['status'],
                'arrival_time' => $attendance['arrival_time'] ?? null,
                'notes' => $attendance['notes'] ?? null,
                'marked_by' => $user->id,
            ];
        }
        
        // Use bulk attendance marking
        Attendance::markBulkAttendance($attendanceData);
        
        // Determine redirect route based on user role
        $redirectRoute = $user->role && $user->role->name === 'teacher' 
            ? 'teacher.attendance.index' 
            : 'admin.attendance.index';
        
        return redirect()->route($redirectRoute)->with('success', 'Attendance marked successfully for ' . count($attendanceData) . ' students.');
    }

    /**
     * Display attendance for a specific date/classroom
     */
    public function show(Request $request, $id = null)
    {
        // If ID is provided, show specific attendance record
        if ($id) {
            $attendance = Attendance::with(['student.user', 'classroom', 'markedBy', 'updatedBy'])
                ->findOrFail($id);
                
            return Inertia::render('Admin/Attendance/Show', [
                'attendance' => $attendance,
            ]);
        }
        
        // Otherwise redirect to index with filters
        return redirect()->route('attendance.index', $request->all());
    }

    /**
     * Show edit form for attendance record
     */
    public function edit(Attendance $attendance)
    {
        $user = Auth::user();
        
        // Check if teacher can edit this attendance record (belongs to their class)
        if ($user->role && $user->role->name === 'teacher' && $user->teacher) {
            $teacherClassroomIds = $user->teacher->classrooms()->pluck('classrooms.id');
            if (!$teacherClassroomIds->contains($attendance->classroom_id)) {
                abort(403, 'You can only edit attendance for your assigned classes.');
            }
        }
        
        $attendance->load(['student.user', 'classroom', 'markedBy']);
        
        // Determine which view to render based on user role
        $viewPath = $user->role && $user->role->name === 'teacher' 
            ? 'Teacher/Attendance/Edit' 
            : 'Admin/Attendance/Edit';
        
        return Inertia::render($viewPath, [
            'attendance' => $attendance,
            'statusOptions' => Attendance::getStatusOptions(),
        ]);
    }

    /**
     * Update attendance record
     */
    public function update(Request $request, Attendance $attendance)
    {
        $user = Auth::user();
        
        // Check if teacher can edit this attendance record (belongs to their class)
        if ($user->role && $user->role->name === 'teacher' && $user->teacher) {
            $teacherClassroomIds = $user->teacher->classrooms()->pluck('classrooms.id');
            if (!$teacherClassroomIds->contains($attendance->classroom_id)) {
                abort(403, 'You can only edit attendance for your assigned classes.');
            }
        }
        
        $request->validate([
            'status' => ['required', Rule::in(['present', 'absent', 'late', 'excused'])],
            'arrival_time' => 'nullable|date_format:H:i',
            'notes' => 'nullable|string|max:500',
        ]);

        $attendance->update([
            'status' => $request->status,
            'arrival_time' => $request->arrival_time,
            'notes' => $request->notes,
            'updated_by' => Auth::id(),
        ]);

        // Determine redirect route based on user role
        $redirectRoute = $user->role && $user->role->name === 'teacher' 
            ? 'teacher.attendance.index' 
            : 'admin.attendance.index';

        return redirect()->route($redirectRoute)->with('success', 'Attendance updated successfully.');
    }

    /**
     * Remove attendance record
     */
    public function destroy(Attendance $attendance)
    {
        $attendance->delete();
        
        return redirect()->back()->with('success', 'Attendance record deleted successfully.');
    }

    /**
     * Get attendance report for a student
     */
    public function studentReport(Request $request, Student $student)
    {
        $termId = $request->get('term_id');
        $sessionId = $request->get('academic_session_id');
        
        $attendances = Attendance::with(['term', 'academicSession'])
            ->forStudent($student->id)
            ->when($termId, fn($q) => $q->forTerm($termId))
            ->when($sessionId, fn($q) => $q->forSession($sessionId))
            ->orderBy('date', 'desc')
            ->get();
            
        $summary = Attendance::getAttendanceSummary($student->id, $termId, $sessionId);
        
        return Inertia::render('Admin/Attendance/StudentReport', [
            'student' => $student->load('user', 'classroom'),
            'attendances' => $attendances,
            'summary' => $summary,
            'terms' => Term::with('academicSession')->get(),
        ]);
    }

    /**
     * Get attendance report for a classroom
     */
    public function classroomReport(Request $request, Classroom $classroom)
    {
        $date = $request->get('date', now()->format('Y-m-d'));
        $termId = $request->get('term_id');
        $sessionId = $request->get('academic_session_id');
        
        $attendances = Attendance::with(['student.user'])
            ->forClassroom($classroom->id)
            ->forDate($date)
            ->when($termId, fn($q) => $q->forTerm($termId))
            ->when($sessionId, fn($q) => $q->forSession($sessionId))
            ->get();
            
        return Inertia::render('Admin/Attendance/ClassroomReport', [
            'classroom' => $classroom->load('students.user'),
            'attendances' => $attendances,
            'selectedDate' => $date,
            'terms' => Term::with('academicSession')->get(),
        ]);
    }

    /**
     * Get accessible classrooms based on user role
     */
    private function getAccessibleClassrooms($user)
    {
        if ($user->role && $user->role->name === 'admin') {
            return Classroom::with('students')->get();
        }
        
        if ($user->role && $user->role->name === 'teacher' && $user->teacher) {
            return $user->teacher->classrooms()->with('students')->get();
        }
        
        return collect();
    }

    /**
     * Get attendance data based on filters
     */
    private function getAttendanceData($date, $classroomId, $termId, $sessionId, $user, $request = null)
    {
        $query = Attendance::with(['student.user', 'classroom', 'markedBy'])
            ->forDate($date);
            
        if ($classroomId) {
            $query->forClassroom($classroomId);
        } elseif ($user->role && $user->role->name === 'teacher' && $user->teacher) {
            // Limit to teacher's classrooms
            $classroomIds = $user->teacher->classrooms()->pluck('classrooms.id');
            $query->whereIn('classroom_id', $classroomIds);
        }
        
        if ($termId) {
            $query->forTerm($termId);
        }
        
        if ($sessionId) {
            $query->forSession($sessionId);
        }
        
        // Add search functionality
        if ($request && $request->has('search')) {
            $search = $request->get('search');
            $query->whereHas('student', function($q) use ($search) {
                $q->where('admission_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }
        
        $query->orderBy('classroom_id')->orderBy('student_id');
        
        // Return paginated results
        return $query->paginate(15)->appends($request ? $request->query() : []);
    }
}
