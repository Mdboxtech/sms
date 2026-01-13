import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, PageHeader } from '@/Components/UI';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function BulkCreate({ auth, students = [], subjects = [], terms = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        term_id: '',
        results: [{ student_id: '', subject_id: '', ca_score: '', exam_score: '' }]
    });

    const [totals, setTotals] = useState([0]);

    const calculateTotal = (index) => {
        const result = data.results[index];
        const ca = parseFloat(result.ca_score) || 0;
        const exam = parseFloat(result.exam_score) || 0;
        const newTotals = [...totals];
        newTotals[index] = ca + exam;
        setTotals(newTotals);
    };

    const addRow = () => {
        setData('results', [
            ...data.results,
            { student_id: '', subject_id: '', ca_score: '', exam_score: '' }
        ]);
        setTotals([...totals, 0]);
    };

    const removeRow = (index) => {
        const newResults = data.results.filter((_, i) => i !== index);
        const newTotals = totals.filter((_, i) => i !== index);
        setData('results', newResults);
        setTotals(newTotals);
    };

    const updateResult = (index, field, value) => {
        const newResults = [...data.results];
        newResults[index] = { ...newResults[index], [field]: value };
        setData('results', newResults);

        if (field === 'ca_score' || field === 'exam_score') {
            calculateTotal(index);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.results.bulk-store'), {
            onSuccess: () => {
                reset();
                setTotals([0]);
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<PageHeader>Bulk Create Results</PageHeader>}
        >
            <Head title="Bulk Create Results - SMS" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <form onSubmit={handleSubmit} className="space-y-6 p-6">
                            <div className="mb-6">
                                <InputLabel htmlFor="term_id" value="Term" />
                                <SearchableSelect
                                    value={data.term_id}
                                    onChange={value => setData('term_id', value)}
                                    options={terms}
                                    placeholder="Select a term"
                                    displayValue={(term) => {
                                        if (!term) return '';
                                        const session = term.academicSession || term.academic_session;
                                        const sessionName = session?.name || 'Unknown Session';
                                        const termName = term.name || 'Unknown Term';
                                        return `${sessionName} - ${termName}`;
                                    }}
                                    error={errors.term_id}
                                />
                                <InputError message={errors.term_id} className="mt-2" />
                            </div>

                            <div className="space-y-4">
                                {data.results.map((result, index) => (
                                    <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1">
                                            <div>
                                                <SelectInput
                                                    value={result.student_id}
                                                    onChange={e => updateResult(index, 'student_id', e.target.value)}
                                                    className="block w-full"
                                                >
                                                    <option value="">Select Student</option>
                                                    {students.map(student => (
                                                        <option key={student.id} value={student.id}>
                                                            {student.user?.name || 'Unknown Student'}
                                                        </option>
                                                    ))}
                                                </SelectInput>
                                            </div>
                                            <div>
                                                <SelectInput
                                                    value={result.subject_id}
                                                    onChange={e => updateResult(index, 'subject_id', e.target.value)}
                                                    className="block w-full"
                                                >
                                                    <option value="">Select Subject</option>
                                                    {subjects.map(subject => (
                                                        <option key={subject.id} value={subject.id}>
                                                            {subject.name || 'Unknown Subject'}
                                                        </option>
                                                    ))}
                                                </SelectInput>
                                            </div>
                                            <div>
                                                <TextInput
                                                    type="number"
                                                    min="0"
                                                    max="40"
                                                    placeholder="CA Score"
                                                    value={result.ca_score}
                                                    onChange={e => updateResult(index, 'ca_score', e.target.value)}
                                                    className="block w-full"
                                                />
                                            </div>
                                            <div>
                                                <TextInput
                                                    type="number"
                                                    min="0"
                                                    max="60"
                                                    placeholder="Exam Score"
                                                    value={result.exam_score}
                                                    onChange={e => updateResult(index, 'exam_score', e.target.value)}
                                                    className="block w-full"
                                                />
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="bg-gray-100 px-3 py-2 rounded-md text-center flex-1">
                                                    Total: {totals[index]}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeRow(index)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={addRow}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <PlusIcon className="h-5 w-5 mr-2" />
                                    Add Another Result
                                </button>

                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-600">
                                        Total Results: {data.results.length}
                                    </span>
                                    <PrimaryButton
                                        type="submit"
                                        className="bg-indigo-600 hover:bg-indigo-700"
                                        disabled={processing}
                                    >
                                        {processing ? 'Saving...' : 'Save All Results'}
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
