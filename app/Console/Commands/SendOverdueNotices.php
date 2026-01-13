<?php

namespace App\Console\Commands;

use App\Services\PaymentNotificationService;
use Illuminate\Console\Command;

class SendOverdueNotices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payments:send-overdue-notices';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send overdue payment notices for past due fees';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Sending overdue payment notices...');

        $notificationService = app(PaymentNotificationService::class);
        $noticesSent = $notificationService->sendOverdueNotices();

        $this->info("Overdue notices sent: {$noticesSent}");

        return Command::SUCCESS;
    }
}
