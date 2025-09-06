import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Save, Users, Calendar, CheckCircle, XCircle, Clock, AlertCircle, BookOpen } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function TeacherAttendanceCreate({ 
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
        classroom_id: selectedClassroom || (classrooms.length > 0 ? classrooms[0].id : ''),
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
        router.get(route('teacher.attendance.create'), {
            date: formData.date,
            classroom_id: classroomId
        }, {
            preserveState: true,
            onFinish: () => setIsLoading(false)
        });
    };

    const handleDateChange = (date) => {
        setIsLoading(true);
        router.get(route('teacher.attendance.create'), {
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

        router.post(route('teacher.attendance.store'), formData, {
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

    // Calculate summary stats
    const presentCount = formData.attendances.filter(a => a.status === 'present').length;
    const absentCount = formData.attendances.filter(a => a.status === 'absent').length;
    const lateCount = formData.attendances.filter(a => a.status === 'late').length;
    const excusedCount = formData.attendances.filter(a => a.status === 'excused').length;

    const selectedClassroomData = classrooms.find(c => c.id == formData.classroom_id);

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
                                    href={route('teacher.attendance.index')}
                                    className="mr-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    Back to Attendance
                                </Link>
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Record attendance for your class students
                        </p>
                    </div>

                    {/* Selection Form */}
                    <div className="bg-white shadow rounded-lg mb-8">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                <Calendar className="w-5 h-5 mr-2" />
                                Attendance Details
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                    {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Class *
                                    </label>
                                    <select
                                        value={formData.classroom_id}
                                        onChange={(e) => handleClassroomChange(e.target.value)}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        required
                                    >
                                        <option value="">Select a class</option>
                                        {classrooms.map(classroom => (
                                            <option key={classroom.id} value={classroom.id}>
                                                {classroom.name} {classroom.section}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.classroom_id && <p className="mt-1 text-sm text-red-600">{errors.classroom_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Session & Term
                                    </label>
                                    <div className="text-sm text-gray-900">
                                        <div>{currentSession?.name}</div>
                                        <div className="text-gray-500">{currentTerm?.name}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Students Attendance Form */}
                    {students.length > 0 && (
                        <form onSubmit={handleSubmit}>
                            {/* Summary Stats */}
                            <div className="bg-white shadow rounded-lg mb-8">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                            <BookOpen className="w-5 h-5 mr-2" />
                                            {selectedClassroomData?.name} {selectedClassroomData?.section} - Attendance Summary
                                        </h3>
                                        <div className="flex space-x-3">
                                            <button
                                                type="button"
                                                onClick={markAllPresent}
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                                Mark All Present
                                            </button>
                                            <button
                                                type="button"
                                                onClick={markAllAbsent}
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                <XCircle className="w-4 h-4 mr-2 text-red-500" />
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

                            {/* Students List */}
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                        <Users className="w-5 h-5 mr-2" />
                                        Students ({students.length})
                                    </h3>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    {students.map((student, index) => (
                                        <div key={student.id} className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {student.user.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {student.user.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {student.admission_number}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-4">
                                                    {/* Status Selection */}
                                                    <div className="flex items-center space-x-2">
                                                        {Object.entries(statusOptions).map(([status, label]) => (
                                                            <label key={status} className="flex items-center">
                                                                <input
                                                                    type="radio"
                                                                    name={`attendance_${student.id}`}
                                                                    value={status}
                                                                    checked={formData.attendances[index]?.status === status}
                                                                    onChange={(e) => updateStudentAttendance(index, 'status', e.target.value)}
                                                                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                                                />
                                                                <span className="ml-2 text-sm text-gray-700 flex items-center">
                                                                    {getStatusIcon(status)}
                                                                    <span className="ml-1">{label}</span>
                                                                </span>
                                                            </label>
                                                        ))}
                                                    </div>

                                                    {/* Arrival Time */}
                                                    {(formData.attendances[index]?.status === 'present' || formData.attendances[index]?.status === 'late') && (
                                                        <div>
                                                            <input
                                                                type="time"
                                                                value={formData.attendances[index]?.arrival_time || ''}
                                                                onChange={(e) => updateStudentAttendance(index, 'arrival_time', e.target.value)}
                                                                className="block w-24 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                                placeholder="Arrival"
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Notes */}
                                                    <div>
                                                        <input
                                                            type="text"
                                                            value={formData.attendances[index]?.notes || ''}
                                                            onChange={(e) => updateStudentAttendance(index, 'notes', e.target.value)}
                                                            className="block w-32 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                            placeholder="Notes"
                                                            maxLength={500}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Submit Button */}
                                <div className="px-6 py-4 border-t border-gray-200">
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={processing || isLoading}
                                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            {processing ? 'Saving...' : 'Save Attendance'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* No Students Message */}
                    {students.length === 0 && formData.classroom_id && (
                        <div className="bg-white shadow rounded-lg">
                            <div className="p-6 text-center">
                                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
                                <p className="text-gray-500">
                                    {formData.classroom_id 
                                        ? 'No students are enrolled in the selected class.'
                                        : 'Please select a class to view students.'
                                    }
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
