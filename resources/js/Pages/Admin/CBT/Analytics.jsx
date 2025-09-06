import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/ui/Card';
import { BarChart3, FileText, HelpCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

export default function Analytics({ auth, analytics }) {
    const { overview, examsBySubject, recentExams, questionsByDifficulty, questionsByType } = analytics;

    const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => {
        const colorClasses = {
            blue: 'bg-blue-50 text-blue-600',
            green: 'bg-green-50 text-green-600',
            yellow: 'bg-yellow-50 text-yellow-600',
            purple: 'bg-purple-50 text-purple-600',
        };

        return (
            <Card>
                <div className="flex items-center">
                    <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">{value}</h3>
                        <p className="text-sm text-gray-600">{title}</p>
                    </div>
                </div>
            </Card>
        );
    };

    const ChartCard = ({ title, data, type = 'bar' }) => (
        <Card>
            <h3 className="text-lg font-medium mb-4">{title}</h3>
            <div className="space-y-3">
                {data.map((item, index) => {
                    const percentage = Math.max((item.count / Math.max(...data.map(d => d.count))) * 100, 5);
                    return (
                        <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 flex-1">
                                {item.subject || item.difficulty || item.type}
                            </span>
                            <div className="flex-1 mx-3">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-8 text-right">
                                {item.count}
                            </span>
                        </div>
                    );
                })}
            </div>
        </Card>
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center space-x-4">
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        CBT Analytics Dashboard
                    </h2>
                </div>
            }
        >
            <Head title="CBT Analytics" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Overview Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard 
                            title="Total Exams" 
                            value={overview.totalExams} 
                            icon={FileText} 
                            color="blue" 
                        />
                        <StatCard 
                            title="Total Questions" 
                            value={overview.totalQuestions} 
                            icon={HelpCircle} 
                            color="green" 
                        />
                        <StatCard 
                            title="Active Exams" 
                            value={overview.activeExams} 
                            icon={Clock} 
                            color="yellow" 
                        />
                        <StatCard 
                            title="Completed Exams" 
                            value={overview.completedExams} 
                            icon={CheckCircle} 
                            color="purple" 
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Exams by Subject */}
                        <ChartCard 
                            title="Exams by Subject" 
                            data={examsBySubject} 
                        />

                        {/* Questions by Difficulty */}
                        <ChartCard 
                            title="Questions by Difficulty" 
                            data={questionsByDifficulty} 
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Questions by Type */}
                        <ChartCard 
                            title="Questions by Type" 
                            data={questionsByType} 
                        />

                        {/* Recent Exams */}
                        <Card>
                            <h3 className="text-lg font-medium mb-4">Recent Exams</h3>
                            <div className="space-y-3">
                                {recentExams.length > 0 ? (
                                    recentExams.map((exam, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <h4 className="font-medium text-gray-900">{exam.title}</h4>
                                                <p className="text-sm text-gray-600">
                                                    {exam.subject?.name} • by {exam.teacher?.name}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">
                                                    {new Date(exam.created_at).toLocaleDateString()}
                                                </p>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    exam.is_active 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {exam.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center py-4">No recent exams found</p>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Performance Insights */}
                    <Card className="mt-6">
                        <h3 className="text-lg font-medium mb-4 flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                            Performance Insights
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-medium text-blue-900">Question Bank Health</h4>
                                <p className="text-sm text-blue-700 mt-1">
                                    You have {overview.totalQuestions} questions across all subjects. 
                                    {overview.totalQuestions < 50 && " Consider adding more questions for better exam variety."}
                                </p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg">
                                <h4 className="font-medium text-green-900">Exam Activity</h4>
                                <p className="text-sm text-green-700 mt-1">
                                    {((overview.activeExams / overview.totalExams) * 100).toFixed(0)}% of your exams are currently active.
                                    {overview.activeExams === 0 && " Activate some exams to start testing."}
                                </p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg">
                                <h4 className="font-medium text-purple-900">Completion Rate</h4>
                                <p className="text-sm text-purple-700 mt-1">
                                    {overview.totalExams > 0 
                                        ? `${((overview.completedExams / overview.totalExams) * 100).toFixed(0)}% of exams have been completed.`
                                        : "No exam completion data yet."
                                    }
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
