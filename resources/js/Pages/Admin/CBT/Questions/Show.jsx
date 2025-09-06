import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/ui/Button';
import Card from '@/Components/ui/Card';
import { ArrowLeft, Edit, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function Show({ 
    auth, 
    question, 
    questionTypes, 
    difficultyLevels 
}) {
    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'hard': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'multiple_choice': return 'bg-blue-100 text-blue-800';
            case 'true_false': return 'bg-purple-100 text-purple-800';
            case 'essay': return 'bg-orange-100 text-orange-800';
            case 'fill_blank': return 'bg-teal-100 text-teal-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const renderAnswerOptions = () => {
        if (!question.options || question.options.length === 0) {
            return null;
        }

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

        const normalizedOptions = normalizeOptions(question.options);

        return (
            <Card>
                <h3 className="text-lg font-medium mb-4">Answer Options</h3>
                <div className="space-y-3">
                    {normalizedOptions.map((option, index) => (
                        <div key={index} className={`p-3 rounded border ${
                            option.is_correct 
                                ? 'border-green-300 bg-green-50' 
                                : 'border-gray-200 bg-gray-50'
                        }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                                        {String.fromCharCode(65 + index)}
                                    </span>
                                    <span className="text-gray-900">{option.text}</span>
                                </div>
                                {option.is_correct && (
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                            Correct Answer
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="secondary"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            Question Details
                        </h2>
                    </div>
                    <Link href={route('admin.cbt.questions.edit', question.id)}>
                        <Button>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Question
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title={`Question - ${question.id}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Question Information */}
                    <Card>
                        <h3 className="text-lg font-medium mb-4">Question Information</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Question ID</label>
                                    <p className="text-gray-900">#{question.id}</p>
                                </div>
                                
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                    <p className="text-gray-900">{question.subject?.name}</p>
                                </div>
                                
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                                    <p className="text-gray-900">{question.teacher?.name}</p>
                                </div>
                            </div>
                            
                            <div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(question.question_type)}`}>
                                        {questionTypes[question.question_type]}
                                    </span>
                                </div>
                                
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty_level)}`}>
                                        {difficultyLevels[question.difficulty_level]}
                                    </span>
                                </div>
                                
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
                                    <p className="text-gray-900">{question.marks} mark{question.marks !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
                            <div className="p-4 bg-gray-50 rounded-md">
                                <p className="text-gray-900 whitespace-pre-wrap">{question.question_text}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit</label>
                                <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <p className="text-gray-900">
                                        {question.time_limit ? `${question.time_limit} seconds` : 'No limit'}
                                    </p>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <div className="flex items-center space-x-2">
                                    {question.is_active ? (
                                        <>
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span className="text-green-600">Active</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-4 h-4 text-red-500" />
                                            <span className="text-red-600">Inactive</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                                <p className="text-gray-900">
                                    {new Date(question.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <div className="border-t border-gray-200 my-6"></div>

                    {/* Answer Options */}
                    {renderAnswerOptions()}

                    <div className="border-t border-gray-200 my-6"></div>

                    {/* Explanation */}
                    {question.explanation && (
                        <Card>
                            <h3 className="text-lg font-medium mb-4">Explanation</h3>
                            <div className="p-4 bg-blue-50 rounded-md">
                                <p className="text-gray-900 whitespace-pre-wrap">{question.explanation}</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
