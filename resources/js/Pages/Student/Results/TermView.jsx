import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, PageHeader } from '@/Components/UI';
import { 
    DocumentArrowDownIcon,
    ArrowLeftIcon,
    ChartBarIcon,
    StarIcon
} from '@heroicons/react/24/outline';

export default function TermView({ results, term, statistics, class_average, student }) {
    const getGrade = (score) => {
        if (score >= 70) return { grade: 'A', remark: 'Excellent', color: 'text-green-600 bg-green-100' };
        if (score >= 60) return { grade: 'B', remark: 'Very Good', color: 'text-green-500 bg-green-50' };
        if (score >= 50) return { grade: 'C', remark: 'Good', color: 'text-blue-500 bg-blue-50' };
        if (score >= 40) return { grade: 'D', remark: 'Pass', color: 'text-yellow-600 bg-yellow-50' };
        return { grade: 'F', remark: 'Fail', color: 'text-red-500 bg-red-50' };
    };

    const getGradeColor = (grade) => {
        switch (grade) {
            case 'A': return 'text-green-600 bg-green-100';
            case 'B': return 'text-green-500 bg-green-50';
            case 'C': return 'text-blue-500 bg-blue-50';
            case 'D': return 'text-yellow-600 bg-yellow-50';
            default: return 'text-red-500 bg-red-50';
        }
    };

    // Helper function to safely convert to number and format
    const safeToFixed = (value, decimals = 1) => {
        const num = parseFloat(value);
        return isNaN(num) ? 'N/A' : num.toFixed(decimals);
    };

    // Convert class_average to number if it's not already
    const numericClassAverage = parseFloat(class_average);
    const hasValidClassAverage = !isNaN(numericClassAverage);

    return (
        <AuthenticatedLayout>
            <Head title={`Results - ${term.name}`} />
            
            <div className="space-y-6">
                <PageHeader
                    title={`Results for ${term.name}`}
                    subtitle={`${term.academic_session.name} - ${student.user.name} (${student.admission_number})`}
                    actions={
                        <div className="flex space-x-3">
                            <Link
                                href={route('student.results.report-card', term.id)}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                            >
                                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                                Download Report Card
                            </Link>
                            <Link
                                href={route('student.results.index')}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Back to All Results
                            </Link>
                        </div>
                    }
                />

                {/* Statistics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <Card>
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <ChartBarIcon className="h-8 w-8 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Total Subjects</p>
                                    <p className="text-2xl font-bold text-gray-900">{statistics.total_subjects}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <StarIcon className="h-8 w-8 text-yellow-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Average Score</p>
                                    <p className="text-2xl font-bold text-gray-900">{safeToFixed(statistics.average_score)}%</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                        <span className="text-green-600 font-bold">H</span>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Highest Score</p>
                                    <p className="text-2xl font-bold text-green-600">{statistics.highest_score}%</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                                        <span className="text-red-600 font-bold">L</span>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Lowest Score</p>
                                    <p className="text-2xl font-bold text-red-600">{statistics.lowest_score}%</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                        <span className="text-blue-600 font-bold">C</span>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Class Average</p>
                                    <p className="text-2xl font-bold text-blue-600">{hasValidClassAverage ? safeToFixed(numericClassAverage) : 'N/A'}%</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Results Table */}
                <Card>
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Subject Results</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Subject
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Teacher
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
                                        Grade
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Comment
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {results.map((result) => {
                                    const gradeInfo = getGrade(result.total_score);
                                    return (
                                        <tr key={result.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {result.subject.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {result.subject.code}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {result.teacher?.user?.name || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {result.ca_score}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {result.exam_score}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">
                                                    {result.total_score}%
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${gradeInfo.color}`}>
                                                    {gradeInfo.grade}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                                {result.teacher_comment || '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Performance Analysis */}
                <Card>
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Performance Analysis</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-md font-medium text-gray-900 mb-3">Grade Distribution</h4>
                                <div className="space-y-2">
                                    {['A', 'B', 'C', 'D', 'F'].map(grade => {
                                        const count = results.filter(r => getGrade(r.total_score).grade === grade).length;
                                        const percentage = results.length > 0 ? safeToFixed(count / results.length * 100) : '0';
                                        return (
                                            <div key={grade} className="flex items-center justify-between">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(grade)}`}>
                                                    Grade {grade}
                                                </span>
                                                <span className="text-sm text-gray-600">
                                                    {count} subjects ({percentage}%)
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-md font-medium text-gray-900 mb-3">Performance Summary</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Your Average:</span>
                                        <span className="font-medium">{safeToFixed(statistics.average_score)}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Class Average:</span>
                                        <span className="font-medium">{hasValidClassAverage ? safeToFixed(numericClassAverage) : 'N/A'}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Difference:</span>
                                        <span className={`font-medium ${
                                            hasValidClassAverage && statistics.average_score > numericClassAverage 
                                                ? 'text-green-600' 
                                                : 'text-red-600'
                                        }`}>
                                            {hasValidClassAverage 
                                                ? `${safeToFixed(statistics.average_score - numericClassAverage)}%`
                                                : 'N/A'
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
