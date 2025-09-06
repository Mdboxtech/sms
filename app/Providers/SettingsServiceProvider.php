<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Config;
use Inertia\Inertia;

class SettingsServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Share settings with all Inertia pages
        Inertia::share([
            'appSettings' => function () {
                return $this->getAppSettings();
            },
            'themeSettings' => function () {
                return $this->getThemeSettings();
            }
        ]);

        // Share settings with Blade views (if needed)
        View::share('appSettings', $this->getAppSettings());
        View::share('themeSettings', $this->getThemeSettings());
    }

    /**
     * Get application settings from config
     */
    public function getAppSettings(): array
    {
        return [
            'school_name' => config('app.school_name', 'School Management System'),
            'school_address' => config('app.school_address', ''),
            'school_phone' => config('app.school_phone', ''),
            'school_email' => config('app.school_email', ''),
            'school_logo' => config('app.school_logo', ''),
            'school_tagline' => config('app.school_tagline', 'Nurturing Minds, Building Futures'),
            'academic_year_format' => config('app.academic_year_format', 'YYYY/YYYY'),
            'default_password' => config('app.default_password', 'password'),
            'max_score' => config('app.max_score', 100),
            'pass_mark' => config('app.pass_mark', 40),
            'grading_system' => config('app.grading_system', 'A-F'),
            'school_colors' => [
                'primary' => config('app.school_primary_color', '#2563eb'),
                'secondary' => config('app.school_secondary_color', '#f59e0b'),
            ]
        ];
    }

    /**
     * Get theme settings from config
     */
    public function getThemeSettings(): array
    {
        return [
            'primary_start' => config('app.theme_primary_start', '#6366f1'),
            'primary_end' => config('app.theme_primary_end', '#8b5cf6'),
            'secondary_start' => config('app.theme_secondary_start', '#ec4899'),
            'secondary_end' => config('app.theme_secondary_end', '#f59e0b'),
            'accent_color' => config('app.theme_accent_color', '#10b981'),
            'background_start' => config('app.theme_background_start', '#f8fafc'),
            'background_end' => config('app.theme_background_end', '#e2e8f0'),
            'sidebar_style' => config('app.theme_sidebar_style', 'gradient'),
            'header_style' => config('app.theme_header_style', 'glass'),
            'button_style' => config('app.theme_button_style', 'gradient'),
        ];
    }
}
