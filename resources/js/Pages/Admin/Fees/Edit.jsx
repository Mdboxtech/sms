import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Save, ArrowLeft, AlertCircle, Trash2, Calendar, DollarSign, Eye } from 'lucide-react';

export default function Edit({ 
    fee,
    classrooms, 
    academicSessions, 
    terms, 
    feeTypes, 
    paymentFrequencies 
}) {
    // Safe defaults with null checks
    const safeFee = fee || {};
    const safeClassrooms = classrooms || [];
    const safeAcademicSessions = academicSessions || [];
    const safeTerms = terms || [];
    const safeFeeTypes = feeTypes || {};
    const safePaymentFrequencies = paymentFrequencies || {};

    const { data, setData, put, delete: destroy, processing, errors } = useForm({
        name: safeFee.name || '',
        description: safeFee.description || '',
        amount: safeFee.amount || '',
        fee_type: safeFee.fee_type || 'tuition',
        payment_frequency: safeFee.payment_frequency || 'termly',
        classroom_id: safeFee.classroom_id || '',
        academic_session_id: safeFee.academic_session_id || '',
        term_id: safeFee.term_id || '',
        due_date: safeFee.due_date || '',
        is_active: safeFee.is_active ?? true,
        is_mandatory: safeFee.is_mandatory ?? true,
        late_fee_amount: safeFee.late_fee_amount || '',
        grace_period_days: safeFee.grace_period_days || 0,
        allow_partial_payment: safeFee.allow_partial_payment || false,
        minimum_amount: safeFee.minimum_amount || '',
    });

    const [filteredTerms, setFilteredTerms] = useState(safeTerms);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        if (data.academic_session_id) {
            const sessionTerms = safeTerms.filter(term => term.academic_session_id == data.academic_session_id);
            setFilteredTerms(sessionTerms);
        } else {
            setFilteredTerms(safeTerms);
        }
    }, [data.academic_session_id, safeTerms]);

    const handleSessionChange = (sessionId) => {
        setData('academic_session_id', sessionId);
        setData('term_id', ''); // Reset term when session changes
        
        if (sessionId) {
            const sessionTerms = safeTerms.filter(term => term.academic_session_id == sessionId);
            setFilteredTerms(sessionTerms);
        } else {
            setFilteredTerms(safeTerms);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.fees.update', safeFee.id));
    };

    const handleDelete = () => {
        destroy(route('admin.fees.destroy', safeFee.id));
    };

    const formatCurrency = (value) => {
        if (!value) return '';
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
        }).format(value);
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Fee - ${safeFee.name || 'Unknown Fee'}`} />
            
            <div className="py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                                {safeFee.id && (
                                    <Link
                                        href={route('admin.fees.show', safeFee.id)}
                                        className="flex items-center text-indigo-600 hover:text-indigo-500"
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        View Fee
                                    </Link>
                                )}
                            </div>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                            >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete Fee
                            </button>
                        </div>
                        <div className="mt-4">
                            <h1 className="text-3xl font-bold text-gray-900">
                                Edit Fee: {safeFee.name || 'Unknown Fee'}
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Update the fee settings and properties
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-white shadow rounded-lg">
                        <form onSubmit={handleSubmit} className="space-y-6 p-6">
                            {/* Basic Information */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                            Fee Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                                                errors.name ? 'border-red-300' : ''
                                            }`}
                                            placeholder="e.g., Tuition Fee - First Term"
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                            Description
                                        </label>
                                        <textarea
                                            id="description"
                                            rows={3}
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                                                errors.description ? 'border-red-300' : ''
                                            }`}
                                            placeholder="Describe this fee (optional)"
                                        />
                                        {errors.description && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                                            Amount (₦) *
                                        </label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <DollarSign className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="number"
                                                id="amount"
                                                step="0.01"
                                                min="0"
                                                value={data.amount}
                                                onChange={(e) => setData('amount', e.target.value)}
                                                className={`pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                                                    errors.amount ? 'border-red-300' : ''
                                                }`}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        {data.amount && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                Preview: {formatCurrency(data.amount)}
                                            </p>
                                        )}
                                        {errors.amount && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                {errors.amount}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="fee_type" className="block text-sm font-medium text-gray-700">
                                            Fee Type *
                                        </label>
                                        <select
                                            id="fee_type"
                                            value={data.fee_type}
                                            onChange={(e) => setData('fee_type', e.target.value)}
                                            className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                                                errors.fee_type ? 'border-red-300' : ''
                                            }`}
                                        >
                                            {Object.entries(safeFeeTypes).map(([key, label]) => (
                                                <option key={key} value={key}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.fee_type && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                {errors.fee_type}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="payment_frequency" className="block text-sm font-medium text-gray-700">
                                            Payment Frequency *
                                        </label>
                                        <select
                                            id="payment_frequency"
                                            value={data.payment_frequency}
                                            onChange={(e) => setData('payment_frequency', e.target.value)}
                                            className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                                                errors.payment_frequency ? 'border-red-300' : ''
                                            }`}
                                        >
                                            {Object.entries(safePaymentFrequencies).map(([key, label]) => (
                                                <option key={key} value={key}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.payment_frequency && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                {errors.payment_frequency}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                                            Due Date
                                        </label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Calendar className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="date"
                                                id="due_date"
                                                value={data.due_date}
                                                onChange={(e) => setData('due_date', e.target.value)}
                                                className={`pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                                                    errors.due_date ? 'border-red-300' : ''
                                                }`}
                                            />
                                        </div>
                                        {errors.due_date && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                {errors.due_date}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Assignment */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Assignment</h3>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                                    <div>
                                        <label htmlFor="classroom_id" className="block text-sm font-medium text-gray-700">
                                            Classroom
                                        </label>
                                        <select
                                            id="classroom_id"
                                            value={data.classroom_id}
                                            onChange={(e) => setData('classroom_id', e.target.value)}
                                            className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                                                errors.classroom_id ? 'border-red-300' : ''
                                            }`}
                                        >
                                            <option value="">All Classrooms</option>
                                            {safeClassrooms.map((classroom) => (
                                                <option key={classroom.id} value={classroom.id}>
                                                    {classroom.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.classroom_id && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                {errors.classroom_id}
                                            </p>
                                        )}
                                        <p className="mt-1 text-sm text-gray-500">
                                            Leave empty to apply to all classrooms
                                        </p>
                                    </div>

                                    <div>
                                        <label htmlFor="academic_session_id" className="block text-sm font-medium text-gray-700">
                                            Academic Session *
                                        </label>
                                        <select
                                            id="academic_session_id"
                                            value={data.academic_session_id}
                                            onChange={(e) => handleSessionChange(e.target.value)}
                                            className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                                                errors.academic_session_id ? 'border-red-300' : ''
                                            }`}
                                        >
                                            <option value="">Select Session</option>
                                            {safeAcademicSessions.map((session) => (
                                                <option key={session.id} value={session.id}>
                                                    {session.name} {session.is_current && '(Current)'}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.academic_session_id && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                {errors.academic_session_id}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="term_id" className="block text-sm font-medium text-gray-700">
                                            Term
                                        </label>
                                        <select
                                            id="term_id"
                                            value={data.term_id}
                                            onChange={(e) => setData('term_id', e.target.value)}
                                            className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                                                errors.term_id ? 'border-red-300' : ''
                                            }`}
                                        >
                                            <option value="">All Terms</option>
                                            {filteredTerms.map((term) => (
                                                <option key={term.id} value={term.id}>
                                                    {term.name} {term.is_current && '(Current)'}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.term_id && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                {errors.term_id}
                                            </p>
                                        )}
                                        <p className="mt-1 text-sm text-gray-500">
                                            Leave empty to apply to all terms
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Settings */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <input
                                            id="is_active"
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                            Active (students can see and pay this fee)
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            id="is_mandatory"
                                            type="checkbox"
                                            checked={data.is_mandatory}
                                            onChange={(e) => setData('is_mandatory', e.target.checked)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="is_mandatory" className="ml-2 block text-sm text-gray-900">
                                            Mandatory (required payment)
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            id="allow_partial_payment"
                                            type="checkbox"
                                            checked={data.allow_partial_payment}
                                            onChange={(e) => setData('allow_partial_payment', e.target.checked)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="allow_partial_payment" className="ml-2 block text-sm text-gray-900">
                                            Allow partial payments
                                        </label>
                                    </div>

                                    {data.allow_partial_payment && (
                                        <div className="ml-6">
                                            <label htmlFor="minimum_amount" className="block text-sm font-medium text-gray-700">
                                                Minimum Payment Amount (₦)
                                            </label>
                                            <input
                                                type="number"
                                                id="minimum_amount"
                                                step="0.01"
                                                min="0"
                                                value={data.minimum_amount}
                                                onChange={(e) => setData('minimum_amount', e.target.value)}
                                                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                                                    errors.minimum_amount ? 'border-red-300' : ''
                                                }`}
                                                placeholder="0.00"
                                            />
                                            {errors.minimum_amount && (
                                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.minimum_amount}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Advanced Options */}
                            <div className="border-t border-gray-200 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    Advanced Options
                                    <svg className={`ml-1 h-4 w-4 transform ${showAdvanced ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {showAdvanced && (
                                    <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="late_fee_amount" className="block text-sm font-medium text-gray-700">
                                                Late Fee Amount (₦)
                                            </label>
                                            <input
                                                type="number"
                                                id="late_fee_amount"
                                                step="0.01"
                                                min="0"
                                                value={data.late_fee_amount}
                                                onChange={(e) => setData('late_fee_amount', e.target.value)}
                                                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                                                    errors.late_fee_amount ? 'border-red-300' : ''
                                                }`}
                                                placeholder="0.00"
                                            />
                                            {errors.late_fee_amount && (
                                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.late_fee_amount}
                                                </p>
                                            )}
                                            <p className="mt-1 text-sm text-gray-500">
                                                Additional charge for overdue payments
                                            </p>
                                        </div>

                                        <div>
                                            <label htmlFor="grace_period_days" className="block text-sm font-medium text-gray-700">
                                                Grace Period (Days)
                                            </label>
                                            <input
                                                type="number"
                                                id="grace_period_days"
                                                min="0"
                                                value={data.grace_period_days}
                                                onChange={(e) => setData('grace_period_days', e.target.value)}
                                                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                                                    errors.grace_period_days ? 'border-red-300' : ''
                                                }`}
                                                placeholder="0"
                                            />
                                            {errors.grace_period_days && (
                                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.grace_period_days}
                                                </p>
                                            )}
                                            <p className="mt-1 text-sm text-gray-500">
                                                Days after due date before late fee applies
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Submit Buttons */}
                            <div className="border-t border-gray-200 pt-6">
                                <div className="flex justify-between">
                                    <div className="flex space-x-3">
                                        <Link
                                            href={route('admin.fees.index')}
                                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Cancel
                                        </Link>
                                        {safeFee.id && (
                                            <Link
                                                href={route('admin.fees.show', safeFee.id)}
                                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                <Eye className="w-4 h-4 mr-2 inline" />
                                                View Fee
                                            </Link>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Update Fee
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Delete Confirmation Modal */}
                    {showDeleteModal && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                                <div className="mt-3 text-center">
                                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                        <Trash2 className="h-6 w-6 text-red-600" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Fee</h3>
                                    <div className="mt-2 px-7 py-3">
                                        <p className="text-sm text-gray-500">
                                            Are you sure you want to delete "{safeFee.name}"? This action cannot be undone.
                                        </p>
                                    </div>
                                    <div className="items-center px-4 py-3">
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => setShowDeleteModal(false)}
                                                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleDelete}
                                                disabled={processing}
                                                className="px-4 py-2 bg-red-600 text-white border border-transparent rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                            >
                                                {processing ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
