<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Application Name
    |--------------------------------------------------------------------------
    |
    | This value is the name of your application, which will be used when the
    | framework needs to place the application's name in a notification or
    | other UI elements where an application name needs to be displayed.
    |
    */

    'name' => env('APP_NAME', 'Laravel'),

    /*
    |--------------------------------------------------------------------------
    | Application Environment
    |--------------------------------------------------------------------------
    |
    | This value determines the "environment" your application is currently
    | running in. This may determine how you prefer to configure various
    | services the application utilizes. Set this in your ".env" file.
    |
    */

    'env' => env('APP_ENV', 'production'),

    /*
    |--------------------------------------------------------------------------
    | Application Debug Mode
    |--------------------------------------------------------------------------
    |
    | When your application is in debug mode, detailed error messages with
    | stack traces will be shown on every error that occurs within your
    | application. If disabled, a simple generic error page is shown.
    |
    */

    'debug' => (bool) env('APP_DEBUG', false),

    /*
    |--------------------------------------------------------------------------
    | Application URL
    |--------------------------------------------------------------------------
    |
    | This URL is used by the console to properly generate URLs when using
    | the Artisan command line tool. You should set this to the root of
    | the application so that it's available within Artisan commands.
    |
    */

    'url' => env('APP_URL', 'http://localhost'),

    /*
    |--------------------------------------------------------------------------
    | Application Timezone
    |--------------------------------------------------------------------------
    |
    | Here you may specify the default timezone for your application, which
    | will be used by the PHP date and date-time functions. The timezone
    | is set to "UTC" by default as it is suitable for most use cases.
    |
    */

    'timezone' => 'UTC',

    /*
    |--------------------------------------------------------------------------
    | School Configuration
    |--------------------------------------------------------------------------
    |
    | These values are specific to the school management system
    |
    */

    'school_name' => env('SCHOOL_NAME', 'School Management System'),
    'school_address' => env('SCHOOL_ADDRESS', ''),
    'school_phone' => env('SCHOOL_PHONE', ''),
    'school_email' => env('SCHOOL_EMAIL', ''),
    'school_logo' => env('SCHOOL_LOGO', ''),
    'school_tagline' => env('SCHOOL_TAGLINE', 'Nurturing Minds, Building Futures'),
    'school_primary_color' => env('SCHOOL_PRIMARY_COLOR', '#2563eb'),
    'school_secondary_color' => env('SCHOOL_SECONDARY_COLOR', '#f59e0b'),
    
    // Color Theme Configuration
    'theme_primary_start' => env('THEME_PRIMARY_START', '#6366f1'), // indigo-500
    'theme_primary_end' => env('THEME_PRIMARY_END', '#8b5cf6'), // violet-500
    'theme_secondary_start' => env('THEME_SECONDARY_START', '#ec4899'), // pink-500
    'theme_secondary_end' => env('THEME_SECONDARY_END', '#f59e0b'), // amber-500
    'theme_accent_color' => env('THEME_ACCENT_COLOR', '#10b981'), // emerald-500
    'theme_background_start' => env('THEME_BACKGROUND_START', '#f8fafc'), // slate-50
    'theme_background_end' => env('THEME_BACKGROUND_END', '#e2e8f0'), // slate-200
    'theme_sidebar_style' => env('THEME_SIDEBAR_STYLE', 'gradient'), // gradient, solid, glass
    'theme_header_style' => env('THEME_HEADER_STYLE', 'glass'), // gradient, solid, glass
    'theme_button_style' => env('THEME_BUTTON_STYLE', 'gradient'), // gradient, solid, outline
    
    'academic_year_format' => env('ACADEMIC_YEAR_FORMAT', 'YYYY/YYYY'),
    'max_score' => env('MAX_SCORE', 100),
    'pass_mark' => env('PASS_MARK', 40),
    'grading_system' => env('GRADING_SYSTEM', 'A-F'),
    'default_password' => env('DEFAULT_PASSWORD', 'password'),

    /*
    |--------------------------------------------------------------------------
    | Application Locale Configuration
    |--------------------------------------------------------------------------
    |
    | The application locale determines the default locale that will be used
    | by Laravel's translation / localization methods. This option can be
    | set to any locale for which you plan to have translation strings.
    |
    */

    'locale' => env('APP_LOCALE', 'en'),

    'fallback_locale' => env('APP_FALLBACK_LOCALE', 'en'),

    'faker_locale' => env('APP_FAKER_LOCALE', 'en_US'),

    /*
    |--------------------------------------------------------------------------
    | Encryption Key
    |--------------------------------------------------------------------------
    |
    | This key is utilized by Laravel's encryption services and should be set
    | to a random, 32 character string to ensure that all encrypted values
    | are secure. You should do this prior to deploying the application.
    |
    */

    'cipher' => 'AES-256-CBC',

    'key' => env('APP_KEY'),

    'previous_keys' => [
        ...array_filter(
            explode(',', (string) env('APP_PREVIOUS_KEYS', ''))
        ),
    ],

    /*
    |--------------------------------------------------------------------------
    | Maintenance Mode Driver
    |--------------------------------------------------------------------------
    |
    | These configuration options determine the driver used to determine and
    | manage Laravel's "maintenance mode" status. The "cache" driver will
    | allow maintenance mode to be controlled across multiple machines.
    |
    | Supported drivers: "file", "cache"
    |
    */

    'maintenance' => [
        'driver' => env('APP_MAINTENANCE_DRIVER', 'file'),
        'store' => env('APP_MAINTENANCE_STORE', 'database'),
    ],

];
