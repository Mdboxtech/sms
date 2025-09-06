<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Message;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use App\Models\Classroom;
use Illuminate\Support\Facades\Auth;

class NotificationService
{
    /**
     * Send notification to all users
     */
    public function sendToAll($title, $body)
    {
        $user = Auth::user();
        
        return Notification::create([
            'title' => $title,
            'body' => $body,
            'sender_id' => $user->id,
            'sender_type' => get_class($user),
            'target_id' => null,
            'target_type' => null,
        ]);
    }

    /**
     * Send notification to specific classroom
     */
    public function sendToClassroom($classroomId, $title, $body)
    {
        $user = Auth::user();
        
        return Notification::create([
            'title' => $title,
            'body' => $body,
            'sender_id' => $user->id,
            'sender_type' => get_class($user),
            'target_id' => $classroomId,
            'target_type' => 'classroom',
        ]);
    }

    /**
     * Send notification to specific user (generic method)
     */
    public function sendNotification($sender, $receiver, $title, $body, $type = null, $referenceId = null)
    {
        return Notification::create([
            'title' => $title,
            'body' => $body,
            'sender_id' => $sender ? $sender->id : null,
            'sender_type' => $sender ? get_class($sender) : null,
            'target_id' => $receiver->id,
            'target_type' => get_class($receiver),
            'type' => $type,
            'reference_id' => $referenceId,
        ]);
    }

    /**
     * Send notification to specific user
     */
    public function sendToUser($userId, $title, $body)
    {
        $user = Auth::user();
        $targetUser = User::findOrFail($userId);
        
        return Notification::create([
            'title' => $title,
            'body' => $body,
            'sender_id' => $user->id,
            'sender_type' => get_class($user),
            'target_id' => $targetUser->id,
            'target_type' => get_class($targetUser),
        ]);
    }

    /**
     * Send notification to all students
     */
    public function sendToAllStudents($title, $body)
    {
        $user = Auth::user();
        $students = Student::with('user')->get();
        
        foreach ($students as $student) {
            Notification::create([
                'title' => $title,
                'body' => $body,
                'sender_id' => $user->id,
                'sender_type' => get_class($user),
                'target_id' => $student->user->id,
                'target_type' => get_class($student->user),
            ]);
        }
        
        return count($students);
    }

    /**
     * Send notification to all teachers
     */
    public function sendToAllTeachers($title, $body)
    {
        $user = Auth::user();
        $teachers = Teacher::with('user')->get();
        
        foreach ($teachers as $teacher) {
            Notification::create([
                'title' => $title,
                'body' => $body,
                'sender_id' => $user->id,
                'sender_type' => get_class($user),
                'target_id' => $teacher->user->id,
                'target_type' => get_class($teacher->user),
            ]);
        }
        
        return count($teachers);
    }

    /**
     * Get unread notifications count for user
     */
    public function getUnreadCount($userId = null)
    {
        $user = $userId ? User::find($userId) : Auth::user();
        
        if (!$user) {
            return 0;
        }

        return Notification::where(function($query) use ($user) {
            // Broadcast notifications (target_id is null)
            $query->whereNull('target_id')
                  // Or notifications targeted to this user
                  ->orWhere(function($subQuery) use ($user) {
                      $subQuery->where('target_id', $user->id)
                               ->where('target_type', get_class($user));
                  })
                  // Or notifications targeted to user's classroom (if student)
                  ->orWhere(function($subQuery) use ($user) {
                      if ($user->hasRole('student')) {
                          $student = Student::where('user_id', $user->id)->first();
                          if ($student) {
                              $subQuery->where('target_id', $student->classroom_id)
                                       ->where('target_type', 'classroom');
                          }
                      }
                  });
        })
        ->whereNull('read_at')
        ->count();
    }

    /**
     * Get unread messages count for user
     */
    public function getUnreadMessagesCount($userId = null)
    {
        $user = $userId ? User::find($userId) : Auth::user();
        
        if (!$user) {
            return 0;
        }

        return Message::where('receiver_id', $user->id)
                      ->where('receiver_type', get_class($user))
                      ->whereNull('read_at')
                      ->count();
    }

    /**
     * Mark all notifications as read for user
     */
    public function markAllNotificationsAsRead($userId = null)
    {
        $user = $userId ? User::find($userId) : Auth::user();
        
        if (!$user) {
            return 0;
        }

        return Notification::where(function($query) use ($user) {
            $query->whereNull('target_id')
                  ->orWhere(function($subQuery) use ($user) {
                      $subQuery->where('target_id', $user->id)
                               ->where('target_type', get_class($user));
                  });
        })
        ->whereNull('read_at')
        ->update(['read_at' => now()]);
    }

    /**
     * Get recent notifications for user
     */
    public function getRecentNotifications($userId = null, $limit = 5)
    {
        $user = $userId ? User::find($userId) : Auth::user();
        
        if (!$user) {
            return collect();
        }

        return Notification::where(function($query) use ($user) {
            $query->whereNull('target_id')
                  ->orWhere(function($subQuery) use ($user) {
                      $subQuery->where('target_id', $user->id)
                               ->where('target_type', get_class($user));
                  })
                  ->orWhere(function($subQuery) use ($user) {
                      if ($user->hasRole('student')) {
                          $student = Student::where('user_id', $user->id)->first();
                          if ($student) {
                              $subQuery->where('target_id', $student->classroom_id)
                                       ->where('target_type', 'classroom');
                          }
                      }
                  });
        })
        ->with(['sender'])
        ->orderBy('created_at', 'desc')
        ->limit($limit)
        ->get();
    }
}
