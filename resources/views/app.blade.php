<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="light">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- PWA Meta Tags -->
        <meta name="theme-color" content="{{ config('app.theme_primary_start', '#6366f1') }}">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="{{ config('app.school_name', 'SMS') }}">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="application-name" content="{{ config('app.school_name', 'SMS') }}">
        <meta name="msapplication-TileColor" content="{{ config('app.theme_primary_start', '#6366f1') }}">
        
        <!-- PWA Manifest -->
        <link rel="manifest" href="{{ route('manifest') }}">
        
        <!-- PWA Icons -->
        @php
            $logoPath = config('app.school_logo', '');
            $iconUrl = $logoPath ? asset('storage/' . $logoPath) : asset('images/logo.png');
        @endphp
        <link rel="apple-touch-icon" sizes="180x180" href="{{ $iconUrl }}">
        <link rel="icon" type="image/png" sizes="32x32" href="{{ $iconUrl }}">
        <link rel="icon" type="image/png" sizes="16x16" href="{{ $iconUrl }}">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-white">
        @inertia
        
        <!-- Service Worker Registration -->
        <script>
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js')
                        .then(function(registration) {
                            console.log('SW registered: ', registration.scope);
                        })
                        .catch(function(error) {
                            console.log('SW registration failed: ', error);
                        });
                });
            }
        </script>
    </body>
</html>
