import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/ui/Button';
import Card from '@/Components/ui/Card';
import { PrinterIcon, DownloadIcon } from '@heroicons/react/24/outline';

export default function ReportCard({ 
    auth, 
    student, 
    term, 
    academicSession, 
    results, 
    cbtResults, 
    traditionalResults, 
    statistics,
    terms,
    academicSessions 
}) {
    const [selectedTerm, setSelectedTerm] = useState(term?.id || '');
    const [selectedSession, setSelectedSession] = useState(academicSession?.id || '');

    const handleFilterChange = () => {
        if (!selectedTerm) return;
        
        router.get(route('student.cbt.results.report-card'), {
            term_id: selectedTerm,
            academic_session_id: selectedSession
        });
    };

    const getGrade = (score) => {
        if (score >= 80) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        if (score >= 50) return 'D';
        return 'F';
    };

    const getRemarks = (score) => {
        if (score >= 80) return 'Excellent';
        if (score >= 70) return 'Very Good';
        if (score >= 60) return 'Good';
        if (score >= 50) return 'Fair';
        return 'Needs Improvement';
    };

    const printReportCard = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        CBT Report Card
                    </h2>
                    <div className="flex space-x-3 print:hidden">
                        <Button variant="secondary" onClick={printReportCard}>
                            <PrinterIcon className="h-4 w-4 mr-2" />
                            Print
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => router.visit(route('student.cbt.results.index'))}
                        >
                            Back to Results
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="CBT Report Card" />

            <div className="py-12 print:py-0">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 print:px-0">
                    
                    {/* Filters - Hide on print */}
                    <Card className="mb-6 print:hidden">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Term for Report Card</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Term *
                                    </label>
                                    <select
                                        value={selectedTerm}
                                        onChange={(e) => setSelectedTerm(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">Select Term</option>
                                        {(terms || []).map(termOption => (
                                            <option key={termOption.id} value={termOption.id}>
                                                {termOption.name}
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
                                        <option value="">Current Session</option>
                                        {(academicSessions || []).map(session => (
                                            <option key={session.id} value={session.id}>
                                                {session.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <Button onClick={handleFilterChange} className="w-full" disabled={!selectedTerm}>
                                        Generate Report Card
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Report Card */}
                    {term && (
                        <Card className="print:shadow-none print:border-none">
                            <div className="p-8 print:p-6">
                                {/* Header */}
                                <div className="text-center mb-8 print:mb-6">
                                    <h1 className="text-3xl font-bold text-gray-900 print:text-2xl">
                                        {student.classroom?.academicSession?.school_name || 'Excellence Academy'}
                                    </h1>
                                    <p className="text-lg text-gray-600 print:text-base">
                                        Computer-Based Testing (CBT) Report Card
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {term.name} • {academicSession?.name || 'Current Session'}
                                    </p>
                                </div>

                                {/* Student Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 print:mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Student Information</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex">
                                                <span className="font-medium w-32">Name:</span>
                                                <span>{student.user?.name}</span>
                                            </div>
                                            <div className="flex">
                                                <span className="font-medium w-32">Admission No:</span>
                                                <span>{student.admission_number}</span>
                                            </div>
                                            <div className="flex">
                                                <span className="font-medium w-32">Class:</span>
                                                <span>{student.classroom?.name}</span>
                                            </div>
                                            <div className="flex">
                                                <span className="font-medium w-32">Gender:</span>
                                                <span className="capitalize">{student.gender}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Academic Summary</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex">
                                                <span className="font-medium w-32">Total Subjects:</span>
                                                <span>{statistics?.total_subjects || 0}</span>
                                            </div>
                                            <div className="flex">
                                                <span className="font-medium w-32">Average Score:</span>
                                                <span>{statistics?.average_score || 0}%</span>
                                            </div>
                                            <div className="flex">
                                                <span className="font-medium w-32">Class Average:</span>
                                                <span>{statistics?.class_average || 0}%</span>
                                            </div>
                                            <div className="flex">
                                                <span className="font-medium w-32">Overall Grade:</span>
                                                <span className="font-semibold">{getGrade(statistics?.average_score || 0)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* CBT Results Table */}
                                {cbtResults.length > 0 && (
                                    <div className="mb-8 print:mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">CBT Examination Results</h3>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full border-collapse border border-gray-300">
                                                <thead>
                                                    <tr className="bg-gray-50">
                                                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-900">
                                                            Subject
                                                        </th>
                                                        <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-900">
                                                            CA Score
                                                        </th>
                                                        <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-900">
                                                            Exam Score
                                                        </th>
                                                        <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-900">
                                                            Total Score
                                                        </th>
                                                        <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-900">
                                                            Grade
                                                        </th>
                                                        <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-900">
                                                            Remarks
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(cbtResults || []).map((result) => (
                                                        <tr key={result.id}>
                                                            <td className="border border-gray-300 px-4 py-2 text-sm">
                                                                {result.subject?.name}
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-2 text-sm text-center">
                                                                {result.ca_score || '-'}
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-2 text-sm text-center">
                                                                {result.exam_score}
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-2 text-sm text-center font-medium">
                                                                {result.total_score}
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-2 text-sm text-center font-medium">
                                                                {getGrade(result.total_score)}
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-2 text-sm text-center">
                                                                {getRemarks(result.total_score)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Traditional Results (if any) */}
                                {traditionalResults.length > 0 && (
                                    <div className="mb-8 print:mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Traditional Examination Results</h3>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full border-collapse border border-gray-300">
                                                <thead>
                                                    <tr className="bg-gray-50">
                                                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-900">
                                                            Subject
                                                        </th>
                                                        <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-900">
                                                            CA Score
                                                        </th>
                                                        <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-900">
                                                            Exam Score
                                                        </th>
                                                        <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-900">
                                                            Total Score
                                                        </th>
                                                        <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-900">
                                                            Grade
                                                        </th>
                                                        <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-900">
                                                            Remarks
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(traditionalResults || []).map((result) => (
                                                        <tr key={result.id}>
                                                            <td className="border border-gray-300 px-4 py-2 text-sm">
                                                                {result.subject?.name}
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-2 text-sm text-center">
                                                                {result.ca_score || '-'}
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-2 text-sm text-center">
                                                                {result.exam_score}
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-2 text-sm text-center font-medium">
                                                                {result.total_score}
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-2 text-sm text-center font-medium">
                                                                {getGrade(result.total_score)}
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-2 text-sm text-center">
                                                                {getRemarks(result.total_score)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Performance Analysis */}
                                <div className="mb-8 print:mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Analysis</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {statistics?.total_subjects || 0}
                                            </div>
                                            <div className="text-sm text-blue-600">Total Subjects</div>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <div className="text-2xl font-bold text-green-600">
                                                {statistics?.average_score || 0}%
                                            </div>
                                            <div className="text-sm text-green-600">Average Score</div>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-lg">
                                            <div className="text-2xl font-bold text-purple-600">
                                                {getGrade(statistics?.average_score || 0)}
                                            </div>
                                            <div className="text-sm text-purple-600">Overall Grade</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="text-center text-sm text-gray-500 border-t pt-4">
                                    <p>This report card was generated on {new Date().toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}</p>
                                    <p className="print:hidden">Computer-Based Testing System • Excellence Academy</p>
                                </div>
                            </div>
                        </Card>
                    )}

                    {!term && (
                        <Card>
                            <div className="p-12 text-center">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Term</h3>
                                <p className="text-gray-600 mb-4">
                                    Please select a term above to generate your CBT report card.
                                </p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            <style jsx>{`
                @media print {
                    @page {
                        margin: 0.5in;
                        size: A4;
                    }
                    
                    body {
                        -webkit-print-color-adjust: exact;
                        color-adjust: exact;
                    }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
