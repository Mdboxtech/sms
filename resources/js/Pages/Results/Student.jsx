import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, PageHeader } from '@/Components/UI';
import { ArrowLeftIcon, DocumentArrowDownIcon, DocumentTextIcon, PencilIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

export default function StudentResults({ auth, student, results }) {
    const [statistics, setStatistics] = useState({
        totalResults: 0,
        averageScore: 0,
        passRate: 0,
        highestScore: 0,
        lowestScore: 100
    });

    // Group results by term
    const [resultsByTerm, setResultsByTerm] = useState({});

    useEffect(() => {
        if (results && results.length > 0) {
            // Group results by term
            const grouped = {};
            results.forEach(result => {
                const termId = result.term?.id || 'unknown';
                if (!grouped[termId]) {
                    grouped[termId] = {
                        term: result.term,
                        results: []
                    };
                }
                grouped[termId].results.push(result);
            });
            setResultsByTerm(grouped);

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
                lowestScore
            });
        }
    }, [results]);

    const getGrade = (score) => {
        if (score >= 70) return { grade: 'A', remark: 'Excellent', color: 'text-green-600' };
        if (score >= 60) return { grade: 'B', remark: 'Very Good', color: 'text-green-500' };
        if (score >= 50) return { grade: 'C', remark: 'Good', color: 'text-blue-500' };
        if (score >= 40) return { grade: 'D', remark: 'Pass', color: 'text-yellow-500' };
        return { grade: 'F', remark: 'Fail', color: 'text-red-500' };
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<PageHeader>Student Results: {student?.user?.name}</PageHeader>}
        >
            <Head title={`${student?.user?.name} Results - SMS`} />

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

                        <Link
                            href={route('admin.results.export', { student_id: student?.id })}
                            className="inline-flex items-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50"
                        >
                            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                            Export Student Results
                        </Link>
                    </div>

                    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Student Information
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                Personal details and academic performance
                            </p>
                        </div>
                        <div className="border-t border-gray-200">
                            <dl>
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Full name</dt>
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
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Class</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {student?.classroom?.name || 'Not assigned'}
                                    </dd>
                                </div>
                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Email address</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {student?.user?.email}
                                    </dd>
                                </div>
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Total Results</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {statistics.totalResults}
                                    </dd>
                                </div>
                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Average Score</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {statistics.averageScore.toFixed(1)}%
                                    </dd>
                                </div>
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Pass Rate</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {statistics.passRate.toFixed(1)}%
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {Object.values(resultsByTerm).map(({ term, results: termResults }) => (
                        <Card key={term?.id || 'unknown'} className="mb-6">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-800">
                                            {term ? `${term.academic_session?.name || ''} - ${term.name}` : 'Unknown Term'}
                                        </h2>
                                        <p className="text-sm text-gray-500">{termResults.length} results</p>
                                    </div>
                                    <Link
                                        href={route('admin.report-card', { student_id: student?.id, term_id: term?.id })}
                                        className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
                                    >
                                        View Report Card
                                    </Link>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
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
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {termResults.map(result => {
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
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <div className="flex space-x-2">
                                                                <Link
                                                                    href={route('admin.results.show', result.id)}
                                                                    className="text-indigo-600 hover:text-indigo-900"
                                                                >
                                                                    <DocumentTextIcon className="h-5 w-5" />
                                                                </Link>
                                                                <Link
                                                                    href={route('admin.results.edit', result.id)}
                                                                    className="text-blue-600 hover:text-blue-900"
                                                                >
                                                                    <PencilIcon className="h-5 w-5" />
                                                                </Link>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {Object.keys(resultsByTerm).length === 0 && (
                        <Card>
                            <div className="p-6 text-center">
                                <p className="text-gray-500">No results found for this student.</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
