import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    Plus, 
    Search, 
    Filter, 
    Eye, 
    Edit, 
    Trash2, 
    DollarSign,
    Users,
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

export default function Index({ 
    fees, 
    filters, 
    classrooms, 
    academicSessions, 
    terms, 
    feeTypes, 
    paymentFrequencies 
}) {
    // Safe defaults
    const safeFees = fees || { data: [], total: 0, from: 0, to: 0, links: [] };
    const safeFilters = filters || {};
    const safeClassrooms = classrooms || [];
    const safeAcademicSessions = academicSessions || [];
    const safeTerms = terms || [];
    const safeFeeTypes = feeTypes || {};
    
    const [searchTerm, setSearchTerm] = useState(safeFilters.search || '');
    const [selectedFees, setSelectedFees] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = (value) => {
        setSearchTerm(value);
        router.get(route('admin.fees.index'), {
            ...safeFilters,
            search: value,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleFilter = (key, value) => {
        router.get(route('admin.fees.index'), {
            ...safeFilters,
            [key]: value,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        router.get(route('admin.fees.index'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    const handleBulkStatusUpdate = (status) => {
        if (selectedFees.length === 0) return;

        router.post(route('admin.fees.bulk.status'), {
            fee_ids: selectedFees,
            status: status,
        }, {
            onSuccess: () => {
                setSelectedFees([]);
            }
        });
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return 'N/A';
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
        }).format(amount);
    };

    const getStatusBadge = (fee) => {
        if (!fee) return null;
        
        if (!fee.is_active) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <XCircle className="w-3 h-3 mr-1" />
                    Inactive
                </span>
            );
        }
        
        if (fee.due_date) {
            const now = new Date();
            const dueDate = new Date(fee.due_date);
            
            if (dueDate < now) {
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Overdue
                    </span>
                );
            }
        }
        
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
            </span>
        );
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedFees(safeFees.data.map(fee => fee.id));
        } else {
            setSelectedFees([]);
        }
    };

    const handleSelectFee = (feeId, checked) => {
        if (checked) {
            setSelectedFees([...selectedFees, feeId]);
        } else {
            setSelectedFees(selectedFees.filter(id => id !== feeId));
        }
    };

    const deleteFee = (feeId) => {
        if (confirm('Are you sure you want to delete this fee? This action cannot be undone.')) {
            router.delete(route('admin.fees.destroy', feeId));
        }
    };

    const activeFeeCount = safeFees.data.filter(fee => fee && fee.is_active).length;
    const hasActiveFilters = Object.values(safeFilters).some(value => value && value !== '');

    return (
        <AuthenticatedLayout>
            <Head title="Fee Management" />
            
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
                                <p className="mt-2 text-gray-600">
                                    Create and manage school fees for different classes and terms
                                </p>
                            </div>
                            
                            <Link
                                href={route('admin.fees.create')}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create New Fee
                            </Link>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <DollarSign className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Total Fees
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {safeFees.total || 0}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <CheckCircle className="h-6 w-6 text-green-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Active Fees
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {activeFeeCount}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <Users className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Fee Types
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {Object.keys(safeFeeTypes).length}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <Calendar className="h-6 w-6 text-purple-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Classrooms
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {safeClassrooms.length}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="p-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Search */}
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            placeholder="Search fees by name or description..."
                                            className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            value={searchTerm}
                                            onChange={(e) => handleSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                                
                                {/* Filter Toggle */}
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                        hasActiveFilters 
                                            ? 'border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100' 
                                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                    }`}
                                >
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filters
                                    {hasActiveFilters && (
                                        <span className="ml-2 bg-indigo-600 text-white rounded-full px-2 py-0.5 text-xs">
                                            {Object.values(safeFilters).filter(v => v && v !== '').length}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Expanded Filters */}
                            {showFilters && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Classroom
                                            </label>
                                            <select
                                                value={safeFilters.classroom_id || ''}
                                                onChange={(e) => handleFilter('classroom_id', e.target.value)}
                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            >
                                                <option value="">All Classrooms</option>
                                                <option value="null">Universal Fees</option>
                                                {safeClassrooms.map(classroom => (
                                                    <option key={classroom.id} value={classroom.id}>
                                                        {classroom.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Academic Session
                                            </label>
                                            <select
                                                value={safeFilters.session_id || ''}
                                                onChange={(e) => handleFilter('session_id', e.target.value)}
                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            >
                                                <option value="">All Sessions</option>
                                                {safeAcademicSessions.map(session => (
                                                    <option key={session.id} value={session.id}>
                                                        {session.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Fee Type
                                            </label>
                                            <select
                                                value={safeFilters.fee_type || ''}
                                                onChange={(e) => handleFilter('fee_type', e.target.value)}
                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            >
                                                <option value="">All Types</option>
                                                {Object.entries(safeFeeTypes).map(([key, label]) => (
                                                    <option key={key} value={key}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Status
                                            </label>
                                            <select
                                                value={safeFilters.status || ''}
                                                onChange={(e) => handleFilter('status', e.target.value)}
                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            >
                                                <option value="">All Status</option>
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    {hasActiveFilters && (
                                        <div className="mt-4">
                                            <button
                                                onClick={clearFilters}
                                                className="text-sm text-indigo-600 hover:text-indigo-500"
                                            >
                                                Clear all filters
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedFees.length > 0 && (
                        <div className="bg-white shadow rounded-lg mb-6">
                            <div className="p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        {selectedFees.length} fee(s) selected
                                    </span>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleBulkStatusUpdate(true)}
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                        >
                                            Activate Selected
                                        </button>
                                        <button
                                            onClick={() => handleBulkStatusUpdate(false)}
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        >
                                            Deactivate Selected
                                        </button>
                                        <button
                                            onClick={() => setSelectedFees([])}
                                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Clear Selection
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Fees Table */}
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        {safeFees.data.length > 0 ? (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="w-4 p-4">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                        checked={selectedFees.length === safeFees.data.length && safeFees.data.length > 0}
                                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                                    />
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Fee Name
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Amount
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Classroom
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Due Date
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th scope="col" className="relative px-6 py-3">
                                                    <span className="sr-only">Actions</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {safeFees.data.map((fee) => (
                                                <tr key={fee.id} className="hover:bg-gray-50">
                                                    <td className="w-4 p-4">
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                            checked={selectedFees.includes(fee.id)}
                                                            onChange={(e) => handleSelectFee(fee.id, e.target.checked)}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {fee.name || 'Unnamed Fee'}
                                                            </div>
                                                            {fee.description && (
                                                                <div className="text-sm text-gray-500">
                                                                    {fee.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatCurrency(fee.amount)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                            {safeFeeTypes[fee.fee_type] || fee.fee_type || 'Unknown'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {fee.classroom ? fee.classroom.name : 'All Classes'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {fee.due_date ? new Date(fee.due_date).toLocaleDateString('en-NG') : 'No due date'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(fee)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center space-x-2">
                                                            <Link
                                                                href={route('admin.fees.show', fee.id)}
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                                title="View Details"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Link>
                                                            <Link
                                                                href={route('admin.fees.edit', fee.id)}
                                                                className="text-green-600 hover:text-green-900"
                                                                title="Edit Fee"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Link>
                                                            <button
                                                                onClick={() => deleteFee(fee.id)}
                                                                className="text-red-600 hover:text-red-900"
                                                                title="Delete Fee"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* Pagination */}
                                {safeFees.links && safeFees.links.length > 3 && (
                                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                        <div className="flex-1 flex justify-between sm:hidden">
                                            {safeFees.prev_page_url && (
                                                <Link
                                                    href={safeFees.prev_page_url}
                                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                >
                                                    Previous
                                                </Link>
                                            )}
                                            {safeFees.next_page_url && (
                                                <Link
                                                    href={safeFees.next_page_url}
                                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                >
                                                    Next
                                                </Link>
                                            )}
                                        </div>
                                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-sm text-gray-700">
                                                    Showing <span className="font-medium">{safeFees.from || 0}</span> to{' '}
                                                    <span className="font-medium">{safeFees.to || 0}</span> of{' '}
                                                    <span className="font-medium">{safeFees.total || 0}</span> results
                                                </p>
                                            </div>
                                            <div>
                                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                    {safeFees.links.map((link, index) => (
                                                        <Link
                                                            key={index}
                                                            href={link.url || '#'}
                                                            preserveScroll
                                                            className={`relative inline-flex items-center px-2 py-2 border text-sm font-medium ${
                                                                link.active
                                                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                                    : link.url
                                                                    ? 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                                    : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                                                            } ${
                                                                index === 0 ? 'rounded-l-md' : ''
                                                            } ${
                                                                index === safeFees.links.length - 1 ? 'rounded-r-md' : ''
                                                            }`}
                                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                                        />
                                                    ))}
                                                </nav>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No fees found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {hasActiveFilters 
                                        ? "Try adjusting your filters or search terms." 
                                        : "Get started by creating your first fee."
                                    }
                                </p>
                                <div className="mt-6">
                                    {hasActiveFilters ? (
                                        <button
                                            onClick={clearFilters}
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Clear Filters
                                        </button>
                                    ) : (
                                        <Link
                                            href={route('admin.fees.create')}
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create Fee
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
