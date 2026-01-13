import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/UI/Button';
import Card from '@/Components/UI/Card';
import { FormInput, FormLabel, FormSelect, FormTextarea } from '@/Components/UI';

export default function Create({ 
    auth, 
    subjects, 
    terms, 
    classrooms,
    questions 
}) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        subject_id: '',
        term_id: '',
        duration: 60,
        total_marks: 0,
        start_time: '',
        end_time: '',
        questions_per_page: 1,
        shuffle_questions: false,
        shuffle_options: false,
        show_results_after_submission: false,
        allow_review: false,
        enable_proctoring: false,
        attempts_allowed: 1,
        auto_submit: true,
        is_active: true,
        classroom_ids: [],
        question_ids: []
    });

    const [selectedQuestions, setSelectedQuestions] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const formData = {
            ...data,
            total_marks: selectedQuestions.reduce((sum, q) => sum + (q.marks || 0), 0)
        };

        post(route('teacher.cbt.exams.store'), {
            data: formData,
            onSuccess: () => {
                alert('Exam created successfully');
                router.get(route('teacher.cbt.exams.index'));
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

    const availableQuestions = questions.filter(q => !selectedQuestions.find(sq => sq.id === q.id));

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Create New Exam
                    </h2>
                    <Button 
                        variant="outline"
                        onClick={() => router.get(route('teacher.cbt.exams.index'))}
                    >
                        Back to Exams
                    </Button>
                </div>
            }
        >
            <Head title="Create Exam" />

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
                                        Term *
                                    </FormLabel>
                                    <FormSelect
                                        value={data.term_id}
                                        onChange={(e) => setData('term_id', e.target.value)}
                                        className="w-full"
                                        required
                                    >
                                        <option value="">Select Term</option>
                                        {terms.map((term) => (
                                            <option key={term.id} value={term.id}>
                                                {term.name}
                                            </option>
                                        ))}
                                    </FormSelect>
                                    {errors.term_id && (
                                        <p className="text-red-500 text-sm mt-1">{errors.term_id}</p>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Schedule & Timing */}
                        <Card className="space-y-4">
                            <h3 className="text-lg font-medium">Schedule & Timing</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                                        Duration (minutes) *
                                    </FormLabel>
                                    <FormInput
                                        type="number"
                                        min="1"
                                        max="600"
                                        value={data.duration}
                                        onChange={(e) => setData('duration', parseInt(e.target.value))}
                                        className="w-full"
                                        required
                                    />
                                    {errors.duration && (
                                        <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
                                    )}
                                </div>

                                <div>
                                    <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Time *
                                    </FormLabel>
                                    <FormInput
                                        type="datetime-local"
                                        value={data.start_time}
                                        onChange={(e) => setData('start_time', e.target.value)}
                                        className="w-full"
                                        required
                                    />
                                    {errors.start_time && (
                                        <p className="text-red-500 text-sm mt-1">{errors.start_time}</p>
                                    )}
                                </div>

                                <div>
                                    <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                                        End Time *
                                    </FormLabel>
                                    <FormInput
                                        type="datetime-local"
                                        value={data.end_time}
                                        onChange={(e) => setData('end_time', e.target.value)}
                                        className="w-full"
                                        required
                                    />
                                    {errors.end_time && (
                                        <p className="text-red-500 text-sm mt-1">{errors.end_time}</p>
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
                                {classrooms.map((classroom) => (
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

                            {questions.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No questions available. Please create some questions first.</p>
                                    <Link href={route('teacher.cbt.questions.create')} className="mt-2 inline-block">
                                        <Button variant="primary">Create Questions</Button>
                                    </Link>
                                </div>
                            )}
                        </Card>

                        {/* Submit Buttons */}
                        <div className="flex justify-end space-x-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.get(route('teacher.cbt.exams.index'))}
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={processing || selectedQuestions.length === 0}
                            >
                                {processing ? 'Creating...' : 'Create Exam'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
