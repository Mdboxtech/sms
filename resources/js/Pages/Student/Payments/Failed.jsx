import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { XCircle, RefreshCw, ArrowLeft, HelpCircle, Phone } from 'lucide-react';

export default function Failed({ payment, reference }) {
    const formatDateTime = (datetime) => {
        return new Date(datetime).toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const retryPayment = () => {
        if (payment?.fee_id) {
            // Redirect to dashboard with the fee selected for retry
            window.location.href = route('student.payments.dashboard') + '?retry_fee=' + payment.fee_id;
        } else {
            window.location.href = route('student.payments.dashboard');
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Payment Failed" />
            
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        {/* Failed Icon */}
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                            <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                        
                        {/* Failed Message */}
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Payment Failed
                            </h2>
                            <p className="text-gray-600 mb-6">
                                We couldn't process your payment. Please try again or contact support.
                            </p>
                        </div>

                        {/* Payment Details */}
                        {payment && (
                            <div className="bg-red-50 rounded-lg p-4 mb-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-500">Fee</span>
                                        <span className="text-sm text-gray-900">{payment.fee?.name}</span>
                                    </div>
                                    
                                    {payment.amount && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-500">Attempted Amount</span>
                                            <span className="text-sm text-gray-900">
                                                ₦{parseFloat(payment.amount).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {payment.created_at && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-500">Attempt Date</span>
                                            <span className="text-sm text-gray-900">
                                                {formatDateTime(payment.created_at)}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {(reference || payment.transaction_reference) && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-500">Reference</span>
                                            <span className="text-sm text-gray-900 font-mono">
                                                {reference || payment.transaction_reference}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {payment.gateway_response && (
                                        <div className="pt-2 border-t border-red-200">
                                            <span className="text-sm font-medium text-gray-500">Error Details:</span>
                                            <p className="text-sm text-red-600 mt-1">
                                                {payment.gateway_response}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Common Reasons */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Common reasons for payment failure:</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Insufficient funds in your account</li>
                                <li>• Incorrect card details or expired card</li>
                                <li>• Network connectivity issues</li>
                                <li>• Transaction limit exceeded</li>
                                <li>• Bank declined the transaction</li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={retryPayment}
                                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Try Again
                            </button>
                            
                            <Link
                                href={route('student.payments.dashboard')}
                                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Payments
                            </Link>
                        </div>

                        {/* Support Information */}
                        <div className="mt-6 text-center">
                            <div className="text-xs text-gray-500">
                                <div className="flex items-center justify-center mb-2">
                                    <HelpCircle className="w-4 h-4 mr-1" />
                                    <span>Need help?</span>
                                </div>
                                <p className="mb-2">
                                    Contact our support team if the problem persists.
                                </p>
                                <div className="flex items-center justify-center text-indigo-600">
                                    <Phone className="w-3 h-3 mr-1" />
                                    <span>School Office: +234 xxx xxxx xxx</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
