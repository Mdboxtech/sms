import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { CheckCircle, Download, ArrowLeft, Receipt, Calendar, DollarSign } from 'lucide-react';

export default function Success({ payment }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
        }).format(amount);
    };

    const formatDateTime = (datetime) => {
        return new Date(datetime).toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Payment Successful" />
            
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        {/* Success Icon */}
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        
                        {/* Success Message */}
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Payment Successful!
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Your school fee payment has been processed successfully.
                            </p>
                        </div>

                        {/* Payment Details */}
                        {payment && (
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-500">Fee</span>
                                        <span className="text-sm text-gray-900">{payment.fee?.name}</span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-500">Amount Paid</span>
                                        <span className="text-sm font-semibold text-green-600">
                                            {formatCurrency(payment.amount)}
                                        </span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-500">Payment Date</span>
                                        <span className="text-sm text-gray-900">
                                            {formatDateTime(payment.created_at)}
                                        </span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-500">Reference</span>
                                        <span className="text-sm text-gray-900 font-mono">
                                            {payment.transaction_reference}
                                        </span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-500">Payment Method</span>
                                        <span className="text-sm text-gray-900 capitalize">
                                            {payment.payment_method?.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            {payment && payment.status === 'successful' && (
                                <Link
                                    href={route('student.receipts.download', payment.id)}
                                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Receipt
                                </Link>
                            )}
                            
                            <Link
                                href={route('student.payments.history')}
                                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                <Receipt className="w-4 h-4 mr-2" />
                                View Payment History
                            </Link>
                            
                            <Link
                                href={route('student.payments.dashboard')}
                                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Payments
                            </Link>
                        </div>

                        {/* Additional Information */}
                        <div className="mt-6 text-center">
                            <div className="text-xs text-gray-500">
                                <p className="mb-2">
                                    Keep your reference number for future inquiries.
                                </p>
                                <p>
                                    If you have any questions, please contact the school administration.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
