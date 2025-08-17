import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    PencilIcon, 
    UserGroupIcon, 
    BookOpenIcon, 
    AcademicCapIcon,
    ArrowLeftIcon 
} from '@heroicons/react/24/outline';
import Card from '@/Components/UI/Card';

export default function Show({ auth, subject }) {
    return (
        <AuthenticatedLayout>
            <Head title={`${subject.name} Details - SMS`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('admin.subjects.index')}
                                className="flex items-center text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeftIcon className="h-5 w-5 mr-1" />
                                Back to Subjects
                            </Link>
                            <h1 className="text-2xl font-semibold text-gray-900">{subject.name}</h1>
                        </div>
                        <Link
                            href={route('admin.subjects.edit', subject.id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            <PencilIcon className="h-4 w-4 mr-2" />
                            Edit Subject
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <Card>
                            <div className="px-4 py-5">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                                <dl className="grid grid-cols-1 gap-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Subject Name</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{subject.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Subject Code</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{subject.code}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Description</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{subject.description || 'No description provided'}</dd>
                                    </div>
                                </dl>
                            </div>
                        </Card>

                        <Card>
                            <div className="px-4 py-5">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Assigned Classes</h3>
                                {subject.classrooms.length === 0 ? (
                                    <p className="text-sm text-gray-500">No classes assigned yet.</p>
                                ) : (
                                    <ul className="divide-y divide-gray-200">
                                        {subject.classrooms.map((classroom) => (
                                            <li key={classroom.id} className="py-3 flex justify-between items-center">
                                                <div className="flex items-center">
                                                    <AcademicCapIcon className="h-5 w-5 text-gray-400 mr-3" />
                                                    <span className="text-sm text-gray-900">{classroom.name}</span>
                                                </div>
                                                <Link
                                                    href={route('admin.classrooms.show', classroom.id)}
                                                    className="text-sm text-indigo-600 hover:text-indigo-900"
                                                >
                                                    View Class
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </Card>

                        <Card>
                            <div className="px-4 py-5">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Assigned Teachers</h3>
                                {subject.teachers.length === 0 ? (
                                    <p className="text-sm text-gray-500">No teachers assigned yet.</p>
                                ) : (
                                    <ul className="divide-y divide-gray-200">
                                        {subject.teachers.map((teacher) => (
                                            <li key={teacher.id} className="py-3 flex justify-between items-center">
                                                <div className="flex items-center">
                                                    <UserGroupIcon className="h-5 w-5 text-gray-400 mr-3" />
                                                    <span className="text-sm text-gray-900">{teacher.user.name}</span>
                                                </div>
                                                <Link
                                                    href={route('admin.teachers.show', teacher.id)}
                                                    className="text-sm text-indigo-600 hover:text-indigo-900"
                                                >
                                                    View Profile
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </Card>
                        {subject.results && subject.results.length > 0 && (
                            <Card>
                                <div className="px-4 py-5">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Results</h3>
                                    <ul className="divide-y divide-gray-200">
                                        {subject.results.slice(0, 5).map((result) => (
                                            <li key={result.id} className="py-3 flex justify-between items-center">
                                                <div className="flex items-center">
                                                    <BookOpenIcon className="h-5 w-5 text-gray-400 mr-3" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {result.student.user.name}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Score: {result.total_score}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Link
                                                    href={route('admin.results.show', result.id)}
                                                    className="text-sm text-indigo-600 hover:text-indigo-900"
                                                >
                                                    View Result
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
