import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, PageHeader } from '@/Components/UI';
import { ArrowLeftIcon, DocumentArrowDownIcon, DocumentTextIcon, PencilIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

export default function TermResults({ auth, term, results }) {
    const [statistics, setStatistics] = useState({
        totalResults: 0,
        averageScore: 0,
        passRate: 0,
        highestScore: 0,
        lowestScore: 100
    });

    // Group results by classroom
    const [resultsByClassroom, setResultsByClassroom] = useState({});

    useEffect(() => {
        if (results && results.length > 0) {
            // Group results by classroom
            const grouped = {};
            results.forEach(result => {
                const classroomId = result.student.classroom?.id || 'unknown';
                if (!grouped[classroomId]) {
                    grouped[classroomId] = {
                        classroom: result.student.classroom,
                        results: []
                    };
                }
                grouped[classroomId].results.push(result);
            });
            setResultsByClassroom(grouped);

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
            header={<PageHeader>Term Results: {term?.academic_session?.name} - {term?.name}</PageHeader>}
        >
            <Head title={`${term?.name} Results - SMS`} />

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
                            href={route('admin.results.export', { term_id: term?.id })}
                            className="inline-flex items-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50"
                        >
                            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                            Export Term Results
                        </Link>
                    </div>

                    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Term Summary
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                Performance overview for {term?.academic_session?.name} - {term?.name}
                            </p>
                        </div>
                        <div className="border-t border-gray-200">
                            <dl>
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Academic Session</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {term?.academic_session?.name || 'N/A'}
                                    </dd>
                                </div>
                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Total Classes</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {Object.keys(resultsByClassroom).length}
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
                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Score Range</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        Highest: {statistics.highestScore}% | Lowest: {statistics.lowestScore}%
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {Object.values(resultsByClassroom).map(({ classroom, results: classResults }) => (
                            <Card key={classroom?.id || 'unknown'} className="h-full">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-800">
                                                {classroom?.name || 'Unknown Class'}
                                            </h2>
                                            <p className="text-sm text-gray-500">{classResults.length} results</p>
                                        </div>
                                        <Link
                                            href={route('admin.results.classroom', { classroom: classroom?.id })}
                                            className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
                                        >
                                            View Details
                                        </Link>
                                    </div>

                                    <div className="mt-4">
                                        <div className="flex justify-between text-sm text-gray-500 mb-2">
                                            <span>Average Score:</span>
                                            <span className="font-medium text-gray-700">
                                                {(classResults.reduce((acc, result) => acc + parseFloat(result.total_score || 0), 0) / classResults.length).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-500 mb-2">
                                            <span>Pass Rate:</span>
                                            <span className="font-medium text-gray-700">
                                                {((classResults.filter(result => parseFloat(result.total_score || 0) >= 40).length / classResults.length) * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>Top Score:</span>
                                            <span className="font-medium text-gray-700">
                                                {Math.max(...classResults.map(result => parseFloat(result.total_score || 0)))}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <Card>
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">All Results</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Student
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Class
                                            </th>
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
                                        {results.map(result => {
                                            const { grade, remark, color } = getGrade(result.total_score);
                                            return (
                                                <tr key={result.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{result.student.user.name}</div>
                                                        <div className="text-sm text-gray-500">{result.student.admission_number}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{result.student.classroom?.name || 'N/A'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{result.subject.name}</div>
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

                    {results.length === 0 && (
                        <Card>
                            <div className="p-6 text-center">
                                <p className="text-gray-500">No results found for this term.</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
