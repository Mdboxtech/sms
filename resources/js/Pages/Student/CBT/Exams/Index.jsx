import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/ui/Button';
import Card from '@/Components/ui/Card';
import { FormInput } from '@/Components/UI';
import { BookOpenIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';

export default function Index({ auth, exams = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('student.cbt.index'), { search }, {
            preserveState: true,
            replace: true
        });
    };

    const formatDateTime = (dateTime) => {
        if (!dateTime) return 'Not scheduled';
        
        try {
            // Laravel sends dates in ISO format: "2025-09-03T04:41:57.000000Z"
            const date = new Date(dateTime);
            
            // Check if date is valid
            if (isNaN(date.getTime())) {
                return 'Invalid date';
            }
            
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                timeZone: 'UTC'
            });
        } catch (error) {
            console.error('Date parsing error:', error);
            return 'Invalid date';
        }
    };

    const getExamStatus = (exam) => {
        // Check if student has completed this exam
        if (exam.student_attempt && exam.student_attempt.status === 'completed') {
            return { status: 'Completed', color: 'green' };
        }

        // Check if student has an in-progress attempt
        if (exam.student_attempt && exam.student_attempt.status === 'in_progress') {
            return { status: 'In Progress', color: 'yellow' };
        }

        // Check exam status first
        if (exam.status !== 'active') {
            return { status: 'Not Available', color: 'gray' };
        }

        // Check time-based availability only for active exams
        const now = new Date();
        
        // Handle start time
        let startTime = null;
        if (exam.start_time) {
            // Laravel sends ISO format: "2025-09-03T04:41:57.000000Z"
            startTime = new Date(exam.start_time);
        }
        
        // Handle end time
        let endTime = null;
        if (exam.end_time) {
            // Laravel sends ISO format: "2025-09-03T04:41:57.000000Z"
            endTime = new Date(exam.end_time);
        }

        // If no schedule is set, exam is available
        if (!startTime && !endTime) {
            return { status: 'Available', color: 'emerald' };
        }
        
        // If only start time is set
        if (startTime && !endTime) {
            if (now < startTime) return { status: 'Upcoming', color: 'blue' };
            return { status: 'Available', color: 'emerald' };
        }
        
        // If both start and end times are set
        if (startTime && endTime) {
            if (now < startTime) return { status: 'Upcoming', color: 'blue' };
            if (now > endTime) return { status: 'Expired', color: 'red' };
            return { status: 'Available', color: 'emerald' };
        }
        
        // If only end time is set (unusual case)
        if (!startTime && endTime) {
            if (now > endTime) return { status: 'Expired', color: 'red' };
            return { status: 'Available', color: 'emerald' };
        }
        
        // Default fallback
        return { status: 'Available', color: 'emerald' };
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Available Exams
                    </h2>
                </div>
            }
        >
            <Head title="Available Exams" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Search */}
                    <Card className="mb-6">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="flex-1">
                                <FormInput
                                    type="text"
                                    placeholder="Search exams..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Button type="submit">
                                Search
                            </Button>
                        </form>
                    </Card>

                    {/* Exams Grid */}
                    {(exams?.data || exams || []).length === 0 ? (
                        <Card className="text-center py-12">
                            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No exams available</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                There are no exams scheduled for your class at this time.
                            </p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(exams?.data || exams || []).map((exam) => {
                                const examStatus = getExamStatus(exam);
                                return (
                                    <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                                        <div className="p-6">
                                            {/* Status Badge */}
                                            <div className="flex justify-between items-start mb-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${examStatus.color}-100 text-${examStatus.color}-800`}>
                                                    {examStatus.status}
                                                </span>
                                                <div className="text-sm text-gray-500">
                                                    {exam.total_marks} marks
                                                </div>
                                            </div>

                                            {/* Exam Title */}
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                {exam.title}
                                            </h3>

                                            {/* Exam Details */}
                                            <div className="space-y-2 mb-4">
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
                                                    {exam.duration_minutes || exam.duration} minutes
                                                </div>
                                            </div>

                                            {/* Description */}
                                            {exam.description && (
                                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                                    {exam.description}
                                                </p>
                                            )}

                                            {/* Schedule */}
                                            <div className="border-t pt-4 mb-4">
                                                <div className="text-xs text-gray-500 space-y-1">
                                                    <div>Start: {formatDateTime(exam.start_time)}</div>
                                                    <div>End: {formatDateTime(exam.end_time)}</div>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <div className="flex justify-end">
                                                {examStatus.status === 'Available' ? (
                                                    <Button
                                                        onClick={() => router.visit(route('student.cbt.exam.show', exam.id))}
                                                        className="w-full"
                                                    >
                                                        Take Exam
                                                    </Button>
                                                ) : examStatus.status === 'In Progress' ? (
                                                    <Button
                                                        onClick={() => router.visit(route('student.cbt.exam.show', exam.id))}
                                                        className="w-full"
                                                    >
                                                        Continue Exam
                                                    </Button>
                                                ) : examStatus.status === 'Completed' ? (
                                                    <Button
                                                        variant="secondary"
                                                        onClick={() => router.visit(route('student.cbt.exam.results', exam.id))}
                                                        className="w-full"
                                                    >
                                                        View Results
                                                    </Button>
                                                ) : examStatus.status === 'Upcoming' ? (
                                                    <Button
                                                        variant="secondary"
                                                        disabled
                                                        className="w-full"
                                                    >
                                                        Starts Soon
                                                    </Button>
                                                ) : examStatus.status === 'Expired' ? (
                                                    <Button
                                                        variant="secondary"
                                                        disabled
                                                        className="w-full"
                                                    >
                                                        Expired
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="secondary"
                                                        onClick={() => router.visit(route('student.cbt.exam.show', exam.id))}
                                                        className="w-full"
                                                    >
                                                        View Details
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
