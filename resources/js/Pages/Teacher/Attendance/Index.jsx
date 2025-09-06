import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Users, Clock, TrendingUp, Eye, Edit, Trash2, Plus, BookOpen } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DataTable from '@/Components/DataTable';

export default function TeacherAttendanceIndex({ 
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
        
        router.get(route('teacher.attendance.index'), params, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this attendance record?')) {
            router.delete(route('teacher.attendance.destroy', id), {
                onSuccess: () => {
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
            header: 'Notes',
            accessor: 'notes',
            render: (row) => row.notes ? (
                <span className="text-sm text-gray-600" title={row.notes}>
                    {row.notes.length > 30 ? row.notes.substring(0, 30) + '...' : row.notes}
                </span>
            ) : (
                <span className="text-sm text-gray-400">—</span>
            )
        },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (row) => (
                <div className="flex items-center space-x-2">
                    <Link
                        href={route('teacher.attendance.edit', row.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </Link>
                </div>
            )
        }
    ];

    // Calculate stats for teacher's classes - handle pagination data structure
    const attendanceData = attendances.data || attendances;
    const stats = [
        {
            name: 'My Classes',
            value: classrooms.length,
            icon: BookOpen,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
        },
        {
            name: 'Total Records',
            value: attendances.total || attendanceData.length,
            icon: Users,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
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
        }
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="My Attendance Records" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="md:flex md:items-center md:justify-between mb-8">
                        <div className="min-w-0 flex-1">
                            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
                                My Attendance Records
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Manage attendance for your assigned classes
                            </p>
                        </div>
                        <div className="mt-4 flex md:mt-0 md:ml-4">
                            <Link
                                href={route('teacher.attendance.create')}
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

                    {/* My Classes Quick Access */}
                    {classrooms.length > 0 && (
                        <div className="bg-white shadow rounded-lg mb-8">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">My Classes</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {classrooms.map(classroom => (
                                        <Link
                                            key={classroom.id}
                                            href={route('teacher.attendance.create', { classroom_id: classroom.id })}
                                            className="block p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:shadow-md transition-all duration-200"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-900">
                                                        {classroom.name} {classroom.section}
                                                    </h4>
                                                    <p className="text-sm text-gray-500">
                                                        {classroom.students?.length || 0} students
                                                    </p>
                                                </div>
                                                <Calendar className="w-5 h-5 text-gray-400" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

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
                                        My Classes
                                    </label>
                                    <select
                                        value={filters.classroom_id || ''}
                                        onChange={(e) => handleFilter({...filters, classroom_id: e.target.value})}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    >
                                        <option value="">All My Classes</option>
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
                                        Status
                                    </label>
                                    <select
                                        value={filters.status || ''}
                                        onChange={(e) => handleFilter({...filters, status: e.target.value})}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    >
                                        <option value="">All Status</option>
                                        {Object.entries(statusOptions).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
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
                                    No attendance records found for your classes with the selected filters.
                                </p>
                                <Link
                                    href={route('teacher.attendance.create')}
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
