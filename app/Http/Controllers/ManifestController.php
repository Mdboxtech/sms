<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Setting;
use Illuminate\Support\Facades\Storage;

class ManifestController extends Controller
{
    /**
     * Generate dynamic PWA manifest based on admin settings
     */
    public function index()
    {
        // Get settings from database
        $schoolName = config('app.school_name', 'School Management System');
        $schoolTagline = config('app.school_tagline', 'Education Management');
        $themeColor = config('app.theme_primary_start', '#6366f1');
        $backgroundColor = config('app.theme_background_start', '#f8fafc');
        $schoolLogo = config('app.school_logo', '');
        
        // Build the icon URL
        $iconUrl = '/storage/' . $schoolLogo;
        if (empty($schoolLogo) || !Storage::disk('public')->exists($schoolLogo)) {
            // Fallback to default icon
            $iconUrl = '/images/logo.png';
        }

        $manifest = [
            'name' => $schoolName,
            'short_name' => $this->getShortName($schoolName),
            'description' => $schoolTagline,
            'start_url' => '/',
            'display' => 'standalone',
            'background_color' => $backgroundColor,
            'theme_color' => $themeColor,
            'orientation' => 'portrait-primary',
            'scope' => '/',
            'lang' => 'en',
            'categories' => ['education', 'productivity'],
            'icons' => [
                [
                    'src' => $iconUrl,
                    'sizes' => '192x192',
                    'type' => 'image/png',
                    'purpose' => 'any maskable'
                ],
                [
                    'src' => $iconUrl,
                    'sizes' => '512x512',
                    'type' => 'image/png',
                    'purpose' => 'any maskable'
                ]
            ],
            'screenshots' => [],
            'related_applications' => [],
            'prefer_related_applications' => false
        ];

        return response()->json($manifest)
            ->header('Content-Type', 'application/manifest+json')
            ->header('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    }

    /**
     * Get a shortened version of the school name for PWA
     */
    private function getShortName(string $name): string
    {
        // If name is already short enough, return as is
        if (strlen($name) <= 12) {
            return $name;
        }

        // Try to get initials or abbreviation
        $words = explode(' ', $name);
        if (count($words) >= 2) {
            // Use first letters of each word
            $initials = '';
            foreach ($words as $word) {
                if (!empty($word)) {
                    $initials .= strtoupper($word[0]);
                }
            }
            if (strlen($initials) <= 6) {
                return $initials;
            }
        }

        // Fallback: just truncate
        return substr($name, 0, 12);
    }
}
