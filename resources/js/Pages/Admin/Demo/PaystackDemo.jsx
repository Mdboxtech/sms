import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    CreditCard, 
    CheckCircle, 
    AlertCircle, 
    DollarSign,
    Key,
    Globe,
    Settings,
    TestTube,
    ArrowRight,
    ExternalLink,
    Zap
} from 'lucide-react';

export default function PaystackDemo({ paymentSettings, webhookUrl, testMode }) {
    const [testResult, setTestResult] = useState(null);
    const [testing, setTesting] = useState(false);
    const [paymentInitialized, setPaymentInitialized] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '1000',
        email: 'test@example.com',
        description: 'Demo Payment Test',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTesting(true);
        setTestResult(null);

        try {
            const response = await fetch(route('admin.demo.paystack.test'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            
            if (result.success) {
                setTestResult({
                    type: 'success',
                    message: result.message,
                    data: result.data
                });
                setPaymentInitialized(true);
            } else {
                setTestResult({
                    type: 'error',
                    message: result.message
                });
            }
        } catch (error) {
            setTestResult({
                type: 'error',
                message: 'Network error: ' + error.message
            });
        } finally {
            setTesting(false);
        }
    };

    const openPaymentPage = () => {
        if (testResult?.data?.authorization_url) {
            window.open(testResult.data.authorization_url, '_blank');
        }
    };

    const resetDemo = () => {
        setTestResult(null);
        setPaymentInitialized(false);
        reset();
    };

    const isConfigured = paymentSettings.paystack_public_key && paymentSettings.paystack_secret_key;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-3">
                    <TestTube className="w-6 h-6 text-indigo-600" />
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Paystack Integration Demo
                    </h2>
                    {testMode && (
                        <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded">
                            Test Mode
                        </span>
                    )}
                </div>
            }
        >
            <Head title="Paystack Demo" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Configuration Status */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration Status</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className={`p-4 rounded-lg border ${
                                    paymentSettings.paystack_public_key ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                                }`}>
                                    <div className="flex items-center space-x-2">
                                        <Key className="w-5 h-5" />
                                        <span className="font-medium">Public Key</span>
                                        {paymentSettings.paystack_public_key ? (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 text-red-600" />
                                        )}
                                    </div>
                                    <p className="text-sm mt-1">
                                        {paymentSettings.paystack_public_key ? 'Configured' : 'Not configured'}
                                    </p>
                                </div>

                                <div className={`p-4 rounded-lg border ${
                                    paymentSettings.paystack_secret_key ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                                }`}>
                                    <div className="flex items-center space-x-2">
                                        <Key className="w-5 h-5" />
                                        <span className="font-medium">Secret Key</span>
                                        {paymentSettings.paystack_secret_key ? (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 text-red-600" />
                                        )}
                                    </div>
                                    <p className="text-sm mt-1">
                                        {paymentSettings.paystack_secret_key ? 'Configured' : 'Not configured'}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Globe className="w-5 h-5 text-blue-600" />
                                    <span className="font-medium text-blue-900">Webhook URL</span>
                                </div>
                                <p className="text-sm text-blue-700 font-mono bg-blue-100 p-2 rounded">
                                    {webhookUrl}
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                    Configure this URL in your Paystack dashboard for payment notifications
                                </p>
                            </div>

                            {!isConfigured && (
                                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-center space-x-2">
                                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                                        <span className="font-medium text-yellow-900">Configuration Required</span>
                                    </div>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        Please configure your Paystack keys in the{' '}
                                        <a 
                                            href={route('admin.settings.payment')} 
                                            className="underline hover:no-underline"
                                        >
                                            Payment Settings
                                        </a>{' '}
                                        before testing.
                                    </p>
                                </div>
                            )}

                            {/* Demo Instructions */}
                            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <TestTube className="w-5 h-5 text-blue-600" />
                                    <span className="font-medium text-blue-900">How to Get Test Keys</span>
                                </div>
                                <div className="text-sm text-blue-700 space-y-2">
                                    <ol className="list-decimal list-inside space-y-1">
                                        <li>Visit <a href="https://dashboard.paystack.com/" target="_blank" className="underline">Paystack Dashboard</a></li>
                                        <li>Create a free account or login</li>
                                        <li>Navigate to Settings → API Keys & Webhooks</li>
                                        <li>Copy your Test Public Key (starts with pk_test_...)</li>
                                        <li>Copy your Test Secret Key (starts with sk_test_...)</li>
                                        <li>Add them to Payment Settings</li>
                                    </ol>
                                    <div className="mt-3 p-3 bg-blue-100 rounded text-xs">
                                        <p className="font-semibold mb-1">💡 Quick Test Keys (for demo only):</p>
                                        <p><strong>Public:</strong> pk_test_abcdef1234567890</p>
                                        <p><strong>Secret:</strong> sk_test_abcdef1234567890</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Demo Form */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <CreditCard className="w-6 h-6 text-indigo-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Payment Demo</h3>
                            </div>

                            {isConfigured ? (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Amount (₦)
                                            </label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="number"
                                                    value={data.amount}
                                                    onChange={e => setData('amount', e.target.value)}
                                                    className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    placeholder="1000"
                                                    min="100"
                                                    step="1"
                                                    required
                                                />
                                            </div>
                                            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={e => setData('email', e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="test@example.com"
                                                required
                                            />
                                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <input
                                            type="text"
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Demo Payment Test"
                                            required
                                        />
                                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                                    </div>

                                    <div className="flex space-x-4">
                                        <button
                                            type="submit"
                                            disabled={testing || processing}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                        >
                                            <Zap className="w-4 h-4" />
                                            <span>{testing ? 'Initializing...' : 'Initialize Payment'}</span>
                                        </button>

                                        {testResult && (
                                            <button
                                                type="button"
                                                onClick={resetDemo}
                                                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg"
                                            >
                                                Reset Demo
                                            </button>
                                        )}
                                    </div>
                                </form>
                            ) : (
                                <div className="text-center py-8">
                                    <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-4">Configure your Paystack settings to enable the demo</p>
                                    <a
                                        href={route('admin.settings.payment')}
                                        className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg"
                                    >
                                        <Settings className="w-4 h-4" />
                                        <span>Payment Settings</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </a>
                                </div>
                            )}

                            {/* Test Results */}
                            {testResult && (
                                <div className={`mt-6 p-4 rounded-lg border ${
                                    testResult.type === 'success' 
                                        ? 'bg-green-50 border-green-200' 
                                        : 'bg-red-50 border-red-200'
                                }`}>
                                    <div className="flex items-start space-x-2">
                                        {testResult.type === 'success' ? (
                                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                        )}
                                        <div className="flex-1">
                                            <p className={`font-medium ${
                                                testResult.type === 'success' ? 'text-green-900' : 'text-red-900'
                                            }`}>
                                                {testResult.message}
                                            </p>
                                            
                                            {testResult.type === 'success' && testResult.data && (
                                                <div className="mt-3 space-y-2">
                                                    <div className="bg-white p-3 rounded border">
                                                        <p className="text-sm text-gray-600 mb-2">Payment Reference:</p>
                                                        <p className="font-mono text-sm bg-gray-100 p-2 rounded">{testResult.data.reference}</p>
                                                    </div>
                                                    
                                                    <button
                                                        onClick={openPaymentPage}
                                                        className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                        <span>Open Payment Page</span>
                                                    </button>
                                                    
                                                    <p className="text-xs text-green-600 mt-2">
                                                        Click the button above to open the Paystack payment page in a new tab.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mt-6">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Demo Instructions</h3>
                            <div className="space-y-3 text-sm text-gray-600">
                                <div className="flex items-start space-x-2">
                                    <span className="bg-indigo-100 text-indigo-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">1</span>
                                    <p>Fill in the demo payment form with test values</p>
                                </div>
                                <div className="flex items-start space-x-2">
                                    <span className="bg-indigo-100 text-indigo-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">2</span>
                                    <p>Click "Initialize Payment" to create a Paystack transaction</p>
                                </div>
                                <div className="flex items-start space-x-2">
                                    <span className="bg-indigo-100 text-indigo-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">3</span>
                                    <p>If successful, you'll get a payment reference and a link to the Paystack payment page</p>
                                </div>
                                <div className="flex items-start space-x-2">
                                    <span className="bg-indigo-100 text-indigo-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">4</span>
                                    <p>Use Paystack's test cards (e.g., 4084084084084081) to complete the payment in test mode</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
