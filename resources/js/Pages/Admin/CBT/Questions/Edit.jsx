import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/UI/Button';
import { FormInput, FormLabel, FormTextarea, FormSelect } from '@/Components/UI';
import Card from '@/Components/UI/Card';
import { Plus, Minus, Save, ArrowLeft } from 'lucide-react';

export default function Edit({ 
    auth, 
    question, 
    subjects, 
    teachers, 
    questionTypes, 
    difficultyLevels 
}) {
    // Debug: log the question data
    console.log('Question data received:', question);
    
    // Helper function to ensure options is always a valid array
    const ensureOptionsArray = (options) => {
        if (!options) return [];
        if (Array.isArray(options)) return options;
        if (typeof options === 'object') return Object.values(options);
        return [];
    };
    
    // Convert backend options format to frontend format
    const initializeOptions = () => {
        console.log('Initializing options for question:', question);
        console.log('Question options:', question.options);
        console.log('Question correct_answer:', question.correct_answer);
        
        if (question.question_type === 'true_false') {
            return [
                { text: 'True', is_correct: question.correct_answer === 'True' },
                { text: 'False', is_correct: question.correct_answer === 'False' }
            ];
        }
        
        if (question.options && Array.isArray(question.options)) {
            // Convert from ["Option A", "Option B"] to [{text: "Option A", is_correct: true/false}]
            return ensureOptionsArray(question.options).map((text, index) => ({
                text: text,
                is_correct: question.correct_answer === text // Compare with actual text
            }));
        }
        
        if (question.options && typeof question.options === 'object') {
            // Handle case where options are stored as {A: "text", B: "text"}
            return Object.values(question.options).map((text, index) => {
                const letter = Object.keys(question.options)[index];
                return {
                    text: text,
                    is_correct: question.correct_answer === letter || question.correct_answer === text
                };
            });
        }
        
        // Default case for new questions
        return [
            { text: '', is_correct: false },
            { text: '', is_correct: false },
            { text: '', is_correct: false },
            { text: '', is_correct: false }
        ];
    };

    const { data, setData, put, processing, errors, reset } = useForm({
        subject_id: question.subject_id?.toString() || '',
        teacher_id: question.teacher_id?.toString() || '',
        question_text: question.question_text || '',
        question_type: question.question_type || 'multiple_choice',
        difficulty_level: question.difficulty_level || 'medium',
        marks: question.marks || 1,
        time_limit: question.time_limit || 60,
        explanation: question.explanation || '',
        is_active: question.is_active !== false,
        options: initializeOptions(),
        correct_answer: question.correct_answer || ''
    });

    const handleOptionChange = (index, field, value) => {
        const safeOptions = ensureOptionsArray(data.options);
        const newOptions = [...safeOptions];
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
        const safeOptions = ensureOptionsArray(data.options);
        setData('options', [...safeOptions, { text: '', is_correct: false }]);
    };

    const removeOption = (index) => {
        const safeOptions = ensureOptionsArray(data.options);
        if (safeOptions.length > 2) {
            const newOptions = safeOptions.filter((_, i) => i !== index);
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
        } else if (value === 'multiple_choice' && ensureOptionsArray(data.options).length === 0) {
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
        
        // Create a copy of the current data to modify
        let submissionData = { ...data };
        
        // Handle options and correct answer based on question type
        if (data.question_type === 'multiple_choice' || data.question_type === 'true_false') {
            const safeOptions = ensureOptionsArray(data.options);
            const hasCorrectAnswer = safeOptions.some(option => option.is_correct);
            if (!hasCorrectAnswer) {
                alert('Please select at least one correct answer.');
                return;
            }
            
            // Find correct answer - save as the actual text to match database format
            const correctOption = safeOptions.find(option => option.is_correct);
            submissionData.correct_answer = correctOption.text;
        }
        
        console.log('Submitting data:', submissionData);
        
        // Submit using the router directly with the modified data
        router.put(route('admin.cbt.questions.update', question.id), submissionData, {
            preserveScroll: true,
            onSuccess: () => {
                // Success handled by redirect
            },
            onError: (errors) => {
                console.log('Validation errors:', errors);
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center space-x-4">
                    <Button
                        variant="secondary"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Edit Question #{question.id}
                    </h2>
                </div>
            }
        >
            <Head title={`Edit Question - ${question.id}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Basic Information */}
                                <Card>
                                    <div className="p-6">
                                        <h3 className="text-lg font-medium mb-6">Basic Information</h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div>
                                                <FormLabel htmlFor="subject_id">Subject *</FormLabel>
                                                <FormSelect 
                                                    id="subject_id"
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
                                                <FormLabel htmlFor="teacher_id">Teacher *</FormLabel>
                                                <FormSelect 
                                                    id="teacher_id"
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

                                        <div className="mb-6">
                                            <FormLabel htmlFor="question_text">Question Text *</FormLabel>
                                            <FormTextarea
                                                id="question_text"
                                                placeholder="Enter your question here..."
                                                value={data.question_text}
                                                onChange={(e) => setData('question_text', e.target.value)}
                                                className="mt-1 w-full"
                                                rows={4}
                                            />
                                            {errors.question_text && (
                                                <p className="text-sm text-red-600 mt-1">{errors.question_text}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                            <div>
                                                <FormLabel htmlFor="question_type">Question Type *</FormLabel>
                                                <FormSelect 
                                                    id="question_type"
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
                                                {errors.question_type && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.question_type}</p>
                                                )}
                                            </div>

                                            <div>
                                                <FormLabel htmlFor="difficulty_level">Difficulty Level *</FormLabel>
                                                <FormSelect 
                                                    id="difficulty_level"
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
                                                <FormLabel htmlFor="marks">Marks *</FormLabel>
                                                <FormInput
                                                    id="marks"
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

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <FormLabel htmlFor="time_limit">Time Limit (seconds)</FormLabel>
                                                <FormInput
                                                    id="time_limit"
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

                                            <div className="flex items-center space-x-2 mt-8">
                                                <input
                                                    type="checkbox"
                                                    id="is_active"
                                                    checked={data.is_active}
                                                    onChange={(e) => setData('is_active', e.target.checked)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <FormLabel htmlFor="is_active">Active</FormLabel>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {/* Answer Options */}
                                {(data.question_type === 'multiple_choice' || data.question_type === 'true_false') && (
                                    <Card>
                                        <div className="p-6">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="text-lg font-medium">Answer Options</h3>
                                                {data.question_type === 'multiple_choice' && (
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={addOption}
                                                    >
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Add Option
                                                    </Button>
                                                )}
                                            </div>
                                            
                                            {/* Validation Message */}
                                            {!ensureOptionsArray(data.options).some(option => option.is_correct) && (data.question_type === 'multiple_choice' || data.question_type === 'true_false') && (
                                                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                                    <p className="text-yellow-800 text-sm">
                                                        ⚠️ Please mark at least one option as correct
                                                    </p>
                                                </div>
                                            )}
                                            
                                            <div className="space-y-4">
                                                {ensureOptionsArray(data.options).map((option, index) => (
                                                    <div key={index} className="flex items-center space-x-4 p-4 border-2 rounded-lg hover:border-gray-300 transition-colors bg-gray-50">
                                                        <div className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={option.is_correct}
                                                                onChange={(e) => 
                                                                    handleOptionChange(index, 'is_correct', e.target.checked)
                                                                }
                                                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                            />
                                                            <span className="ml-2 text-sm text-gray-600 font-medium">Correct</span>
                                                        </div>
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
                                                            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                                                                ✓ Correct Answer
                                                            </span>
                                                        )}
                                                        {data.question_type === 'multiple_choice' && ensureOptionsArray(data.options).length > 2 && (
                                                            <Button
                                                                type="button"
                                                                variant="danger"
                                                                size="sm"
                                                                onClick={() => removeOption(index)}
                                                            >
                                                                <Minus className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            {errors.options && (
                                                <p className="text-sm text-red-600 mt-2">{errors.options}</p>
                                            )}
                                            {errors.correct_answer && (
                                                <p className="text-sm text-red-600 mt-2">{errors.correct_answer}</p>
                                            )}
                                            
                                            {/* Debug information */}
                                            {data.question_type === 'multiple_choice' && (
                                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
                                                    <p><strong>Debug Info:</strong></p>
                                                    <p>Selected correct option: {ensureOptionsArray(data.options).findIndex(opt => opt.is_correct) + 1} ({String.fromCharCode(65 + ensureOptionsArray(data.options).findIndex(opt => opt.is_correct))})</p>
                                                    <p>Has correct answer: {ensureOptionsArray(data.options).some(opt => opt.is_correct) ? 'Yes' : 'No'}</p>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                )}

                                {/* Explanation */}
                                <Card>
                                    <div className="p-6">
                                        <h3 className="text-lg font-medium mb-4">Explanation (Optional)</h3>
                                        <FormTextarea
                                            placeholder="Provide an explanation for the correct answer..."
                                            value={data.explanation}
                                            onChange={(e) => setData('explanation', e.target.value)}
                                            rows={3}
                                            className="w-full"
                                        />
                                        {errors.explanation && (
                                            <p className="text-sm text-red-600 mt-1">{errors.explanation}</p>
                                        )}
                                    </div>
                                </Card>

                                {/* Submit Button */}
                                <Card>
                                    <div className="p-6">
                                        <div className="flex justify-end space-x-4">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={() => window.history.back()}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={processing}>
                                                <Save className="w-4 h-4 mr-2" />
                                                {processing ? 'Updating...' : 'Update Question'}
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
