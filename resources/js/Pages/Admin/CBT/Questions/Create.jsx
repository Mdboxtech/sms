import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/UI/Button';
import Card from '@/Components/UI/Card';
import { FormInput, FormLabel, FormSelect } from '@/Components/UI';

export default function Create({ 
    auth, 
    subjects, 
    teachers, 
    questionTypes, 
    difficultyLevels 
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        subject_id: '',
        teacher_id: '',
        question_text: '',
        question_type: 'multiple_choice',
        difficulty_level: 'medium',
        marks: 1,
        time_limit: 60,
        explanation: '',
        is_active: true,
        options: [
            { text: '', is_correct: false },
            { text: '', is_correct: false },
            { text: '', is_correct: false },
            { text: '', is_correct: false }
        ]
    });

    const handleOptionChange = (index, field, value) => {
        const newOptions = [...data.options];
        newOptions[index][field] = value;
        
        // If marking as correct and it's multiple choice, unmark others
        if (field === 'is_correct' && value && data.question_type === 'multiple_choice') {
            newOptions.forEach((option, i) => {
                if (i !== index) option.is_correct = false;
            });
        }
        
        setData('options', newOptions);
    };

    const addOption = () => {
        setData('options', [...data.options, { text: '', is_correct: false }]);
    };

    const removeOption = (index) => {
        if (data.options.length > 2) {
            const newOptions = data.options.filter((_, i) => i !== index);
            setData('options', newOptions);
        }
    };

    const handleQuestionTypeChange = (value) => {
        setData('question_type', value);
        
        // Reset options based on question type
        if (value === 'true_false') {
            setData('options', [
                { text: 'True', is_correct: false },
                { text: 'False', is_correct: false }
            ]);
        } else if (value === 'essay' || value === 'fill_blank') {
            setData('options', []);
        } else if (value === 'multiple_choice' && data.options.length === 0) {
            setData('options', [
                { text: '', is_correct: false },
                { text: '', is_correct: false },
                { text: '', is_correct: false },
                { text: '', is_correct: false }
            ]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validation
        if (data.question_type === 'multiple_choice' || data.question_type === 'true_false') {
            const hasCorrectAnswer = data.options.some(option => option.is_correct);
            if (!hasCorrectAnswer) {
                alert('Please mark at least one option as correct');
                return;
            }
        }
        
        post(route('admin.cbt.questions.store'), {
            onSuccess: () => {
                alert('Question created successfully');
            },
            onError: (errors) => {
                alert('Please check the form for errors');
            }
        });
    };

    const renderQuestionTypeHelp = () => {
        switch (data.question_type) {
            case 'multiple_choice':
                return 'Students select one correct answer from multiple options.';
            case 'true_false':
                return 'Students select either True or False.';
            case 'essay':
                return 'Students provide a written response. Manual grading required.';
            case 'fill_blank':
                return 'Students fill in missing words or phrases.';
            default:
                return '';
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center space-x-4">
                    <Button
                        variant="outline"
                        onClick={() => window.history.back()}
                    >
                        ← Back
                    </Button>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Create New Question
                    </h2>
                </div>
            }
        >
            <Head title="Create Question" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <Card className="p-6">
                            <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <FormLabel>Subject *</FormLabel>
                                        <FormSelect
                                            value={data.subject_id}
                                            onChange={(e) => setData('subject_id', e.target.value)}
                                            className="mt-1 w-full"
                                        >
                                            <option value="">Select Subject</option>
                                            {subjects.map((subject) => (
                                                <option key={subject.id} value={subject.id}>
                                                    {subject.name}
                                                </option>
                                            ))}
                                        </FormSelect>
                                        {errors.subject_id && (
                                            <p className="text-sm text-red-600 mt-1">{errors.subject_id}</p>
                                        )}
                                    </div>

                                    <div>
                                        <FormLabel>Teacher *</FormLabel>
                                        <FormSelect
                                            value={data.teacher_id}
                                            onChange={(e) => setData('teacher_id', e.target.value)}
                                            className="mt-1 w-full"
                                        >
                                            <option value="">Select Teacher</option>
                                            {teachers.map((teacher) => (
                                                <option key={teacher.id} value={teacher.user_id}>
                                                    {teacher.user?.name}
                                                </option>
                                            ))}
                                        </FormSelect>
                                        {errors.teacher_id && (
                                            <p className="text-sm text-red-600 mt-1">{errors.teacher_id}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <FormLabel>Question Text *</FormLabel>
                                    <textarea
                                        placeholder="Enter your question here..."
                                        value={data.question_text}
                                        onChange={(e) => setData('question_text', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        rows={4}
                                    />
                                    {errors.question_text && (
                                        <p className="text-sm text-red-600 mt-1">{errors.question_text}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <FormLabel>Question Type *</FormLabel>
                                        <FormSelect
                                            value={data.question_type}
                                            onChange={(e) => handleQuestionTypeChange(e.target.value)}
                                            className="mt-1 w-full"
                                        >
                                            {Object.entries(questionTypes).map(([key, label]) => (
                                                <option key={key} value={key}>
                                                    {label}
                                                </option>
                                            ))}
                                        </FormSelect>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {renderQuestionTypeHelp()}
                                        </p>
                                        {errors.question_type && (
                                            <p className="text-sm text-red-600 mt-1">{errors.question_type}</p>
                                        )}
                                    </div>

                                    <div>
                                        <FormLabel>Difficulty Level *</FormLabel>
                                        <FormSelect
                                            value={data.difficulty_level}
                                            onChange={(e) => setData('difficulty_level', e.target.value)}
                                            className="mt-1 w-full"
                                        >
                                            {Object.entries(difficultyLevels).map(([key, label]) => (
                                                <option key={key} value={key}>
                                                    {label}
                                                </option>
                                            ))}
                                        </FormSelect>
                                        {errors.difficulty_level && (
                                            <p className="text-sm text-red-600 mt-1">{errors.difficulty_level}</p>
                                        )}
                                    </div>

                                    <div>
                                        <FormLabel>Marks *</FormLabel>
                                        <FormInput
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={data.marks}
                                            onChange={(e) => setData('marks', parseInt(e.target.value))}
                                            className="mt-1 w-full"
                                        />
                                        {errors.marks && (
                                            <p className="text-sm text-red-600 mt-1">{errors.marks}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <FormLabel>Time Limit (seconds)</FormLabel>
                                        <FormInput
                                            type="number"
                                            min="30"
                                            max="3600"
                                            value={data.time_limit}
                                            onChange={(e) => setData('time_limit', parseInt(e.target.value))}
                                            className="mt-1 w-full"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Leave blank for no time limit
                                        </p>
                                        {errors.time_limit && (
                                            <p className="text-sm text-red-600 mt-1">{errors.time_limit}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-2 mt-6">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                        <FormLabel htmlFor="is_active">Active</FormLabel>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Answer Options */}
                        {(data.question_type === 'multiple_choice' || data.question_type === 'true_false') && (
                            <Card className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium">Answer Options</h3>
                                    {data.question_type === 'multiple_choice' && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addOption}
                                        >
                                            + Add Option
                                        </Button>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    {data.options.map((option, index) => (
                                        <div key={index} className="flex items-center space-x-3 p-3 border rounded">
                                            <input
                                                type="checkbox"
                                                checked={option.is_correct}
                                                onChange={(e) => 
                                                    handleOptionChange(index, 'is_correct', e.target.checked)
                                                }
                                                className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-500 focus:ring-green-500"
                                            />
                                            <FormInput
                                                placeholder={`Option ${index + 1}`}
                                                value={option.text}
                                                onChange={(e) => 
                                                    handleOptionChange(index, 'text', e.target.value)
                                                }
                                                className="flex-1"
                                                disabled={data.question_type === 'true_false'}
                                            />
                                            {option.is_correct && (
                                                <span className="inline-block px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                                                    Correct
                                                </span>
                                            )}
                                            {data.question_type === 'multiple_choice' && data.options.length > 2 && (
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => removeOption(index)}
                                                >
                                                    −
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {errors.options && (
                                    <p className="text-sm text-red-600 mt-2">{errors.options}</p>
                                )}
                            </Card>
                        )}

                        {/* Explanation */}
                        <Card className="p-6">
                            <h3 className="text-lg font-medium mb-4">Explanation (Optional)</h3>
                            <textarea
                                placeholder="Provide an explanation for the correct answer..."
                                value={data.explanation}
                                onChange={(e) => setData('explanation', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            {errors.explanation && (
                                <p className="text-sm text-red-600 mt-1">{errors.explanation}</p>
                            )}
                        </Card>

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating...' : 'Create Question'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
