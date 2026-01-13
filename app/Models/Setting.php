<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;

class Setting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
        'description',
        'group',
        'is_public',
        'is_encrypted'
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'is_encrypted' => 'boolean',
    ];

    /**
     * Get a setting value by key
     */
    public static function getValue(string $key, $default = null)
    {
        $setting = Cache::remember("setting:{$key}", 3600, function () use ($key) {
            return static::where('key', $key)->first();
        });

        if (!$setting) {
            return $default;
        }

        return static::castValue($setting->value, $setting->type, $setting->is_encrypted);
    }

    /**
     * Set a setting value
     */
    public static function setValue(string $key, $value, string $type = 'string', bool $isEncrypted = false): void
    {
        $processedValue = $isEncrypted ? Crypt::encryptString((string) $value) : $value;

        static::updateOrCreate(
            ['key' => $key],
            [
                'value' => $processedValue,
                'type' => $type,
                'is_encrypted' => $isEncrypted
            ]
        );

        Cache::forget("setting:{$key}");
    }

    /**
     * Get multiple settings by group
     */
    public static function getGroup(string $group): array
    {
        $settings = Cache::remember("settings_group:{$group}", 3600, function () use ($group) {
            return static::where('group', $group)->select(['key', 'value', 'type', 'is_encrypted'])->get();
        });

        $result = [];
        foreach ($settings as $setting) {
            $result[$setting->key] = static::castValue(
                $setting->value, 
                $setting->type, 
                $setting->is_encrypted
            );
        }

        return $result;
    }

    /**
     * Get all public settings for frontend
     */
    public static function getPublicSettings(): array
    {
        $settings = Cache::remember('public_settings', 3600, function () {
            return static::where('is_public', true)->select(['key', 'value', 'type', 'is_encrypted'])->get();
        });

        $result = [];
        foreach ($settings as $setting) {
            $result[$setting->key] = static::castValue(
                $setting->value, 
                $setting->type, 
                false // Never decrypt public settings
            );
        }

        return $result;
    }

    /**
     * Cast value to proper type
     */
    protected static function castValue($value, string $type, bool $isEncrypted)
    {
        if ($isEncrypted && $value) {
            try {
                $value = Crypt::decryptString($value);
            } catch (\Illuminate\Contracts\Encryption\DecryptException $e) {
                // If decryption fails, log the error and return empty string
                Log::warning("Failed to decrypt setting value: " . $e->getMessage());
                $value = '';
            }
        }

        return match($type) {
            'boolean' => (bool) $value,
            'integer' => (int) $value,
            'float' => (float) $value,
            'json' => json_decode($value, true),
            'array' => is_array($value) ? $value : json_decode($value, true),
            default => $value,
        };
    }

    /**
     * Get all settings as an associative array
     */
    public static function getAllSettings(): array
    {
        $settings = Cache::remember('all_settings', 3600, function () {
            return static::all()->keyBy('key');
        });

        $processedSettings = [];
        foreach ($settings as $key => $setting) {
            try {
                $processedSettings[$key] = static::castValue(
                    $setting->value, 
                    $setting->type ?? 'string', 
                    $setting->is_encrypted ?? false
                );
            } catch (\Exception $e) {
                // If decryption fails, use the raw value or default
                Log::warning("Failed to decrypt setting: {$key}", ['error' => $e->getMessage()]);
                $processedSettings[$key] = $setting->value;
            }
        }

        return $processedSettings;
    }

    /**
     * Clear all settings cache
     */
    public static function clearCache(): void
    {
        Cache::flush(); // In production, use more specific cache clearing
    }

    /**
     * Reset corrupted encrypted settings
     */
    public static function resetCorruptedEncryptedSettings(): int
    {
        $corruptedCount = 0;
        $encryptedSettings = static::where('is_encrypted', true)->get();
        
        foreach ($encryptedSettings as $setting) {
            try {
                // Try to decrypt the value
                if ($setting->value) {
                    Crypt::decryptString($setting->value);
                }
            } catch (\Illuminate\Contracts\Encryption\DecryptException $e) {
                // If decryption fails, reset the value
                Log::warning("Resetting corrupted encrypted setting: {$setting->key}");
                $setting->update([
                    'value' => '',
                    'is_encrypted' => false
                ]);
                $corruptedCount++;
            }
        }
        
        if ($corruptedCount > 0) {
            static::clearCache();
        }
        
        return $corruptedCount;
    }
}
