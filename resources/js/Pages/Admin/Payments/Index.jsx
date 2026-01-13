import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    Search, 
    Filter, 
    Download, 
    Eye, 
    Calendar,
    CreditCard,
    TrendingUp,
    DollarSign,
    CheckCircle,
    Clock,
    XCircle,
    FileText,
    Users,
    BarChart3
} from 'lucide-react';

export default function Index({ 
    payments, 
    filters, 
    fees, 
    classrooms, 
    statistics, 
    monthlyRevenue,
    paymentStatuses,
    paymentMethods 
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedFee, setSelectedFee] = useState(filters.fee_id || '');
    const [selectedClassroom, setSelectedClassroom] = useState(filters.classroom_id || '');
    const [selectedMethod, setSelectedMethod] = useState(filters.payment_method || '');
    const [selectedMonth, setSelectedMonth] = useState(filters.month || '');
    const [selectedYear, setSelectedYear] = useState(filters.year || '');
    const [showFilters, setShowFilters] = useState(false);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount);
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('en-NG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status) => {
        const colors = {
            successful: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            failed: 'bg-red-100 text-red-800',
        };

        const icons = {
            successful: CheckCircle,
            pending: Clock,
            failed: XCircle,
        };

        const Icon = icons[status] || Clock;

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
                <Icon className="w-3 h-3 mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
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
        router.get(route('admin.payments.index'), {
            search: searchTerm,
            status: selectedStatus,
            fee_id: selectedFee,
            classroom_id: selectedClassroom,
            payment_method: selectedMethod,
            month: selectedMonth,
            year: selectedYear,
        }, { preserveState: true });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('');
        setSelectedFee('');
        setSelectedClassroom('');
        setSelectedMethod('');
        setSelectedMonth('');
        setSelectedYear('');
        router.get(route('admin.payments.index'), {}, { preserveState: true });
    };

    const exportPayments = () => {
        // Implement export functionality
        window.open(route('admin.payments.export', filters), '_blank');
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

    const years = Array.from({ length: 5 }, (_, i) => {
        const year = new Date().getFullYear() - i;
        return { value: year.toString(), label: year.toString() };
    });

    return (
        <AuthenticatedLayout>
            <Head title="Payment Records" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Payment Records</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            View and manage all school fee payment transactions
                        </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </button>
                        <button 
                            onClick={exportPayments}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </button>
                        <Link
                            href={route('admin.payments.analytics')}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Analytics
                        </Link>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg border">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {formatCurrency(statistics.total_amount || 0)}
                                </p>
                                <p className="text-sm text-green-600">
                                    {statistics.successful_payments || 0} successful payments
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
                                    {formatCurrency(statistics.pending_amount || 0)}
                                </p>
                                <p className="text-sm text-yellow-600">
                                    {statistics.pending_payments || 0} pending payments
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FileText className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {statistics.total_payments || 0}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {statistics.failed_payments || 0} failed
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <TrendingUp className="h-8 w-8 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Success Rate</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {statistics.total_payments > 0 
                                        ? Math.round((statistics.successful_payments / statistics.total_payments) * 100)
                                        : 0}%
                                </p>
                                <p className="text-sm text-indigo-600">
                                    Payment success rate
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-white p-6 rounded-lg border">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Search
                                </label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Reference, student name, or fee..."
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                >
                                    <option value="">All Statuses</option>
                                    {Object.entries(paymentStatuses).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fee
                                </label>
                                <select
                                    value={selectedFee}
                                    onChange={(e) => setSelectedFee(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                >
                                    <option value="">All Fees</option>
                                    {fees.map((fee) => (
                                        <option key={fee.id} value={fee.id}>{fee.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Classroom
                                </label>
                                <select
                                    value={selectedClassroom}
                                    onChange={(e) => setSelectedClassroom(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                >
                                    <option value="">All Classes</option>
                                    {classrooms.map((classroom) => (
                                        <option key={classroom.id} value={classroom.id}>{classroom.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Payment Method
                                </label>
                                <select
                                    value={selectedMethod}
                                    onChange={(e) => setSelectedMethod(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                >
                                    <option value="">All Methods</option>
                                    {Object.entries(paymentMethods).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Month
                                </label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                >
                                    <option value="">All Months</option>
                                    {months.map((month) => (
                                        <option key={month.value} value={month.value}>{month.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Year
                                </label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                >
                                    <option value="">All Years</option>
                                    {years.map((year) => (
                                        <option key={year.value} value={year.value}>{year.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 mt-4">
                            <button
                                onClick={handleSearch}
                                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
                            >
                                Apply Filters
                            </button>
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                )}

                {/* Payment Records Table */}
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
                                            Student
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
                                                    {payment.student?.user?.name || 'Unknown Student'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {payment.student?.classroom?.name}
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
                                                    <Link
                                                        href={route('admin.payments.show', payment.id)}
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
                                <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No payment records</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    No payment transactions found matching your criteria.
                                </p>
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
