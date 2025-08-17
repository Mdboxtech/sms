import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, PageHeader } from '@/Components/UI';
import { ArrowLeftIcon, DocumentArrowDownIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

export default function ReportCard({ auth, student, results, term }) {

    const [statistics, setStatistics] = useState({
        totalResults: 0,
        averageScore: 0,
        passRate: 0,
        highestScore: 0,
        lowestScore: 100,
        position: 'N/A'
    });

    useEffect(() => {
        if (results && results.length > 0) {
            // Calculate statistics
            const totalResults = results.length;
            const totalScore = results.reduce((acc, result) => acc + parseFloat(result.total_score || 0), 0);
            const averageScore = totalScore / totalResults;
            const passCount = results.filter(result => parseFloat(result.total_score || 0) >= 40).length;
            const passRate = (passCount / totalResults) * 100;
            const highestScore = Math.max(...results.map(result => parseFloat(result.total_score || 0)));
            const lowestScore = Math.min(...results.map(result => parseFloat(result.total_score || 0)));

            setStatistics({
                totalResults,
                averageScore,
                passRate,
                highestScore,
                lowestScore,
                position: student.position || 'N/A'
            });
        }
    }, [results, student]);

    const getGrade = (score) => {
        if (score >= 70) return { grade: 'A', remark: 'Excellent', color: 'text-green-600' };
        if (score >= 60) return { grade: 'B', remark: 'Very Good', color: 'text-green-500' };
        if (score >= 50) return { grade: 'C', remark: 'Good', color: 'text-blue-500' };
        if (score >= 40) return { grade: 'D', remark: 'Pass', color: 'text-yellow-500' };
        return { grade: 'F', remark: 'Fail', color: 'text-red-500' };
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<PageHeader>Report Card: {student?.user?.name}</PageHeader>}
        >
            <Head title={`Report Card - ${student?.user?.name} - SMS`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6 flex justify-between items-center print:hidden">
                        <Link
                            href={route('student.results.index')}
                            className="inline-flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Back to Results
                        </Link>

                        <div className="flex space-x-4">
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
                            >
                                <PrinterIcon className="h-4 w-4 mr-2" />
                                Print Report Card
                            </button>
                            <Link
                                href={route('student.report-card.download', { term_id: term?.id })}
                                className="inline-flex items-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50"
                            >
                                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                                Download PDF
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6 print:mb-4 print:shadow-none">
                        <div className="px-4 py-5 sm:px-6 print:border-b print:border-gray-200">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        Student Report Card
                                    </h3>
                                   
                                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                        {/* {term?.academic_session?.name} - {term?.name} */}
                                          {(term.academicSession ? term.academicSession.name : 'No Session')} - {term.name}
                                       
                                    </p>
                                </div>
                                <div className="print:block hidden">
                                    <h2 className="text-xl font-bold">School Management System</h2>
                                    <p className="text-sm">End of Term Report</p>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-200 print:border-t-0">
                            <dl>
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 print:bg-white">
                                    <dt className="text-sm font-medium text-gray-500">Student Name</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {student?.user?.name}
                                    </dd>
                                </div>
                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Admission Number</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {student?.admission_number}
                                    </dd>
                                </div>
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 print:bg-white">
                                    <dt className="text-sm font-medium text-gray-500">Class</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {student?.classroom?.name}
                                    </dd>
                                </div>
                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Term</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {term?.academic_session?.name} - {term?.name}
                                    </dd>
                                </div>
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 print:bg-white">
                                    <dt className="text-sm font-medium text-gray-500">Position in Class</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {statistics.position}
                                    </dd>
                                </div>
                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Average Score</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {statistics.averageScore.toFixed(1)}%
                                    </dd>
                                </div>
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 print:bg-white">
                                    <dt className="text-sm font-medium text-gray-500">Pass Rate</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {statistics.passRate.toFixed(1)}%
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    <Card className="mb-6 print:shadow-none print:border print:border-gray-200">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Subject Results</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 print:bg-white">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Subject
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                CA Score
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Exam Score
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total Score
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Grade
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {results.map(result => {
                                            const { grade, remark, color } = getGrade(result.total_score);
                                            return (
                                                <tr key={result.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{result.subject.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{result.ca_score}/40</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{result.exam_score}/60</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{result.total_score}/100</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className={`text-sm font-medium ${color}`}>{grade} ({remark})</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {parseFloat(result.total_score) >= 40 ? (
                                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                                <CheckCircleIcon className="h-4 w-4 mr-1" /> Pass
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                                <XCircleIcon className="h-4 w-4 mr-1" /> Fail
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Card>

                    <Card className="mb-6 print:shadow-none print:border print:border-gray-200">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Teacher's Remarks</h3>
                            <div className="bg-gray-50 p-4 rounded-lg print:bg-white print:border print:border-gray-200">
                                {results.length > 0 && results[0].remark ? (
                                    <p className="text-gray-800">{results[0].remark}</p>
                                ) : (
                                    <p className="text-gray-500 italic">No remarks available.</p>
                                )}
                            </div>
                        </div>
                    </Card>

                    <div className="print:mt-8 print:border-t print:border-gray-200 print:pt-4 hidden print:block">
                        <div className="flex justify-between">
                            <div>
                                <p className="font-medium">Class Teacher's Signature</p>
                                <div className="mt-8 border-b border-gray-400 w-40"></div>
                            </div>
                            <div>
                                <p className="font-medium">Principal's Signature</p>
                                <div className="mt-8 border-b border-gray-400 w-40"></div>
                            </div>
                        </div>
                        <div className="mt-8 text-center text-sm text-gray-500">
                            <p>This report card was generated on {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    {results.length === 0 && (
                        <Card>
                            <div className="p-6 text-center">
                                <p className="text-gray-500">No results found for this term.</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page { size: portrait; margin: 1cm; }
                    nav, footer, .print\:hidden { display: none !important; }
                    .print\:block { display: block !important; }
                    .print\:shadow-none { box-shadow: none !important; }
                    .print\:border { border: 1px solid #e5e7eb !important; }
                    .print\:border-gray-200 { border-color: #e5e7eb !important; }
                    .print\:border-t { border-top: 1px solid #e5e7eb !important; }
                    .print\:border-b { border-bottom: 1px solid #e5e7eb !important; }
                    .print\:bg-white { background-color: white !important; }
                    .print\:mb-4 { margin-bottom: 1rem !important; }
                    .print\:mt-8 { margin-top: 2rem !important; }
                    .print\:pt-4 { padding-top: 1rem !important; }
                    body { font-size: 12pt; }
                    h1, h2, h3 { page-break-after: avoid; }
                    table { page-break-inside: auto; }
                    tr { page-break-inside: avoid; page-break-after: auto; }
                    thead { display: table-header-group; }
                    tfoot { display: table-footer-group; }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}