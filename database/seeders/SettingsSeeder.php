<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // Payment Settings
            [
                'key' => 'paystack_public_key',
                'value' => env('PAYSTACK_PUBLIC_KEY', ''),
                'type' => 'string',
                'group' => 'payment',
                'description' => 'Paystack Public Key',
                'is_public' => false,
                'is_encrypted' => false,
            ],
            [
                'key' => 'paystack_secret_key',
                'value' => env('PAYSTACK_SECRET_KEY', ''),
                'type' => 'string',
                'group' => 'payment',
                'description' => 'Paystack Secret Key',
                'is_public' => false,
                'is_encrypted' => true, // Encrypt sensitive data
            ],
            [
                'key' => 'paystack_webhook_url',
                'value' => env('PAYSTACK_WEBHOOK_URL', ''),
                'type' => 'string',
                'group' => 'payment',
                'description' => 'Paystack Webhook URL',
                'is_public' => false,
                'is_encrypted' => false,
            ],
            [
                'key' => 'paystack_enabled',
                'value' => env('PAYSTACK_ENABLED', 'false'),
                'type' => 'boolean',
                'group' => 'payment',
                'description' => 'Enable Paystack Payments',
                'is_public' => true,
                'is_encrypted' => false,
            ],
            [
                'key' => 'app_currency',
                'value' => env('APP_CURRENCY', 'NGN'),
                'type' => 'string',
                'group' => 'payment',
                'description' => 'Application Currency',
                'is_public' => true,
                'is_encrypted' => false,
            ],

            // School Settings
            [
                'key' => 'school_name',
                'value' => env('SCHOOL_NAME', 'Excellence Academy'),
                'type' => 'string',
                'group' => 'general',
                'description' => 'School Name',
                'is_public' => true,
                'is_encrypted' => false,
            ],
            [
                'key' => 'school_tagline',
                'value' => env('SCHOOL_TAGLINE', 'Excellence in Education'),
                'type' => 'string',
                'group' => 'general',
                'description' => 'School Tagline',
                'is_public' => true,
                'is_encrypted' => false,
            ],

            // System Settings
            [
                'key' => 'maintenance_mode',
                'value' => 'false',
                'type' => 'boolean',
                'group' => 'system',
                'description' => 'Maintenance Mode',
                'is_public' => true,
                'is_encrypted' => false,
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
