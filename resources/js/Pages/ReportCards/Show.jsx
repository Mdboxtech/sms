import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, PageHeader } from '@/Components/UI';
import { DocumentArrowDownIcon, PrinterIcon } from '@heroicons/react/24/outline';

export default function Show({ auth, reportCard, student, term }) {
    // Function to handle printing
    const handlePrint = () => {
        window.print();
    };

    // Function to handle PDF download
    const downloadPDF = () => {
        router.post(route('report-cards.download'), { 
            student_id: student?.id, 
            term_id: term?.id
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (response) => {
                // The download will be initiated by the response
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<PageHeader>View Report Card</PageHeader>}
        >
            <Head title={`Report Card - ${student?.user?.name || 'Student'}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <div className="p-6">
                            {/* Header Actions */}
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Report Card Details
                                </h2>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handlePrint}
                                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50"
                                    >
                                        <PrinterIcon className="h-4 w-4 mr-2" />
                                        Print
                                    </button>
                                    <button
                                        onClick={downloadPDF}
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700"
                                    >
                                        <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                                        Download PDF
                                    </button>
                                </div>
                            </div>

                            {/* Student Information */}
                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Student Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Name</p>
                                        <p className="mt-1">{student?.user?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Admission Number</p>
                                        <p className="mt-1">{student?.admission_number || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Class</p>
                                        <p className="mt-1">{student?.classroom?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Term</p>
                                        <p className="mt-1">
                                            {term?.academicSession?.name || 'N/A'} - {term?.name || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Results Table */}
                            <div className="mt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Performance</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr>
                                                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Subject
                                                </th>
                                                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    CA Score (40)
                                                </th>
                                                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Exam Score (60)
                                                </th>
                                                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Total (100)
                                                </th>
                                                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Grade
                                                </th>
                                                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Remarks
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {console.log('Full props:', { reportCard, student, term })}
                                            {console.log('Results:', reportCard?.results)}
                                            {reportCard?.results?.map((result) => (
                                                <tr key={result.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {result?.subject?.name || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {result?.ca_score || '0'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {result?.exam_score || '0'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {result?.total_score || '0'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {getGrade(result?.total_score)?.grade || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {result?.remark || 'No remark'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Performance Summary */}
                            <div className="mt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Summary</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Total Subjects</p>
                                        <p className="mt-1">{reportCard?.results?.length || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Average Score</p>
                                        <p className="mt-1">
                                            {calculateAverage(reportCard?.results)}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Position in Class</p>
                                        <p className="mt-1">{reportCard?.position || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Class Average</p>
                                        <p className="mt-1">{reportCard?.class_average || 'N/A'}%</p>
                                    </div>
                                </div>
                            </div>

                            {/* Teacher's Comment */}
                            <div className="mt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Teacher's Comment</h3>
                                <p className="text-sm text-gray-600">
                                    {reportCard?.teacher_comment || 'No comment available.'}
                                </p>
                            </div>

                            {/* Principal's Comment */}
                            <div className="mt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Principal's Comment</h3>
                                <p className="text-sm text-gray-600">
                                    {reportCard?.principal_comment || 'No comment available.'}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Helper function to calculate grade
function getGrade(score) {
    if (!score) return { grade: 'N/A', remark: 'N/A' };
    if (score >= 70) return { grade: 'A', remark: 'Excellent' };
    if (score >= 60) return { grade: 'B', remark: 'Very Good' };
    if (score >= 50) return { grade: 'C', remark: 'Good' };
    if (score >= 40) return { grade: 'D', remark: 'Pass' };
    return { grade: 'F', remark: 'Fail' };
}

// Helper function to calculate average
function calculateAverage(results) {
    if (!results || results.length === 0) return 0;
    const sum = results.reduce((acc, result) => acc + (result?.total_score || 0), 0);
    return (sum / results.length).toFixed(1);
}
