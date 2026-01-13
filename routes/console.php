<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule payment reminders and overdue notices
Schedule::command('payments:send-reminders')->dailyAt('09:00');
Schedule::command('payments:send-overdue-notices')->dailyAt('10:00');
