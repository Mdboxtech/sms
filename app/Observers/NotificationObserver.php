<?php

namespace App\Observers;

use App\Models\Result;
use App\Models\Notification;
use App\Models\User;
use App\Services\NotificationService;

class NotificationObserver
{
    /**
     * Handle the Result "created" event.
     */
    public function created(Result $result): void
    {
        $notificationService = app(NotificationService::class);
        
        // Notify student about new result
        $student = $result->student;
        if ($student && $student->user) {
            $teacherName = $result->teacher ? $result->teacher->name : 'system';
            $notificationService->sendNotification(
                auth()->user(),
                $student->user,
                'New Result Added',
                "A new result has been added for {$result->subject->name} in {$result->term->name}. Score: {$result->total_score}",
                'result',
                $result->id
            );
        }

        // Notify admin about new result entry
        $admins = User::whereHas('role', function($q) {
            $q->where('name', 'admin');
        })->get();

        foreach ($admins as $admin) {
            $teacherName = $result->teacher ? $result->teacher->name : 'system';
            $studentName = $student && $student->user ? $student->user->name : 'unknown student';
            $notificationService->sendNotification(
                auth()->user(),
                $admin,
                'New Result Entry',
                "A new result has been entered by {$teacherName} for {$studentName} in {$result->subject->name}",
                'result_entry',
                $result->id
            );
        }
    }

    /**
     * Handle the Result "updated" event.
     */
    public function updated(Result $result): void
    {
        // Only notify if significant fields changed
        if ($result->wasChanged(['ca_score', 'exam_score', 'total_score'])) {
            $notificationService = app(NotificationService::class);
            $student = $result->student;
            if ($student && $student->user) {
                $notificationService->sendNotification(
                    auth()->user(),
                    $student->user,
                    'Result Updated',
                    "Your result for {$result->subject->name} in {$result->term->name} has been updated. New score: {$result->total_score}",
                    'result_update',
                    $result->id
                );
            }
        }
    }

    /**
     * Handle the Result "deleted" event.
     */
    public function deleted(Result $result): void
    {
        $notificationService = app(NotificationService::class);
        
        // Notify student about deleted result
        $student = $result->student;
        if ($student && $student->user) {
            $notificationService->sendNotification(
                auth()->user(),
                $student->user,
                'Result Removed',
                "A result for {$result->subject->name} in {$result->term->name} has been removed",
                'result_delete',
                null
            );
        }
    }
}
