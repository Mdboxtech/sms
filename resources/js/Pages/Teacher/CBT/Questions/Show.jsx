import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/ui/Button';
import Card from '@/Components/ui/Card';

export default function Show({ auth, question, questionTypes, difficultyLevels }) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
            router.delete(route('teacher.cbt.questions.destroy', question.id), {
                onSuccess: () => {
                    alert('Question deleted successfully');
                    router.get(route('teacher.cbt.questions.index'));
                },
                onError: (errors) => {
                    alert('Failed to delete question');
                }
            });
        }
    };

    const getBadgeClasses = (type, value) => {
        const baseClasses = 'inline-block px-3 py-1 text-sm font-semibold rounded-full';
        
        if (type === 'difficulty') {
            switch (value) {
                case 'easy': return baseClasses + ' bg-green-100 text-green-800';
                case 'medium': return baseClasses + ' bg-yellow-100 text-yellow-800';
                case 'hard': return baseClasses + ' bg-red-100 text-red-800';
                default: return baseClasses + ' bg-gray-100 text-gray-800';
            }
        }
        
        if (type === 'question_type') {
            switch (value) {
                case 'multiple_choice': return baseClasses + ' bg-blue-100 text-blue-800';
                case 'true_false': return baseClasses + ' bg-purple-100 text-purple-800';
                case 'essay': return baseClasses + ' bg-orange-100 text-orange-800';
                case 'fill_blank': return baseClasses + ' bg-teal-100 text-teal-800';
                default: return baseClasses + ' bg-gray-100 text-gray-800';
            }
        }
        
        if (type === 'status') {
            return value ? baseClasses + ' bg-green-100 text-green-800' : baseClasses + ' bg-red-100 text-red-800';
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

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Question Details
                    </h2>
                    <div className="space-x-2">
                        <Link href={route('teacher.cbt.questions.edit', question.id)}>
                            <Button variant="outline">
                                Edit Question
                            </Button>
                        </Link>
                        <Button 
                            variant="destructive"
                            onClick={handleDelete}
                        >
                            Delete Question
                        </Button>
                        <Link href={route('teacher.cbt.questions.index')}>
                            <Button variant="outline">
                                Back to Questions
                            </Button>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Question - ${question.id}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Question Overview */}
                    <Card className="space-y-4">
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-semibold">Question Overview</h3>
                            <div className="flex space-x-2">
                                <span className={getBadgeClasses('question_type', question.question_type)}>
                                    {questionTypes[question.question_type]}
                                </span>
                                <span className={getBadgeClasses('difficulty', question.difficulty_level)}>
                                    {difficultyLevels[question.difficulty_level]}
                                </span>
                                <span className={getBadgeClasses('status', question.is_active)}>
                                    {question.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-700 mb-2">Basic Information</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subject:</span>
                                        <span className="font-medium">{question.subject?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Class:</span>
                                        <span className="font-medium">{question.classroom?.name || 'General'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Marks:</span>
                                        <span className="font-medium">{question.marks}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Created:</span>
                                        <span className="font-medium">{formatDate(question.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Updated:</span>
                                        <span className="font-medium">{formatDate(question.updated_at)}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-700 mb-2">Question Statistics</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Used in Exams:</span>
                                        <span className="font-medium">{question.exams_count || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Times Answered:</span>
                                        <span className="font-medium">{question.attempts_count || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Correct Rate:</span>
                                        <span className="font-medium">
                                            {question.attempts_count > 0 
                                                ? `${Math.round((question.correct_attempts_count / question.attempts_count) * 100)}%` 
                                                : 'N/A'
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Question Content */}
                    <Card className="space-y-4">
                        <h3 className="text-lg font-semibold">Question Content</h3>
                        
                        <div>
                            <h4 className="font-medium text-gray-700 mb-2">Question Text</h4>
                            <div className="bg-gray-50 p-4 rounded-lg border">
                                <p className="text-gray-900 whitespace-pre-wrap">{question.question_text}</p>
                            </div>
                        </div>

                        {/* Multiple Choice Options */}
                        {question.question_type === 'multiple_choice' && question.options && question.options.length > 0 && (
                            <div>
                                <h4 className="font-medium text-gray-700 mb-2">Answer Options</h4>
                                <div className="space-y-2">
                                    {(() => {
                                        // Normalize options to handle different formats
                                        const normalizeOptions = (options) => {
                                            if (!options) return [];
                                            
                                            if (Array.isArray(options)) {
                                                // Check if it's an array of objects with 'text' property
                                                if (options.length > 0 && typeof options[0] === 'object' && options[0].text) {
                                                    return options;
                                                }
                                                // Simple array: ['Option A', 'Option B'] - convert to objects
                                                return options.map((text, index) => ({
                                                    text: text,
                                                    is_correct: question.correct_answer === text
                                                }));
                                            }
                                            
                                            if (typeof options === 'object') {
                                                // Associative array: {A: 'Option A', B: 'Option B'}
                                                return Object.values(options).map((text, index) => ({
                                                    text: text,
                                                    is_correct: question.correct_answer === text || question.correct_answer === Object.keys(options)[index]
                                                }));
                                            }
                                            
                                            return [];
                                        };

                                        return normalizeOptions(question.options).map((option, index) => (
                                        <div 
                                            key={index} 
                                            className={`p-3 rounded-lg border-2 ${
                                                option.is_correct 
                                                    ? 'border-green-200 bg-green-50' 
                                                    : 'border-gray-200 bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                                                    option.is_correct 
                                                        ? 'bg-green-200 text-green-800' 
                                                        : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                    {String.fromCharCode(65 + index)}
                                                </span>
                                                <span className="flex-1">{option.text}</span>
                                                {option.is_correct && (
                                                    <span className="text-green-600 font-medium text-sm">
                                                        ✓ Correct
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        ));
                                    })()}
                                </div>
                            </div>
                        )}

                        {/* True/False Answer */}
                        {question.question_type === 'true_false' && (
                            <div>
                                <h4 className="font-medium text-gray-700 mb-2">Correct Answer</h4>
                                <div className="bg-green-50 border-2 border-green-200 p-3 rounded-lg">
                                    <span className="text-green-800 font-medium">
                                        {question.correct_answer === 'true' ? 'True' : 'False'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Essay/Fill Blank Answer */}
                        {(question.question_type === 'essay' || question.question_type === 'fill_blank') && question.correct_answer && (
                            <div>
                                <h4 className="font-medium text-gray-700 mb-2">
                                    {question.question_type === 'essay' ? 'Model Answer' : 'Correct Answer'}
                                </h4>
                                <div className="bg-blue-50 border-2 border-blue-200 p-3 rounded-lg">
                                    <p className="text-blue-900 whitespace-pre-wrap">{question.correct_answer}</p>
                                </div>
                            </div>
                        )}

                        {/* Explanation */}
                        {question.explanation && (
                            <div>
                                <h4 className="font-medium text-gray-700 mb-2">Explanation</h4>
                                <div className="bg-blue-50 border-2 border-blue-200 p-3 rounded-lg">
                                    <p className="text-blue-900 whitespace-pre-wrap">{question.explanation}</p>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Question Usage */}
                    {question.exams && question.exams.length > 0 && (
                        <Card className="space-y-4">
                            <h3 className="text-lg font-semibold">Used in Exams</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Exam Title
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Subject
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Class
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Duration
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {question.exams.map((exam) => (
                                            <tr key={exam.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {exam.title}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {exam.subject?.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {exam.classroom?.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {exam.duration} minutes
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={getBadgeClasses('status', exam.is_active)}>
                                                        {exam.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
