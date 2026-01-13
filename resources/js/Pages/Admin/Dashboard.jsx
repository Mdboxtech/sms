import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    UsersIcon,
    AcademicCapIcon,
    BookOpenIcon,
    ChartBarIcon,
    ClockIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboard({ auth, metrics, recent_results, class_distribution, latest_activities, current_term, current_session }) {
    return (
        <AuthenticatedLayout>
            <Head title="Admin Dashboard - SMS" />
            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-600">Welcome back, {auth.user.name}</p>
                        {current_term && current_term !== 'Not Set' && (
                            <p className="text-sm text-indigo-600 mt-1">
                                Current Term: {current_term} {current_session && current_session !== 'Not Set' ? `(${current_session})` : ''}
                            </p>
                        )}
                    </div>

                    {/* Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <UsersIcon className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Total Students</p>
                                        <p className="text-2xl font-semibold text-gray-900">{metrics.total_students}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <AcademicCapIcon className="h-8 w-8 text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Total Classes</p>
                                        <p className="text-2xl font-semibold text-gray-900">{metrics.total_classes}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <BookOpenIcon className="h-8 w-8 text-purple-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Total Subjects</p>
                                        <p className="text-2xl font-semibold text-gray-900">{metrics.total_subjects}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <ChartBarIcon className="h-8 w-8 text-orange-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Term Results</p>
                                        <p className="text-2xl font-semibold text-gray-900">{metrics.total_results}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Recent Results */}
                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Recent Results
                                    <span className="ml-2 text-sm font-normal text-gray-500">(Current Term)</span>
                                </h3>
                                <div className="space-y-4">
                                    {recent_results.length === 0 ? (
                                        <p className="text-gray-500">No recent results for current term</p>
                                    ) : (
                                        recent_results.map((result) => (
                                            <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">{result.student.user.name}</p>
                                                    <p className="text-sm text-gray-500">{result.subject.name}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-gray-900">{result.total_score}</p>
                                                    <p className="text-xs text-gray-500">{result.term && result.term.academicSession ? result.term.academicSession.name : 'N/A'}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Class Distribution */}
                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Distribution</h3>
                                <div className="space-y-4">
                                    {class_distribution.length === 0 ? (
                                        <p className="text-gray-500">No classes found</p>
                                    ) : (
                                        class_distribution.map((classData, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center">
                                                    <UserGroupIcon className="h-5 w-5 text-gray-400 mr-3" />
                                                    <span className="font-medium text-gray-900">{classData.name}</span>
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">{classData.student_count} students</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Latest Activities */}
                    <div className="mt-8 bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Latest Activities
                                <span className="ml-2 text-sm font-normal text-gray-500">(Current Term)</span>
                            </h3>
                            <div className="space-y-3">
                                {latest_activities.length === 0 ? (
                                    <p className="text-gray-500">No recent activities for current term</p>
                                ) : (
                                    latest_activities.map((activity, index) => (
                                        <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                            <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-900">{activity.message}</p>
                                                <p className="text-xs text-gray-500">{new Date(activity.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
