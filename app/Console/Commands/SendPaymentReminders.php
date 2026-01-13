<?php

namespace App\Console\Commands;

use App\Services\PaymentNotificationService;
use Illuminate\Console\Command;

class SendPaymentReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payments:send-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send payment reminder emails for upcoming due dates';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Sending payment reminders...');

        $notificationService = app(PaymentNotificationService::class);
        $remindersSent = $notificationService->sendScheduledReminders();

        $this->info("Payment reminders sent: {$remindersSent}");

        return Command::SUCCESS;
    }
}
