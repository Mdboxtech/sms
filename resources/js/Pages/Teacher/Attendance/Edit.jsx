import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Save, User, Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function TeacherAttendanceEdit({ 
    auth, 
    attendance, 
    statusOptions 
}) {
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

        router.put(route('teacher.attendance.update', attendance.id), formData, {
            onSuccess: () => {
                router.visit(route('teacher.attendance.index'));
            },
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            },
            onFinish: () => setProcessing(false)
        });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'present':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'absent':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'late':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            case 'excused':
                return <AlertCircle className="w-5 h-5 text-blue-500" />;
            default:
                return <CheckCircle className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'present':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'absent':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'late':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'excused':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Edit Attendance" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Link
                                    href={route('teacher.attendance.index')}
                                    className="mr-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    Back to Attendance
                                </Link>
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Attendance</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Update attendance record for {attendance.student.user.name}
                        </p>
                    </div>

                    {/* Student Information */}
                    <div className="bg-white shadow rounded-lg mb-8">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                <User className="w-5 h-5 mr-2" />
                                Student Information
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0 h-16 w-16">
                                    <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                                        <span className="text-xl font-medium text-gray-700">
                                            {attendance.student.user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-lg font-medium text-gray-900">
                                        {attendance.student.user.name}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                        Admission No: {attendance.student.admission_number}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Class: {attendance.classroom.name} {attendance.classroom.section}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-500">Date</div>
                                    <div className="text-lg font-medium text-gray-900">
                                        {new Date(attendance.date).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Current Status */}
                    <div className="bg-white shadow rounded-lg mb-8">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Current Status</h3>
                        </div>
                        <div className="p-6">
                            <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border ${getStatusColor(attendance.status)}`}>
                                {getStatusIcon(attendance.status)}
                                <span className="ml-2">{statusOptions[attendance.status]}</span>
                            </div>
                            {attendance.arrival_time && (
                                <div className="mt-2 text-sm text-gray-600">
                                    Arrival Time: {attendance.arrival_time}
                                </div>
                            )}
                            {attendance.notes && (
                                <div className="mt-2 text-sm text-gray-600">
                                    Notes: {attendance.notes}
                                </div>
                            )}
                            <div className="mt-2 text-xs text-gray-500">
                                Marked by: {attendance.marked_by.name} on {new Date(attendance.created_at).toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Edit Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <Calendar className="w-5 h-5 mr-2" />
                                    Update Attendance
                                </h3>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Status Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Attendance Status *
                                    </label>
                                    <div className="space-y-3">
                                        {Object.entries(statusOptions).map(([status, label]) => (
                                            <label key={status} className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    value={status}
                                                    checked={formData.status === status}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                                />
                                                <span className="ml-3 text-sm text-gray-700 flex items-center">
                                                    {getStatusIcon(status)}
                                                    <span className="ml-2">{label}</span>
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                                </div>

                                {/* Arrival Time */}
                                {(formData.status === 'present' || formData.status === 'late') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Arrival Time
                                        </label>
                                        <input
                                            type="time"
                                            value={formData.arrival_time}
                                            onChange={(e) => setFormData(prev => ({ ...prev, arrival_time: e.target.value }))}
                                            className="block w-full max-w-xs border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                        {errors.arrival_time && <p className="mt-1 text-sm text-red-600">{errors.arrival_time}</p>}
                                    </div>
                                )}

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Notes
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                        rows={3}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="Add any additional notes about this attendance record..."
                                        maxLength={500}
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        {formData.notes.length}/500 characters
                                    </p>
                                    {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="px-6 py-4 border-t border-gray-200">
                                <div className="flex justify-end space-x-3">
                                    <Link
                                        href={route('teacher.attendance.index')}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {processing ? 'Updating...' : 'Update Attendance'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
