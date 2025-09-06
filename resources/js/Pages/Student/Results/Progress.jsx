import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, PageHeader } from '@/Components/UI';
import { 
    ArrowLeftIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    MinusIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

export default function Progress({ progress_data, student }) {
    const getGrade = (score) => {
        if (score >= 70) return { grade: 'A', remark: 'Excellent', color: 'text-green-600 bg-green-100' };
        if (score >= 60) return { grade: 'B', remark: 'Very Good', color: 'text-green-500 bg-green-50' };
        if (score >= 50) return { grade: 'C', remark: 'Good', color: 'text-blue-500 bg-blue-50' };
        if (score >= 40) return { grade: 'D', remark: 'Pass', color: 'text-yellow-600 bg-yellow-50' };
        return { grade: 'F', remark: 'Fail', color: 'text-red-500 bg-red-50' };
    };

    const getTrendIcon = (current, previous) => {
        if (!previous) return <MinusIcon className="h-4 w-4 text-gray-400" />;
        if (current > previous) return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
        if (current < previous) return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
        return <MinusIcon className="h-4 w-4 text-gray-400" />;
    };

    const getTrendColor = (current, previous) => {
        if (!previous) return 'text-gray-400';
        if (current > previous) return 'text-green-500';
        if (current < previous) return 'text-red-500';
        return 'text-gray-400';
    };

    const getOverallStats = () => {
        if (progress_data.length === 0) return null;
        
        const scores = progress_data.map(p => p.average_score);
        const latest = scores[scores.length - 1];
        const first = scores[0];
        const improvement = latest - first;
        const bestTerm = progress_data.reduce((best, current) => 
            current.average_score > best.average_score ? current : best
        );
        
        return {
            total_terms: progress_data.length,
            latest_average: latest,
            improvement: improvement,
            best_term: bestTerm,
            highest_score: Math.max(...scores),
            lowest_score: Math.min(...scores)
        };
    };

    const stats = getOverallStats();

    return (
        <AuthenticatedLayout>
            <Head title="Academic Progress" />
            
            <div className="space-y-6">
                <PageHeader
                    title="Academic Progress"
                    subtitle={`Progress tracking for ${student.user.name} (${student.admission_number})`}
                    actions={
                        <Link
                            href={route('student.results.index')}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Back to Results
                        </Link>
                    }
                />

                {progress_data.length === 0 ? (
                    <Card>
                        <div className="text-center py-12">
                            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No progress data</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                No academic records found. Results will appear here once they are published.
                            </p>
                        </div>
                    </Card>
                ) : (
                    <>
                        {/* Overall Statistics */}
                        {stats && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Card>
                                    <div className="p-6">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <span className="text-blue-600 font-bold text-sm">T</span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-500">Total Terms</p>
                                                <p className="text-2xl font-bold text-gray-900">{stats.total_terms}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <Card>
                                    <div className="p-6">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                                    <span className="text-green-600 font-bold text-sm">L</span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-500">Latest Average</p>
                                                <p className="text-2xl font-bold text-gray-900">{stats.latest_average.toFixed(1)}%</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <Card>
                                    <div className="p-6">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                                    stats.improvement >= 0 ? 'bg-green-100' : 'bg-red-100'
                                                }`}>
                                                    {stats.improvement >= 0 ? (
                                                        <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
                                                    ) : (
                                                        <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-500">Overall Improvement</p>
                                                <p className={`text-2xl font-bold ${
                                                    stats.improvement >= 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {stats.improvement >= 0 ? '+' : ''}{stats.improvement.toFixed(1)}%
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <Card>
                                    <div className="p-6">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                                                    <span className="text-yellow-600 font-bold text-sm">B</span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-500">Best Performance</p>
                                                <p className="text-2xl font-bold text-gray-900">{stats.highest_score.toFixed(1)}%</p>
                                                <p className="text-xs text-gray-500">{stats.best_term.term}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* Progress Timeline */}
                        <Card>
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Academic Progress Timeline</h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-6">
                                    {progress_data.map((term, index) => {
                                        const previousTerm = index > 0 ? progress_data[index - 1] : null;
                                        const gradeInfo = getGrade(term.average_score);
                                        const trendIcon = getTrendIcon(term.average_score, previousTerm?.average_score);
                                        const trendColor = getTrendColor(term.average_score, previousTerm?.average_score);
                                        
                                        return (
                                            <div key={term.term_id} className="relative">
                                                {index !== progress_data.length - 1 && (
                                                    <div className="absolute left-6 top-12 h-6 w-0.5 bg-gray-200"></div>
                                                )}
                                                <div className="flex items-start space-x-4">
                                                    <div className="flex-shrink-0">
                                                        <div className="h-12 w-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                                                            <span className="text-sm font-medium text-gray-600">
                                                                {index + 1}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="bg-gray-50 rounded-lg p-4">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h4 className="text-sm font-medium text-gray-900">
                                                                    {term.term}
                                                                </h4>
                                                                <div className="flex items-center space-x-2">
                                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${gradeInfo.color}`}>
                                                                        {gradeInfo.grade}
                                                                    </span>
                                                                    {trendIcon}
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                                <div>
                                                                    <span className="text-gray-500">Average Score:</span>
                                                                    <span className="ml-1 font-medium text-gray-900">
                                                                        {term.average_score.toFixed(1)}%
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500">Subjects:</span>
                                                                    <span className="ml-1 font-medium text-gray-900">
                                                                        {term.total_subjects}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500">Grade:</span>
                                                                    <span className="ml-1 font-medium text-gray-900">
                                                                        {gradeInfo.grade} ({gradeInfo.remark})
                                                                    </span>
                                                                </div>
                                                                {previousTerm && (
                                                                    <div>
                                                                        <span className="text-gray-500">Change:</span>
                                                                        <span className={`ml-1 font-medium ${trendColor}`}>
                                                                            {term.average_score > previousTerm.average_score ? '+' : ''}
                                                                            {(term.average_score - previousTerm.average_score).toFixed(1)}%
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="mt-3">
                                                                <Link
                                                                    href={route('student.results.term', term.term_id)}
                                                                    className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                                                                >
                                                                    View detailed results →
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </Card>

                        {/* Performance Chart Placeholder */}
                        <Card>
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Performance Chart</h3>
                            </div>
                            <div className="p-6">
                                <div className="text-center py-8">
                                    <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Performance Visualization</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Interactive charts and graphs will be available in a future update.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
