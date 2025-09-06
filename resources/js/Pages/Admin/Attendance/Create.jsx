import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Save, Users, Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function AttendanceCreate({ 
    auth, 
    classrooms, 
    students, 
    existingAttendance,
    selectedDate,
    selectedClassroom,
    currentSession,
    currentTerm,
    statusOptions 
}) {
    const [formData, setFormData] = useState({
        date: selectedDate || new Date().toISOString().split('T')[0],
        classroom_id: selectedClassroom || '',
        academic_session_id: currentSession?.id || '',
        term_id: currentTerm?.id || '',
        attendances: []
    });
    
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Initialize attendance data when students change
    useEffect(() => {
        if (students.length > 0) {
            const attendanceData = students.map(student => ({
                student_id: student.id,
                status: existingAttendance[student.id]?.status || 'present',
                arrival_time: existingAttendance[student.id]?.arrival_time || '',
                notes: existingAttendance[student.id]?.notes || ''
            }));
            
            setFormData(prev => ({
                ...prev,
                attendances: attendanceData
            }));
        }
    }, [students, existingAttendance]);

    const handleClassroomChange = (classroomId) => {
        setIsLoading(true);
        router.get(route('admin.attendance.create'), {
            date: formData.date,
            classroom_id: classroomId
        }, {
            preserveState: true,
            onFinish: () => setIsLoading(false)
        });
    };

    const handleDateChange = (date) => {
        setIsLoading(true);
        router.get(route('admin.attendance.create'), {
            date: date,
            classroom_id: formData.classroom_id
        }, {
            preserveState: true,
            onFinish: () => setIsLoading(false)
        });
    };

    const updateStudentAttendance = (studentIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            attendances: prev.attendances.map((attendance, index) => 
                index === studentIndex 
                    ? { ...attendance, [field]: value }
                    : attendance
            )
        }));
    };

    const markAllPresent = () => {
        setFormData(prev => ({
            ...prev,
            attendances: prev.attendances.map(attendance => ({
                ...attendance,
                status: 'present',
                arrival_time: '08:00'
            }))
        }));
    };

    const markAllAbsent = () => {
        setFormData(prev => ({
            ...prev,
            attendances: prev.attendances.map(attendance => ({
                ...attendance,
                status: 'absent',
                arrival_time: ''
            }))
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router.post(route('admin.attendance.store'), formData, {
            onSuccess: () => {
                // Redirect to index page
                router.visit(route('admin.attendance.index'));
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

    // Calculate summary stats
    const presentCount = formData.attendances.filter(a => a.status === 'present').length;
    const absentCount = formData.attendances.filter(a => a.status === 'absent').length;
    const lateCount = formData.attendances.filter(a => a.status === 'late').length;
    const excusedCount = formData.attendances.filter(a => a.status === 'excused').length;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Mark Attendance" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
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
                                        Mark Attendance
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {formData.date ? new Date(formData.date).toLocaleDateString() : 'Select date and classroom'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Date and Classroom Selection */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Date *
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => handleDateChange(e.target.value)}
                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            required
                                        />
                                        {errors.date && (
                                            <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Classroom *
                                        </label>
                                        <select
                                            value={formData.classroom_id}
                                            onChange={(e) => handleClassroomChange(e.target.value)}
                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            required
                                        >
                                            <option value="">Select Classroom</option>
                                            {classrooms.map(classroom => (
                                                <option key={classroom.id} value={classroom.id}>
                                                    {classroom.name} {classroom.section} ({classroom.students?.length || 0} students)
                                                </option>
                                            ))}
                                        </select>
                                        {errors.classroom_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.classroom_id}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Attendance Summary & Quick Actions */}
                        {students.length > 0 && (
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Attendance Summary ({students.length} students)
                                        </h3>
                                        <div className="flex space-x-2">
                                            <button
                                                type="button"
                                                onClick={markAllPresent}
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                Mark All Present
                                            </button>
                                            <button
                                                type="button"
                                                onClick={markAllAbsent}
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                            >
                                                <XCircle className="w-4 h-4 mr-1" />
                                                Mark All Absent
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
                                            <div className="text-sm text-gray-500">Present</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-red-600">{absentCount}</div>
                                            <div className="text-sm text-gray-500">Absent</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-yellow-600">{lateCount}</div>
                                            <div className="text-sm text-gray-500">Late</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">{excusedCount}</div>
                                            <div className="text-sm text-gray-500">Excused</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Student Attendance List */}
                        {students.length > 0 && (
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                        <Users className="w-5 h-5 mr-2" />
                                        Student Attendance
                                    </h3>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    {students.map((student, index) => (
                                        <div key={student.id} className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 mr-4">
                                                        {getStatusIcon(formData.attendances[index]?.status)}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-900">
                                                            {student.user.name}
                                                        </h4>
                                                        <p className="text-sm text-gray-500">
                                                            {student.admission_number}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Status
                                                        </label>
                                                        <select
                                                            value={formData.attendances[index]?.status || 'present'}
                                                            onChange={(e) => updateStudentAttendance(index, 'status', e.target.value)}
                                                            className="block w-24 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                                        >
                                                            {Object.entries(statusOptions).map(([value, label]) => (
                                                                <option key={value} value={value}>{label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Arrival Time
                                                        </label>
                                                        <input
                                                            type="time"
                                                            value={formData.attendances[index]?.arrival_time || ''}
                                                            onChange={(e) => updateStudentAttendance(index, 'arrival_time', e.target.value)}
                                                            className="block w-24 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Notes
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.attendances[index]?.notes || ''}
                                                            onChange={(e) => updateStudentAttendance(index, 'notes', e.target.value)}
                                                            placeholder="Optional notes..."
                                                            className="block w-32 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {isLoading && (
                            <div className="bg-white shadow rounded-lg p-6">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                                    <p className="text-sm text-gray-500">Loading students...</p>
                                </div>
                            </div>
                        )}

                        {/* No Students Message */}
                        {!isLoading && students.length === 0 && formData.classroom_id && (
                            <div className="bg-white shadow rounded-lg p-6">
                                <div className="text-center">
                                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        This classroom doesn't have any students enrolled.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        {students.length > 0 && (
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing || !formData.classroom_id}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Attendance
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
