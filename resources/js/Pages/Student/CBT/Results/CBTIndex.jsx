import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/ui/Button';
import Card from '@/Components/ui/Card';
import { 
    AcademicCapIcon,
    ClockIcon,
    ChartBarIcon,
    DocumentTextIcon,
    TrophyIcon,
    CalendarIcon,
    PrinterIcon
} from '@heroicons/react/24/outline';

export default function Index({ 
    auth, 
    attempts, 
    results, 
    terms, 
    academicSessions, 
    filters, 
    student 
}) {
    const [selectedTerm, setSelectedTerm] = useState(filters.term_id || '');
    const [selectedSession, setSelectedSession] = useState(filters.academic_session_id || '');

    const handleFilterChange = () => {
        router.get(route('student.cbt.results.index'), {
            term_id: selectedTerm,
            academic_session_id: selectedSession
        });
    };

    const getGrade = (percentage) => {
        if (percentage >= 80) return { grade: 'A', color: 'green' };
        if (percentage >= 70) return { grade: 'B', color: 'blue' };
        if (percentage >= 60) return { grade: 'C', color: 'yellow' };
        if (percentage >= 50) return { grade: 'D', color: 'orange' };
        return { grade: 'F', color: 'red' };
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        My CBT Results
                    </h2>
                    <div className="flex space-x-3">
                        <Button
                            variant="secondary"
                            onClick={() => router.visit(route('student.cbt.results.report-card', { term_id: selectedTerm }))}
                            disabled={!selectedTerm}
                        >
                            <PrinterIcon className="h-4 w-4 mr-2" />
                            Report Card
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => router.visit(route('student.cbt.index'))}
                        >
                            Back to Exams
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="My CBT Results" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Filters */}
                    <Card className="mb-6">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Results</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Term
                                    </label>
                                    <select
                                        value={selectedTerm}
                                        onChange={(e) => setSelectedTerm(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">All Terms</option>
                                        {terms.map(term => (
                                            <option key={term.id} value={term.id}>
                                                {term.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Academic Session
                                    </label>
                                    <select
                                        value={selectedSession}
                                        onChange={(e) => setSelectedSession(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">All Sessions</option>
                                        {academicSessions.map(session => (
                                            <option key={session.id} value={session.id}>
                                                {session.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <Button onClick={handleFilterChange} className="w-full">
                                        Apply Filters
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Summary Statistics */}
                    {attempts.data.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                            <Card>
                                <div className="p-6">
                                    <div className="flex items-center">
                                        <AcademicCapIcon className="h-8 w-8 text-blue-500" />
                                        <div className="ml-4">
                                            <p className="text-2xl font-bold text-gray-900">
                                                {attempts.data.length}
                                            </p>
                                            <p className="text-gray-600">Exams Taken</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                            
                            <Card>
                                <div className="p-6">
                                    <div className="flex items-center">
                                        <ChartBarIcon className="h-8 w-8 text-green-500" />
                                        <div className="ml-4">
                                            <p className="text-2xl font-bold text-gray-900">
                                                {Math.round(attempts.data.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0) / attempts.data.length)}%
                                            </p>
                                            <p className="text-gray-600">Average Score</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                            
                            <Card>
                                <div className="p-6">
                                    <div className="flex items-center">
                                        <TrophyIcon className="h-8 w-8 text-yellow-500" />
                                        <div className="ml-4">
                                            <p className="text-2xl font-bold text-gray-900">
                                                {Math.max(...attempts.data.map(a => a.percentage || 0))}%
                                            </p>
                                            <p className="text-gray-600">Best Score</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                            
                            <Card>
                                <div className="p-6">
                                    <div className="flex items-center">
                                        <ClockIcon className="h-8 w-8 text-purple-500" />
                                        <div className="ml-4">
                                            <p className="text-2xl font-bold text-gray-900">
                                                {formatDuration(attempts.data.reduce((sum, attempt) => sum + (attempt.time_taken || 0), 0) / attempts.data.length)}
                                            </p>
                                            <p className="text-gray-600">Avg. Time</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Results List */}
                    {attempts.data.length > 0 ? (
                        <Card>
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Exam Results</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Exam
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Subject
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Score
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Grade
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Time Taken
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {attempts.data.map((attempt) => {
                                                const gradeInfo = getGrade(attempt.percentage || 0);
                                                return (
                                                    <tr key={attempt.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {attempt.exam?.title}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {attempt.exam?.term?.name}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">
                                                                {attempt.exam?.subject?.name}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {attempt.total_score}/{attempt.exam?.total_marks}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {attempt.percentage}%
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${gradeInfo.color}-100 text-${gradeInfo.color}-800`}>
                                                                {gradeInfo.grade}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {formatDuration(attempt.time_taken || 0)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {formatDate(attempt.submitted_at || attempt.end_time)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            <Link
                                                                href={route('student.cbt.results.show', attempt.id)}
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                            >
                                                                View Details
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* Pagination */}
                                {attempts.links && (
                                    <div className="mt-4">
                                        {/* Add pagination component here */}
                                    </div>
                                )}
                            </div>
                        </Card>
                    ) : (
                        <Card>
                            <div className="p-12 text-center">
                                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    You haven't completed any CBT exams yet or no results match your filters.
                                </p>
                                <div className="mt-6">
                                    <Button onClick={() => router.visit(route('student.cbt.index'))}>
                                        Browse Available Exams
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
