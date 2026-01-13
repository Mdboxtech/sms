import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    GraduationCap,
    BookOpen,
    BarChart3,
    FileText,
    User,
    Calendar
} from 'lucide-react';

export default function StudentDashboard({ auth, student_info, current_results }) {
    return (
        <AuthenticatedLayout>
            <Head title="Student Dashboard - SMS" />
            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
                        <p className="text-gray-600">Welcome back, {auth.user.name}</p>
                    </div>

                    {/* Student Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <GraduationCap className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Class</p>
                                        <p className="text-lg font-semibold text-gray-900">{student_info.classroom}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <User className="h-8 w-8 text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Admission No.</p>
                                        <p className="text-lg font-semibold text-gray-900">{student_info.admission_number}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <Calendar className="h-8 w-8 text-purple-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Current Term</p>
                                        <p className="text-lg font-semibold text-gray-900">{student_info.current_term}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <BookOpen className="h-8 w-8 text-orange-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Session</p>
                                        <p className="text-lg font-semibold text-gray-900">{student_info.current_session}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Current Term Results */}
                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Current Term Results</h3>
                                    <Link
                                        href={route('student.results.index')}
                                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                    >
                                        View All Results
                                    </Link>
                                </div>
                                <div className="space-y-4">
                                    {current_results.length === 0 ? (
                                        <p className="text-gray-500">No results for current term</p>
                                    ) : (
                                        current_results.map((result) => (
                                            <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">{result.subject.name}</p>
                                                    <p className="text-sm text-gray-500">{result.term && result.term.academicSession ? result.term.academicSession.name : 'N/A'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-gray-900">{result.total_score}</p>
                                                    <p className="text-xs text-gray-500">Position: {result.position || 'N/A'}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                                <div className="space-y-4">
                                    <Link
                                        href={route('student.results.index')}
                                        className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                        <BarChart3 className="h-6 w-6 text-blue-600 mr-3" />
                                        <div>
                                            <p className="font-medium text-blue-900">View My Results</p>
                                            <p className="text-sm text-blue-700">Check all your academic results</p>
                                        </div>
                                    </Link>

                                    <Link
                                        href={route('student.results.progress')}
                                        className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                    >
                                        <FileText className="h-6 w-6 text-green-600 mr-3" />
                                        <div>
                                            <p className="font-medium text-green-900">View Progress</p>
                                            <p className="text-sm text-green-700">Check your academic progress</p>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
