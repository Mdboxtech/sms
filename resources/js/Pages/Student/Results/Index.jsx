import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, PageHeader } from '@/Components/UI';
import { useState } from 'react';
import {
    EyeIcon,
    DocumentArrowDownIcon,
    ChartBarIcon,
    CalendarIcon,
    ArrowTrendingUpIcon,
    ClockIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function Index({ results_by_term, terms, current_term, subjects, filters, student }) {
    const [showAllTerms, setShowAllTerms] = useState(filters?.show_all || false);
    const [selectedTerm, setSelectedTerm] = useState(filters?.term_id || '');

    const getGrade = (score) => {
        if (score >= 70) return { grade: 'A', remark: 'Excellent', color: 'text-green-600 bg-green-100' };
        if (score >= 60) return { grade: 'B', remark: 'Very Good', color: 'text-green-500 bg-green-50' };
        if (score >= 50) return { grade: 'C', remark: 'Good', color: 'text-blue-500 bg-blue-50' };
        if (score >= 40) return { grade: 'D', remark: 'Pass', color: 'text-yellow-600 bg-yellow-50' };
        return { grade: 'F', remark: 'Fail', color: 'text-red-500 bg-red-50' };
    };

    const calculateTermStats = (results) => {
        if (!results || results.length === 0) return null;

        // Filter out any null or undefined scores and convert to numbers
        const validScores = results
            .map(r => parseFloat(r.total_score))
            .filter(score => !isNaN(score) && score !== null);

        if (validScores.length === 0) return null;

        const totalScore = validScores.reduce((a, b) => a + b, 0);

        return {
            total_subjects: results.length,
            valid_subjects: validScores.length,
            average_score: totalScore / validScores.length,
            highest_score: Math.max(...validScores),
            lowest_score: Math.min(...validScores),
            total_score: totalScore,
            total_possible: validScores.length * 100,
            percentage: (totalScore / (validScores.length * 100)) * 100
        };
    };

    // Handle term filter change
    const handleTermChange = (termId) => {
        setSelectedTerm(termId);
        router.get(route('student.results.index'), {
            term_id: termId,
            show_all: false
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    // Toggle show all terms
    const handleShowAllTerms = () => {
        const newShowAll = !showAllTerms;
        setShowAllTerms(newShowAll);
        router.get(route('student.results.index'), {
            show_all: newShowAll
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="My Results" />

            <div className="space-y-6">
                <PageHeader
                    title="My Academic Results"
                    subtitle={`Academic performance for ${student.user.name} (${student.admission_number})`}
                    actions={
                        <Link
                            href={route('student.results.progress')}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                            <ArrowTrendingUpIcon className="h-4 w-4 mr-2" />
                            View Progress
                        </Link>
                    }
                />

                {/* Student Info Card */}
                <Card>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Student Name</h3>
                            <p className="text-lg font-semibold text-gray-900">{student.user.name}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Admission Number</h3>
                            <p className="text-lg font-semibold text-gray-900">{student.admission_number}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Class</h3>
                            <p className="text-lg font-semibold text-gray-900">{student.classroom?.name}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Academic Session</h3>
                            <p className="text-lg font-semibold text-gray-900">{student.classroom?.academic_session?.name || '2024/2025'}</p>
                        </div>
                    </div>
                </Card>

                {/* Term Filter Controls */}
                <Card>
                    <div className="p-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700">View Results:</span>
                                </div>

                                {/* Current Term Badge */}
                                {current_term && (
                                    <div className="flex items-center">
                                        <button
                                            onClick={() => handleTermChange(current_term.id)}
                                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedTerm == current_term.id && !showAllTerms
                                                    ? 'bg-green-100 text-green-800 ring-2 ring-green-500'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-green-50'
                                                }`}
                                        >
                                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                                            Current Term
                                            <span className="ml-1 text-xs opacity-75">
                                                ({current_term.name})
                                            </span>
                                        </button>
                                    </div>
                                )}

                                {/* Show All Toggle */}
                                <button
                                    onClick={handleShowAllTerms}
                                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all ${showAllTerms
                                            ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-500'
                                            : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
                                        }`}
                                >
                                    <ClockIcon className="h-4 w-4 mr-1" />
                                    All Terms
                                </button>
                            </div>

                            {/* Previous Terms Dropdown */}
                            {terms.length > 0 && (
                                <div className="flex items-center space-x-2">
                                    <label className="text-sm text-gray-600">Select Term:</label>
                                    <select
                                        value={selectedTerm}
                                        onChange={(e) => handleTermChange(e.target.value)}
                                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    >
                                        <option value="">-- Select a term --</option>
                                        {terms.map(term => (
                                            <option key={term.id} value={term.id}>
                                                {term.name} - {(term.academicSession || term.academic_session)?.name}
                                                {current_term?.id === term.id ? ' (Current)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Info message */}
                        <div className="mt-3 text-xs text-gray-500">
                            {showAllTerms
                                ? '📊 Showing results from all available terms'
                                : current_term && selectedTerm == current_term.id
                                    ? '✅ Showing current term results only. Click "All Terms" to view previous results.'
                                    : '📅 Viewing specific term results. Select "Current Term" to go back.'
                            }
                        </div>
                    </div>
                </Card>

                {/* Academic Overview Summary */}
                {Object.keys(results_by_term).length > 0 && (
                    <Card>
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Overview</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
                                    <div className="text-2xl font-bold">{Object.keys(results_by_term).length}</div>
                                    <div className="text-blue-100 text-sm">Terms Completed</div>
                                </div>
                                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
                                    <div className="text-2xl font-bold">
                                        {Object.values(results_by_term).reduce((total, results) => total + results.length, 0)}
                                    </div>
                                    <div className="text-green-100 text-sm">Total Subjects</div>
                                </div>
                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
                                    <div className="text-2xl font-bold">
                                        {(() => {
                                            const allResults = Object.values(results_by_term).flat();
                                            const validScores = allResults.map(r => parseFloat(r.total_score)).filter(s => !isNaN(s));
                                            return validScores.length > 0 ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1) : '0';
                                        })()}
                                    </div>
                                    <div className="text-purple-100 text-sm">Overall Average</div>
                                </div>
                                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
                                    <div className="text-2xl font-bold">
                                        {(() => {
                                            const allResults = Object.values(results_by_term).flat();
                                            const cbtResults = allResults.filter(r => r.is_cbt_exam);
                                            return cbtResults.length;
                                        })()}
                                    </div>
                                    <div className="text-orange-100 text-sm">CBT Exams</div>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Results by Term */}
                <div className="space-y-6">
                    {Object.entries(results_by_term).map(([termName, results]) => {
                        const stats = calculateTermStats(results);
                        const averageGrade = stats ? getGrade(stats.average_score) : null;

                        // Performance analysis
                        const strongSubjects = results.filter(r => r.total_score >= 70).length;
                        const improvementNeeded = results.filter(r => r.total_score < 50).length;

                        return (
                            <Card key={termName}>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                            <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
                                            {termName}
                                        </h3>
                                        {stats && averageGrade && (
                                            <div className="mt-2 flex items-center space-x-3">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${averageGrade.color}`}>
                                                    Grade: {averageGrade.grade} - {averageGrade.remark}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {stats.total_score.toFixed(0)}/{stats.total_possible} points
                                                </span>
                                                {strongSubjects > 0 && (
                                                    <span className="text-sm text-green-600">
                                                        {strongSubjects} strong subject{strongSubjects !== 1 ? 's' : ''}
                                                    </span>
                                                )}
                                                {improvementNeeded > 0 && (
                                                    <span className="text-sm text-orange-600">
                                                        {improvementNeeded} need{improvementNeeded !== 1 ? '' : 's'} improvement
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        {stats && (
                                            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div className="bg-blue-50 p-3 rounded-lg">
                                                    <div className="text-blue-600 font-semibold">{stats.total_subjects}</div>
                                                    <div className="text-blue-500 text-xs">Total Subjects</div>
                                                </div>
                                                <div className="bg-green-50 p-3 rounded-lg">
                                                    <div className="text-green-600 font-semibold">{stats.average_score.toFixed(1)}</div>
                                                    <div className="text-green-500 text-xs">Average Score</div>
                                                </div>
                                                <div className="bg-purple-50 p-3 rounded-lg">
                                                    <div className="text-purple-600 font-semibold">{stats.highest_score}</div>
                                                    <div className="text-purple-500 text-xs">Highest Score</div>
                                                </div>
                                                <div className="bg-orange-50 p-3 rounded-lg">
                                                    <div className="text-orange-600 font-semibold">{stats.percentage.toFixed(1)}%</div>
                                                    <div className="text-orange-500 text-xs">Overall %</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex space-x-2">
                                        <Link
                                            href={route('student.results.term', results[0].term.id)}
                                            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            <EyeIcon className="h-4 w-4 mr-1" />
                                            View Details
                                        </Link>
                                        <Link
                                            href={route('student.results.report-card', results[0].term.id)}
                                            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                                            Report Card
                                        </Link>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Subject
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    CA Score
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Exam Score
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Total Score
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Grade & Remark
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Teacher
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Position
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {results.map((result, index) => {
                                                const gradeInfo = getGrade(result.total_score);
                                                // Sort results by total_score to calculate position
                                                const sortedResults = [...results].sort((a, b) => b.total_score - a.total_score);
                                                const position = sortedResults.findIndex(r => r.id === result.id) + 1;

                                                return (
                                                    <tr key={result.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {result.subject.name}
                                                                </div>
                                                                {result.is_cbt_exam && (
                                                                    <span className="ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                                        CBT
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">
                                                                {result.ca_score || 0}/40
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {((result.ca_score || 0) / 40 * 100).toFixed(1)}%
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">
                                                                {result.exam_score || 0}/60
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {((result.exam_score || 0) / 60 * 100).toFixed(1)}%
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {result.total_score || 0}/100
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {result.total_score || 0}%
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="space-y-1">
                                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${gradeInfo.color}`}>
                                                                    {gradeInfo.grade}
                                                                </span>
                                                                <div className="text-xs text-gray-500">
                                                                    {gradeInfo.remark}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-500">
                                                                {result.teacher?.user?.name || 'N/A'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {position}{position === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : 'th'}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                of {results.length}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {Object.keys(results_by_term).length === 0 && (
                    <Card>
                        <div className="text-center py-12">
                            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Your results will appear here once they are uploaded by your teachers.
                            </p>
                        </div>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
