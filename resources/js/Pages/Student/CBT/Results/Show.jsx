import React from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/ui/Button';
import Card from '@/Components/ui/Card';
import { 
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    UserIcon,
    BookOpenIcon,
    CalendarIcon,
    ChartBarIcon,
    PrinterIcon
} from '@heroicons/react/24/outline';

export default function Show({ auth, attempt, result, student }) {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    };

    const getGrade = (percentage) => {
        if (percentage >= 80) return { grade: 'A', color: 'green', description: 'Excellent' };
        if (percentage >= 70) return { grade: 'B', color: 'blue', description: 'Very Good' };
        if (percentage >= 60) return { grade: 'C', color: 'yellow', description: 'Good' };
        if (percentage >= 50) return { grade: 'D', color: 'orange', description: 'Fair' };
        return { grade: 'F', color: 'red', description: 'Needs Improvement' };
    };

    const gradeInfo = getGrade(attempt.percentage || 0);
    const correctAnswers = attempt.answers?.filter(answer => answer.is_correct).length || 0;
    const totalQuestions = attempt.answers?.length || 0;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Exam Result Details
                    </h2>
                    <div className="flex space-x-3">
                        <Button
                            variant="secondary"
                            onClick={() => window.print()}
                        >
                            <PrinterIcon className="h-4 w-4 mr-2" />
                            Print Result
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => router.visit(route('student.cbt.results.index'))}
                        >
                            Back to Results
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title={`Result - ${attempt.exam?.title}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Exam Overview */}
                    <Card className="mb-6">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {attempt.exam?.title}
                                    </h3>
                                    <p className="text-gray-600">
                                        {attempt.exam?.subject?.name} • {attempt.exam?.term?.name}
                                    </p>
                                </div>
                                <div className={`text-right`}>
                                    <div className={`text-4xl font-bold text-${gradeInfo.color}-600`}>
                                        {gradeInfo.grade}
                                    </div>
                                    <div className={`text-sm text-${gradeInfo.color}-600`}>
                                        {gradeInfo.description}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-gray-900">
                                        {attempt.total_score}
                                    </div>
                                    <div className="text-sm text-gray-600">Score Obtained</div>
                                    <div className="text-xs text-gray-500">
                                        out of {attempt.exam?.total_marks}
                                    </div>
                                </div>
                                
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-gray-900">
                                        {Math.round(attempt.percentage || 0)}%
                                    </div>
                                    <div className="text-sm text-gray-600">Percentage</div>
                                </div>
                                
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-gray-900">
                                        {correctAnswers}/{totalQuestions}
                                    </div>
                                    <div className="text-sm text-gray-600">Correct Answers</div>
                                </div>
                                
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-gray-900">
                                        {formatDuration(attempt.time_taken || 0)}
                                    </div>
                                    <div className="text-sm text-gray-600">Time Taken</div>
                                    <div className="text-xs text-gray-500">
                                        of {attempt.exam?.duration} minutes
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Exam Details */}
                    <Card className="mb-6">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Exam Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <BookOpenIcon className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">Subject</div>
                                            <div className="text-sm text-gray-600">{attempt.exam?.subject?.name}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">Teacher</div>
                                            <div className="text-sm text-gray-600">{attempt.exam?.teacher?.name}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">Duration</div>
                                            <div className="text-sm text-gray-600">{attempt.exam?.duration} minutes</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">Started</div>
                                            <div className="text-sm text-gray-600">{formatDate(attempt.start_time)}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">Completed</div>
                                            <div className="text-sm text-gray-600">{formatDate(attempt.end_time)}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <ChartBarIcon className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">Status</div>
                                            <div className="text-sm text-gray-600 capitalize">
                                                {attempt.status.replace('_', ' ')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Question by Question Breakdown */}
                    {attempt.answers && attempt.answers.length > 0 && (
                        <Card>
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Question Breakdown</h3>
                                <div className="space-y-4">
                                    {attempt.answers.map((answer, index) => (
                                        <div key={answer.id} className="border rounded-lg p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center mb-2">
                                                        <span className="font-medium text-gray-900">
                                                            Question {index + 1}
                                                        </span>
                                                        <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                            answer.is_correct 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {answer.is_correct ? (
                                                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                                            ) : (
                                                                <XCircleIcon className="h-3 w-3 mr-1" />
                                                            )}
                                                            {answer.is_correct ? 'Correct' : 'Incorrect'}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="text-sm text-gray-600 mb-2">
                                                        {answer.question?.question || 'Question content not available'}
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span className="font-medium text-gray-700">Your Answer: </span>
                                                            <span className={answer.is_correct ? 'text-green-600' : 'text-red-600'}>
                                                                {answer.answer_text || 'Not answered'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-gray-700">Correct Answer: </span>
                                                            <span className="text-green-600">
                                                                {answer.question?.correct_answer}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="text-right">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {answer.marks_obtained || 0} / {answer.question?.marks || 1}
                                                    </div>
                                                    <div className="text-xs text-gray-500">marks</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
