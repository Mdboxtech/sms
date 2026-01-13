import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    Receipt, 
    Calendar, 
    User, 
    CreditCard, 
    CheckCircle, 
    XCircle, 
    Clock, 
    ArrowLeft, 
    Download,
    Banknote,
    School,
    Hash,
    Play,
    Loader2
} from 'lucide-react';

export default function Show({ payment }) {
    const [processing, setProcessing] = useState(false);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDownloadReceipt = () => {
        // Only allow download for successful payments
        if (payment.status === 'successful') {
            window.open(route('student.payments.download', payment.id), '_blank');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'success':
            case 'completed':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'failed':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'pending':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success':
            case 'completed':
                return <CheckCircle className="w-5 h-5" />;
            case 'failed':
                return <XCircle className="w-5 h-5" />;
            case 'pending':
                return <Clock className="w-5 h-5" />;
            default:
                return <Clock className="w-5 h-5" />;
        }
    };

    const handlePayNow = () => {
        if (processing) return;
        
        setProcessing(true);
        
        // Initialize payment with Paystack
        router.post(route('student.payments.initiate'), {
            fee_id: payment.fee_id,
            amount: payment.amount,
            payment_id: payment.id, // Reference the existing payment record
        }, {
            onSuccess: (page) => {
                // Check if we received a payment URL from the backend
                if (page.props.paymentUrl) {
                    // Redirect to Paystack payment page
                    window.location.href = page.props.paymentUrl;
                } else {
                    setProcessing(false);
                }
            },
            onError: (errors) => {
                console.error('Payment initiation error:', errors);
                setProcessing(false);
                alert('Failed to initialize payment. Please try again.');
            },
            onFinish: () => {
                // Don't set processing to false here as we might be redirecting
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-3">
                    <Receipt className="w-6 h-6 text-indigo-600" />
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Payment Receipt
                    </h2>
                </div>
            }
        >
            <Head title="Payment Receipt" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Header Actions */}
                    <div className="flex justify-between items-center mb-6">
                        <Link
                            href={route('student.payments.history')}
                            className="inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to History
                        </Link>
                        
                        <div className="flex space-x-3">
                            {/* Pay Now Button for Pending/Failed Payments */}
                            {(payment.status === 'pending' || payment.status === 'failed') && (
                                <button
                                    onClick={handlePayNow}
                                    disabled={processing}
                                    className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition ease-in-out duration-150"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-4 h-4 mr-2" />
                                            Pay Now
                                        </>
                                    )}
                                </button>
                            )}
                            
                            {payment.status === 'successful' && (
                                <button
                                    onClick={handleDownloadReceipt}
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Receipt
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Receipt Card */}
                    <div className="bg-white overflow-hidden shadow-lg sm:rounded-lg border">
                        {/* Receipt Header */}
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-8 text-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-2xl font-bold mb-2">Payment Receipt</h1>
                                    <p className="text-indigo-100">Transaction ID: {payment.reference}</p>
                                </div>
                                <div className="text-right">
                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(payment.status)}`}>
                                        {getStatusIcon(payment.status)}
                                        <span className="ml-2 capitalize">{payment.status}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Receipt Body */}
                        <div className="px-6 py-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Payment Details */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <CreditCard className="w-5 h-5 mr-2 text-indigo-600" />
                                        Payment Information
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Amount Paid:</span>
                                            <span className="text-lg font-bold text-green-600">{formatCurrency(payment.amount)}</span>
                                        </div>
                                        
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Payment Method:</span>
                                            <span className="text-sm font-medium text-gray-900 capitalize">{payment.payment_method || 'Online Payment'}</span>
                                        </div>
                                        
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Transaction Date:</span>
                                            <span className="text-sm font-medium text-gray-900">{formatDate(payment.created_at)}</span>
                                        </div>
                                        
                                        {payment.paid_at && (
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Confirmed At:</span>
                                                <span className="text-sm font-medium text-gray-900">{formatDate(payment.paid_at)}</span>
                                            </div>
                                        )}
                                        
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Reference:</span>
                                            <span className="text-sm font-mono text-gray-900">{payment.reference}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Student & Fee Details */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <User className="w-5 h-5 mr-2 text-indigo-600" />
                                        Student Information
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Student Name:</span>
                                            <span className="text-sm font-medium text-gray-900">{payment.student?.user?.name}</span>
                                        </div>
                                        
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Student ID:</span>
                                            <span className="text-sm font-medium text-gray-900">{payment.student?.admission_number}</span>
                                        </div>
                                        
                                        {payment.fee && (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Fee Type:</span>
                                                    <span className="text-sm font-medium text-gray-900">{payment.fee.name}</span>
                                                </div>
                                                
                                                {payment.fee.description && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Description:</span>
                                                        <span className="text-sm text-gray-900">{payment.fee.description}</span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Additional Details */}
                            {(payment.gateway_response || payment.notes) && (
                                <div className="mt-8 pt-8 border-t border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <Hash className="w-5 h-5 mr-2 text-indigo-600" />
                                        Additional Information
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 gap-4">
                                        {payment.gateway_response && (
                                            <div>
                                                <span className="text-sm text-gray-600 block mb-1">Gateway Response:</span>
                                                <span className="text-sm text-gray-900">{payment.gateway_response}</span>
                                            </div>
                                        )}
                                        
                                        {payment.notes && (
                                            <div>
                                                <span className="text-sm text-gray-600 block mb-1">Notes:</span>
                                                <span className="text-sm text-gray-900">{payment.notes}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Success Message */}
                            {payment.status === 'success' && (
                                <div className="mt-8 bg-green-50 border border-green-200 rounded-md p-4">
                                    <div className="flex items-center">
                                        <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                                        <div>
                                            <h4 className="text-sm font-medium text-green-800">Payment Successful</h4>
                                            <p className="text-sm text-green-700 mt-1">
                                                Your payment has been processed successfully. This receipt serves as proof of payment.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Pending Message */}
                            {payment.status === 'pending' && (
                                <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center">
                                            <Clock className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0" />
                                            <div>
                                                <h4 className="text-sm font-medium text-yellow-800">Payment Pending</h4>
                                                <p className="text-sm text-yellow-700 mt-1">
                                                    This payment has not been completed yet. Click "Pay Now" to process payment through Paystack.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handlePayNow}
                                            disabled={processing}
                                            className="ml-4 inline-flex items-center px-4 py-2 bg-yellow-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-yellow-700 focus:bg-yellow-700 active:bg-yellow-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition ease-in-out duration-150 flex-shrink-0"
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="w-4 h-4 mr-1" />
                                                    Pay Now
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Failed Message with Retry Option */}
                            {payment.status === 'failed' && (
                                <div className="mt-8 bg-red-50 border border-red-200 rounded-md p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center">
                                            <XCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                                            <div>
                                                <h4 className="text-sm font-medium text-red-800">Payment Failed</h4>
                                                <p className="text-sm text-red-700 mt-1">
                                                    This payment was not successful. You can try again or contact support if you believe this is an error.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handlePayNow}
                                            disabled={processing}
                                            className="ml-4 inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 focus:bg-red-700 active:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition ease-in-out duration-150 flex-shrink-0"
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                                    Retrying...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="w-4 h-4 mr-1" />
                                                    Try Again
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Receipt Footer */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>Generated on {formatDate(new Date())}</span>
                                <span>For questions, contact school administration</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex justify-center space-x-4">
                        <Link
                            href={route('student.payments.dashboard')}
                            className="inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            <Banknote className="w-4 h-4 mr-2" />
                            Payment Dashboard
                        </Link>
                        
                        <Link
                            href={route('student.payments.history')}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            <Calendar className="w-4 h-4 mr-2" />
                            View All Payments
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
