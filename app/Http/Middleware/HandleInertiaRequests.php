<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => fn () => $request->user()
                    ? array_merge($request->user()->load('roles')->only('id', 'name', 'email', 'role', 'roles'), [
                        'isAdmin' => $request->user()->isAdmin(),
                        'isTeacher' => $request->user()->isTeacher(),
                        'isStudent' => $request->user()->isStudent(),
                    ])
                    : null,
            ],
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'themeSettings' => fn () => [
                'primary_start' => \App\Models\Setting::getValue('theme_primary_start', '#6366f1'),
                'primary_end' => \App\Models\Setting::getValue('theme_primary_end', '#8b5cf6'),
                'secondary_start' => \App\Models\Setting::getValue('theme_secondary_start', '#ec4899'),
                'secondary_end' => \App\Models\Setting::getValue('theme_secondary_end', '#f59e0b'),
                'accent_color' => \App\Models\Setting::getValue('theme_accent_color', '#10b981'),
                'background_start' => \App\Models\Setting::getValue('theme_background_start', '#f8fafc'),
                'background_end' => \App\Models\Setting::getValue('theme_background_end', '#e2e8f0'),
                'sidebar_style' => \App\Models\Setting::getValue('theme_sidebar_style', 'gradient'),
                'header_style' => \App\Models\Setting::getValue('theme_header_style', 'glass'),
                'button_style' => \App\Models\Setting::getValue('theme_button_style', 'gradient'),
            ],
        ];
    }
}
