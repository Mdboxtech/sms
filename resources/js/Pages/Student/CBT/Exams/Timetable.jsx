import React from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/ui/Button';
import Card from '@/Components/ui/Card';
import { CalendarIcon, ClockIcon, BookOpenIcon, UserIcon } from '@heroicons/react/24/outline';

export default function Timetable({ auth, examSchedules = [], student }) {
    const formatDate = (dateTime) => {
        if (!dateTime) return '';
        
        try {
            // Handle different data types
            let dateObj;
            if (typeof dateTime === 'string') {
                const utcDateTime = dateTime.endsWith('Z') ? dateTime : dateTime + 'Z';
                dateObj = new Date(utcDateTime);
            } else if (dateTime instanceof Date) {
                dateObj = dateTime;
            } else {
                dateObj = new Date(dateTime);
            }
            
            // Check if date is valid
            if (isNaN(dateObj.getTime())) {
                return '';
            }
            
            return dateObj.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'UTC'
            });
        } catch (error) {
            console.error('Error formatting date:', error, dateTime);
            return '';
        }
    };

    const formatTime = (dateTime) => {
        if (!dateTime) return '';
        
        try {
            // Handle different data types
            let dateObj;
            if (typeof dateTime === 'string') {
                const utcDateTime = dateTime.endsWith('Z') ? dateTime : dateTime + 'Z';
                dateObj = new Date(utcDateTime);
            } else if (dateTime instanceof Date) {
                dateObj = dateTime;
            } else {
                dateObj = new Date(dateTime);
            }
            
            // Check if date is valid
            if (isNaN(dateObj.getTime())) {
                return '';
            }
            
            return dateObj.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'UTC'
            });
        } catch (error) {
            console.error('Error formatting time:', error, dateTime);
            return '';
        }
    };

    const getExamStatus = (exam) => {
        const now = new Date();
        
        let startTime = null;
        let endTime = null;
        
        try {
            // Handle start_time
            if (exam.start_time) {
                if (typeof exam.start_time === 'string') {
                    const utcDateTime = exam.start_time.endsWith('Z') ? exam.start_time : exam.start_time + 'Z';
                    startTime = new Date(utcDateTime);
                } else {
                    startTime = new Date(exam.start_time);
                }
                
                // Check if date is valid
                if (isNaN(startTime.getTime())) {
                    startTime = null;
                }
            }
            
            // Handle end_time
            if (exam.end_time) {
                if (typeof exam.end_time === 'string') {
                    const utcDateTime = exam.end_time.endsWith('Z') ? exam.end_time : exam.end_time + 'Z';
                    endTime = new Date(utcDateTime);
                } else {
                    endTime = new Date(exam.end_time);
                }
                
                // Check if date is valid
                if (isNaN(endTime.getTime())) {
                    endTime = null;
                }
            }
        } catch (error) {
            console.error('Error parsing exam times:', error, exam);
            return { status: 'Not Scheduled', color: 'gray' };
        }

        if (!startTime) return { status: 'Not Scheduled', color: 'gray' };
        if (now < startTime) return { status: 'Upcoming', color: 'blue' };
        if (endTime && now > endTime) return { status: 'Completed', color: 'green' };
        return { status: 'Available', color: 'emerald' };
    };

    const groupExamsByDate = (exams) => {
        const grouped = {};
        exams.forEach(exam => {
            if (exam.start_time) {
                try {
                    let dateObj;
                    if (typeof exam.start_time === 'string') {
                        const utcDateTime = exam.start_time.endsWith('Z') ? exam.start_time : exam.start_time + 'Z';
                        dateObj = new Date(utcDateTime);
                    } else {
                        dateObj = new Date(exam.start_time);
                    }
                    
                    // Check if date is valid
                    if (!isNaN(dateObj.getTime())) {
                        const date = dateObj.toDateString();
                        if (!grouped[date]) {
                            grouped[date] = [];
                        }
                        grouped[date].push(exam);
                    }
                } catch (error) {
                    console.error('Error parsing exam date:', error, exam);
                }
            }
        });

        // Sort exams within each date by time
        Object.keys(grouped).forEach(date => {
            grouped[date].sort((a, b) => {
                try {
                    return new Date(a.start_time) - new Date(b.start_time);
                } catch (error) {
                    console.error('Error sorting exams:', error);
                    return 0;
                }
            });
        });

        return grouped;
    };

    const groupedExams = groupExamsByDate(examSchedules);
    const sortedDates = Object.keys(groupedExams).sort((a, b) => new Date(a) - new Date(b));

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Exam Timetable
                    </h2>
                    <Button
                        variant="secondary"
                        onClick={() => router.visit(route('student.cbt.index'))}
                    >
                        View All Exams
                    </Button>
                </div>
            }
        >
            <Head title="Exam Timetable" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Student Info */}
                    {student && (
                        <Card className="mb-6">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Exam Schedule for {student.user?.name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Class: {student.classroom?.name}
                                </p>
                            </div>
                        </Card>
                    )}

                    {/* Timetable */}
                    {sortedDates.length === 0 ? (
                        <Card className="text-center py-12">
                            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No scheduled exams</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                There are no scheduled exams for your class at this time.
                            </p>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {sortedDates.map(date => (
                                <Card key={date} className="overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-4 border-b">
                                        <div className="flex items-center">
                                            <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {formatDate(new Date(date))}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="divide-y divide-gray-200">
                                        {groupedExams[date].map(exam => {
                                            const examStatus = getExamStatus(exam);
                                            return (
                                                <div key={exam.id} className="p-6">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h4 className="text-lg font-medium text-gray-900">
                                                                    {exam.title}
                                                                </h4>
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${examStatus.color}-100 text-${examStatus.color}-800`}>
                                                                    {examStatus.status}
                                                                </span>
                                                            </div>
                                                            
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                                                <div className="flex items-center text-sm text-gray-600">
                                                                    <BookOpenIcon className="h-4 w-4 mr-2" />
                                                                    {exam.subject?.name}
                                                                </div>
                                                                <div className="flex items-center text-sm text-gray-600">
                                                                    <UserIcon className="h-4 w-4 mr-2" />
                                                                    {exam.teacher?.name}
                                                                </div>
                                                                <div className="flex items-center text-sm text-gray-600">
                                                                    <ClockIcon className="h-4 w-4 mr-2" />
                                                                    {formatTime(exam.start_time)} - {formatTime(exam.end_time)}
                                                                </div>
                                                                <div className="flex items-center text-sm text-gray-600">
                                                                    <span className="font-medium mr-2">Duration:</span>
                                                                    {exam.duration} mins
                                                                </div>
                                                            </div>

                                                            {exam.description && (
                                                                <p className="text-sm text-gray-600 mb-4">
                                                                    {exam.description}
                                                                </p>
                                                            )}

                                                            <div className="flex items-center justify-between">
                                                                <div className="text-sm text-gray-500">
                                                                    <span className="font-medium">Total Marks:</span> {exam.total_marks}
                                                                </div>
                                                                
                                                                <div className="flex space-x-2">
                                                                    {examStatus.status === 'Available' ? (
                                                                        <Button
                                                                            onClick={() => router.visit(route('student.cbt.exam.show', exam.id))}
                                                                        >
                                                                            Take Exam
                                                                        </Button>
                                                                    ) : examStatus.status === 'Completed' ? (
                                                                        <Button
                                                                            variant="secondary"
                                                                            onClick={() => router.visit(route('student.cbt.exam.results.by-exam', exam.id))}
                                                                        >
                                                                            View Results
                                                                        </Button>
                                                                    ) : (
                                                                        <Button
                                                                            variant="secondary"
                                                                            onClick={() => router.visit(route('student.cbt.exam.show', exam.id))}
                                                                        >
                                                                            View Details
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
