import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, PageHeader } from '@/Components/UI';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function Edit({ result, subjects, students, terms }) {
    const { data, setData, put, processing, errors } = useForm({
        student_id: result.student_id || '',
        subject_id: result.subject_id || '',
        term_id: result.term_id || '',
        ca_score: result.ca_score || '',
        exam_score: result.exam_score || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('teacher.results.update', result.id));
    };

    const totalScore = (parseFloat(data.ca_score) || 0) + (parseFloat(data.exam_score) || 0);

    const getGrade = (score) => {
        if (score >= 70) return { grade: 'A', remark: 'Excellent', color: 'text-green-600' };
        if (score >= 60) return { grade: 'B', remark: 'Very Good', color: 'text-green-500' };
        if (score >= 50) return { grade: 'C', remark: 'Good', color: 'text-blue-500' };
        if (score >= 40) return { grade: 'D', remark: 'Pass', color: 'text-yellow-500' };
        return { grade: 'F', remark: 'Fail', color: 'text-red-500' };
    };

    const gradeInfo = getGrade(totalScore);

    return (
        <AuthenticatedLayout>
            <Head title="Edit Result" />
            
            <div className="space-y-6">
                <PageHeader
                    title="Edit Result"
                    subtitle={`Editing result for ${result.student.user.name} - ${result.subject.name}`}
                    actions={
                        <Link
                            href={route('teacher.results.index')}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Back to Results
                        </Link>
                    }
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Student */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Student
                                        </label>
                                        <select
                                            value={data.student_id}
                                            onChange={(e) => setData('student_id', e.target.value)}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            disabled
                                        >
                                            <option value="">Select student...</option>
                                            {students.map((student) => (
                                                <option key={student.id} value={student.id}>
                                                    {student.user.name} ({student.admission_number})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.student_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.student_id}</p>
                                        )}
                                    </div>

                                    {/* Subject */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Subject
                                        </label>
                                        <select
                                            value={data.subject_id}
                                            onChange={(e) => setData('subject_id', e.target.value)}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            disabled
                                        >
                                            <option value="">Select subject...</option>
                                            {subjects.map((subject) => (
                                                <option key={subject.id} value={subject.id}>
                                                    {subject.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.subject_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.subject_id}</p>
                                        )}
                                    </div>

                                    {/* Term */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Term
                                        </label>
                                        <select
                                            value={data.term_id}
                                            onChange={(e) => setData('term_id', e.target.value)}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            disabled
                                        >
                                            <option value="">Select term...</option>
                                            {terms.map((term) => (
                                                <option key={term.id} value={term.id}>
                                                    {term.name} - {term.academic_session?.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.term_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.term_id}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* CA Score */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            CA Score (out of 30)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="30"
                                            step="0.1"
                                            value={data.ca_score}
                                            onChange={(e) => setData('ca_score', e.target.value)}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="Enter CA score"
                                        />
                                        {errors.ca_score && (
                                            <p className="mt-1 text-sm text-red-600">{errors.ca_score}</p>
                                        )}
                                    </div>

                                    {/* Exam Score */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Exam Score (out of 70)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="70"
                                            step="0.1"
                                            value={data.exam_score}
                                            onChange={(e) => setData('exam_score', e.target.value)}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="Enter exam score"
                                        />
                                        {errors.exam_score && (
                                            <p className="mt-1 text-sm text-red-600">{errors.exam_score}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-4">
                                    <Link
                                        href={route('teacher.results.index')}
                                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {processing ? 'Updating...' : 'Update Result'}
                                    </button>
                                </div>
                            </form>
                        </Card>
                    </div>

                    {/* Score Summary */}
                    <div>
                        <Card>
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">Score Summary</h3>
                                
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">CA Score:</span>
                                        <span className="font-medium">{data.ca_score || 0}/30</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Exam Score:</span>
                                        <span className="font-medium">{data.exam_score || 0}/70</span>
                                    </div>
                                    <div className="border-t pt-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-900">Total Score:</span>
                                            <span className="text-lg font-bold">{totalScore}/100</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-sm text-gray-600">Grade:</span>
                                            <span className={`font-bold ${gradeInfo.color}`}>
                                                {gradeInfo.grade}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Remark:</span>
                                            <span className={`text-sm font-medium ${gradeInfo.color}`}>
                                                {gradeInfo.remark}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
