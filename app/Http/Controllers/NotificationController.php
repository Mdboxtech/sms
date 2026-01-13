<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use App\Models\Classroom;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Display a listing of notifications
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Ensure role relationship is loaded
        $user->load('role');
        
        // Get notifications for current user
        $notifications = Notification::where(function($query) use ($user) {
            // Broadcast notifications (target_id is null)
            $query->whereNull('target_id');
            
            // Notifications targeted to this specific user
            $query->orWhere(function($subQuery) use ($user) {
                $subQuery->where('target_id', $user->id)
                         ->where('target_type', 'user');
            });
            
            // If user is a student, include classroom notifications
            if ($user->role && $user->role->name === 'student') {
                $student = Student::where('user_id', $user->id)->first();
                if ($student && $student->classroom_id) {
                    $query->orWhere(function($subQuery) use ($student) {
                        $subQuery->where('target_id', $student->classroom_id)
                                 ->where('target_type', 'classroom');
                    });
                }
            }
        })
        ->with(['sender'])
        ->orderBy('created_at', 'desc')
        ->paginate(20);

        $unreadCount = Notification::where(function($query) use ($user) {
            $query->whereNull('target_id')
                  ->orWhere(function($subQuery) use ($user) {
                      $subQuery->where('target_id', $user->id)
                               ->where('target_type', 'user');
                  });
                  
            if ($user->role && $user->role->name === 'student') {
                $student = Student::where('user_id', $user->id)->first();
                if ($student && $student->classroom_id) {
                    $query->orWhere(function($subQuery) use ($student) {
                        $subQuery->where('target_id', $student->classroom_id)
                                 ->where('target_type', 'classroom');
                    });
                }
            }
        })
        ->whereNull('read_at')
        ->count();

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount
        ]);
    }

    /**
     * Show the form for creating a new notification
     */
    public function create()
    {
        $classrooms = Classroom::all();
        $students = Student::with('user')->get();
        $teachers = Teacher::with('user')->get();

        return Inertia::render('Notifications/Create', [
            'classrooms' => $classrooms,
            'students' => $students,
            'teachers' => $teachers
        ]);
    }

    /**
     * Store a newly created notification
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'nullable|string',
            'target_type' => 'nullable|in:all,classroom,student,teacher',
            'target_id' => 'nullable|integer'
        ]);

        $user = Auth::user();

        Notification::create([
            'title' => $request->title,
            'body' => $request->body,
            'sender_id' => $user->id,
            'sender_type' => get_class($user),
            'target_id' => $request->target_type === 'all' ? null : $request->target_id,
            'target_type' => $request->target_type === 'all' ? null : $request->target_type,
        ]);

        return redirect()->route('admin.notifications.index')
                        ->with('success', 'Notification sent successfully!');
    }

    /**
     * Display the specified notification
     */
    public function show(Notification $notification)
    {
        $user = Auth::user();
        
        // Check if user can view this notification
        if (!$this->canUserViewNotification($user, $notification)) {
            abort(403, 'Unauthorized');
        }

        // Mark as read if not already read
        if (!$notification->read_at) {
            $notification->update(['read_at' => now()]);
        }

        return Inertia::render('Notifications/Show', [
            'notification' => $notification->load('sender')
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Notification $notification)
    {
        $user = Auth::user();
        
        if ($this->canUserViewNotification($user, $notification)) {
            $notification->update(['read_at' => now()]);
        }

        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read for current user
     */
    public function markAllAsRead()
    {
        $user = Auth::user();
        
        Notification::where(function($query) use ($user) {
            $query->whereNull('target_id')
                  ->orWhere(function($subQuery) use ($user) {
                      $subQuery->where('target_id', $user->id)
                               ->where('target_type', get_class($user));
                  });
        })
        ->whereNull('read_at')
        ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }

    /**
     * Get unread notifications count
     */
    private function getUnreadCountPrivate()
    {
        $user = Auth::user();
        
        return Notification::where(function($query) use ($user) {
            $query->whereNull('target_id')
                  ->orWhere(function($subQuery) use ($user) {
                      $subQuery->where('target_id', $user->id)
                               ->where('target_type', get_class($user));
                  });
        })
        ->whereNull('read_at')
        ->count();
    }

    /**
     * Check if user can view notification
     */
    private function canUserViewNotification($user, $notification)
    {
        // Broadcast notifications can be viewed by all
        if (!$notification->target_id) {
            return true;
        }

        // Check if notification is targeted to this user
        if ($notification->target_id === $user->id && $notification->target_type === get_class($user)) {
            return true;
        }

        // Check if notification is targeted to user's classroom (for students)
        if ($user->role && $user->role->name === 'student' && $notification->target_type === 'classroom') {
            $student = Student::where('user_id', $user->id)->first();
            return $student && $student->classroom_id === $notification->target_id;
        }

        return false;
    }

    /**
     * Get unread notifications count for API
     */
    public function getUnreadCount()
    {
        $user = Auth::user();
        
        // Return empty response if not authenticated
        if (!$user) {
            return response()->json([
                'count' => 0,
                'notifications' => []
            ]);
        }
        
        $unreadNotifications = Notification::where(function($query) use ($user) {
            // Broadcast notifications (target_id is null)
            $query->whereNull('target_id')
                  // Or notifications targeted to this user
                  ->orWhere(function($subQuery) use ($user) {
                      $subQuery->where('target_id', $user->id)
                               ->where('target_type', get_class($user));
                  })
                  // Or notifications targeted to user's classroom (if student)
                  ->orWhere(function($subQuery) use ($user) {
                      if ($user->role && $user->role->name === 'student') {
                          $student = Student::where('user_id', $user->id)->first();
                          if ($student) {
                              $subQuery->where('target_id', $student->classroom_id)
                                       ->where('target_type', 'classroom');
                          }
                      }
                  });
        })
        ->whereNull('read_at')
        ->with(['sender'])
        ->orderBy('created_at', 'desc')
        ->limit(10)
        ->get();

        return response()->json([
            'count' => $unreadNotifications->count(),
            'notifications' => $unreadNotifications
        ]);
    }

    /**
     * Get unread notifications for API
     */
    public function getUnreadNotifications()
    {
        $user = Auth::user();
        
        $unreadNotifications = Notification::where(function($query) use ($user) {
            // Broadcast notifications (target_id is null)
            $query->whereNull('target_id')
                  // Or notifications targeted to this user
                  ->orWhere(function($subQuery) use ($user) {
                      $subQuery->where('target_id', $user->id)
                               ->where('target_type', get_class($user));
                  })
                  // Or notifications targeted to user's classroom (if student)
                  ->orWhere(function($subQuery) use ($user) {
                      if ($user->role && $user->role->name === 'student') {
                          $student = Student::where('user_id', $user->id)->first();
                          if ($student) {
                              $subQuery->where('target_id', $student->classroom_id)
                                       ->where('target_type', 'classroom');
                          }
                      }
                  });
        })
        ->whereNull('read_at')
        ->with(['sender'])
        ->orderBy('created_at', 'desc')
        ->limit(10)
        ->get();

        return response()->json([
            'count' => $unreadNotifications->count(),
            'notifications' => $unreadNotifications
        ]);
    }
}
