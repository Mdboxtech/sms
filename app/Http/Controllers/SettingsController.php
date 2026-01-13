<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Models\Setting;
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

        // Get theme settings for the form (different name to avoid overriding global themeSettings)
        $formThemeSettings = [
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

        // Get payment settings
        $paymentSettings = [
            'paystack_public_key' => config('paystack.publicKey', ''),
            'paystack_secret_key' => config('paystack.secretKey') ? '••••••••••••••••' : '', // Masked for security
            'paystack_merchant_email' => config('paystack.merchantEmail', ''),
            'paystack_test_mode' => config('paystack.test_mode', true),
            'paystack_currency' => config('paystack.currency', 'NGN'),
            'payment_enabled' => !empty(config('paystack.publicKey')) && !empty(config('paystack.secretKey')),
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
            'formThemeSettings' => $formThemeSettings,
            'paymentSettings' => $paymentSettings,
            'currentSession' => $currentSession,
            'currentTerm' => $currentTerm,
            'backupInfo' => $backupInfo,
            'academicSessions' => AcademicSession::all(),
            'terms' => Term::with('academicSession')->get(),
        ]);
    }

    public function updateGeneral(Request $request)
    {
        try {
            $request->validate([
                'school_name' => 'required|string|max:255',
                'school_address' => 'nullable|string',
                'school_phone' => 'nullable|string|max:20',
                'school_email' => 'nullable|email|max:255',
                'school_tagline' => 'nullable|string|max:255',
                'school_primary_color' => 'nullable|string|max:7',
                'school_secondary_color' => 'nullable|string|max:7',
            ]);

            // Update settings in database instead of .env
            Setting::setValue('school_name', $request->school_name, 'string', false);
            Setting::setValue('school_address', $request->school_address ?? '', 'string', false);
            Setting::setValue('school_phone', $request->school_phone ?? '', 'string', false);
            Setting::setValue('school_email', $request->school_email ?? '', 'string', false);
            Setting::setValue('school_tagline', $request->school_tagline ?? '', 'string', false);
            Setting::setValue('school_primary_color', $request->school_primary_color ?? '#1e40af', 'string', false);
            Setting::setValue('school_secondary_color', $request->school_secondary_color ?? '#f59e0b', 'string', false);

            // Mark these as public so they're available in frontend
            Setting::updateOrCreate(['key' => 'school_name'], ['is_public' => true]);
            Setting::updateOrCreate(['key' => 'school_tagline'], ['is_public' => true]);
            Setting::updateOrCreate(['key' => 'school_primary_color'], ['is_public' => true]);
            Setting::updateOrCreate(['key' => 'school_secondary_color'], ['is_public' => true]);

            // Clear settings cache
            Setting::clearCache();

            return redirect()->route('admin.settings.index')->with('success', 'General settings updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update general settings: ' . $e->getMessage());
            return redirect()->route('admin.settings.index')
                ->withInput()
                ->with('error', 'Failed to update general settings. Please try again.');
        }
    }

    public function updateAcademic(Request $request)
    {
        try {
            $request->validate([
                'max_score' => 'required|integer|min:1|max:1000',
                'pass_mark' => 'required|integer|min:1|max:100',
                'grading_system' => 'required|string|in:A-F,1-5,percentage',
                'default_password' => 'required|string|min:6',
            ]);

            // Update settings in database instead of .env
            Setting::setValue('max_score', $request->max_score, 'integer', false);
            Setting::setValue('pass_mark', $request->pass_mark, 'integer', false);
            Setting::setValue('grading_system', $request->grading_system, 'string', false);
            Setting::setValue('default_password', $request->default_password, 'string', true); // Encrypt password

            // These are academic settings group
            Setting::updateOrCreate(['key' => 'max_score'], ['group' => 'academic']);
            Setting::updateOrCreate(['key' => 'pass_mark'], ['group' => 'academic']);
            Setting::updateOrCreate(['key' => 'grading_system'], ['group' => 'academic']);
            Setting::updateOrCreate(['key' => 'default_password'], ['group' => 'academic']);

            // Clear settings cache
            Setting::clearCache();

            return redirect()->route('admin.settings.index')->with('success', 'Academic settings updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update academic settings: ' . $e->getMessage());
            return redirect()->route('admin.settings.index')
                ->withInput()
                ->with('error', 'Failed to update academic settings. Please try again.');
        }
    }

    public function updateSystem(Request $request)
    {
        $request->validate([
            'mail_driver' => 'required|string|in:smtp,sendmail,mailgun,ses,postmark',
            'queue_driver' => 'required|string|in:sync,database,redis,sqs',
            'auto_backup' => 'boolean',
        ]);

        try {
            // Update system settings in database
            Setting::updateOrCreate(
                ['key' => 'mail_driver'],
                ['value' => $request->mail_driver, 'group' => 'system']
            );

            Setting::updateOrCreate(
                ['key' => 'queue_driver'],
                ['value' => $request->queue_driver, 'group' => 'system']
            );

            Setting::updateOrCreate(
                ['key' => 'auto_backup'],
                ['value' => $request->boolean('auto_backup'), 'group' => 'system']
            );

            // Clear settings cache
            Cache::forget('settings');

            return redirect()->route('admin.settings.index')->with('success', 'System settings updated successfully.');
        } catch (\Exception $e) {
            return redirect()->route('admin.settings.index')
                ->with('error', 'Failed to update system settings: ' . $e->getMessage());
        }
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

        try {
            // Update theme settings in database
            Setting::updateOrCreate(
                ['key' => 'theme_primary_start'],
                ['value' => $request->theme_primary_start, 'group' => 'theme']
            );

            Setting::updateOrCreate(
                ['key' => 'theme_primary_end'],
                ['value' => $request->theme_primary_end, 'group' => 'theme']
            );

            Setting::updateOrCreate(
                ['key' => 'theme_secondary_start'],
                ['value' => $request->theme_secondary_start, 'group' => 'theme']
            );

            Setting::updateOrCreate(
                ['key' => 'theme_secondary_end'],
                ['value' => $request->theme_secondary_end, 'group' => 'theme']
            );

            Setting::updateOrCreate(
                ['key' => 'theme_accent_color'],
                ['value' => $request->theme_accent_color, 'group' => 'theme']
            );

            Setting::updateOrCreate(
                ['key' => 'theme_background_start'],
                ['value' => $request->theme_background_start, 'group' => 'theme']
            );

            Setting::updateOrCreate(
                ['key' => 'theme_background_end'],
                ['value' => $request->theme_background_end, 'group' => 'theme']
            );

            Setting::updateOrCreate(
                ['key' => 'theme_sidebar_style'],
                ['value' => $request->theme_sidebar_style, 'group' => 'theme']
            );

            Setting::updateOrCreate(
                ['key' => 'theme_header_style'],
                ['value' => $request->theme_header_style, 'group' => 'theme']
            );

            Setting::updateOrCreate(
                ['key' => 'theme_button_style'],
                ['value' => $request->theme_button_style, 'group' => 'theme']
            );

            // Clear settings cache
            Cache::forget('settings');

            return redirect()->route('admin.settings.index')->with('success', 'Theme settings updated successfully.');
        } catch (\Exception $e) {
            return redirect()->route('admin.settings.index')
                ->with('error', 'Failed to update theme settings: ' . $e->getMessage());
        }
    }

    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('logos', 'public');
            
            try {
                // Update logo setting in database
                Setting::updateOrCreate(
                    ['key' => 'school_logo'],
                    ['value' => $logoPath, 'group' => 'general']
                );

                // Clear settings cache
                Cache::forget('settings');

                return redirect()->route('admin.settings.index')->with('success', 'School logo updated successfully.');
            } catch (\Exception $e) {
                // Delete uploaded file if database update fails
                Storage::disk('public')->delete($logoPath);
                return redirect()->route('admin.settings.index')
                    ->with('error', 'Failed to update logo: ' . $e->getMessage());
            }
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

    public function paymentSettings()
    {
        $paymentSettings = [
            'paystack_public_key' => Setting::getValue('paystack_public_key', ''),
            'paystack_secret_key' => Setting::getValue('paystack_secret_key', ''),
            'paystack_payment_url' => Setting::getValue('paystack_payment_url', 'https://api.paystack.co'),
            'paystack_webhook_url' => Setting::getValue('paystack_webhook_url', route('webhook.paystack')),
            'payment_enabled' => Setting::getValue('paystack_enabled', false),
            'currency' => Setting::getValue('app_currency', 'NGN'),
            'webhook_url' => route('webhook.paystack'),
            
            // Additional settings with defaults
            'allow_partial_payments' => Setting::getValue('allow_partial_payments', true),
            'minimum_payment_amount' => Setting::getValue('minimum_payment_amount', '100'),
            'payment_deadline_days' => Setting::getValue('payment_deadline_days', '30'),
            'late_fee_enabled' => Setting::getValue('late_fee_enabled', false),
            'late_fee_percentage' => Setting::getValue('late_fee_percentage', '5'),
            'grace_period_days' => Setting::getValue('grace_period_days', '7'),
            
            // Email notifications
            'send_payment_confirmations' => Setting::getValue('send_payment_confirmations', true),
            'send_payment_reminders' => Setting::getValue('send_payment_reminders', true),
            'send_overdue_notices' => Setting::getValue('send_overdue_notices', true),
        ];

        return Inertia::render('Admin/Settings/Payment', [
            'paymentSettings' => $paymentSettings,
        ]);
    }

    public function updatePaymentSettings(Request $request)
    {
        try {
            $request->validate([
                'paystack_public_key' => 'required|string',
                'paystack_secret_key' => 'required|string',
                'paystack_payment_url' => 'nullable|string|url',
                'paystack_webhook_url' => 'nullable|string|url',
                'payment_enabled' => 'boolean',
                'currency' => 'required|string|in:NGN,USD,GHS,ZAR,KES',
            ]);

            // Update settings in database instead of .env
            Setting::setValue('paystack_public_key', $request->paystack_public_key);
            Setting::setValue('paystack_secret_key', $request->paystack_secret_key, 'string', true); // Encrypt secret
            Setting::setValue('paystack_payment_url', $request->paystack_payment_url ?? 'https://api.paystack.co');
            Setting::setValue('paystack_webhook_url', $request->paystack_webhook_url ?? '');
            Setting::setValue('paystack_enabled', $request->payment_enabled, 'boolean');
            Setting::setValue('app_currency', $request->currency);

            // Update additional settings if provided
            if ($request->has('allow_partial_payments')) {
                Setting::setValue('allow_partial_payments', $request->allow_partial_payments, 'boolean');
            }
            if ($request->has('minimum_payment_amount')) {
                Setting::setValue('minimum_payment_amount', $request->minimum_payment_amount);
            }
            if ($request->has('payment_deadline_days')) {
                Setting::setValue('payment_deadline_days', $request->payment_deadline_days);
            }
            if ($request->has('late_fee_enabled')) {
                Setting::setValue('late_fee_enabled', $request->late_fee_enabled, 'boolean');
            }
            if ($request->has('late_fee_percentage')) {
                Setting::setValue('late_fee_percentage', $request->late_fee_percentage);
            }
            if ($request->has('grace_period_days')) {
                Setting::setValue('grace_period_days', $request->grace_period_days);
            }

            // Email notification settings
            if ($request->has('send_payment_confirmations')) {
                Setting::setValue('send_payment_confirmations', $request->send_payment_confirmations, 'boolean');
            }
            if ($request->has('send_payment_reminders')) {
                Setting::setValue('send_payment_reminders', $request->send_payment_reminders, 'boolean');
            }
            if ($request->has('send_overdue_notices')) {
                Setting::setValue('send_overdue_notices', $request->send_overdue_notices, 'boolean');
            }

            // Clear settings cache
            Setting::clearCache();

            return redirect()->route('admin.settings.payment')->with('success', 'Payment settings updated successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->route('admin.settings.payment')
                ->withErrors($e->validator)
                ->withInput()
                ->with('error', 'Please fix the validation errors and try again.');
        } catch (\Exception $e) {
            Log::error('Failed to update payment settings: ' . $e->getMessage());
            return redirect()->route('admin.settings.payment')
                ->withInput()
                ->with('error', 'Failed to update payment settings. Please try again or contact support.');
        }
    }

    public function testPaymentConnection(Request $request)
    {
        try {
            $publicKey = $request->input('public_key', Setting::getValue('paystack_public_key'));
            $secretKey = $request->input('secret_key', Setting::getValue('paystack_secret_key'));

            if (empty($publicKey) || empty($secretKey)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Public key and secret key are required',
                ], 400);
            }

            // Test Paystack connection by verifying the keys
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $secretKey,
                'Content-Type' => 'application/json',
            ])->get('https://api.paystack.co/bank');

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Paystack connection successful! Keys are valid.',
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to connect to Paystack. Please check your keys.',
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Connection test failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function paystackDemo()
    {
        $paymentSettings = [
            'paystack_public_key' => config('services.paystack.public_key', ''),
            'paystack_secret_key' => config('services.paystack.secret_key', ''),
            'payment_enabled' => config('services.paystack.enabled', false),
            'currency' => config('app.currency', 'NGN'),
        ];

        return Inertia::render('Admin/Demo/PaystackDemo', [
            'paymentSettings' => $paymentSettings,
            'webhookUrl' => route('webhook.paystack'),
            'testMode' => app()->environment('local'),
        ]);
    }

    public function testPaystackDemo(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:100',
            'email' => 'required|email',
            'description' => 'required|string|max:255',
        ]);

        try {
            $publicKey = config('services.paystack.public_key');
            $secretKey = config('services.paystack.secret_key');

            if (empty($publicKey) || empty($secretKey)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Paystack keys are not configured. Please update your payment settings first.',
                ], 400);
            }

            // Generate a unique reference
            $reference = 'demo_' . time() . '_' . uniqid();

            // Initialize payment with Paystack
            $paystackData = [
                'email' => $request->email,
                'amount' => $request->amount * 100, // Convert to kobo
                'reference' => $reference,
                'currency' => 'NGN',
                'callback_url' => route('admin.demo.paystack'),
                'metadata' => [
                    'demo_test' => true,
                    'description' => $request->description,
                    'user_id' => Auth::id(),
                ]
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $secretKey,
                'Content-Type' => 'application/json',
            ])->post('https://api.paystack.co/transaction/initialize', $paystackData);

            if ($response->successful()) {
                $data = $response->json();
                
                return response()->json([
                    'success' => true,
                    'message' => 'Payment initialized successfully!',
                    'data' => [
                        'authorization_url' => $data['data']['authorization_url'],
                        'access_code' => $data['data']['access_code'],
                        'reference' => $data['data']['reference'],
                    ]
                ]);
            } else {
                $error = $response->json();
                return response()->json([
                    'success' => false,
                    'message' => 'Paystack API Error: ' . ($error['message'] ?? 'Unknown error'),
                ], 400);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Demo test failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function resetCorruptedSettings()
    {
        try {
            $count = Setting::resetCorruptedEncryptedSettings();
            
            return redirect()->route('admin.settings.index')->with('success', 
                "Reset {$count} corrupted encrypted settings. Settings cache cleared.");
        } catch (\Exception $e) {
            Log::error('Failed to reset corrupted settings: ' . $e->getMessage());
            return redirect()->route('admin.settings.index')->with('error', 
                'Failed to reset corrupted settings: ' . $e->getMessage());
        }
    }
}
