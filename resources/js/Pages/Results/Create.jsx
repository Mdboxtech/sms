import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, PageHeader } from '@/Components/UI';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';

export default function CreateResult({ auth, students = [], subjects = [], terms = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        student_id: '',
        subject_id: '',
        term_id: '',
        ca_score: '',
        exam_score: '',
        generate_remark: true,
    });

    const [totalScore, setTotalScore] = useState(0);

    const calculateTotal = (ca, exam) => {
        const caScore = parseFloat(ca) || 0;
        const examScore = parseFloat(exam) || 0;
        return caScore + examScore;
    };

    const handleScoreChange = (field, value) => {
        setData(field, value);
        if (field === 'ca_score' || field === 'exam_score') {
            const newTotal = calculateTotal(
                field === 'ca_score' ? value : data.ca_score,
                field === 'exam_score' ? value : data.exam_score
            );
            setTotalScore(newTotal);
        }
    };

    const validateForm = () => {
        if (!data.student_id) return 'Please select a student';
        if (!data.subject_id) return 'Please select a subject';
        if (!data.term_id) return 'Please select a term';
        if (!data.ca_score) return 'Please enter CA score';
        if (!data.exam_score) return 'Please enter exam score';
        if (parseFloat(data.ca_score) < 0 || parseFloat(data.ca_score) > 40) return 'CA score must be between 0 and 40';
        if (parseFloat(data.exam_score) < 0 || parseFloat(data.exam_score) > 60) return 'Exam score must be between 0 and 60';
        return null;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const error = validateForm();
        if (error) {
            alert(error);
            return;
        }

        post(route('admin.results.store'), {
            onSuccess: () => {
                reset();
                setTotalScore(0);
            },
            onError: (errors) => {
                if (errors.message) {
                    alert(errors.message);
                }
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<PageHeader>Create Result</PageHeader>}
        >
            <Head title="Create Result - SMS" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <form onSubmit={handleSubmit} className="space-y-6 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Student Selection */}
                                <div>
                                    <InputLabel htmlFor="student_id" value="Student" />
                                    <SelectInput
                                        id="student_id"
                                        className="mt-1 block w-full"
                                        value={data.student_id}
                                        onChange={e => setData('student_id', e.target.value)}
                                    >
                                        <option value="">Select Student</option>
                                        {students.map(student => (
                                            <option key={student.id} value={student.id}>
                                                {student.user?.name || 'Unknown Student'}
                                            </option>
                                        ))}
                                    </SelectInput>
                                    <InputError message={errors.student_id} className="mt-2" />
                                </div>

                                {/* Subject Selection */}
                                <div>
                                    <InputLabel htmlFor="subject_id" value="Subject" />
                                    <SelectInput
                                        id="subject_id"
                                        className="mt-1 block w-full"
                                        value={data.subject_id}
                                        onChange={e => setData('subject_id', e.target.value)}
                                    >
                                        <option value="">Select Subject</option>
                                        {subjects.map(subject => (
                                            <option key={subject.id} value={subject.id}>
                                                {subject.name || 'Unknown Subject'}
                                            </option>
                                        ))}
                                    </SelectInput>
                                    <InputError message={errors.subject_id} className="mt-2" />
                                </div>

                                {/* Term Selection */}
                                <div>
                                    <InputLabel htmlFor="term_id" value="Term" />
                                    <SelectInput
                                        id="term_id"
                                        className="mt-1 block w-full"
                                        value={data.term_id}
                                        onChange={e => setData('term_id', e.target.value)}
                                    >
                                        <option value="">Select Term</option>
                                        {terms.map(term => {
                                            const sessionName = term.academicSession?.name || 'Unknown Session';
                                            const termName = term.name || 'Unknown Term';
                                            return (
                                                <option key={term.id} value={term.id}>
                                                    {sessionName} - {termName}
                                                </option>
                                            );
                                        })}
                                    </SelectInput>
                                    <InputError message={errors.term_id} className="mt-2" />
                                </div>
                            </div>

                            {/* Scores Section */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <InputLabel htmlFor="ca_score" value="CA Score (max: 40)" />
                                    <TextInput
                                        id="ca_score"
                                        type="number"
                                        min="0"
                                        max="40"
                                        className="mt-1 block w-full"
                                        value={data.ca_score}
                                        onChange={e => handleScoreChange('ca_score', e.target.value)}
                                    />
                                    <InputError message={errors.ca_score} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="exam_score" value="Exam Score (max: 60)" />
                                    <TextInput
                                        id="exam_score"
                                        type="number"
                                        min="0"
                                        max="60"
                                        className="mt-1 block w-full"
                                        value={data.exam_score}
                                        onChange={e => handleScoreChange('exam_score', e.target.value)}
                                    />
                                    <InputError message={errors.exam_score} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel value="Total Score" />
                                    <div className="mt-1 p-2 bg-gray-100 rounded-md text-center font-bold text-lg">
                                        {totalScore}
                                    </div>
                                </div>
                            </div>

                            {/* AI Remark Option */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="generate_remark"
                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                    checked={data.generate_remark}
                                    onChange={e => setData('generate_remark', e.target.checked)}
                                />
                                <label htmlFor="generate_remark" className="ml-2 text-sm text-gray-600">
                                    Generate AI Remark
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    {totalScore >= 70 ? (
                                        <span className="text-green-600">Excellent Score!</span>
                                    ) : totalScore >= 50 ? (
                                        <span className="text-blue-600">Good Score</span>
                                    ) : totalScore >= 40 ? (
                                        <span className="text-yellow-600">Pass</span>
                                    ) : totalScore > 0 ? (
                                        <span className="text-red-600">Needs Improvement</span>
                                    ) : null}
                                </div>
                                <div className="flex space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            reset();
                                            setTotalScore(0);
                                        }}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        disabled={processing}
                                    >
                                        Clear Form
                                    </button>
                                    <PrimaryButton
                                        type="submit"
                                        className="bg-indigo-600 hover:bg-indigo-700"
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Saving...
                                            </>
                                        ) : 'Save Result'}
                                    </PrimaryButton>
                                </div>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 