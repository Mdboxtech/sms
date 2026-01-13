import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    ArrowLeft,
    Download,
    Eye,
    Filter,
    Search,
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    Receipt,
    FileText
} from 'lucide-react';

export default function History({ 
    payments, 
    filters, 
    fees, 
    statistics,
    pagination 
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedFee, setSelectedFee] = useState(filters.fee_id || '');
    const [selectedMonth, setSelectedMonth] = useState(filters.month || '');
    const [showFilters, setShowFilters] = useState(false);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
        }).format(amount);
    };

    const formatDateTime = (datetime) => {
        return new Date(datetime).toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            successful: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Successful' },
            pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
            failed: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Failed' },
            cancelled: { icon: XCircle, color: 'bg-gray-100 text-gray-800', label: 'Cancelled' },
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className="w-3 h-3 mr-1" />
                {config.label}
            </span>
        );
    };

    const getPaymentMethodBadge = (method) => {
        const colors = {
            paystack: 'bg-blue-100 text-blue-800',
            bank_transfer: 'bg-purple-100 text-purple-800',
            cash: 'bg-green-100 text-green-800',
        };

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[method] || 'bg-gray-100 text-gray-800'}`}>
                {method?.replace('_', ' ').toUpperCase() || 'Unknown'}
            </span>
        );
    };

    const handleSearch = () => {
        router.get(route('student.payments.history'), {
            search: searchTerm,
            status: selectedStatus,
            fee_id: selectedFee,
            month: selectedMonth,
        }, { preserveState: true });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('');
        setSelectedFee('');
        setSelectedMonth('');
        router.get(route('student.payments.history'), {}, { preserveState: true });
    };

    const downloadReceipt = (paymentId) => {
        window.open(route('student.receipts.download', paymentId), '_blank');
    };

    const months = [
        { value: '01', label: 'January' },
        { value: '02', label: 'February' },
        { value: '03', label: 'March' },
        { value: '04', label: 'April' },
        { value: '05', label: 'May' },
        { value: '06', label: 'June' },
        { value: '07', label: 'July' },
        { value: '08', label: 'August' },
        { value: '09', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Payment History" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('student.payments.dashboard')}
                            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Dashboard
                        </Link>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </button>
                        <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                            <Download className="w-4 h-4 mr-2" />
                            Export All
                        </button>
                    </div>
                </div>

                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Payment History</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        View all your school fee payment transactions
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg border">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Paid</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {formatCurrency(statistics.total_paid || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Receipt className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Transactions</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {statistics.transaction_count || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Clock className="h-8 w-8 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Pending</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {statistics.pending_count || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <XCircle className="h-8 w-8 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Failed</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {statistics.failed_count || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="bg-white rounded-lg border p-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Search
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-10"
                                        placeholder="Reference number..."
                                    />
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="successful">Successful</option>
                                    <option value="pending">Pending</option>
                                    <option value="failed">Failed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fee Type
                                </label>
                                <select
                                    value={selectedFee}
                                    onChange={(e) => setSelectedFee(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">All Fees</option>
                                    {fees.map(fee => (
                                        <option key={fee.id} value={fee.id}>
                                            {fee.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Month
                                </label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">All Months</option>
                                    {months.map(month => (
                                        <option key={month.value} value={month.value}>
                                            {month.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-end space-x-2">
                                <button
                                    onClick={handleSearch}
                                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
                                >
                                    Apply
                                </button>
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment History Table */}
                <div className="bg-white rounded-lg border overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Payment Transactions</h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                        {payments && payments.data && payments.data.length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date & Reference
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fee Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Method
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {payments.data.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatDateTime(payment.created_at)}
                                                </div>
                                                <div className="text-sm text-gray-500 font-mono">
                                                    {payment.transaction_reference}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {payment.fee?.name || 'Unknown Fee'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {payment.fee?.description}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(payment.amount)}
                                                </div>
                                                {payment.fee && payment.amount < payment.fee.amount && (
                                                    <div className="text-xs text-yellow-600">
                                                        Partial Payment
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getPaymentMethodBadge(payment.payment_method)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(payment.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    {payment.status === 'successful' && (
                                                        <button
                                                            onClick={() => downloadReceipt(payment.id)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                            title="Download Receipt"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <Link
                                                        href={route('student.payments.show', payment.id)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-12 text-center">
                                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No payment history</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    You haven't made any payments yet.
                                </p>
                                <div className="mt-6">
                                    <Link
                                        href={route('student.payments.dashboard')}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        <Receipt className="w-4 h-4 mr-2" />
                                        Make a Payment
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {payments && payments.links && (
                        <div className="px-6 py-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing {payments.from || 0} to {payments.to || 0} of {payments.total || 0} results
                                </div>
                                <div className="flex items-center space-x-1">
                                    {payments.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-2 text-sm rounded-md ${
                                                link.active
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
