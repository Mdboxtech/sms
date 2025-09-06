<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Models\User;
use App\Models\AcademicSession;
use App\Models\Term;
use App\Services\BackupService;

class SettingsController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        // Get system information
        $systemInfo = [
            'app_name' => config('app.name'),
            'app_version' => '1.0.0',
            'laravel_version' => app()->version(),
            'php_version' => PHP_VERSION,
            'database_connection' => config('database.default'),
            'storage_disk' => config('filesystems.default'),
            'mail_driver' => config('mail.default'),
            'queue_driver' => config('queue.default'),
        ];

        // Get application settings
        $appSettings = [
            'school_name' => config('app.school_name', 'School Management System'),
            'school_address' => config('app.school_address', ''),
            'school_phone' => config('app.school_phone', ''),
            'school_email' => config('app.school_email', ''),
            'school_logo' => config('app.school_logo', ''),
            'school_tagline' => config('app.school_tagline', 'Nurturing Minds, Building Futures'),
            'school_primary_color' => config('app.school_primary_color', '#2563eb'),
            'school_secondary_color' => config('app.school_secondary_color', '#f59e0b'),
            'academic_year_format' => config('app.academic_year_format', 'YYYY/YYYY'),
            'default_password' => config('app.default_password', 'password'),
            'max_score' => config('app.max_score', 100),
            'pass_mark' => config('app.pass_mark', 40),
            'grading_system' => config('app.grading_system', 'A-F'),
        ];

        // Get theme settings
        $themeSettings = [
            'theme_primary_start' => config('app.theme_primary_start', '#6366f1'),
            'theme_primary_end' => config('app.theme_primary_end', '#8b5cf6'),
            'theme_secondary_start' => config('app.theme_secondary_start', '#ec4899'),
            'theme_secondary_end' => config('app.theme_secondary_end', '#f59e0b'),
            'theme_accent_color' => config('app.theme_accent_color', '#10b981'),
            'theme_background_start' => config('app.theme_background_start', '#f8fafc'),
            'theme_background_end' => config('app.theme_background_end', '#e2e8f0'),
            'theme_sidebar_style' => config('app.theme_sidebar_style', 'gradient'),
            'theme_header_style' => config('app.theme_header_style', 'glass'),
            'theme_button_style' => config('app.theme_button_style', 'gradient'),
        ];

        // Get current academic session and term
        $currentSession = AcademicSession::where('is_current', true)->first();
        $currentTerm = Term::where('is_current', true)->first();

        // Get backup information
        $backupInfo = [
            'last_backup' => $this->getLastBackupDate(),
            'backup_location' => storage_path('app/backups'),
            'auto_backup' => config('backup.auto_backup', false),
            'backup_count' => $this->getBackupCount(),
        ];

        return Inertia::render('Settings/Index', [
            'auth' => ['user' => $user],
            'systemInfo' => $systemInfo,
            'appSettings' => $appSettings,
            'themeSettings' => $themeSettings,
            'currentSession' => $currentSession,
            'currentTerm' => $currentTerm,
            'backupInfo' => $backupInfo,
            'academicSessions' => AcademicSession::all(),
            'terms' => Term::with('academicSession')->get(),
        ]);
    }

    public function updateGeneral(Request $request)
    {
        $request->validate([
            'school_name' => 'required|string|max:255',
            'school_address' => 'nullable|string',
            'school_phone' => 'nullable|string|max:20',
            'school_email' => 'nullable|email|max:255',
            'school_tagline' => 'nullable|string|max:255',
            'school_primary_color' => 'nullable|string|max:7',
            'school_secondary_color' => 'nullable|string|max:7',
        ]);

        // Update .env file
        $this->updateEnvFile([
            'SCHOOL_NAME' => $request->school_name,
            'SCHOOL_ADDRESS' => $request->school_address,
            'SCHOOL_PHONE' => $request->school_phone,
            'SCHOOL_EMAIL' => $request->school_email,
            'SCHOOL_TAGLINE' => $request->school_tagline,
            'SCHOOL_PRIMARY_COLOR' => $request->school_primary_color,
            'SCHOOL_SECONDARY_COLOR' => $request->school_secondary_color,
        ]);

        // Clear config cache to reload settings
        Artisan::call('config:clear');

        return redirect()->route('admin.settings.index')->with('success', 'General settings updated successfully.');
    }

    public function updateAcademic(Request $request)
    {
        $request->validate([
            'max_score' => 'required|integer|min:1|max:1000',
            'pass_mark' => 'required|integer|min:1|max:100',
            'grading_system' => 'required|string|in:A-F,1-5,percentage',
            'default_password' => 'required|string|min:6',
        ]);

        $this->updateEnvFile([
            'MAX_SCORE' => $request->max_score,
            'PASS_MARK' => $request->pass_mark,
            'GRADING_SYSTEM' => $request->grading_system,
            'DEFAULT_PASSWORD' => $request->default_password,
        ]);

        // Clear config cache to reload settings
        Artisan::call('config:clear');

        return redirect()->route('admin.settings.index')->with('success', 'Academic settings updated successfully.');
    }

    public function updateSystem(Request $request)
    {
        $request->validate([
            'mail_driver' => 'required|string|in:smtp,sendmail,mailgun,ses,postmark',
            'queue_driver' => 'required|string|in:sync,database,redis,sqs',
            'auto_backup' => 'boolean',
        ]);

        $this->updateEnvFile([
            'MAIL_MAILER' => $request->mail_driver,
            'QUEUE_CONNECTION' => $request->queue_driver,
            'AUTO_BACKUP' => $request->auto_backup ? 'true' : 'false',
        ]);

        // Clear config cache to reload settings
        Artisan::call('config:clear');

        return redirect()->route('admin.settings.index')->with('success', 'System settings updated successfully.');
    }

    public function updateTheme(Request $request)
    {
        $request->validate([
            'theme_primary_start' => 'required|string|regex:/^#([a-fA-F0-9]{6})$/',
            'theme_primary_end' => 'required|string|regex:/^#([a-fA-F0-9]{6})$/',
            'theme_secondary_start' => 'required|string|regex:/^#([a-fA-F0-9]{6})$/',
            'theme_secondary_end' => 'required|string|regex:/^#([a-fA-F0-9]{6})$/',
            'theme_accent_color' => 'required|string|regex:/^#([a-fA-F0-9]{6})$/',
            'theme_background_start' => 'required|string|regex:/^#([a-fA-F0-9]{6})$/',
            'theme_background_end' => 'required|string|regex:/^#([a-fA-F0-9]{6})$/',
            'theme_sidebar_style' => 'required|string|in:gradient,solid,glass',
            'theme_header_style' => 'required|string|in:gradient,solid,glass',
            'theme_button_style' => 'required|string|in:gradient,solid,outline',
        ]);

        $this->updateEnvFile([
            'THEME_PRIMARY_START' => $request->theme_primary_start,
            'THEME_PRIMARY_END' => $request->theme_primary_end,
            'THEME_SECONDARY_START' => $request->theme_secondary_start,
            'THEME_SECONDARY_END' => $request->theme_secondary_end,
            'THEME_ACCENT_COLOR' => $request->theme_accent_color,
            'THEME_BACKGROUND_START' => $request->theme_background_start,
            'THEME_BACKGROUND_END' => $request->theme_background_end,
            'THEME_SIDEBAR_STYLE' => $request->theme_sidebar_style,
            'THEME_HEADER_STYLE' => $request->theme_header_style,
            'THEME_BUTTON_STYLE' => $request->theme_button_style,
        ]);

        // Clear config cache to reload settings
        Artisan::call('config:clear');

        return redirect()->route('admin.settings.index')->with('success', 'Theme settings updated successfully.');
    }

    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('logos', 'public');
            
            $this->updateEnvFile([
                'SCHOOL_LOGO' => $logoPath,
            ]);

            // Clear config cache to reload settings
            Artisan::call('config:clear');

            return redirect()->route('admin.settings.index')->with('success', 'School logo updated successfully.');
        }

        return redirect()->route('admin.settings.index')->with('error', 'Failed to upload logo.');
    }

    public function backup(BackupService $backupService)
    {
        $result = $backupService->createDatabaseBackup();
        
        if ($result['success']) {
            return redirect()->route('admin.settings.index')->with('success', 
                "Database backup created successfully. File: {$result['filename']} ({$result['size']})");
        } else {
            return redirect()->route('admin.settings.index')->with('error', 
                'Backup failed: ' . $result['error']);
        }
    }

    public function restore(Request $request, BackupService $backupService)
    {
        $request->validate([
            'backup_file' => 'required|file|mimetypes:application/sql,text/plain,application/octet-stream',
        ]);

        $result = $backupService->restoreDatabase($request->file('backup_file'));
        
        if ($result['success']) {
            return redirect()->route('admin.settings.index')->with('success', 
                'Database restored successfully from: ' . $result['filename']);
        } else {
            return redirect()->route('admin.settings.index')->with('error', 
                'Restore failed: ' . $result['error']);
        }
    }

    public function clearCache()
    {
        try {
            Artisan::call('cache:clear');
            Artisan::call('config:clear');
            Artisan::call('route:clear');
            Artisan::call('view:clear');

            return redirect()->route('admin.settings.index')->with('success', 'All caches cleared successfully.');
        } catch (\Exception $e) {
            return redirect()->route('admin.settings.index')->with('error', 'Cache clear failed: ' . $e->getMessage());
        }
    }

    public function optimizeSystem()
    {
        try {
            Artisan::call('config:cache');
            Artisan::call('route:cache');
            Artisan::call('view:cache');

            return redirect()->route('admin.settings.index')->with('success', 'System optimized successfully.');
        } catch (\Exception $e) {
            return redirect()->route('admin.settings.index')->with('error', 'Optimization failed: ' . $e->getMessage());
        }
    }

    public function setActiveSession(Request $request)
    {
        $request->validate([
            'session_id' => 'required|exists:academic_sessions,id',
        ]);

        // Deactivate all sessions
        AcademicSession::query()->update(['is_current' => false]);

        // Activate selected session
        AcademicSession::find($request->session_id)->update(['is_current' => true]);

        return redirect()->route('admin.settings.index')->with('success', 'Active academic session updated successfully.');
    }

    public function setActiveTerm(Request $request)
    {
        $request->validate([
            'term_id' => 'required|exists:terms,id',
        ]);

        // Deactivate all terms
        Term::query()->update(['is_current' => false]);

        // Activate selected term
        Term::find($request->term_id)->update(['is_current' => true]);

        return redirect()->route('admin.settings.index')->with('success', 'Active term updated successfully.');
    }

    private function getLastBackupDate()
    {
        if (!Storage::exists('backups')) {
            return 'Never';
        }

        $backups = Storage::files('backups');
        if (empty($backups)) {
            return 'Never';
        }

        $lastBackup = collect($backups)
            ->map(function ($file) {
                return Storage::lastModified($file);
            })
            ->max();

        return $lastBackup ? date('Y-m-d H:i:s', $lastBackup) : 'Never';
    }

    private function getBackupCount()
    {
        if (!Storage::exists('backups')) {
            return 0;
        }

        return count(Storage::files('backups'));
    }

    private function updateEnvFile($data)
    {
        $envFile = base_path('.env');
        $envContent = file_get_contents($envFile);

        foreach ($data as $key => $value) {
            $pattern = "/^{$key}=.*/m";
            $replacement = "{$key}=" . (is_string($value) ? "\"{$value}\"" : $value);

            if (preg_match($pattern, $envContent)) {
                $envContent = preg_replace($pattern, $replacement, $envContent);
            } else {
                $envContent .= "\n{$replacement}";
            }
        }

        file_put_contents($envFile, $envContent);
    }
}
