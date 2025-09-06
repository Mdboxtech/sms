import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Save, User, Calendar, Clock, FileText } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function AttendanceEdit({ auth, attendance, statusOptions }) {
    const [formData, setFormData] = useState({
        status: attendance.status,
        arrival_time: attendance.arrival_time || '',
        notes: attendance.notes || ''
    });
    
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router.put(route('admin.attendance.update', attendance.id), formData, {
            onSuccess: () => {
                // Redirect to show page
                router.visit(route('admin.attendance.show', attendance.id));
            },
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            },
            onFinish: () => setProcessing(false)
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            present: 'text-green-600 bg-green-50 border-green-200',
            absent: 'text-red-600 bg-red-50 border-red-200',
            late: 'text-yellow-600 bg-yellow-50 border-yellow-200',
            excused: 'text-blue-600 bg-blue-50 border-blue-200',
        };
        return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Edit Attendance - ${attendance.student.user.name}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center">
                            <Link
                                href={route('admin.attendance.show', attendance.id)}
                                className="mr-4 text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h2 className="text-2xl font-bold leading-7 text-gray-900">
                                    Edit Attendance
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    {attendance.student.user.name} - {new Date(attendance.date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Form */}
                        <div className="lg:col-span-2">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Student Info Card (Read-only) */}
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
                                                <dt className="text-sm font-medium text-gray-500">Student Name</dt>
                                                <dd className="mt-1 text-sm font-medium text-gray-900">
                                                    {attendance.student.user.name}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Admission Number</dt>
                                                <dd className="mt-1 text-sm text-gray-900">
                                                    {attendance.student.admission_number}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Date</dt>
                                                <dd className="mt-1 text-sm text-gray-900 flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                                                    {new Date(attendance.date).toLocaleDateString()}
                                                </dd>
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

                                {/* Attendance Details Form */}
                                <div className="bg-white shadow rounded-lg">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900">Attendance Details</h3>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        {/* Status Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                Attendance Status *
                                            </label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {Object.entries(statusOptions).map(([value, label]) => (
                                                    <label key={value} className="relative">
                                                        <input
                                                            type="radio"
                                                            name="status"
                                                            value={value}
                                                            checked={formData.status === value}
                                                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                                                            className="sr-only"
                                                        />
                                                        <div className={`
                                                            cursor-pointer rounded-lg border-2 p-3 text-center transition-all
                                                            ${formData.status === value 
                                                                ? getStatusColor(value) 
                                                                : 'text-gray-500 bg-white border-gray-200 hover:border-gray-300'
                                                            }
                                                        `}>
                                                            <div className="text-sm font-medium">{label}</div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                            {errors.status && (
                                                <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                                            )}
                                        </div>

                                        {/* Arrival Time */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Clock className="w-4 h-4 inline mr-1" />
                                                Arrival Time
                                            </label>
                                            <input
                                                type="time"
                                                value={formData.arrival_time}
                                                onChange={(e) => setFormData({...formData, arrival_time: e.target.value})}
                                                className="block w-full md:w-48 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                            {errors.arrival_time && (
                                                <p className="mt-1 text-sm text-red-600">{errors.arrival_time}</p>
                                            )}
                                            <p className="mt-1 text-xs text-gray-500">
                                                Optional: Record the time student arrived
                                            </p>
                                        </div>

                                        {/* Notes */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <FileText className="w-4 h-4 inline mr-1" />
                                                Notes
                                            </label>
                                            <textarea
                                                rows={4}
                                                value={formData.notes}
                                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                placeholder="Optional notes about this attendance record..."
                                            />
                                            {errors.notes && (
                                                <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                                            )}
                                            <p className="mt-1 text-xs text-gray-500">
                                                Maximum 500 characters
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end space-x-3">
                                    <Link
                                        href={route('admin.attendance.show', attendance.id)}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Update Attendance
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Current Status */}
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">Current Status</h3>
                                </div>
                                <div className="p-6">
                                    <div className={`
                                        rounded-lg border-2 p-4 text-center
                                        ${getStatusColor(attendance.status)}
                                    `}>
                                        <div className="text-lg font-semibold">
                                            {statusOptions[attendance.status]}
                                        </div>
                                        {attendance.arrival_time && (
                                            <div className="text-sm mt-1">
                                                Arrived at {attendance.arrival_time}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Original Record Info */}
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">Record Information</h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Originally Marked By</dt>
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
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
