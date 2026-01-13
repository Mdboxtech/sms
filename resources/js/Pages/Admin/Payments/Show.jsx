import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    ArrowLeft, 
    CreditCard, 
    User, 
    Calendar, 
    DollarSign,
    FileText,
    CheckCircle,
    Clock,
    XCircle,
    Download,
    RefreshCw
} from 'lucide-react';

export default function Show({ payment }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount);
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('en-NG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleDownloadReceipt = () => {
        // Only allow download for successful payments
        if (payment.status === 'successful') {
            window.open(route('admin.payments.download', payment.id), '_blank');
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            successful: 'bg-green-100 text-green-800 border-green-200',
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            failed: 'bg-red-100 text-red-800 border-red-200',
        };

        const icons = {
            successful: CheckCircle,
            pending: Clock,
            failed: XCircle,
        };

        const Icon = icons[status] || Clock;

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border ${colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                <Icon className="w-4 h-4 mr-2" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getPaymentMethodBadge = (method) => {
        const colors = {
            paystack: 'bg-blue-100 text-blue-800 border-blue-200',
            bank_transfer: 'bg-purple-100 text-purple-800 border-purple-200',
            cash: 'bg-green-100 text-green-800 border-green-200',
        };

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border ${colors[method] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                {method?.replace('_', ' ').toUpperCase() || 'Unknown'}
            </span>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Payment Details - ${payment.transaction_reference}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('admin.payments.index')}
                            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Payment Records
                        </Link>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        {payment.status === 'successful' && (
                            <button 
                                onClick={handleDownloadReceipt}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Receipt
                            </button>
                        )}
                        {payment.status === 'pending' && (
                            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh Status
                            </button>
                        )}
                    </div>
                </div>

                {/* Payment Status Banner */}
                <div className={`rounded-lg p-6 border-l-4 ${
                    payment.status === 'successful' 
                        ? 'bg-green-50 border-green-400' 
                        : payment.status === 'pending'
                        ? 'bg-yellow-50 border-yellow-400'
                        : 'bg-red-50 border-red-400'
                }`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Payment {payment.status === 'successful' ? 'Successful' : payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Transaction Reference: <span className="font-mono font-medium">{payment.transaction_reference}</span>
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-gray-900">
                                {formatCurrency(payment.amount)}
                            </div>
                            {getStatusBadge(payment.status)}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Payment Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Transaction Information */}
                        <div className="bg-white rounded-lg border">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <CreditCard className="w-5 h-5 mr-2" />
                                    Transaction Information
                                </h3>
                            </div>
                            <div className="p-6">
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Payment Reference</dt>
                                        <dd className="mt-1 text-sm text-gray-900 font-mono">{payment.payment_reference}</dd>
                                    </div>
                                    {payment.paystack_reference && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Paystack Reference</dt>
                                            <dd className="mt-1 text-sm text-gray-900 font-mono">{payment.paystack_reference}</dd>
                                        </div>
                                    )}
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                                        <dd className="mt-1">{getPaymentMethodBadge(payment.payment_method)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Transaction Date</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{formatDateTime(payment.created_at)}</dd>
                                    </div>
                                    {payment.verified_at && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Verified Date</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{formatDateTime(payment.verified_at)}</dd>
                                        </div>
                                    )}
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Amount</dt>
                                        <dd className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(payment.amount)}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        {/* Fee Information */}
                        {payment.fee && (
                            <div className="bg-white rounded-lg border">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                        <FileText className="w-5 h-5 mr-2" />
                                        Fee Information
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Fee Name</dt>
                                            <dd className="mt-1 text-sm font-medium text-gray-900">{payment.fee.name}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Fee Amount</dt>
                                            <dd className="mt-1 text-sm font-medium text-gray-900">{formatCurrency(payment.fee.amount)}</dd>
                                        </div>
                                        <div className="md:col-span-2">
                                            <dt className="text-sm font-medium text-gray-500">Description</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{payment.fee.description || 'No description provided'}</dd>
                                        </div>
                                        {payment.fee.academic_session && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Academic Session</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{payment.fee.academic_session.name}</dd>
                                            </div>
                                        )}
                                        {payment.fee.term && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Term</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{payment.fee.term.name}</dd>
                                            </div>
                                        )}
                                    </dl>
                                    
                                    {payment.amount < payment.fee.amount && (
                                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <Clock className="h-5 w-5 text-yellow-400" />
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm text-yellow-800">
                                                        <strong>Partial Payment:</strong> This is a partial payment. 
                                                        Outstanding balance: {formatCurrency(payment.fee.amount - payment.amount)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Student Information */}
                    <div className="space-y-6">
                        {payment.student && (
                            <div className="bg-white rounded-lg border">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                        <User className="w-5 h-5 mr-2" />
                                        Student Information
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <dl className="space-y-4">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Student Name</dt>
                                            <dd className="mt-1 text-sm font-medium text-gray-900">
                                                {payment.student.user?.name || 'Unknown Student'}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Student Email</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {payment.student.user?.email || 'No email'}
                                            </dd>
                                        </div>
                                        {payment.student.classroom && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Class</dt>
                                                <dd className="mt-1 text-sm text-gray-900">
                                                    {payment.student.classroom.name}
                                                </dd>
                                            </div>
                                        )}
                                        {payment.student.admission_number && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Admission Number</dt>
                                                <dd className="mt-1 text-sm text-gray-900 font-mono">
                                                    {payment.student.admission_number}
                                                </dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>
                            </div>
                        )}

                        {/* Payment Timeline */}
                        <div className="bg-white rounded-lg border">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <Calendar className="w-5 h-5 mr-2" />
                                    Payment Timeline
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="flow-root">
                                    <ul className="-mb-8">
                                        <li>
                                            <div className="relative pb-8">
                                                <div className="relative flex space-x-3">
                                                    <div>
                                                        <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                                            <DollarSign className="w-4 h-4 text-white" />
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                        <div>
                                                            <p className="text-sm text-gray-600">Payment initiated</p>
                                                        </div>
                                                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                            {formatDateTime(payment.created_at)}
                                                        </div>
                                                    </div>
                                                </div>
                                                {(payment.verified_at || payment.status === 'successful') && (
                                                    <div className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></div>
                                                )}
                                            </div>
                                        </li>
                                        
                                        {payment.verified_at && (
                                            <li>
                                                <div className="relative pb-8">
                                                    <div className="relative flex space-x-3">
                                                        <div>
                                                            <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                                                                <CheckCircle className="w-4 h-4 text-white" />
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                            <div>
                                                                <p className="text-sm text-gray-600">Payment verified</p>
                                                            </div>
                                                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                                {formatDateTime(payment.verified_at)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        )}

                                        {payment.status === 'failed' && (
                                            <li>
                                                <div className="relative">
                                                    <div className="relative flex space-x-3">
                                                        <div>
                                                            <span className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center ring-8 ring-white">
                                                                <XCircle className="w-4 h-4 text-white" />
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                            <div>
                                                                <p className="text-sm text-gray-600">Payment failed</p>
                                                            </div>
                                                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                                {formatDateTime(payment.updated_at)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
