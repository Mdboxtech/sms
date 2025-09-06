import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import ResultCommentsModal from '@/Components/ResultCommentsModal';
import { format } from 'date-fns';

export default function Show({ auth, termResult, results }) {
    const [showCommentsModal, setShowCommentsModal] = useState(false);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">
                Term Results for {termResult.student.user.name} - {termResult.term.name} ({termResult.term.academic_session.name})
            </h2>}
        >
            <Head title="Term Results" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        {/* Student Info */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">Student Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p><span className="font-medium">Name:</span> {termResult.student.user.name}</p>
                                    <p><span className="font-medium">Class:</span> {termResult.classroom.name}</p>
                                </div>
                                <div>
                                    <p><span className="font-medium">Term:</span> {termResult.term.name}</p>
                                    <p><span className="font-medium">Session:</span> {termResult.term.academic_session.name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Results Table */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">Subject Results</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CA Score</th>
                                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Score</th>
                                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Score</th>
                                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                                            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {results.map((result) => (
                                            <tr key={result.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">{result.subject.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{result.ca_score}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{result.exam_score}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{result.total_score}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{result.grade}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{result.teacher?.user.name}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">Term Summary</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <p><span className="font-medium">Average Score:</span> {termResult.average_score.toFixed(2)}</p>
                                <p><span className="font-medium">Position in Class:</span> {termResult.position}</p>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Comments</h3>
                                {(auth.user.isAdmin || auth.user.isClassTeacher) && (
                                    <button
                                        onClick={() => setShowCommentsModal(true)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                    >
                                        Edit Comments
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="border rounded-lg p-4">
                                    <p className="font-medium mb-2">Class Teacher's Comment:</p>
                                    <p className="text-gray-700">{termResult.teacher_comment || 'No comment yet'}</p>
                                    {termResult.teacher_id && (
                                        <p className="text-sm text-gray-500 mt-2">
                                            - By {termResult.teacher?.user.name} ({format(new Date(termResult.updated_at), 'PPp')})
                                        </p>
                                    )}
                                </div>
                                <div className="border rounded-lg p-4">
                                    <p className="font-medium mb-2">Principal's Comment:</p>
                                    <p className="text-gray-700">{termResult.principal_comment || 'No comment yet'}</p>
                                    {termResult.principal_id && (
                                        <p className="text-sm text-gray-500 mt-2">
                                            - By {termResult.principal?.name} ({format(new Date(termResult.updated_at), 'PPp')})
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comments Modal */}
            <ResultCommentsModal
                show={showCommentsModal}
                onClose={() => setShowCommentsModal(false)}
                termResult={termResult}
                canEditPrincipalComment={auth.user.isAdmin}
            />
        </AuthenticatedLayout>
    );
}
