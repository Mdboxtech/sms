import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/ui/Button';
import Card from '@/Components/ui/Card';
import { FormInput, FormLabel, FormSelect } from '@/Components/UI';

export default function Create({ 
    auth, 
    subjects, 
    teachers,
    terms,
    classrooms
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        subject_id: '',
        teacher_id: '',
        term_id: '',
        exam_type: 'test',
        total_marks: 0,
        passing_marks: 0,
        duration_minutes: 60,
        start_time: '',
        end_time: '',
        instructions: '',
        is_active: true,
        is_published: false,
        randomize_questions: false,
        randomize_options: false,
        show_results_immediately: false,
        allow_review: true,
        classroom_ids: [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        post(route('admin.cbt.exams.store'), {
            onSuccess: () => {
                alert('Exam created successfully');
            },
            onError: (errors) => {
                alert('Please check the form for errors');
            }
        });
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
                        Create New Exam
                    </h2>
                </div>
            }
        >
            <Head title="Create Exam" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <Card className="p-6">
                            <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <FormLabel>Exam Title *</FormLabel>
                                    <FormInput
                                        type="text"
                                        placeholder="Enter exam title..."
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="mt-1 w-full"
                                    />
                                    {errors.title && (
                                        <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                                    )}
                                </div>

                                <div>
                                    <FormLabel>Description</FormLabel>
                                    <textarea
                                        placeholder="Enter exam description..."
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        rows={3}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                        <FormLabel>Term *</FormLabel>
                                        <FormSelect
                                            value={data.term_id}
                                            onChange={(e) => setData('term_id', e.target.value)}
                                            className="mt-1 w-full"
                                        >
                                            <option value="">Select Term</option>
                                            {terms?.map((term) => (
                                                <option key={term.id} value={term.id}>
                                                    {term.name}
                                                </option>
                                            ))}
                                        </FormSelect>
                                        {errors.term_id && (
                                            <p className="text-sm text-red-600 mt-1">{errors.term_id}</p>
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <FormLabel>Exam Type *</FormLabel>
                                        <FormSelect
                                            value={data.exam_type}
                                            onChange={(e) => setData('exam_type', e.target.value)}
                                            className="mt-1 w-full"
                                        >
                                            <option value="test">Test</option>
                                            <option value="exam">Exam</option>
                                            <option value="quiz">Quiz</option>
                                            <option value="assignment">Assignment</option>
                                        </FormSelect>
                                        {errors.exam_type && (
                                            <p className="text-sm text-red-600 mt-1">{errors.exam_type}</p>
                                        )}
                                    </div>

                                    <div>
                                        <FormLabel>Duration (minutes) *</FormLabel>
                                        <FormInput
                                            type="number"
                                            min="1"
                                            max="480"
                                            value={data.duration_minutes}
                                            onChange={(e) => setData('duration_minutes', parseInt(e.target.value))}
                                            className="mt-1 w-full"
                                        />
                                        {errors.duration_minutes && (
                                            <p className="text-sm text-red-600 mt-1">{errors.duration_minutes}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <FormLabel>Start Time</FormLabel>
                                        <FormInput
                                            type="datetime-local"
                                            value={data.start_time}
                                            onChange={(e) => setData('start_time', e.target.value)}
                                            className="mt-1 w-full"
                                        />
                                        {errors.start_time && (
                                            <p className="text-sm text-red-600 mt-1">{errors.start_time}</p>
                                        )}
                                    </div>

                                    <div>
                                        <FormLabel>End Time</FormLabel>
                                        <FormInput
                                            type="datetime-local"
                                            value={data.end_time}
                                            onChange={(e) => setData('end_time', e.target.value)}
                                            className="mt-1 w-full"
                                        />
                                        {errors.end_time && (
                                            <p className="text-sm text-red-600 mt-1">{errors.end_time}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <FormLabel>Total Marks</FormLabel>
                                        <FormInput
                                            type="number"
                                            min="0"
                                            value={data.total_marks}
                                            onChange={(e) => setData('total_marks', parseInt(e.target.value))}
                                            className="mt-1 w-full"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Will be calculated from questions
                                        </p>
                                        {errors.total_marks && (
                                            <p className="text-sm text-red-600 mt-1">{errors.total_marks}</p>
                                        )}
                                    </div>

                                    <div>
                                        <FormLabel>Passing Marks *</FormLabel>
                                        <FormInput
                                            type="number"
                                            min="0"
                                            value={data.passing_marks}
                                            onChange={(e) => setData('passing_marks', parseInt(e.target.value))}
                                            className="mt-1 w-full"
                                        />
                                        {errors.passing_marks && (
                                            <p className="text-sm text-red-600 mt-1">{errors.passing_marks}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Classroom Assignment */}
                        <Card className="p-6">
                            <h3 className="text-lg font-medium mb-4">Classroom Assignment</h3>
                            <div className="space-y-4">
                                <div>
                                    <FormLabel>Select Classrooms *</FormLabel>
                                    <p className="text-sm text-gray-600 mb-3">Choose which classrooms can take this exam</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
                                        {classrooms?.map((classroom) => (
                                            <div key={classroom.id} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id={`classroom-${classroom.id}`}
                                                    checked={data.classroom_ids.includes(classroom.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setData('classroom_ids', [...data.classroom_ids, classroom.id]);
                                                        } else {
                                                            setData('classroom_ids', data.classroom_ids.filter(id => id !== classroom.id));
                                                        }
                                                    }}
                                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                />
                                                <FormLabel htmlFor={`classroom-${classroom.id}`} className="text-sm">
                                                    {classroom.name}
                                                </FormLabel>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.classroom_ids && (
                                        <p className="text-sm text-red-600 mt-1">{errors.classroom_ids}</p>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Exam Settings */}
                        <Card className="p-6">
                            <h3 className="text-lg font-medium mb-4">Exam Settings</h3>
                            <div className="space-y-4">
                                <div>
                                    <FormLabel>Instructions</FormLabel>
                                    <textarea
                                        placeholder="Enter exam instructions for students..."
                                        value={data.instructions}
                                        onChange={(e) => setData('instructions', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        rows={4}
                                    />
                                    {errors.instructions && (
                                        <p className="text-sm text-red-600 mt-1">{errors.instructions}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="is_active"
                                                checked={data.is_active}
                                                onChange={(e) => setData('is_active', e.target.checked)}
                                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                            <FormLabel htmlFor="is_active">Active</FormLabel>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="is_published"
                                                checked={data.is_published}
                                                onChange={(e) => setData('is_published', e.target.checked)}
                                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                            <FormLabel htmlFor="is_published">Published</FormLabel>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="allow_review"
                                                checked={data.allow_review}
                                                onChange={(e) => setData('allow_review', e.target.checked)}
                                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                            <FormLabel htmlFor="allow_review">Allow Review After Completion</FormLabel>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="show_results_immediately"
                                                checked={data.show_results_immediately}
                                                onChange={(e) => setData('show_results_immediately', e.target.checked)}
                                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                            <FormLabel htmlFor="show_results_immediately">Show Results Immediately</FormLabel>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="randomize_questions"
                                                checked={data.randomize_questions}
                                                onChange={(e) => setData('randomize_questions', e.target.checked)}
                                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                            <FormLabel htmlFor="randomize_questions">Randomize Question Order</FormLabel>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="randomize_options"
                                                checked={data.randomize_options}
                                                onChange={(e) => setData('randomize_options', e.target.checked)}
                                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                            <FormLabel htmlFor="randomize_options">Randomize Answer Options</FormLabel>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                                {processing ? 'Creating...' : 'Create Exam'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
