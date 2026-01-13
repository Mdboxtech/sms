import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/UI/Button';
import Card from '@/Components/UI/Card';
import { FormInput, FormLabel, FormSelect, FormTextarea } from '@/Components/UI';

export default function Edit({ 
    auth, 
    exam, 
    subjects, 
    terms, 
    teachers, 
    classrooms,
    questions,
    examQuestions 
}) {
    const { data, setData, put, processing, errors } = useForm({
        title: exam.title || '',
        description: exam.description || '',
        subject_id: exam.subject_id || '',
        term_id: exam.term_id || (terms?.length > 0 ? terms[0].id : ''),
        teacher_id: exam.teacher_id || '',
        exam_type: exam.exam_type || 'exam',
        duration_minutes: exam.duration_minutes || exam.duration || 60,
        passing_marks: exam.passing_marks || 60,
        total_marks: exam.total_marks || 0,
        status: exam.status || 'draft',
        instructions: exam.instructions || '',
        start_time: exam.start_time ? exam.start_time.slice(0, 16) : '',
        end_time: exam.end_time ? exam.end_time.slice(0, 16) : '',
        questions_per_page: exam.questions_per_page || 1,
        shuffle_questions: exam.randomize_questions || false,
        shuffle_options: exam.randomize_options || false,
        show_results_after_submission: exam.show_results_immediately || false,
        allow_review: exam.allow_review || false,
        enable_proctoring: exam.enable_proctoring || false,
        attempts_allowed: exam.attempts_allowed || 1,
        auto_submit: exam.auto_submit || true,
        is_active: exam.is_active || true,
        classroom_ids: exam.classrooms?.map(c => c.id) || [],
        question_ids: (examQuestions || []).map(q => q.id) || []
    });

    const [selectedQuestions, setSelectedQuestions] = useState(examQuestions || []);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const formData = {
            ...data,
            // Map frontend field names to database column names
            randomize_questions: data.shuffle_questions,
            randomize_options: data.shuffle_options,
            show_results_immediately: data.show_results_after_submission,
            total_marks: selectedQuestions.reduce((sum, q) => sum + (q.marks || 0), 0)
        };

        // Remove the frontend-only fields
        delete formData.shuffle_questions;
        delete formData.shuffle_options;
        delete formData.show_results_after_submission;

        put(route('admin.cbt.exams.update', exam.id), {
            data: formData,
            onSuccess: () => {
                alert('Exam updated successfully');
                router.get(route('admin.cbt.exams.show', exam.id));
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
            }
        });
    };

    const addQuestion = (question) => {
        if (!selectedQuestions.find(q => q.id === question.id)) {
            const newQuestions = [...selectedQuestions, question];
            setSelectedQuestions(newQuestions);
            setData('question_ids', newQuestions.map(q => q.id));
            setData('total_marks', newQuestions.reduce((sum, q) => sum + (q.marks || 0), 0));
        }
    };

    const removeQuestion = (questionId) => {
        const newQuestions = selectedQuestions.filter(q => q.id !== questionId);
        setSelectedQuestions(newQuestions);
        setData('question_ids', newQuestions.map(q => q.id));
        setData('total_marks', newQuestions.reduce((sum, q) => sum + (q.marks || 0), 0));
    };

    const availableQuestions = (questions || []).filter(q => !selectedQuestions.find(sq => sq.id === q.id));

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Edit Exam
                    </h2>
                    <div className="space-x-2">
                        <Button 
                            variant="outline"
                            onClick={() => router.get(route('admin.cbt.exams.show', exam.id))}
                        >
                            View Exam
                        </Button>
                        <Button 
                            variant="outline"
                            onClick={() => router.get(route('admin.cbt.exams.index'))}
                        >
                            Back to Exams
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Edit Exam" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <Card className="space-y-4">
                            <h3 className="text-lg font-medium">Basic Information</h3>
                            
                            <div>
                                <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                                    Exam Title *
                                </FormLabel>
                                <FormInput
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="w-full"
                                    placeholder="Enter exam title"
                                    required
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                                )}
                            </div>

                            <div>
                                <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </FormLabel>
                                <FormTextarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="w-full"
                                    rows={3}
                                    placeholder="Enter exam description"
                                />
                                {errors.description && (
                                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                        {(subjects || []).map((subject) => (
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
                                        Term *
                                    </FormLabel>
                                    <FormSelect
                                        value={data.term_id}
                                        onChange={(e) => setData('term_id', e.target.value)}
                                        className="w-full"
                                        required
                                    >
                                        <option value="">Select Term</option>
                                        {(terms || []).map((term) => (
                                            <option key={term.id} value={term.id}>
                                                {term.name}
                                            </option>
                                        ))}
                                    </FormSelect>
                                    {errors.term_id && (
                                        <p className="text-red-500 text-sm mt-1">{errors.term_id}</p>
                                    )}
                                </div>

                                <div>
                                    <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                                        Teacher
                                    </FormLabel>
                                    <FormSelect
                                        value={data.teacher_id}
                                        onChange={(e) => setData('teacher_id', e.target.value)}
                                        className="w-full"
                                    >
                                        <option value="">Select Teacher</option>
                                        {(teachers || []).map((teacher) => (
                                            <option key={teacher.user ? teacher.user.id : teacher.id} value={teacher.user ? teacher.user.id : teacher.id}>
                                                {teacher.user ? teacher.user.name : teacher.name}
                                            </option>
                                        ))}
                                    </FormSelect>
                                    {errors.teacher_id && (
                                        <p className="text-red-500 text-sm mt-1">{errors.teacher_id}</p>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Schedule & Timing */}
                        <Card className="space-y-4">
                            <h3 className="text-lg font-medium">Schedule & Timing</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Time
                                    </FormLabel>
                                    <FormInput
                                        type="datetime-local"
                                        value={data.start_time}
                                        onChange={(e) => setData('start_time', e.target.value)}
                                        className="w-full"
                                    />
                                    {errors.start_time && (
                                        <p className="text-red-500 text-sm mt-1">{errors.start_time}</p>
                                    )}
                                </div>

                                <div>
                                    <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                                        End Time
                                    </FormLabel>
                                    <FormInput
                                        type="datetime-local"
                                        value={data.end_time}
                                        onChange={(e) => setData('end_time', e.target.value)}
                                        className="w-full"
                                    />
                                    {errors.end_time && (
                                        <p className="text-red-500 text-sm mt-1">{errors.end_time}</p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                                        Duration (minutes) *
                                    </FormLabel>
                                    <FormInput
                                        type="number"
                                        min="1"
                                        max="600"
                                        value={data.duration_minutes}
                                        onChange={(e) => setData('duration_minutes', parseInt(e.target.value))}
                                        className="w-full"
                                        required
                                    />
                                    {errors.duration_minutes && (
                                        <p className="text-red-500 text-sm mt-1">{errors.duration_minutes}</p>
                                    )}
                                </div>

                                <div>
                                    <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                                        Exam Type *
                                    </FormLabel>
                                    <select
                                        value={data.exam_type}
                                        onChange={(e) => setData('exam_type', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Exam Type</option>
                                        <option value="exam">Exam</option>
                                        <option value="test">Test</option>
                                        <option value="ca">Continuous Assessment</option>
                                    </select>
                                    {errors.exam_type && (
                                        <p className="text-red-500 text-sm mt-1">{errors.exam_type}</p>
                                    )}
                                </div>

                                <div>
                                    <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                                        Passing Marks *
                                    </FormLabel>
                                    <FormInput
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={data.passing_marks}
                                        onChange={(e) => setData('passing_marks', parseInt(e.target.value))}
                                        className="w-full"
                                        required
                                    />
                                    {errors.passing_marks && (
                                        <p className="text-red-500 text-sm mt-1">{errors.passing_marks}</p>
                                    )}
                                </div>

                                <div>
                                    <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                                        Status *
                                    </FormLabel>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Status</option>
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                        <option value="active">Active</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                    {errors.status && (
                                        <p className="text-red-500 text-sm mt-1">{errors.status}</p>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Exam Settings */}
                        <Card className="space-y-4">
                            <h3 className="text-lg font-medium">Exam Settings</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                                            Questions per Page
                                        </FormLabel>
                                        <FormInput
                                            type="number"
                                            min="1"
                                            max="50"
                                            value={data.questions_per_page}
                                            onChange={(e) => setData('questions_per_page', parseInt(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>

                                    <div>
                                        <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                                            Attempts Allowed
                                        </FormLabel>
                                        <FormInput
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={data.attempts_allowed}
                                            onChange={(e) => setData('attempts_allowed', parseInt(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            id="shuffle_questions"
                                            checked={data.shuffle_questions}
                                            onChange={(e) => setData('shuffle_questions', e.target.checked)}
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <FormLabel htmlFor="shuffle_questions" className="text-sm font-medium text-gray-700">
                                            Shuffle Questions
                                        </FormLabel>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            id="shuffle_options"
                                            checked={data.shuffle_options}
                                            onChange={(e) => setData('shuffle_options', e.target.checked)}
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <FormLabel htmlFor="shuffle_options" className="text-sm font-medium text-gray-700">
                                            Shuffle Answer Options
                                        </FormLabel>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            id="show_results_after_submission"
                                            checked={data.show_results_after_submission}
                                            onChange={(e) => setData('show_results_after_submission', e.target.checked)}
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <FormLabel htmlFor="show_results_after_submission" className="text-sm font-medium text-gray-700">
                                            Show Results After Submission
                                        </FormLabel>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            id="allow_review"
                                            checked={data.allow_review}
                                            onChange={(e) => setData('allow_review', e.target.checked)}
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <FormLabel htmlFor="allow_review" className="text-sm font-medium text-gray-700">
                                            Allow Review Before Submit
                                        </FormLabel>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            id="enable_proctoring"
                                            checked={data.enable_proctoring}
                                            onChange={(e) => setData('enable_proctoring', e.target.checked)}
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <FormLabel htmlFor="enable_proctoring" className="text-sm font-medium text-gray-700">
                                            Enable Proctoring
                                        </FormLabel>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            id="auto_submit"
                                            checked={data.auto_submit}
                                            onChange={(e) => setData('auto_submit', e.target.checked)}
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <FormLabel htmlFor="auto_submit" className="text-sm font-medium text-gray-700">
                                            Auto Submit When Time Expires
                                        </FormLabel>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <FormLabel htmlFor="is_active" className="text-sm font-medium text-gray-700">
                                            Active (Exam is available)
                                        </FormLabel>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Assigned Classes */}
                        <Card className="space-y-4">
                            <h3 className="text-lg font-medium">Assigned Classes</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {(classrooms || []).map((classroom) => (
                                    <div key={classroom.id} className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            id={`classroom_${classroom.id}`}
                                            checked={data.classroom_ids.includes(classroom.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setData('classroom_ids', [...data.classroom_ids, classroom.id]);
                                                } else {
                                                    setData('classroom_ids', data.classroom_ids.filter(id => id !== classroom.id));
                                                }
                                            }}
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <FormLabel htmlFor={`classroom_${classroom.id}`} className="text-sm font-medium text-gray-700">
                                            {classroom.name}
                                        </FormLabel>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Questions Section */}
                        <Card className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium">
                                    Questions ({selectedQuestions.length}) - Total Marks: {data.total_marks}
                                </h3>
                            </div>

                            {/* Selected Questions */}
                            {selectedQuestions.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-medium text-gray-700">Selected Questions</h4>
                                    {selectedQuestions.map((question, index) => (
                                        <div key={question.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex-1">
                                                <span className="text-sm font-medium text-gray-500">Q{index + 1}.</span>
                                                <span className="ml-2">{question.question_text.substring(0, 100)}...</span>
                                                <span className="ml-2 text-sm text-gray-500">({question.marks} marks)</span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => removeQuestion(question.id)}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Available Questions */}
                            {availableQuestions.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-medium text-gray-700">Available Questions</h4>
                                    <div className="max-h-64 overflow-y-auto space-y-2">
                                        {availableQuestions.map((question) => (
                                            <div key={question.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                                                <div className="flex-1">
                                                    <span>{question.question_text.substring(0, 100)}...</span>
                                                    <span className="ml-2 text-sm text-gray-500">({question.marks} marks)</span>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => addQuestion(question)}
                                                >
                                                    Add
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* Submit Buttons */}
                        <div className="flex justify-end space-x-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.get(route('admin.cbt.exams.show', exam.id))}
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={processing}
                            >
                                {processing ? 'Updating...' : 'Update Exam'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
