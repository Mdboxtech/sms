import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, User, Clock, MapPin, Edit, FileText } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function AttendanceShow({ auth, attendance }) {
    const getStatusBadge = (status) => {
        const statusClasses = {
            present: 'bg-green-100 text-green-800',
            absent: 'bg-red-100 text-red-800',
            late: 'bg-yellow-100 text-yellow-800',
            excused: 'bg-blue-100 text-blue-800',
        };

        const statusLabels = {
            present: 'Present',
            absent: 'Absent',
            late: 'Late',
            excused: 'Excused',
        };

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusClasses[status]}`}>
                {statusLabels[status] || status}
            </span>
        );
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Attendance - ${attendance.student.user.name}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Link
                                    href={route('admin.attendance.index')}
                                    className="mr-4 text-gray-600 hover:text-gray-900"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                                <div>
                                    <h2 className="text-2xl font-bold leading-7 text-gray-900">
                                        Attendance Details
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {new Date(attendance.date).toLocaleDateString('en-US', { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex space-x-3">
                                <Link
                                    href={route('admin.attendance.edit', attendance.id)}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Student Information */}
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                        <User className="w-5 h-5 mr-2" />
                                        Student Information
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{attendance.student.user.name}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Admission Number</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{attendance.student.admission_number}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{attendance.student.user.email}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Classroom</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {attendance.classroom.name} {attendance.classroom.section}
                                            </dd>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Attendance Details */}
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                        <Calendar className="w-5 h-5 mr-2" />
                                        Attendance Details
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Date</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {new Date(attendance.date).toLocaleDateString()}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Status</dt>
                                            <dd className="mt-1">
                                                {getStatusBadge(attendance.status)}
                                            </dd>
                                        </div>
                                        {attendance.arrival_time && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Arrival Time</dt>
                                                <dd className="mt-1 text-sm text-gray-900 flex items-center">
                                                    <Clock className="w-4 h-4 mr-1 text-gray-400" />
                                                    {attendance.arrival_time}
                                                </dd>
                                            </div>
                                        )}
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Academic Session</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {attendance.academic_session?.name || 'N/A'}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Term</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {attendance.term?.name || 'N/A'}
                                            </dd>
                                        </div>
                                    </div>

                                    {attendance.notes && (
                                        <div className="mt-6">
                                            <dt className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                                                <FileText className="w-4 h-4 mr-1" />
                                                Notes
                                            </dt>
                                            <dd className="text-sm text-gray-900 bg-gray-50 rounded-md p-3">
                                                {attendance.notes}
                                            </dd>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Tracking Information */}
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">Tracking Information</h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Marked By</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{attendance.marked_by.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Marked At</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {new Date(attendance.marked_at).toLocaleString()}
                                        </dd>
                                    </div>
                                    {attendance.updated_by && (
                                        <>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Last Updated By</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{attendance.updated_by.name}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Updated At</dt>
                                                <dd className="mt-1 text-sm text-gray-900">
                                                    {new Date(attendance.updated_at).toLocaleString()}
                                                </dd>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                                </div>
                                <div className="p-6 space-y-3">
                                    <Link
                                        href={route('admin.attendance.student.report', attendance.student.id)}
                                        className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        View Student Report
                                    </Link>
                                    <Link
                                        href={route('admin.attendance.classroom.report', attendance.classroom.id)}
                                        className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        View Class Report
                                    </Link>
                                    <Link
                                        href={route('admin.attendance.create', { 
                                            date: attendance.date, 
                                            classroom_id: attendance.classroom.id 
                                        })}
                                        className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Mark Today's Attendance
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
