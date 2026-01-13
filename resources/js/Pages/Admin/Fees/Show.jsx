import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    ArrowLeft, 
    Edit, 
    DollarSign, 
    Calendar, 
    Clock, 
    Users, 
    CheckCircle,
    XCircle,
    AlertTriangle,
    FileText,
    Download,
    Eye,
    Settings,
    TrendingUp,
    BarChart3,
    CreditCard,
    AlertCircle
} from 'lucide-react';

export default function Show({ fee, paymentStats, recentPayments }) {
    // Safe defaults with null checks
    const safeFee = fee || {};
    const safePaymentStats = paymentStats || {
        total_collected: 0,
        total_pending: 0,
        total_students: 0,
        completion_rate: 0,
        overdue_count: 0
    };
    const safeRecentPayments = recentPayments || [];

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '₦0.00';
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
        }).format(amount);
    };

    const formatDate = (date) => {
        if (!date) return 'Not set';
        try {
            return new Date(date).toLocaleDateString('en-NG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    const formatDateTime = (datetime) => {
        if (!datetime) return 'Unknown';
        try {
            return new Date(datetime).toLocaleDateString('en-NG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            completed: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Completed' },
            partial: { icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-800', label: 'Partial' },
            pending: { icon: Clock, color: 'bg-gray-100 text-gray-800', label: 'Pending' },
            overdue: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Overdue' },
        };

        const config = statusConfig[status] || statusConfig.pending;
        const IconComponent = config.icon;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                <IconComponent className="w-3 h-3 mr-1" />
                {config.label}
            </span>
        );
    };

    const getFeeTypeBadge = (type) => {
        const typeColors = {
            tuition: 'bg-blue-100 text-blue-800',
            development: 'bg-purple-100 text-purple-800',
            transport: 'bg-green-100 text-green-800',
            hostel: 'bg-orange-100 text-orange-800',
            examination: 'bg-red-100 text-red-800',
            sports: 'bg-yellow-100 text-yellow-800',
            library: 'bg-indigo-100 text-indigo-800',
            laboratory: 'bg-pink-100 text-pink-800',
            other: 'bg-gray-100 text-gray-800'
        };

        const color = typeColors[type] || typeColors.other;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
                {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Other'}
            </span>
        );
    };

    const getProgressWidth = (current, total) => {
        if (!total || total === 0) return 0;
        return Math.min((current / total) * 100, 100);
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Fee Details - ${safeFee.name || 'Unknown Fee'}`} />
            
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Link
                                    href={route('admin.fees.index')}
                                    className="flex items-center text-gray-500 hover:text-gray-700"
                                >
                                    <ArrowLeft className="w-5 h-5 mr-1" />
                                    Back to Fees
                                </Link>
                            </div>
                            <div className="flex space-x-3">
                                {safeFee.id && (
                                    <Link
                                        href={route('admin.fees.edit', safeFee.id)}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Fee
                                    </Link>
                                )}
                                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                    <Download className="w-4 h-4 mr-2" />
                                    Export Report
                                </button>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="flex items-center space-x-3">
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {safeFee.name || 'Unknown Fee'}
                                </h1>
                                {getFeeTypeBadge(safeFee.fee_type)}
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    safeFee.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {safeFee.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <p className="mt-2 text-gray-600">
                                {safeFee.description || 'No description provided'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Fee Information Card */}
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                        <FileText className="w-5 h-5 mr-2 text-gray-400" />
                                        Fee Information
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Amount</dt>
                                            <dd className="mt-1 text-2xl font-semibold text-gray-900 flex items-center">
                                                <DollarSign className="w-5 h-5 mr-1 text-green-500" />
                                                {formatCurrency(safeFee.amount)}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Payment Frequency</dt>
                                            <dd className="mt-1 text-sm text-gray-900 capitalize">
                                                {safeFee.payment_frequency || 'Not specified'}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                                            <dd className="mt-1 text-sm text-gray-900 flex items-center">
                                                <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                                                {formatDate(safeFee.due_date)}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Late Fee</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {safeFee.late_fee_amount ? formatCurrency(safeFee.late_fee_amount) : 'None'}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Grace Period</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {safeFee.grace_period_days || 0} days
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Mandatory</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    safeFee.is_mandatory ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {safeFee.is_mandatory ? 'Required' : 'Optional'}
                                                </span>
                                            </dd>
                                        </div>
                                    </dl>

                                    {/* Assignment Details */}
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <h4 className="text-sm font-medium text-gray-500 mb-4">Assignment</h4>
                                        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3">
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Classroom</dt>
                                                <dd className="mt-1 text-sm text-gray-900">
                                                    {safeFee.classroom?.name || 'All Classrooms'}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Academic Session</dt>
                                                <dd className="mt-1 text-sm text-gray-900">
                                                    {safeFee.academic_session?.name || 'Not specified'}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Term</dt>
                                                <dd className="mt-1 text-sm text-gray-900">
                                                    {safeFee.term?.name || 'All Terms'}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>

                                    {/* Partial Payment Settings */}
                                    {safeFee.allow_partial_payment && (
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <h4 className="text-sm font-medium text-gray-500 mb-4">Partial Payment Settings</h4>
                                            <div className="bg-blue-50 rounded-lg p-4">
                                                <div className="flex">
                                                    <CreditCard className="w-5 h-5 text-blue-400 mt-0.5" />
                                                    <div className="ml-3">
                                                        <h5 className="text-sm font-medium text-blue-900">Partial payments allowed</h5>
                                                        <p className="text-sm text-blue-700 mt-1">
                                                            Minimum payment: {formatCurrency(safeFee.minimum_amount || 0)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Recent Payments */}
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                        <CreditCard className="w-5 h-5 mr-2 text-gray-400" />
                                        Recent Payments
                                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {safeRecentPayments.length}
                                        </span>
                                    </h3>
                                </div>
                                <div className="overflow-hidden">
                                    {safeRecentPayments.length > 0 ? (
                                        <ul className="divide-y divide-gray-200">
                                            {safeRecentPayments.map((payment, index) => (
                                                <li key={payment.id || index} className="px-6 py-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0">
                                                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                                    <span className="text-sm font-medium text-gray-600">
                                                                        {payment.student?.first_name?.[0] || 'S'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="ml-4">
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {payment.student?.first_name || 'Unknown'} {payment.student?.last_name || 'Student'}
                                                                </p>
                                                                <p className="text-sm text-gray-500">
                                                                    {formatDateTime(payment.created_at)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-3">
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {formatCurrency(payment.amount)}
                                                            </span>
                                                            {getStatusBadge(payment.status || 'pending')}
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="px-6 py-12 text-center">
                                            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No payments yet</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                No payments have been made for this fee yet.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Quick Stats */}
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                        <BarChart3 className="w-5 h-5 mr-2 text-gray-400" />
                                        Payment Statistics
                                    </h3>
                                </div>
                                <div className="p-6 space-y-6">
                                    {/* Collection Progress */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">Collection Progress</span>
                                            <span className="text-sm text-gray-500">{Math.round(safePaymentStats.completion_rate || 0)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                                                style={{ width: `${safePaymentStats.completion_rate || 0}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="text-center p-4 bg-green-50 rounded-lg">
                                            <div className="text-2xl font-bold text-green-600">
                                                {formatCurrency(safePaymentStats.total_collected)}
                                            </div>
                                            <div className="text-sm text-green-700">Total Collected</div>
                                        </div>
                                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                            <div className="text-2xl font-bold text-yellow-600">
                                                {formatCurrency(safePaymentStats.total_pending)}
                                            </div>
                                            <div className="text-sm text-yellow-700">Still Pending</div>
                                        </div>
                                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {safePaymentStats.total_students || 0}
                                            </div>
                                            <div className="text-sm text-blue-700">Total Students</div>
                                        </div>
                                        {safePaymentStats.overdue_count > 0 && (
                                            <div className="text-center p-4 bg-red-50 rounded-lg">
                                                <div className="text-2xl font-bold text-red-600">
                                                    {safePaymentStats.overdue_count}
                                                </div>
                                                <div className="text-sm text-red-700">Overdue Payments</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                        <Settings className="w-5 h-5 mr-2 text-gray-400" />
                                        Quick Actions
                                    </h3>
                                </div>
                                <div className="p-6 space-y-3">
                                    {safeFee.id && (
                                        <>
                                            <Link
                                                href={route('admin.fees.edit', safeFee.id)}
                                                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                <Edit className="w-4 h-4 mr-2" />
                                                Edit Fee Details
                                            </Link>
                                            <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                                <Download className="w-4 h-4 mr-2" />
                                                Download Report
                                            </button>
                                            <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                                <Users className="w-4 h-4 mr-2" />
                                                View All Payments
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Fee Status */}
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                        <AlertCircle className="w-5 h-5 mr-2 text-gray-400" />
                                        Fee Status
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">Status</span>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                safeFee.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {safeFee.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">Created</span>
                                            <span className="text-sm text-gray-900">
                                                {formatDate(safeFee.created_at)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">Last Updated</span>
                                            <span className="text-sm text-gray-900">
                                                {formatDate(safeFee.updated_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
