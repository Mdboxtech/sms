import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/badge';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function Results({ attempt, exam, student }) {
    const { auth } = usePage().props;
    
    const getScoreColor = (percentage) => {
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getGrade = (percentage) => {
        if (percentage >= 90) return 'A';
        if (percentage >= 80) return 'B';
        if (percentage >= 70) return 'C';
        if (percentage >= 60) return 'D';
        return 'F';
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

    const correctAnswers = attempt.answers?.filter(answer => answer.is_correct).length || 0;
    const totalQuestions = attempt.answers?.length || 0;
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Exam Results
                    </h2>
                </div>
            }
        >
            <Head title="Exam Results" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="space-y-6">
                        {/* Exam Info */}
                        <Card className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {exam?.title || 'Exam Title Not Available'}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Subject: {exam?.subject?.name || 'N/A'} | 
                                        Term: {exam?.term?.name || 'N/A'}
                                    </p>
                                </div>
                                <Badge 
                                    variant={attempt.status === 'completed' ? 'default' : 'secondary'}
                                    className="ml-2"
                                >
                                    {attempt.status}
                                </Badge>
                            </div>

                            {exam?.description && (
                                <p className="text-gray-700 mb-4">{exam.description}</p>
                            )}
                        </Card>

                        {/* Score Summary */}
                        <Card className="p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Score Summary</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className={`text-3xl font-bold ${getScoreColor(percentage)}`}>
                                        {percentage}%
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">Overall Score</div>
                                </div>
                                
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="text-3xl font-bold text-blue-600">
                                        {getGrade(percentage)}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">Grade</div>
                                </div>
                                
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="text-3xl font-bold text-green-600">
                                        {correctAnswers}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">Correct Answers</div>
                                </div>
                                
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="text-3xl font-bold text-gray-600">
                                        {totalQuestions}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">Total Questions</div>
                                </div>
                            </div>
                        </Card>

                        {/* Attempt Details */}
                        <Card className="p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Attempt Details</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                    <Clock className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">Duration</div>
                                        <div className="text-sm text-gray-600">
                                            {attempt.time_taken ? formatDuration(attempt.time_taken) : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                    <CheckCircle className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">Completed At</div>
                                        <div className="text-sm text-gray-600">
                                            {attempt.end_time 
                                                ? new Date(attempt.end_time).toLocaleString()
                                                : 'N/A'
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Question Results */}
                        {attempt.answers && attempt.answers.length > 0 && (
                            <Card className="p-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Question Results</h4>
                                
                                <div className="space-y-4">
                                    {attempt.answers.map((answer, index) => (
                                        <div 
                                            key={answer.id} 
                                            className="p-4 border rounded-lg bg-gray-50"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <span className="text-sm font-medium text-gray-900">
                                                            Question {index + 1}
                                                        </span>
                                                        {answer.is_correct ? (
                                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                                        ) : (
                                                            <XCircle className="h-4 w-4 text-red-500" />
                                                        )}
                                                    </div>
                                                    
                                                    <p className="text-sm text-gray-700 mb-2">
                                                        {answer.question?.question_text || 'Question text not available'}
                                                    </p>
                                                    
                                                    <div className="text-sm">
                                                        <span className="font-medium">Your Answer: </span>
                                                        <span className={answer.is_correct ? 'text-green-600' : 'text-red-600'}>
                                                            {answer.answer_text || answer.selected_option || 'No answer'}
                                                        </span>
                                                    </div>
                                                    
                                                    {!answer.is_correct && answer.question?.correct_answer && (
                                                        <div className="text-sm mt-1">
                                                            <span className="font-medium">Correct Answer: </span>
                                                            <span className="text-green-600">
                                                                {answer.question.correct_answer}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="ml-4">
                                                    <Badge 
                                                        variant={answer.is_correct ? 'default' : 'destructive'}
                                                        className="text-xs"
                                                    >
                                                        {answer.is_correct ? 'Correct' : 'Wrong'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Actions */}
                        <div className="flex justify-between">
                            <Button 
                                variant="outline" 
                                onClick={() => window.history.back()}
                            >
                                Back to Exams
                            </Button>
                            
                            <div className="space-x-2">
                                <Button 
                                    variant="outline"
                                    onClick={() => window.print()}
                                >
                                    Print Results
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
