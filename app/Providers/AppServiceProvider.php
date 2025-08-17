<?php

namespace App\Providers;

use App\Models\Result;
use App\Observers\ResultObserver;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Result::observe(ResultObserver::class);
        Vite::prefetch(concurrency: 3);
    }
}
