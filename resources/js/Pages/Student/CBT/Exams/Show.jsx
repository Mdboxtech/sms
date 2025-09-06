import React from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/ui/Button';
import Card from '@/Components/ui/Card';
import { 
    BookOpenIcon, 
    ClockIcon, 
    UserIcon,
    CalendarIcon,
    InformationCircleIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function Show({ auth, exam, attempt, canTake, timeRemaining, student }) {
    const formatDateTime = (dateTime) => {
        if (!dateTime) return 'Not scheduled';
        
        // The backend sends ISO string with Z (UTC), but we want to display
        // the time as if it were local time (same as admin input)
        const isoString = dateTime.replace('Z', ''); // Remove Z to treat as local
        const date = new Date(isoString);
        
        return date.toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDuration = (minutes) => {
        if (minutes < 60) return `${minutes} minutes`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const getStatusInfo = () => {
        if (attempt) {
            switch (attempt.status) {
                case 'completed':
                case 'submitted':
                    return {
                        icon: CheckCircleIcon,
                        text: 'You have completed this exam',
                        color: 'green',
                        canTake: false
                    };
                case 'in_progress':
                    return {
                        icon: ClockIcon,
                        text: 'You have an exam in progress',
                        color: 'blue',
                        canTake: true,
                        action: 'Continue'
                    };
                default:
                    return {
                        icon: InformationCircleIcon,
                        text: 'You can take this exam',
                        color: 'blue',
                        canTake: true,
                        action: 'Start'
                    };
            }
        }

        if (!canTake.canTake) {
            return {
                icon: ExclamationTriangleIcon,
                text: canTake.reason || 'You cannot take this exam at this time',
                color: 'red',
                canTake: false
            };
        }

        return {
            icon: CheckCircleIcon,
            text: 'You are eligible to take this exam',
            color: 'green',
            canTake: true,
            action: 'Start'
        };
    };

    const statusInfo = getStatusInfo();
    const StatusIcon = statusInfo.icon;

    const handleStartExam = () => {
        console.log('handleStartExam called', { attempt, exam: exam.id });
        
        if (attempt && attempt.status === 'in_progress') {
            console.log('Continuing exam, navigating to take page');
            router.visit(route('student.cbt.exam.take', exam.id));
        } else {
            console.log('Starting new exam');
            router.post(route('student.cbt.exam.start', exam.id), {}, {
                onSuccess: (page) => {
                    console.log('Exam start successful', page);
                    // Redirect will be handled by the controller
                },
                onError: (errors) => {
                    console.error('Exam start failed', errors);
                }
            });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        {exam.title}
                    </h2>
                    <Button
                        variant="secondary"
                        onClick={() => router.visit(route('student.cbt.index'))}
                    >
                        Back to Exams
                    </Button>
                </div>
            }
        >
            <Head title={`${exam.title} - Exam Details`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Status Card */}
                    <Card className="mb-6">
                        <div className="p-6">
                            <div className="flex items-center">
                                <StatusIcon className={`h-6 w-6 text-${statusInfo.color}-500 mr-3`} />
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Exam Status
                                    </h3>
                                    <p className={`text-${statusInfo.color}-600`}>
                                        {statusInfo.text}
                                    </p>
                                </div>
                            </div>
                            
                            {statusInfo.canTake && (
                                <div className="mt-4">
                                    <Button
                                        onClick={handleStartExam}
                                        className="w-full sm:w-auto"
                                    >
                                        {statusInfo.action} Exam
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Exam Details */}
                    <Card className="mb-6">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Exam Information
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <BookOpenIcon className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">Subject</div>
                                            <div className="text-sm text-gray-600">{exam.subject?.name}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">Teacher</div>
                                            <div className="text-sm text-gray-600">{exam.teacher?.name}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">Duration</div>
                                            <div className="text-sm text-gray-600">{formatDuration(exam.duration)}</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">Start Time</div>
                                            <div className="text-sm text-gray-600">{formatDateTime(exam.start_time)}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">End Time</div>
                                            <div className="text-sm text-gray-600">{formatDateTime(exam.end_time)}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <InformationCircleIcon className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">Total Marks</div>
                                            <div className="text-sm text-gray-600">{exam.total_marks} marks</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Description */}
                    {exam.description && (
                        <Card className="mb-6">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-3">
                                    Description
                                </h3>
                                <p className="text-gray-600 whitespace-pre-wrap">
                                    {exam.description}
                                </p>
                            </div>
                        </Card>
                    )}

                    {/* Instructions */}
                    {exam.instructions && (
                        <Card className="mb-6">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-3">
                                    Instructions
                                </h3>
                                <div className="prose prose-sm max-w-none text-gray-600">
                                    <p className="whitespace-pre-wrap">{exam.instructions}</p>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Attempt History */}
                    {attempt && (
                        <Card>
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-3">
                                    Your Attempt
                                </h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <div className="font-medium text-gray-900">Status</div>
                                            <div className={`capitalize ${
                                                attempt.status === 'completed' ? 'text-green-600' :
                                                attempt.status === 'in_progress' ? 'text-blue-600' :
                                                'text-gray-600'
                                            }`}>
                                                {attempt.status.replace('_', ' ')}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">Started</div>
                                            <div className="text-gray-600">
                                                {attempt.start_time ? formatDateTime(attempt.start_time) : 'Not started'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">Score</div>
                                            <div className="text-gray-600">
                                                {attempt.total_score !== null ? `${attempt.total_score}/${exam.total_marks}` : 'Not graded'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
