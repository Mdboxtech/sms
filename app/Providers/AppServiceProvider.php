<?php

namespace App\Providers;

use App\Models\Result;
use App\Models\StudentExamAttempt;
use App\Observers\ResultObserver;
use App\Observers\NotificationObserver;
use App\Observers\StudentExamAttemptObserver;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(\App\Services\ClassTeacherService::class, function ($app) {
            return new \App\Services\ClassTeacherService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Result::observe(ResultObserver::class);
        // TODO: Re-enable notification observer after fixing
        // Result::observe(NotificationObserver::class);
        StudentExamAttempt::observe(StudentExamAttemptObserver::class);
        Vite::prefetch(concurrency: 3);
    }
}
