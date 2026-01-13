import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/UI/Button';
import Card from '@/Components/UI/Card';
import { FormInput, FormLabel, FormSelect, FormTextarea } from '@/Components/UI';

export default function Edit({ 
    auth, 
    question, 
    subjects, 
    questionTypes, 
    difficultyLevels,
    classrooms 
}) {
    // Helper function to ensure options is always a valid array
    const ensureOptionsArray = (options) => {
        if (!options) return [];
        if (Array.isArray(options)) return options;
        if (typeof options === 'object') return Object.values(options);
        return [];
    };
    
    const { data, setData, put, processing, errors } = useForm({
        subject_id: question.subject_id || '',
        classroom_id: question.classroom_id || '',
        question_text: question.question_text || '',
        question_type: question.question_type || 'multiple_choice',
        difficulty_level: question.difficulty_level || 'medium',
        marks: question.marks || 1,
        explanation: question.explanation || '',
        is_active: question.is_active || true,
        options: question.options || [
            { text: '', is_correct: false },
            { text: '', is_correct: false },
            { text: '', is_correct: false },
            { text: '', is_correct: false }
        ],
        correct_answer: question.correct_answer || '',
        metadata: question.metadata || {}
    });

    const [optionsCount, setOptionsCount] = useState(data.options.length || 4);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate based on question type
        let formData = { ...data };
        
        if (data.question_type === 'multiple_choice') {
            // Ensure at least one option is marked as correct
            const hasCorrectOption = data.options.some(option => option.is_correct);
            if (!hasCorrectOption) {
                alert('Please mark at least one option as correct');
                return;
            }
            // Filter out empty options
            formData.options = data.options.filter(option => option.text.trim() !== '');
        } else if (data.question_type === 'true_false') {
            formData.options = [];
        } else if (data.question_type === 'essay' || data.question_type === 'fill_blank') {
            formData.options = [];
        }

        put(route('teacher.cbt.questions.update', question.id), {
            data: formData,
            onSuccess: () => {
                alert('Question updated successfully');
                router.get(route('teacher.cbt.questions.show', question.id));
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
            }
        });
    };

    const addOption = () => {
        if (optionsCount < 6) {
            setData('options', [...data.options, { text: '', is_correct: false }]);
            setOptionsCount(optionsCount + 1);
        }
    };

    const removeOption = (index) => {
        if (optionsCount > 2) {
            const newOptions = data.options.filter((_, i) => i !== index);
            setData('options', newOptions);
            setOptionsCount(optionsCount - 1);
        }
    };

    const updateOption = (index, field, value) => {
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

    const handleQuestionTypeChange = (type) => {
        let newOptions = data.options;
        let newCorrectAnswer = data.correct_answer;

        if (type === 'multiple_choice' && data.options.length === 0) {
            newOptions = [
                { text: '', is_correct: false },
                { text: '', is_correct: false },
                { text: '', is_correct: false },
                { text: '', is_correct: false }
            ];
            setOptionsCount(4);
        } else if (type !== 'multiple_choice') {
            newOptions = [];
            if (type === 'true_false' && !['true', 'false'].includes(data.correct_answer)) {
                newCorrectAnswer = 'true';
            }
        }
        
        setData(prev => ({
            ...prev,
            question_type: type,
            options: newOptions,
            correct_answer: newCorrectAnswer
        }));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Edit Question
                    </h2>
                    <div className="space-x-2">
                        <Button 
                            variant="outline"
                            onClick={() => router.get(route('teacher.cbt.questions.show', question.id))}
                        >
                            View Question
                        </Button>
                        <Button 
                            variant="outline"
                            onClick={() => router.get(route('teacher.cbt.questions.index'))}
                        >
                            Back to Questions
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Edit Question" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <Card className="space-y-4">
                            <h3 className="text-lg font-medium">Basic Information</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject *
                                    </FormLabel>
                                    <FormSelect
                                        value={data.subject_id}
                                        onChange={(e) => setData('subject_id', e.target.value)}
                                        className="w-full"
                                        required
                                    >
                                        <option value="">Select Subject</option>
                                        {subjects.map((subject) => (
                                            <option key={subject.id} value={subject.id}>
                                                {subject.name}
                                            </option>
                                        ))}
                                    </FormSelect>
                                    {errors.subject_id && (
                                        <p className="text-red-500 text-sm mt-1">{errors.subject_id}</p>
                                    )}
                                </div>

                                <div>
                                    <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                                        Class
                                    </FormLabel>
                                    <FormSelect
                                        value={data.classroom_id}
                                        onChange={(e) => setData('classroom_id', e.target.value)}
                                        className="w-full"
                                    >
                                        <option value="">Select Class (Optional)</option>
                                        {classrooms.map((classroom) => (
                                            <option key={classroom.id} value={classroom.id}>
                                                {classroom.name}
                                            </option>
                                        ))}
                                    </FormSelect>
                                    {errors.classroom_id && (
                                        <p className="text-red-500 text-sm mt-1">{errors.classroom_id}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                                        Question Type *
                                    </FormLabel>
                                    <FormSelect
                                        value={data.question_type}
                                        onChange={(e) => handleQuestionTypeChange(e.target.value)}
                                        className="w-full"
                                        required
                                    >
                                        {Object.entries(questionTypes).map(([key, label]) => (
                                            <option key={key} value={key}>
                                                {label}
                                            </option>
                                        ))}
                                    </FormSelect>
                                    {errors.question_type && (
                                        <p className="text-red-500 text-sm mt-1">{errors.question_type}</p>
                                    )}
                                </div>

                                <div>
                                    <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                                        Difficulty Level *
                                    </FormLabel>
                                    <FormSelect
                                        value={data.difficulty_level}
                                        onChange={(e) => setData('difficulty_level', e.target.value)}
                                        className="w-full"
                                        required
                                    >
                                        {Object.entries(difficultyLevels).map(([key, label]) => (
                                            <option key={key} value={key}>
                                                {label}
                                            </option>
                                        ))}
                                    </FormSelect>
                                    {errors.difficulty_level && (
                                        <p className="text-red-500 text-sm mt-1">{errors.difficulty_level}</p>
                                    )}
                                </div>

                                <div>
                                    <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                                        Marks *
                                    </FormLabel>
                                    <FormInput
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={data.marks}
                                        onChange={(e) => setData('marks', parseInt(e.target.value))}
                                        className="w-full"
                                        required
                                    />
                                    {errors.marks && (
                                        <p className="text-red-500 text-sm mt-1">{errors.marks}</p>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Question Content */}
                        <Card className="space-y-4">
                            <h3 className="text-lg font-medium">Question Content</h3>
                            
                            <div>
                                <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                                    Question Text *
                                </FormLabel>
                                <FormTextarea
                                    value={data.question_text}
                                    onChange={(e) => setData('question_text', e.target.value)}
                                    className="w-full"
                                    rows={4}
                                    placeholder="Enter your question here..."
                                    required
                                />
                                {errors.question_text && (
                                    <p className="text-red-500 text-sm mt-1">{errors.question_text}</p>
                                )}
                            </div>

                            {/* Multiple Choice Options */}
                            {data.question_type === 'multiple_choice' && (
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <FormLabel className="text-sm font-medium text-gray-700">
                                            Answer Options *
                                        </FormLabel>
                                        <div className="space-x-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addOption}
                                                disabled={optionsCount >= 6}
                                            >
                                                Add Option
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {ensureOptionsArray(data.options).map((option, index) => (
                                            <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                                                <input
                                                    type="radio"
                                                    name="correct_option"
                                                    checked={option.is_correct}
                                                    onChange={(e) => updateOption(index, 'is_correct', e.target.checked)}
                                                    className="h-4 w-4 text-blue-600"
                                                />
                                                <FormInput
                                                    type="text"
                                                    value={option.text}
                                                    onChange={(e) => updateOption(index, 'text', e.target.value)}
                                                    placeholder={`Option ${index + 1}`}
                                                    className="flex-1"
                                                />
                                                {optionsCount > 2 && (
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => removeOption(index)}
                                                    >
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Select the radio button next to the correct answer
                                    </p>
                                </div>
                            )}

                            {/* True/False Answer */}
                            {data.question_type === 'true_false' && (
                                <div>
                                    <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                                        Correct Answer *
                                    </FormLabel>
                                    <FormSelect
                                        value={data.correct_answer}
                                        onChange={(e) => setData('correct_answer', e.target.value)}
                                        className="w-full"
                                        required
                                    >
                                        <option value="">Select Answer</option>
                                        <option value="true">True</option>
                                        <option value="false">False</option>
                                    </FormSelect>
                                    {errors.correct_answer && (
                                        <p className="text-red-500 text-sm mt-1">{errors.correct_answer}</p>
                                    )}
                                </div>
                            )}

                            {/* Essay/Fill Blank Answer */}
                            {(data.question_type === 'essay' || data.question_type === 'fill_blank') && (
                                <div>
                                    <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                                        Model Answer {data.question_type === 'essay' ? '(Optional)' : '*'}
                                    </FormLabel>
                                    <FormTextarea
                                        value={data.correct_answer}
                                        onChange={(e) => setData('correct_answer', e.target.value)}
                                        className="w-full"
                                        rows={3}
                                        placeholder={
                                            data.question_type === 'essay' 
                                                ? 'Provide a model answer or marking scheme...'
                                                : 'Enter the correct answer...'
                                        }
                                        required={data.question_type === 'fill_blank'}
                                    />
                                    {errors.correct_answer && (
                                        <p className="text-red-500 text-sm mt-1">{errors.correct_answer}</p>
                                    )}
                                </div>
                            )}

                            {/* Explanation */}
                            <div>
                                <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                                    Explanation (Optional)
                                </FormLabel>
                                <FormTextarea
                                    value={data.explanation}
                                    onChange={(e) => setData('explanation', e.target.value)}
                                    className="w-full"
                                    rows={3}
                                    placeholder="Provide an explanation for the correct answer..."
                                />
                                {errors.explanation && (
                                    <p className="text-red-500 text-sm mt-1">{errors.explanation}</p>
                                )}
                            </div>
                        </Card>

                        {/* Additional Settings */}
                        <Card className="space-y-4">
                            <h3 className="text-lg font-medium">Settings</h3>
                            
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 text-blue-600"
                                />
                                <FormLabel htmlFor="is_active" className="text-sm font-medium text-gray-700">
                                    Active (Question can be used in exams)
                                </FormLabel>
                            </div>
                        </Card>

                        {/* Submit Buttons */}
                        <div className="flex justify-end space-x-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.get(route('teacher.cbt.questions.show', question.id))}
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={processing}
                            >
                                {processing ? 'Updating...' : 'Update Question'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
