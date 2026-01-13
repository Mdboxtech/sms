<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Config;
use App\Models\Setting;
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
        if ($this->app->runningInConsole()) {
            return;
        }

        try {
            // Update config values from database for runtime use
            $this->loadDatabaseSettings();

            // Share settings with all Inertia pages
            Inertia::share([
                'appSettings' => function () {
                    return $this->getAppSettings();
                },
                'themeSettings' => function () {
                    return $this->getThemeSettings();
                },
                'publicSettings' => function () {
                    return Setting::getPublicSettings();
                }
            ]);

            // Share settings with Blade views (if needed)
            View::share('appSettings', $this->getAppSettings());
            View::share('themeSettings', $this->getThemeSettings());
            View::share('publicSettings', Setting::getPublicSettings());
        } catch (\Exception $e) {
            // Fail silently during migration or when database is not ready
        }
    }

    /**
     * Load database settings into config
     */
    protected function loadDatabaseSettings(): void
    {
        // Load payment settings from database
        $paystackPublicKey = Setting::getValue('paystack_public_key', '');
        $paystackSecretKey = Setting::getValue('paystack_secret_key', '');
        $paystackEnabled = Setting::getValue('paystack_enabled', false);
        $appCurrency = Setting::getValue('app_currency', 'NGN');
        
        if (!empty($paystackPublicKey)) {
            Config::set('services.paystack.public_key', $paystackPublicKey);
        }
        if (!empty($paystackSecretKey)) {
            Config::set('services.paystack.secret_key', $paystackSecretKey);
        }
        Config::set('services.paystack.enabled', $paystackEnabled);
        Config::set('app.currency', $appCurrency);

        // Load general app settings from database
        $schoolName = Setting::getValue('school_name', '');
        $schoolAddress = Setting::getValue('school_address', '');
        $schoolPhone = Setting::getValue('school_phone', '');
        $schoolEmail = Setting::getValue('school_email', '');
        $schoolLogo = Setting::getValue('school_logo', '');
        $schoolTagline = Setting::getValue('school_tagline', '');
        $schoolPrimaryColor = Setting::getValue('school_primary_color', '');
        $schoolSecondaryColor = Setting::getValue('school_secondary_color', '');

        if (!empty($schoolName)) Config::set('app.school_name', $schoolName);
        if (!empty($schoolAddress)) Config::set('app.school_address', $schoolAddress);
        if (!empty($schoolPhone)) Config::set('app.school_phone', $schoolPhone);
        if (!empty($schoolEmail)) Config::set('app.school_email', $schoolEmail);
        if (!empty($schoolLogo)) Config::set('app.school_logo', $schoolLogo);
        if (!empty($schoolTagline)) Config::set('app.school_tagline', $schoolTagline);
        if (!empty($schoolPrimaryColor)) Config::set('app.school_primary_color', $schoolPrimaryColor);
        if (!empty($schoolSecondaryColor)) Config::set('app.school_secondary_color', $schoolSecondaryColor);

        // Load academic settings from database
        $maxScore = Setting::getValue('max_score', 0);
        $passMark = Setting::getValue('pass_mark', 0);
        $gradingSystem = Setting::getValue('grading_system', '');
        $defaultPassword = Setting::getValue('default_password', '');

        if ($maxScore > 0) Config::set('app.max_score', $maxScore);
        if ($passMark > 0) Config::set('app.pass_mark', $passMark);
        if (!empty($gradingSystem)) Config::set('app.grading_system', $gradingSystem);
        if (!empty($defaultPassword)) Config::set('app.default_password', $defaultPassword);

        // Load theme settings from database
        $themePrimaryStart = Setting::getValue('theme_primary_start', '');
        $themePrimaryEnd = Setting::getValue('theme_primary_end', '');
        $themeSecondaryStart = Setting::getValue('theme_secondary_start', '');
        $themeSecondaryEnd = Setting::getValue('theme_secondary_end', '');
        $themeAccentColor = Setting::getValue('theme_accent_color', '');
        $themeBackgroundStart = Setting::getValue('theme_background_start', '');
        $themeBackgroundEnd = Setting::getValue('theme_background_end', '');
        $themeSidebarStyle = Setting::getValue('theme_sidebar_style', '');
        $themeHeaderStyle = Setting::getValue('theme_header_style', '');
        $themeButtonStyle = Setting::getValue('theme_button_style', '');

        if (!empty($themePrimaryStart)) Config::set('app.theme_primary_start', $themePrimaryStart);
        if (!empty($themePrimaryEnd)) Config::set('app.theme_primary_end', $themePrimaryEnd);
        if (!empty($themeSecondaryStart)) Config::set('app.theme_secondary_start', $themeSecondaryStart);
        if (!empty($themeSecondaryEnd)) Config::set('app.theme_secondary_end', $themeSecondaryEnd);
        if (!empty($themeAccentColor)) Config::set('app.theme_accent_color', $themeAccentColor);
        if (!empty($themeBackgroundStart)) Config::set('app.theme_background_start', $themeBackgroundStart);
        if (!empty($themeBackgroundEnd)) Config::set('app.theme_background_end', $themeBackgroundEnd);
        if (!empty($themeSidebarStyle)) Config::set('app.theme_sidebar_style', $themeSidebarStyle);
        if (!empty($themeHeaderStyle)) Config::set('app.theme_header_style', $themeHeaderStyle);
        if (!empty($themeButtonStyle)) Config::set('app.theme_button_style', $themeButtonStyle);
    }

    /**
     * Get application settings from database
     */
    public function getAppSettings(): array
    {
        return [
            'school_name' => Setting::getValue('school_name', 'School Management System'),
            'school_address' => Setting::getValue('school_address', ''),
            'school_phone' => Setting::getValue('school_phone', ''),
            'school_email' => Setting::getValue('school_email', ''),
            'school_logo' => Setting::getValue('school_logo', ''),
            'school_tagline' => Setting::getValue('school_tagline', 'Nurturing Minds, Building Futures'),
            'academic_year_format' => Setting::getValue('academic_year_format', 'YYYY/YYYY'),
            'default_password' => Setting::getValue('default_password', 'password'),
            'max_score' => Setting::getValue('max_score', 100),
            'pass_mark' => Setting::getValue('pass_mark', 40),
            'grading_system' => Setting::getValue('grading_system', 'A-F'),
            'school_colors' => [
                'primary' => Setting::getValue('school_primary_color', '#2563eb'),
                'secondary' => Setting::getValue('school_secondary_color', '#f59e0b'),
            ]
        ];
    }

    /**
     * Get theme settings from database
     */
    public function getThemeSettings(): array
    {
        return [
            'primary_start' => Setting::getValue('theme_primary_start', '#6366f1'),
            'primary_end' => Setting::getValue('theme_primary_end', '#8b5cf6'),
            'secondary_start' => Setting::getValue('theme_secondary_start', '#ec4899'),
            'secondary_end' => Setting::getValue('theme_secondary_end', '#f59e0b'),
            'accent_color' => Setting::getValue('theme_accent_color', '#10b981'),
            'background_start' => Setting::getValue('theme_background_start', '#f8fafc'),
            'background_end' => Setting::getValue('theme_background_end', '#e2e8f0'),
            'sidebar_style' => Setting::getValue('theme_sidebar_style', 'gradient'),
            'header_style' => Setting::getValue('theme_header_style', 'glass'),
            'button_style' => Setting::getValue('theme_button_style', 'gradient'),
        ];
    }
}
