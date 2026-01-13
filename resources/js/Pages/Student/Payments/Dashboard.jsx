import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    CreditCard, 
    Clock, 
    CheckCircle, 
    AlertTriangle, 
    DollarSign,
    Calendar,
    Receipt,
    Download,
    Eye,
    RefreshCw
} from 'lucide-react';

export default function Dashboard({ student, fees, payments, statistics }) {
    const [selectedFee, setSelectedFee] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    
    const { data, setData, post, processing } = useForm({
        fee_id: '',
        amount: '',
        payment_method: 'paystack',
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
        }).format(amount);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            completed: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Paid' },
            partial: { icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-800', label: 'Partial' },
            pending: { icon: Clock, color: 'bg-gray-100 text-gray-800', label: 'Pending' },
            overdue: { icon: AlertTriangle, color: 'bg-red-100 text-red-800', label: 'Overdue' },
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

    const getFeeStatus = (fee) => {
        const payment = payments.find(p => p.fee_id === fee.id && p.status === 'successful');
        const totalPaid = payments
            .filter(p => p.fee_id === fee.id && p.status === 'successful')
            .reduce((sum, p) => sum + parseFloat(p.amount), 0);

        if (totalPaid >= fee.amount) {
            return 'completed';
        } else if (totalPaid > 0) {
            return 'partial';
        } else if (fee.due_date && new Date(fee.due_date) < new Date()) {
            return 'overdue';
        } else {
            return 'pending';
        }
    };

    const getAmountOwed = (fee) => {
        const totalPaid = payments
            .filter(p => p.fee_id === fee.id && p.status === 'successful')
            .reduce((sum, p) => sum + parseFloat(p.amount), 0);
        
        return Math.max(0, fee.amount - totalPaid);
    };

    const handlePayment = (fee) => {
        setSelectedFee(fee);
        const amountOwed = getAmountOwed(fee);
        setPaymentAmount(amountOwed.toString());
        setData({
            fee_id: fee.id,
            amount: amountOwed.toString(),
            payment_method: 'paystack',
        });
        setShowPaymentModal(true);
    };

    const submitPayment = (e) => {
        e.preventDefault();
        post(route('student.payments.initiate'), {
            onSuccess: () => {
                setShowPaymentModal(false);
                setSelectedFee(null);
            }
        });
    };

    const handleAmountChange = (value) => {
        const numValue = parseFloat(value);
        const maxAmount = getAmountOwed(selectedFee);
        
        if (numValue <= maxAmount) {
            setPaymentAmount(value);
            setData('amount', value);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Payment Dashboard" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Payment Dashboard</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Welcome {student.user?.name}, manage your school fee payments
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Admission Number</div>
                            <div className="text-lg font-semibold text-gray-900">{student.admission_number}</div>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg border">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <DollarSign className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Fees</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {formatCurrency(statistics.total_fees || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Amount Paid</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {formatCurrency(statistics.total_paid || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Clock className="h-8 w-8 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Outstanding</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {formatCurrency(statistics.outstanding || 0)}
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
                </div>

                {/* Current Fees */}
                <div className="bg-white rounded-lg border overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">Current School Fees</h3>
                            <button className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900">
                                <RefreshCw className="w-4 h-4 mr-1" />
                                Refresh
                            </button>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        {fees && fees.length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fee Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Due Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {fees.map((fee) => {
                                        const status = getFeeStatus(fee);
                                        const amountOwed = getAmountOwed(fee);
                                        const totalPaid = payments
                                            .filter(p => p.fee_id === fee.id && p.status === 'successful')
                                            .reduce((sum, p) => sum + parseFloat(p.amount), 0);
                                        
                                        return (
                                            <tr key={fee.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {fee.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {fee.description}
                                                    </div>
                                                    {fee.payment_frequency && (
                                                        <div className="text-xs text-gray-400 mt-1 capitalize">
                                                            {fee.payment_frequency} Fee
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatCurrency(fee.amount)}
                                                    </div>
                                                    {totalPaid > 0 && (
                                                        <div className="text-xs text-green-600">
                                                            Paid: {formatCurrency(totalPaid)}
                                                        </div>
                                                    )}
                                                    {amountOwed > 0 && (
                                                        <div className="text-xs text-red-600">
                                                            Owed: {formatCurrency(amountOwed)}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {fee.due_date ? formatDate(fee.due_date) : 'Not set'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center space-x-2">
                                                        {amountOwed > 0 && (
                                                            <button
                                                                onClick={() => handlePayment(fee)}
                                                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                                            >
                                                                <CreditCard className="w-3 h-3 mr-1" />
                                                                Pay Now
                                                            </button>
                                                        )}
                                                        <Link
                                                            href={route('student.payments.history', { fee_id: fee.id })}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-12 text-center">
                                <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No fees assigned</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    There are no fees currently assigned to your class.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link
                            href={route('student.payments.history')}
                            className="flex items-center p-4 border rounded-lg hover:bg-gray-50"
                        >
                            <Receipt className="h-8 w-8 text-blue-600 mr-3" />
                            <div>
                                <div className="text-sm font-medium text-gray-900">Payment History</div>
                                <div className="text-sm text-gray-500">View all transactions</div>
                            </div>
                        </Link>
                        
                        <Link
                            href={route('student.receipts.index')}
                            className="flex items-center p-4 border rounded-lg hover:bg-gray-50"
                        >
                            <Download className="h-8 w-8 text-green-600 mr-3" />
                            <div>
                                <div className="text-sm font-medium text-gray-900">Download Receipts</div>
                                <div className="text-sm text-gray-500">Get payment receipts</div>
                            </div>
                        </Link>
                        
                        <button className="flex items-center p-4 border rounded-lg hover:bg-gray-50 text-left">
                            <Calendar className="h-8 w-8 text-purple-600 mr-3" />
                            <div>
                                <div className="text-sm font-medium text-gray-900">Payment Schedule</div>
                                <div className="text-sm text-gray-500">View due dates</div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedFee && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                                <CreditCard className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mt-4 text-center">Make Payment</h3>
                            
                            <form onSubmit={submitPayment} className="mt-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Fee: {selectedFee.name}
                                    </label>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Amount Owed: {formatCurrency(getAmountOwed(selectedFee))}
                                    </p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Payment Amount (₦)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="1"
                                        max={getAmountOwed(selectedFee)}
                                        value={paymentAmount}
                                        onChange={(e) => handleAmountChange(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="Enter amount"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        You can make partial payments
                                    </p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Payment Method
                                    </label>
                                    <select
                                        value={data.payment_method}
                                        onChange={(e) => setData('payment_method', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="paystack">Paystack (Card/Bank Transfer)</option>
                                        <option value="bank_transfer">Direct Bank Transfer</option>
                                    </select>
                                </div>
                                
                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowPaymentModal(false)}
                                        className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing || !paymentAmount}
                                        className="px-4 py-2 bg-indigo-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {processing ? 'Processing...' : 'Pay Now'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
