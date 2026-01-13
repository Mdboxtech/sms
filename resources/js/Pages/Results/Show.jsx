import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, PageHeader } from '@/Components/UI';
import { ArrowLeftIcon, PencilIcon, TrashIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function ShowResult({ auth, result }) {
    const [regeneratingRemark, setRegeneratingRemark] = useState(false);

    const getGradeAndRemark = (score) => {
        if (score >= 70) return { grade: 'A', remark: 'Excellent' };
        if (score >= 60) return { grade: 'B', remark: 'Very Good' };
        if (score >= 50) return { grade: 'C', remark: 'Good' };
        if (score >= 40) return { grade: 'D', remark: 'Pass' };
        return { grade: 'F', remark: 'Fail' };
    };

    const { grade, remark } = getGradeAndRemark(result?.total_score || 0);

    const regenerateRemark = async () => {
        if (!result?.id || !result?.student?.user?.name || !result?.subject?.name) {
            console.error('Invalid result data for generating remark');
            return;
        }

        setRegeneratingRemark(true);

        try {
            const response = await fetch(route('api.ai.remark'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify({
                    result_id: result.id,
                    student: result.student.user.name,
                    subjects: [{
                        name: result.subject.name,
                        score: result.total_score || 0
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.remark) {
                // Redirect to refresh the page with new data
                window.location.reload();
            }

        } catch (error) {
            console.error('Error regenerating remark:', error);
            alert('Failed to generate remark. Please try again.');
        } finally {
            setRegeneratingRemark(false);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<PageHeader>View Result</PageHeader>}
        >
            <Head title="View Result - SMS" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6 flex justify-between items-center">
                        <Link
                            href={route('admin.results.index')}
                            className="inline-flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Back to Results
                        </Link>

                        <div className="flex space-x-2">
                            <Link
                                href={route('admin.results.edit', result.id)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <PencilIcon className="h-4 w-4 mr-2" />
                                Edit
                            </Link>
                            <Link
                                href={route('admin.results.destroy', result.id)}
                                method="delete"
                                as="button"
                                className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                                onClick={(e) => {
                                    if (!confirm('Are you sure you want to delete this result?')) {
                                        e.preventDefault();
                                    }
                                }}
                            >
                                <TrashIcon className="h-4 w-4 mr-2" />
                                Delete
                            </Link>
                        </div>
                    </div>

                    <Card>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Student Information</h2>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Name:</span>
                                            <p className="text-gray-800">{result?.student?.user?.name || 'Unknown Student'}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Admission Number:</span>
                                            <p className="text-gray-800">{result?.student?.admission_number || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Class:</span>
                                            <p className="text-gray-800">{result?.student?.classroom?.name || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Result Details</h2>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Subject:</span>
                                            <p className="text-gray-800">{result?.subject?.name || 'Unknown Subject'}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Term:</span>
                                            <p className="text-gray-800">
                                                {result?.term
                                                    ? `${(result.term.academicSession || result.term.academic_session)?.name || 'Unknown Session'} - ${result.term.name || 'Unknown Term'}`
                                                    : 'Unknown Term'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Recorded By:</span>
                                            <p className="text-gray-800">{result?.teacher?.name || 'Unknown Teacher'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Scores</h2>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="bg-white p-4 rounded-md shadow-sm">
                                        <span className="text-sm font-medium text-gray-500">CA Score:</span>
                                        <p className="text-2xl font-bold text-gray-800">{result?.ca_score || '0'}</p>
                                        <span className="text-xs text-gray-500">Out of 40</span>
                                    </div>
                                    <div className="bg-white p-4 rounded-md shadow-sm">
                                        <span className="text-sm font-medium text-gray-500">Exam Score:</span>
                                        <p className="text-2xl font-bold text-gray-800">{result?.exam_score || '0'}</p>
                                        <span className="text-xs text-gray-500">Out of 60</span>
                                    </div>
                                    <div className="bg-white p-4 rounded-md shadow-sm">
                                        <span className="text-sm font-medium text-gray-500">Total Score:</span>
                                        <p className="text-2xl font-bold text-gray-800">{result?.total_score || '0'}</p>
                                        <span className="text-xs text-gray-500">Out of 100</span>
                                    </div>
                                    <div className="bg-white p-4 rounded-md shadow-sm">
                                        <span className="text-sm font-medium text-gray-500">Grade:</span>
                                        <p className="text-2xl font-bold text-gray-800">{grade}</p>
                                        <span className="text-xs text-gray-500">{remark}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-xl font-semibold text-gray-800">Teacher's Remark</h2>
                                    <button
                                        onClick={regenerateRemark}
                                        disabled={regeneratingRemark}
                                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <SparklesIcon className="h-4 w-4 mr-1" />
                                        {regeneratingRemark ? 'Generating...' : 'Regenerate AI Remark'}
                                    </button>
                                </div>
                                <div className="bg-white p-4 rounded-md shadow-sm">
                                    <p className="text-gray-700 italic">{result?.remark || 'No remark provided.'}</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
