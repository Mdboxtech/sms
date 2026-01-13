<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Student;
use App\Models\Fee;
use App\Models\Setting;
use App\Mail\PaymentConfirmation;
use App\Mail\PaymentReminder;
use App\Mail\OverduePaymentNotice;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class PaymentNotificationService
{
    /**
     * Send payment confirmation email
     */
    public function sendPaymentConfirmation(Payment $payment): bool
    {
        try {
            // Check if payment confirmation emails are enabled
            if (!Setting::getValue('send_payment_confirmations', true)) {
                return false;
            }

            $student = $payment->student;
            if (!$student || !$student->user || !$student->user->email) {
                Log::warning('Cannot send payment confirmation: Student or email not found', [
                    'payment_id' => $payment->id
                ]);
                return false;
            }

            Mail::to($student->user->email)->send(new PaymentConfirmation($payment));

            Log::info('Payment confirmation email sent', [
                'payment_id' => $payment->id,
                'student_id' => $student->id,
                'email' => $student->user->email
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Failed to send payment confirmation email', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Send payment reminder email for upcoming due dates
     */
    public function sendPaymentReminder(Student $student, Fee $fee, int $daysUntilDue): bool
    {
        try {
            // Check if payment reminder emails are enabled
            if (!Setting::getValue('send_payment_reminders', true)) {
                return false;
            }

            if (!$student->user || !$student->user->email) {
                Log::warning('Cannot send payment reminder: Student email not found', [
                    'student_id' => $student->id,
                    'fee_id' => $fee->id
                ]);
                return false;
            }

            // Check if fee has outstanding balance
            $feeStatus = $fee->getStatusForStudent($student->id);
            if ($feeStatus['balance'] <= 0) {
                return false; // No need to send reminder if fully paid
            }

            Mail::to($student->user->email)->send(new PaymentReminder($student, $fee, $daysUntilDue));

            Log::info('Payment reminder email sent', [
                'student_id' => $student->id,
                'fee_id' => $fee->id,
                'days_until_due' => $daysUntilDue,
                'email' => $student->user->email
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Failed to send payment reminder email', [
                'student_id' => $student->id,
                'fee_id' => $fee->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Send overdue payment notice
     */
    public function sendOverdueNotice(Student $student, Fee $fee, int $daysOverdue): bool
    {
        try {
            // Check if overdue notice emails are enabled
            if (!Setting::getValue('send_overdue_notices', true)) {
                return false;
            }

            if (!$student->user || !$student->user->email) {
                Log::warning('Cannot send overdue notice: Student email not found', [
                    'student_id' => $student->id,
                    'fee_id' => $fee->id
                ]);
                return false;
            }

            // Check if fee has outstanding balance
            $feeStatus = $fee->getStatusForStudent($student->id);
            if ($feeStatus['balance'] <= 0) {
                return false; // No need to send notice if fully paid
            }

            Mail::to($student->user->email)->send(new OverduePaymentNotice($student, $fee, $daysOverdue));

            Log::info('Overdue payment notice sent', [
                'student_id' => $student->id,
                'fee_id' => $fee->id,
                'days_overdue' => $daysOverdue,
                'email' => $student->user->email
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Failed to send overdue payment notice', [
                'student_id' => $student->id,
                'fee_id' => $fee->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Process payment with all rules applied
     */
    public function processPaymentRules(Payment $payment): void
    {
        try {
            $fee = $payment->fee;
            $student = $payment->student;

            if (!$fee || !$student) {
                return;
            }

            // Apply minimum payment amount rule
            $minimumAmount = (float) Setting::getValue('minimum_payment_amount', 100);
            if ($payment->amount < $minimumAmount && !$payment->is_partial_payment) {
                Log::warning('Payment below minimum amount', [
                    'payment_id' => $payment->id,
                    'amount' => $payment->amount,
                    'minimum' => $minimumAmount
                ]);
            }

            // Check if partial payments are allowed
            $allowPartialPayments = Setting::getValue('allow_partial_payments', true);
            if ($payment->is_partial_payment && !$allowPartialPayments) {
                Log::warning('Partial payment attempted when not allowed', [
                    'payment_id' => $payment->id,
                    'student_id' => $student->id,
                    'fee_id' => $fee->id
                ]);
            }

            // Apply late fee if applicable
            $this->applyLateFeeIfNeeded($payment);

            // Send confirmation email if payment is successful
            if ($payment->status === 'successful') {
                $this->sendPaymentConfirmation($payment);
            }

        } catch (\Exception $e) {
            Log::error('Error processing payment rules', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Apply late fee based on settings
     */
    protected function applyLateFeeIfNeeded(Payment $payment): void
    {
        $fee = $payment->fee;
        
        if (!$fee->due_date || !$fee->due_date->isPast()) {
            return; // Not overdue
        }

        $lateFeeEnabled = Setting::getValue('late_fee_enabled', false);
        if (!$lateFeeEnabled) {
            return;
        }

        $gracePeriodDays = (int) Setting::getValue('grace_period_days', 7);
        $daysOverdue = $fee->due_date->diffInDays(now());

        if ($daysOverdue <= $gracePeriodDays) {
            return; // Still in grace period
        }

        // Calculate late fee
        $lateFeePercentage = (float) Setting::getValue('late_fee_percentage', 5);
        $lateFeeAmount = ($fee->amount * $lateFeePercentage) / 100;

        // Update fee with late fee if not already applied
        if ($fee->late_fee_amount != $lateFeeAmount) {
            $fee->update(['late_fee_amount' => $lateFeeAmount]);
            
            Log::info('Late fee applied', [
                'fee_id' => $fee->id,
                'student_id' => $payment->student_id,
                'late_fee_amount' => $lateFeeAmount,
                'days_overdue' => $daysOverdue
            ]);
        }
    }

    /**
     * Check and send payment reminders for upcoming due dates
     */
    public function sendScheduledReminders(): int
    {
        $remindersSent = 0;
        
        try {
            $paymentDeadlineDays = (int) Setting::getValue('payment_deadline_days', 30);
            $reminderDays = [7, 3, 1]; // Send reminders 7, 3, and 1 days before due date

            foreach ($reminderDays as $days) {
                $targetDate = now()->addDays($days)->startOfDay();

                $fees = Fee::where('is_active', true)
                    ->where('due_date', '>=', $targetDate)
                    ->where('due_date', '<', $targetDate->copy()->endOfDay())
                    ->with(['classroom.students.user'])
                    ->get();

                foreach ($fees as $fee) {
                    if ($fee->classroom && $fee->classroom->students) {
                        foreach ($fee->classroom->students as $student) {
                            $feeStatus = $fee->getStatusForStudent($student->id);
                            
                            if ($feeStatus['balance'] > 0) {
                                if ($this->sendPaymentReminder($student, $fee, $days)) {
                                    $remindersSent++;
                                }
                            }
                        }
                    }
                }
            }

        } catch (\Exception $e) {
            Log::error('Error sending scheduled reminders', [
                'error' => $e->getMessage()
            ]);
        }

        return $remindersSent;
    }

    /**
     * Check and send overdue notices
     */
    public function sendOverdueNotices(): int
    {
        $noticesSent = 0;
        
        try {
            $overdueNoticeDays = [1, 7, 14, 30]; // Send notices 1, 7, 14, and 30 days after due date

            foreach ($overdueNoticeDays as $days) {
                $targetDate = now()->subDays($days)->startOfDay();

                $fees = Fee::where('is_active', true)
                    ->where('due_date', '>=', $targetDate)
                    ->where('due_date', '<', $targetDate->copy()->endOfDay())
                    ->with(['classroom.students.user'])
                    ->get();

                foreach ($fees as $fee) {
                    if ($fee->classroom && $fee->classroom->students) {
                        foreach ($fee->classroom->students as $student) {
                            $feeStatus = $fee->getStatusForStudent($student->id);
                            
                            if ($feeStatus['balance'] > 0) {
                                if ($this->sendOverdueNotice($student, $fee, $days)) {
                                    $noticesSent++;
                                }
                            }
                        }
                    }
                }
            }

        } catch (\Exception $e) {
            Log::error('Error sending overdue notices', [
                'error' => $e->getMessage()
            ]);
        }

        return $noticesSent;
    }
}
