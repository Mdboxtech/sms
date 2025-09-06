import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Users, Clock, TrendingUp, Eye, Edit, Trash2, Plus } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DataTable from '@/Components/DataTable';

export default function AttendanceIndex({ 
    auth, 
    attendances, 
    classrooms, 
    terms, 
    sessions, 
    filters, 
    currentSession, 
    currentTerm,
    statusOptions 
}) {
    const [isLoading, setIsLoading] = useState(false);

    const handleFilter = (newFilters) => {
        setIsLoading(true);
        
        // Remove page parameter when filtering to start from page 1
        const params = { ...newFilters };
        delete params.page;
        
        router.get(route('admin.attendance.index'), params, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this attendance record?')) {
            router.delete(route('admin.attendance.destroy', id), {
                onSuccess: () => {
                    // Refresh the page
                    router.reload();
                }
            });
        }
    };

    const getStatusBadge = (status) => {
        const statusClasses = {
            present: 'bg-green-100 text-green-800',
            absent: 'bg-red-100 text-red-800',
            late: 'bg-yellow-100 text-yellow-800',
            excused: 'bg-blue-100 text-blue-800',
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}>
                {statusOptions[status] || status}
            </span>
        );
    };

    const columns = [
        {
            header: 'Date',
            accessor: 'date',
            render: (row) => new Date(row.date).toLocaleDateString()
        },
        {
            header: 'Student',
            accessor: 'student',
            render: (row) => (
                <div>
                    <div className="font-medium text-gray-900">{row.student.user.name}</div>
                    <div className="text-sm text-gray-500">{row.student.admission_number}</div>
                </div>
            )
        },
        {
            header: 'Class',
            accessor: 'classroom',
            render: (row) => (
                <span className="text-sm font-medium text-gray-900">
                    {row.classroom.name} {row.classroom.section}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => getStatusBadge(row.status)
        },
        {
            header: 'Arrival Time',
            accessor: 'arrival_time',
            render: (row) => row.arrival_time ? (
                <span className="text-sm text-gray-900">{row.arrival_time}</span>
            ) : (
                <span className="text-sm text-gray-400">—</span>
            )
        },
        {
            header: 'Marked By',
            accessor: 'marked_by',
            render: (row) => (
                <span className="text-sm text-gray-900">{row.marked_by.name}</span>
            )
        },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (row) => (
                <div className="flex items-center space-x-2">
                    <Link
                        href={route('admin.attendance.show', row.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View"
                    >
                        <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                        href={route('admin.attendance.edit', row.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    // Calculate stats - handle pagination data structure
    const attendanceData = attendances.data || attendances;
    const stats = [
        {
            name: 'Total Records',
            value: attendances.total || attendanceData.length,
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
        },
        {
            name: 'Present Today',
            value: attendanceData.filter(a => a.status === 'present' && a.date === new Date().toISOString().split('T')[0]).length,
            icon: TrendingUp,
            color: 'text-green-600',
            bgColor: 'bg-green-100'
        },
        {
            name: 'Absent Today',
            value: attendanceData.filter(a => a.status === 'absent' && a.date === new Date().toISOString().split('T')[0]).length,
            icon: Clock,
            color: 'text-red-600',
            bgColor: 'bg-red-100'
        },
        {
            name: 'Late Today',
            value: attendanceData.filter(a => a.status === 'late' && a.date === new Date().toISOString().split('T')[0]).length,
            icon: Calendar,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100'
        }
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Attendance Management" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="md:flex md:items-center md:justify-between mb-8">
                        <div className="min-w-0 flex-1">
                            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
                                Attendance Management
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Track and manage student attendance across all classes
                            </p>
                        </div>
                        <div className="mt-4 flex md:mt-0 md:ml-4">
                            <Link
                                href={route('admin.attendance.create')}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Mark Attendance
                            </Link>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className={`w-8 h-8 rounded-md ${stat.bgColor} flex items-center justify-center`}>
                                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                            </div>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">
                                                    {stat.name}
                                                </dt>
                                                <dd className="text-lg font-medium text-gray-900">
                                                    {stat.value}
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="bg-white shadow rounded-lg mb-8">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.date || ''}
                                        onChange={(e) => handleFilter({...filters, date: e.target.value})}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Classroom
                                    </label>
                                    <select
                                        value={filters.classroom_id || ''}
                                        onChange={(e) => handleFilter({...filters, classroom_id: e.target.value})}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    >
                                        <option value="">All Classrooms</option>
                                        {classrooms.map(classroom => (
                                            <option key={classroom.id} value={classroom.id}>
                                                {classroom.name} {classroom.section}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Term
                                    </label>
                                    <select
                                        value={filters.term_id || ''}
                                        onChange={(e) => handleFilter({...filters, term_id: e.target.value})}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    >
                                        {terms.map(term => (
                                            <option key={term.id} value={term.id}>
                                                {term.name} ({term.academic_session?.name})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Academic Session
                                    </label>
                                    <select
                                        value={filters.academic_session_id || ''}
                                        onChange={(e) => handleFilter({...filters, academic_session_id: e.target.value})}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    >
                                        {sessions.map(session => (
                                            <option key={session.id} value={session.id}>
                                                {session.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="bg-white shadow rounded-lg">
                        {(attendances.data && attendances.data.length > 0) || (Array.isArray(attendances) && attendances.length > 0) ? (
                            <DataTable
                                columns={columns}
                                data={attendances}
                                searchable={true}
                                searchPlaceholder="Search by student name, email, or admission number..."
                            />
                        ) : (
                            <div className="p-6 text-center">
                                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Attendance Records</h3>
                                <p className="text-gray-500 mb-4">
                                    No attendance records found for the selected filters.
                                </p>
                                <Link
                                    href={route('admin.attendance.create')}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Mark Attendance
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
