import { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, PageHeader } from '@/Components/UI';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';
import { Link } from '@inertiajs/react';

export default function EditResult({ auth, result, students = [], subjects = [], terms = [] }) {
    const { data, setData, put, processing, errors } = useForm({
        student_id: result?.student_id || '',
        subject_id: result?.subject_id || '',
        term_id: result?.term_id || '',
        ca_score: result?.ca_score || '',
        exam_score: result?.exam_score || '',
        generate_remark: true,
    });

    const [totalScore, setTotalScore] = useState(result?.total_score || 0);

    useEffect(() => {
        if (result) {
            setData({
                student_id: result.student_id,
                subject_id: result.subject_id,
                term_id: result.term_id,
                ca_score: result.ca_score,
                exam_score: result.exam_score,
                generate_remark: true,
            });
            setTotalScore(result.total_score);
        }
    }, [result]);

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

        put(route('admin.results.update', result.id), {
            onSuccess: () => {
                // Success message handled by Inertia
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
            header={<PageHeader>Edit Result</PageHeader>}
        >
            <Head title="Edit Result - SMS" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <form onSubmit={handleSubmit} className="space-y-6 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Student Information (Read-only) */}
                                <div>
                                    <InputLabel htmlFor="student_name" value="Student" />
                                    <TextInput
                                        id="student_name"
                                        type="text"
                                        className="mt-1 block w-full bg-gray-100"
                                        value={result?.student?.user?.name || 'Unknown Student'}
                                        disabled
                                    />
                                    <input type="hidden" name="student_id" value={result?.student_id} />
                                </div>

                                {/* Subject Information (Read-only) */}
                                <div>
                                    <InputLabel htmlFor="subject_name" value="Subject" />
                                    <TextInput
                                        id="subject_name"
                                        type="text"
                                        className="mt-1 block w-full bg-gray-100"
                                        value={result?.subject?.name || 'Unknown Subject'}
                                        disabled
                                    />
                                    <input type="hidden" name="subject_id" value={result?.subject_id} />
                                </div>

                                {/* Term Information (Read-only) */}
                                <div>
                                    <InputLabel htmlFor="term_name" value="Term" />
                                    <TextInput
                                        id="term_name"
                                        type="text"
                                        className="mt-1 block w-full bg-gray-100"
                                        value={
                                            result?.term
                                                ? `${result.term.academicSession?.name || 'Unknown Session'} - ${result.term.name || 'Unknown Term'}`
                                                : 'Unknown Term'
                                        }
                                        disabled
                                    />
                                    <input type="hidden" name="term_id" value={result?.term_id} />
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
                                        step="0.01"
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
                                        step="0.01"
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
                                    Generate New AI Remark
                                </label>
                            </div>

                            {/* Current Remark Display */}
                            {result?.remark && (
                                <div className="p-4 bg-gray-50 rounded-md">
                                    <h3 className="text-sm font-medium text-gray-700 mb-1">Current Remark:</h3>
                                    <p className="text-gray-600 italic">
                                        {result.remark}
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center justify-between mt-6">
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
                                    <Link
                                        href={route('admin.results.index')}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Cancel
                                    </Link>
                                    <PrimaryButton
                                        type="submit"
                                        className="bg-indigo-600 hover:bg-indigo-700"
                                        disabled={processing}
                                    >
                                        {processing ? 'Saving...' : 'Update Result'}
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
