<?php

namespace App\Observers;

use App\Models\StudentExamAttempt;
use App\Services\CBTResultIntegrationService;
use Illuminate\Support\Facades\Log;

class StudentExamAttemptObserver
{
    /**
     * Handle the StudentExamAttempt "created" event.
     */
    public function created(StudentExamAttempt $studentExamAttempt): void
    {
        //
    }

    /**
     * Handle the StudentExamAttempt "updated" event.
     */
    public function updated(StudentExamAttempt $studentExamAttempt): void
    {
        Log::info("Observer triggered for attempt {$studentExamAttempt->id}, status: {$studentExamAttempt->status}");
        
        // Check if the attempt was just completed
        if ($studentExamAttempt->isDirty('status') && $studentExamAttempt->status === 'completed') {
            try {
                Log::info("Auto-syncing CBT score for attempt {$studentExamAttempt->id}");
                
                // Create service instance manually to avoid DI issues
                $cbtIntegrationService = app(CBTResultIntegrationService::class);
                $cbtIntegrationService->syncCBTToResult($studentExamAttempt);
                
                Log::info("Auto-synced CBT score for attempt {$studentExamAttempt->id}");
            } catch (\Exception $e) {
                // Log error but don't prevent the update
                Log::error("Failed to auto-sync CBT score for attempt {$studentExamAttempt->id}: " . $e->getMessage());
            }
        }
    }

    /**
     * Handle the StudentExamAttempt "deleted" event.
     */
    public function deleted(StudentExamAttempt $studentExamAttempt): void
    {
        // If a CBT attempt is deleted, we might want to revert the result
        // But we'll leave this decision to manual intervention for safety
    }

    /**
     * Handle the StudentExamAttempt "restored" event.
     */
    public function restored(StudentExamAttempt $studentExamAttempt): void
    {
        //
    }

    /**
     * Handle the StudentExamAttempt "force deleted" event.
     */
    public function forceDeleted(StudentExamAttempt $studentExamAttempt): void
    {
        //
    }
}
