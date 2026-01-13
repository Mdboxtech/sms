import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, PageHeader } from '@/Components/UI';
import {
    BookOpenIcon,
    UserGroupIcon,
    ChartBarIcon,
    AcademicCapIcon,
    CalendarIcon,
    DocumentTextIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
import { Link } from '@inertiajs/react';

export default function Dashboard({ auth, metrics, recent_results, my_classes, my_subjects, current_term }) {
    const quickActions = [
        {
            name: 'Mark Attendance',
            href: route('teacher.attendance.create'),
            icon: CalendarIcon,
            description: 'Mark student attendance'
        },
        {
            name: 'View Attendance',
            href: route('teacher.attendance.index'),
            icon: DocumentTextIcon,
            description: 'View attendance records'
        },
        {
            name: 'Enter Results',
            href: route('teacher.results.create'),
            icon: DocumentTextIcon,
            description: 'Record student results'
        },
        {
            name: 'View Results',
            href: route('teacher.results.index'),
            icon: ChartBarIcon,
            description: 'Review entered results'
        },
        {
            name: 'Bulk Entry',
            href: route('teacher.results.bulk-create'),
            icon: PlusIcon,
            description: 'Enter multiple results'
        },
        {
            name: 'My Students',
            href: route('teacher.students'),
            icon: UserGroupIcon,
            description: 'View my students'
        }
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Teacher Dashboard - SMS" />

            <div className="space-y-6">
                <PageHeader
                    title={`Welcome back, ${auth.user.name}!`}
                    subtitle={`Manage your classes and students${current_term && current_term !== 'Not Set' ? ` - ${current_term}` : ''}`}
                />

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <BookOpenIcon className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">My Subjects</p>
                                <p className="text-2xl font-semibold text-gray-900">{metrics.my_subjects}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <UserGroupIcon className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">My Classes</p>
                                <p className="text-2xl font-semibold text-gray-900">{metrics.my_classes}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <AcademicCapIcon className="h-8 w-8 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Students</p>
                                <p className="text-2xl font-semibold text-gray-900">{metrics.total_students}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ChartBarIcon className="h-8 w-8 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Pending Results</p>
                                <p className="text-2xl font-semibold text-gray-900">{metrics.pending_results}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                href={action.href}
                                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            >
                                <div className="flex items-center">
                                    <action.icon className="h-8 w-8 text-indigo-600" />
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">{action.name}</p>
                                        <p className="text-xs text-gray-500">{action.description}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* My Subjects */}
                    <Card className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">My Subjects</h3>
                        {my_subjects && my_subjects.length > 0 ? (
                            <div className="space-y-3">
                                {my_subjects.map((subject) => (
                                    <div key={subject.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">{subject.name}</p>
                                            <p className="text-sm text-gray-500">Code: {subject.code}</p>
                                        </div>
                                        <BookOpenIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No subjects assigned</p>
                        )}
                    </Card>

                    {/* My Classes */}
                    <Card className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">My Classes</h3>
                        {my_classes && my_classes.length > 0 ? (
                            <div className="space-y-3">
                                {my_classes.map((classroom) => (
                                    <div key={classroom.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">{classroom.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {classroom.students ? classroom.students.length : 0} students
                                            </p>
                                        </div>
                                        <UserGroupIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No classes assigned</p>
                        )}
                    </Card>
                </div>

                {/* Recent Results */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                            Recent Results
                            <span className="ml-2 text-sm font-normal text-gray-500">(Current Term)</span>
                        </h3>
                        <Link
                            href={route('teacher.results.index')}
                            className="text-sm text-indigo-600 hover:text-indigo-500"
                        >
                            View all
                        </Link>
                    </div>
                    {recent_results && recent_results.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Student
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Subject
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Term
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Score
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Grade
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recent_results.map((result) => (
                                        <tr key={result.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {result.student?.user?.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {result.subject?.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {result.term?.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {result.total_score}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${result.grade === 'A' ? 'bg-green-100 text-green-800' :
                                                        result.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                                                            result.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                                                                result.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                                                                    'bg-red-100 text-red-800'
                                                    }`}>
                                                    {result.grade}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500">No recent results</p>
                    )}
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
