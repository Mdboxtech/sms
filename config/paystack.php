<?php

return [
    /**
     * Public Key From Paystack Dashboard
     */
    'publicKey' => env('PAYSTACK_PUBLIC_KEY'),

    /**
     * Secret Key From Paystack Dashboard
     */
    'secretKey' => env('PAYSTACK_SECRET_KEY'),

    /**
     * Paystack Payment URL
     */
    'paymentUrl' => env('PAYSTACK_PAYMENT_URL', 'https://api.paystack.co'),

    /**
     * Optional email address of the merchant
     */
    'merchantEmail' => env('PAYSTACK_MERCHANT_EMAIL'),

    /**
     * Webhook URL for payment verification
     */
    'webhookUrl' => env('PAYSTACK_WEBHOOK_URL'),

    /**
     * Currency Code
     */
    'currency' => env('PAYSTACK_CURRENCY', 'NGN'),

    /**
     * Payment channels that are enabled
     */
    'channels' => [
        'card',
        'bank',
        'ussd',
        'qr',
        'mobile_money',
        'bank_transfer'
    ],

    /**
     * Payment timeout in seconds (30 minutes)
     */
    'timeout' => 1800,

    /**
     * Paystack API Version
     */
    'api_version' => 'v1',

    /**
     * Test mode setting
     */
    'test_mode' => env('APP_ENV') !== 'production',
];
