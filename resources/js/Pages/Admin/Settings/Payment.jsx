import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    Save, 
    AlertCircle, 
    CheckCircle, 
    Key, 
    Globe, 
    DollarSign,
    Settings as SettingsIcon,
    Eye,
    EyeOff,
    TestTube,
    X
} from 'lucide-react';

export default function PaymentSettings({ paymentSettings, flash }) {
    const [showPublicKey, setShowPublicKey] = useState(false);
    const [showSecretKey, setShowSecretKey] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [testing, setTesting] = useState(false);
    const [alertMessage, setAlertMessage] = useState(null);

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            setAlertMessage({
                type: 'success',
                message: flash.success
            });
        } else if (flash?.error) {
            setAlertMessage({
                type: 'error',
                message: flash.error
            });
        }
    }, [flash]);

    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        paystack_public_key: paymentSettings?.paystack_public_key || '',
        paystack_secret_key: paymentSettings?.paystack_secret_key || '',
        paystack_payment_url: paymentSettings?.paystack_payment_url || 'https://api.paystack.co',
        paystack_webhook_url: paymentSettings?.webhook_url || window.location.origin + '/webhook/paystack',
        payment_enabled: paymentSettings?.payment_enabled || false,
        currency: paymentSettings?.currency || 'NGN',
        
        // Additional payment settings with defaults
        allow_partial_payments: paymentSettings?.allow_partial_payments ?? true,
        minimum_payment_amount: paymentSettings?.minimum_payment_amount || '100',
        payment_deadline_days: paymentSettings?.payment_deadline_days || '30',
        late_fee_enabled: paymentSettings?.late_fee_enabled ?? false,
        late_fee_percentage: paymentSettings?.late_fee_percentage || '5',
        grace_period_days: paymentSettings?.grace_period_days || '7',
        
        // Email notifications
        send_payment_confirmations: paymentSettings?.send_payment_confirmations ?? true,
        send_payment_reminders: paymentSettings?.send_payment_reminders ?? true,
        send_overdue_notices: paymentSettings?.send_overdue_notices ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.settings.updatePaymentSettings'), {
            onSuccess: () => {
                setAlertMessage({
                    type: 'success',
                    message: 'Payment settings have been updated successfully!'
                });
            },
            onError: (errors) => {
                const errorMessages = Object.values(errors).flat();
                setAlertMessage({
                    type: 'error',
                    message: errorMessages.length > 0 ? errorMessages[0] : 'Failed to update payment settings. Please try again.'
                });
            }
        });
    };

    const testPaystackConnection = async () => {
        setTesting(true);
        setTestResult(null);
        
        try {
            const response = await fetch(route('admin.settings.payment.test'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({
                    public_key: data.paystack_public_key,
                    secret_key: data.paystack_secret_key,
                }),
            });
            
            const result = await response.json();
            setTestResult(result);
            
            // Show alert message for test result
            setAlertMessage({
                type: result.success ? 'success' : 'error',
                message: result.message
            });
        } catch (error) {
            const errorResult = {
                success: false,
                message: 'Failed to test connection: ' + error.message,
            };
            setTestResult(errorResult);
            setAlertMessage({
                type: 'error',
                message: errorResult.message
            });
        }
        
        setTesting(false);
    };

    const closeAlert = () => {
        setAlertMessage(null);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Payment Settings" />
            
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Payment Settings</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Configure payment gateways and related settings for school fee collection
                    </p>
                </div>

                {/* Alert Messages */}
                {alertMessage && (
                    <div className={`rounded-md p-4 ${
                        alertMessage.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    {alertMessage.type === 'success' ? (
                                        <CheckCircle className="h-5 w-5 text-green-400" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-red-400" />
                                    )}
                                </div>
                                <div className="ml-3">
                                    <p className={`text-sm font-medium ${
                                        alertMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
                                    }`}>
                                        {alertMessage.message}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={closeAlert}
                                className={`inline-flex rounded-md p-1.5 ${
                                    alertMessage.type === 'success' ? 'text-green-500 hover:bg-green-100' : 'text-red-500 hover:bg-red-100'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                    alertMessage.type === 'success' ? 'focus:ring-green-600' : 'focus:ring-red-600'
                                }`}
                            >
                                <span className="sr-only">Dismiss</span>
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Legacy Success Message (keeping for backward compatibility) */}
                {recentlySuccessful && !alertMessage && (
                    <div className="rounded-md bg-green-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-5 w-5 text-green-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">
                                    Payment settings updated successfully!
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    {/* Paystack Configuration */}
                    <div className="bg-white rounded-lg border overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <DollarSign className="h-5 w-5 text-indigo-600 mr-2" />
                                    <h3 className="text-lg font-medium text-gray-900">Paystack Configuration</h3>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center">
                                        <input
                                            id="payment_enabled"
                                            type="checkbox"
                                            checked={data.payment_enabled}
                                            onChange={(e) => setData('payment_enabled', e.target.checked)}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <label htmlFor="payment_enabled" className="ml-2 text-sm font-medium text-gray-700">
                                            Enable Paystack
                                        </label>
                                    </div>
                                    {data.payment_enabled ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Enabled
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            Disabled
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Public Key *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPublicKey ? 'text' : 'password'}
                                            value={data.paystack_public_key}
                                            onChange={(e) => setData('paystack_public_key', e.target.value)}
                                            className={`w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pr-10 ${
                                                errors.paystack_public_key ? 'border-red-300' : ''
                                            }`}
                                            placeholder="pk_test_..."
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPublicKey(!showPublicKey)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            {showPublicKey ? (
                                                <EyeOff className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.paystack_public_key && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            {errors.paystack_public_key}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Secret Key *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showSecretKey ? 'text' : 'password'}
                                            value={data.paystack_secret_key}
                                            onChange={(e) => setData('paystack_secret_key', e.target.value)}
                                            className={`w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pr-10 ${
                                                errors.paystack_secret_key ? 'border-red-300' : ''
                                            }`}
                                            placeholder="sk_test_..."
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowSecretKey(!showSecretKey)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            {showSecretKey ? (
                                                <EyeOff className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.paystack_secret_key && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            {errors.paystack_secret_key}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Payment URL *
                                    </label>
                                    <div className="flex rounded-md shadow-sm">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                            <Globe className="h-4 w-4 mr-1" />
                                            API
                                        </span>
                                        <input
                                            type="url"
                                            value={data.paystack_payment_url}
                                            onChange={(e) => setData('paystack_payment_url', e.target.value)}
                                            className={`flex-1 rounded-none rounded-r-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                                                errors.paystack_payment_url ? 'border-red-300' : ''
                                            }`}
                                            placeholder="https://api.paystack.co"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Paystack API base URL (use https://api.paystack.co for live)
                                    </p>
                                    {errors.paystack_payment_url && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            {errors.paystack_payment_url}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        App Currency *
                                    </label>
                                    <select
                                        value={data.currency}
                                        onChange={(e) => setData('currency', e.target.value)}
                                        className={`w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                                            errors.currency ? 'border-red-300' : ''
                                        }`}
                                    >
                                        <option value="NGN">Nigerian Naira (NGN)</option>
                                        <option value="USD">US Dollar (USD)</option>
                                        <option value="GHS">Ghanaian Cedi (GHS)</option>
                                        <option value="ZAR">South African Rand (ZAR)</option>
                                        <option value="KES">Kenyan Shilling (KES)</option>
                                    </select>
                                    <p className="mt-1 text-xs text-gray-500">
                                        This currency will be used throughout the application
                                    </p>
                                    {errors.currency && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            {errors.currency}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Webhook URL
                                    </label>
                                    <div className="flex rounded-md shadow-sm">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                            <Globe className="h-4 w-4 mr-1" />
                                            Webhook
                                        </span>
                                        <input
                                            type="url"
                                            value={data.paystack_webhook_url}
                                            onChange={(e) => setData('paystack_webhook_url', e.target.value)}
                                            className={`flex-1 rounded-none rounded-r-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                                                errors.paystack_webhook_url ? 'border-red-300' : ''
                                            }`}
                                            placeholder="https://yoursite.com/webhook/paystack"
                                            readOnly
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Copy this URL to your Paystack dashboard webhook settings
                                    </p>
                                    {errors.paystack_webhook_url && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            {errors.paystack_webhook_url}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="paystack_test_mode"
                                        type="checkbox"
                                        checked={data.paystack_test_mode}
                                        onChange={(e) => setData('paystack_test_mode', e.target.checked)}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="paystack_test_mode" className="ml-2 text-sm font-medium text-gray-700">
                                        Enable Test Mode
                                    </label>
                                </div>

                                <button
                                    type="button"
                                    onClick={testPaystackConnection}
                                    disabled={testing || !data.paystack_public_key || !data.paystack_secret_key}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <TestTube className="w-4 h-4 mr-2" />
                                    {testing ? 'Testing...' : 'Test Connection'}
                                </button>
                            </div>

                            {testResult && (
                                <div className={`rounded-md p-4 ${testResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            {testResult.success ? (
                                                <CheckCircle className="h-5 w-5 text-green-400" />
                                            ) : (
                                                <AlertCircle className="h-5 w-5 text-red-400" />
                                            )}
                                        </div>
                                        <div className="ml-3">
                                            <p className={`text-sm font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                                                {testResult.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Rules */}
                    <div className="bg-white rounded-lg border overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center">
                                <SettingsIcon className="h-5 w-5 text-indigo-600 mr-2" />
                                <h3 className="text-lg font-medium text-gray-900">Payment Rules</h3>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Minimum Payment Amount (₦)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.minimum_payment_amount}
                                        onChange={(e) => setData('minimum_payment_amount', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Payment Deadline (Days)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="365"
                                        value={data.payment_deadline_days}
                                        onChange={(e) => setData('payment_deadline_days', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Grace Period (Days)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="30"
                                        value={data.grace_period_days}
                                        onChange={(e) => setData('grace_period_days', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <input
                                        id="allow_partial_payments"
                                        type="checkbox"
                                        checked={data.allow_partial_payments}
                                        onChange={(e) => setData('allow_partial_payments', e.target.checked)}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="allow_partial_payments" className="ml-2 text-sm font-medium text-gray-700">
                                        Allow partial payments
                                    </label>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center">
                                        <input
                                            id="late_fee_enabled"
                                            type="checkbox"
                                            checked={data.late_fee_enabled}
                                            onChange={(e) => setData('late_fee_enabled', e.target.checked)}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <label htmlFor="late_fee_enabled" className="ml-2 text-sm font-medium text-gray-700">
                                            Enable late fees
                                        </label>
                                    </div>

                                    {data.late_fee_enabled && (
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="100"
                                                value={data.late_fee_percentage}
                                                onChange={(e) => setData('late_fee_percentage', e.target.value)}
                                                className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm text-gray-500">% of original amount</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Email Notifications */}
                    <div className="bg-white rounded-lg border overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center">
                                <Key className="h-5 w-5 text-indigo-600 mr-2" />
                                <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div className="flex items-center">
                                <input
                                    id="send_payment_confirmations"
                                    type="checkbox"
                                    checked={data.send_payment_confirmations}
                                    onChange={(e) => setData('send_payment_confirmations', e.target.checked)}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="send_payment_confirmations" className="ml-2 text-sm font-medium text-gray-700">
                                    Send payment confirmation emails
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="send_payment_reminders"
                                    type="checkbox"
                                    checked={data.send_payment_reminders}
                                    onChange={(e) => setData('send_payment_reminders', e.target.checked)}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="send_payment_reminders" className="ml-2 text-sm font-medium text-gray-700">
                                    Send payment reminder emails
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="send_overdue_notices"
                                    type="checkbox"
                                    checked={data.send_overdue_notices}
                                    onChange={(e) => setData('send_overdue_notices', e.target.checked)}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="send_overdue_notices" className="ml-2 text-sm font-medium text-gray-700">
                                    Send overdue payment notices
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
