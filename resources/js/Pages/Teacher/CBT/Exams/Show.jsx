import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/UI/Button';
import Card from '@/Components/UI/Card';
import { normalizeOptions, mapOptions } from '@/Utils/optionsUtils';

export default function Show({ auth, exam, questions, questionTypes, difficultyLevels }) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
            router.delete(route('teacher.cbt.exams.destroy', exam.id), {
                onSuccess: () => {
                    alert('Exam deleted successfully');
                    router.get(route('teacher.cbt.exams.index'));
                },
                onError: (errors) => {
                    alert('Failed to delete exam');
                }
            });
        }
    };

    const handlePublish = () => {
        const action = exam.is_published ? 'unpublish' : 'publish';
        if (confirm(`Are you sure you want to ${action} this exam?`)) {
            router.post(route(`teacher.cbt.exams.${action}`, exam.id), {}, {
                onSuccess: () => {
                    alert(`Exam ${action}ed successfully`);
                },
                onError: (errors) => {
                    alert(`Failed to ${action} exam`);
                }
            });
        }
    };

    const handleClone = () => {
        if (confirm('Are you sure you want to clone this exam?')) {
            router.post(route('teacher.cbt.exams.clone', exam.id), {}, {
                onSuccess: () => {
                    alert('Exam cloned successfully');
                },
                onError: (errors) => {
                    alert('Failed to clone exam');
                }
            });
        }
    };

    const getBadgeClasses = (type, value) => {
        const baseClasses = 'inline-block px-3 py-1 text-sm font-semibold rounded-full';
        
        if (type === 'status') {
            return value ? baseClasses + ' bg-green-100 text-green-800' : baseClasses + ' bg-red-100 text-red-800';
        }
        
        if (type === 'published') {
            return value ? baseClasses + ' bg-blue-100 text-blue-800' : baseClasses + ' bg-gray-100 text-gray-800';
        }
        
        return baseClasses + ' bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getExamStatus = () => {
        const now = new Date();
        const startTime = new Date(exam.start_time);
        const endTime = new Date(exam.end_time);
        
        if (!exam.is_active) return { text: 'Inactive', color: 'gray' };
        if (now < startTime) return { text: 'Upcoming', color: 'blue' };
        if (now > endTime) return { text: 'Completed', color: 'green' };
        return { text: 'Active', color: 'yellow' };
    };

    const status = getExamStatus();

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Exam Details
                    </h2>
                    <div className="space-x-2">
                        <Button 
                            variant={exam.is_published ? 'outline' : 'primary'}
                            onClick={handlePublish}
                        >
                            {exam.is_published ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Button 
                            variant="outline"
                            onClick={handleClone}
                        >
                            Clone Exam
                        </Button>
                        <Link href={route('teacher.cbt.exams.edit', exam.id)}>
                            <Button variant="outline">
                                Edit Exam
                            </Button>
                        </Link>
                        <Button 
                            variant="destructive"
                            onClick={handleDelete}
                        >
                            Delete Exam
                        </Button>
                        <Link href={route('teacher.cbt.exams.index')}>
                            <Button variant="outline">
                                Back to Exams
                            </Button>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Exam - ${exam.title}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Exam Overview */}
                    <Card className="space-y-4">
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-semibold">{exam.title}</h3>
                            <div className="flex space-x-2">
                                <span className={getBadgeClasses('published', exam.is_published)}>
                                    {exam.is_published ? 'Published' : 'Draft'}
                                </span>
                                <span className={getBadgeClasses('status', exam.is_active)}>
                                    {exam.is_active ? 'Active' : 'Inactive'}
                                </span>
                                <span className={`${getBadgeClasses('status', status.color === 'green')} ${
                                    status.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                                    status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                    status.color === 'gray' ? 'bg-gray-100 text-gray-800' : ''
                                }`}>
                                    {status.text}
                                </span>
                            </div>
                        </div>

                        {exam.description && (
                            <p className="text-gray-700">{exam.description}</p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-700 mb-2">Basic Information</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subject:</span>
                                        <span className="font-medium">{exam.subject?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Term:</span>
                                        <span className="font-medium">{exam.term?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Duration:</span>
                                        <span className="font-medium">{exam.duration} minutes</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Marks:</span>
                                        <span className="font-medium">{exam.total_marks}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-700 mb-2">Schedule</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Start Time:</span>
                                        <span className="font-medium">{formatDate(exam.start_time)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">End Time:</span>
                                        <span className="font-medium">{formatDate(exam.end_time)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Created:</span>
                                        <span className="font-medium">{formatDate(exam.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Updated:</span>
                                        <span className="font-medium">{formatDate(exam.updated_at)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Exam Statistics */}
                    <Card className="space-y-4">
                        <h3 className="text-lg font-semibold">Statistics</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <p className="text-2xl font-bold text-blue-600">{exam.attempts_count || 0}</p>
                                <p className="text-sm text-gray-600">Total Attempts</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">{exam.completed_attempts_count || 0}</p>
                                <p className="text-sm text-gray-600">Completed</p>
                            </div>
                            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                <p className="text-2xl font-bold text-yellow-600">
                                    {exam.attempts_count > 0 
                                        ? Math.round((exam.completed_attempts_count / exam.attempts_count) * 100) 
                                        : 0}%
                                </p>
                                <p className="text-sm text-gray-600">Completion Rate</p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <p className="text-2xl font-bold text-purple-600">
                                    {exam.average_score || 0}%
                                </p>
                                <p className="text-sm text-gray-600">Average Score</p>
                            </div>
                        </div>
                    </Card>

                    {/* Assigned Classes */}
                    {exam.classrooms && exam.classrooms.length > 0 && (
                        <Card className="space-y-4">
                            <h3 className="text-lg font-semibold">Assigned Classes</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {exam.classrooms.map((classroom) => (
                                    <div key={classroom.id} className="bg-gray-50 p-3 rounded-lg">
                                        <p className="font-medium">{classroom.name}</p>
                                        <p className="text-sm text-gray-600">{classroom.students_count || 0} students</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Questions */}
                    {questions && questions.length > 0 && (
                        <Card className="space-y-4">
                            <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
                            <div className="space-y-4">
                                {questions.map((question, index) => (
                                    <div key={question.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
                                            <div className="flex space-x-2">
                                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                                    {questionTypes[question.question_type]}
                                                </span>
                                                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                                                    {question.marks} marks
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-gray-900 mb-2">{question.question_text}</p>
                                        
                                        {question.question_type === 'multiple_choice' && question.options && (
                                            <div className="ml-4 space-y-1">
                                                {mapOptions(question.options, (option, optIndex) => {
                                                    const isCorrect = option.is_correct || question.correct_answer === option.text;
                                                    
                                                    return (
                                                        <div key={optIndex} className={`text-sm p-2 rounded ${
                                                            isCorrect ? 'bg-green-50 text-green-800' : 'bg-gray-50'
                                                        }`}>
                                                            {String.fromCharCode(65 + optIndex)}. {option.text}
                                                            {isCorrect && <span className="ml-2 text-green-600">✓</span>}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Quick Actions */}
                    <Card className="space-y-4">
                        <h3 className="text-lg font-semibold">Quick Actions</h3>
                        <div className="flex space-x-4">
                            <Link href={route('teacher.cbt.exams.analytics', exam.id)}>
                                <Button variant="outline">
                                    View Analytics
                                </Button>
                            </Link>
                            <Link href={route('teacher.cbt.exams.results', exam.id)}>
                                <Button variant="outline">
                                    View Results
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
