import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, PageHeader } from '@/Components/UI';
import { 
    BookOpenIcon, 
    UserGroupIcon, 
    ChartBarIcon,
    AcademicCapIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function TeacherSubjects({ subjects = [] }) {
    return (
        <AuthenticatedLayout>
            <Head title="My Subjects - SMS" />
            
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <PageHeader 
                        title="My Subjects"
                        subtitle={`Managing ${subjects.length} subject${subjects.length !== 1 ? 's' : ''}`}
                    />
                    <Link
                        href={route('teacher.results.create')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <DocumentTextIcon className="w-4 h-4 mr-2" />
                        Enter Results
                    </Link>
                </div>

                {subjects.length === 0 ? (
                    <Card className="p-12 text-center">
                        <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Subjects Assigned</h3>
                        <p className="text-gray-500 mb-4">
                            You haven't been assigned to any subjects yet. Contact the administrator to get subjects assigned.
                        </p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subjects.map((subject) => (
                            <Card key={subject.id} className="p-6 hover:shadow-lg transition-shadow duration-200">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <BookOpenIcon className="h-8 w-8 text-indigo-600" />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-lg font-medium text-gray-900">{subject.name}</h3>
                                            <p className="text-sm text-gray-500">Code: {subject.code}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-3">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <UserGroupIcon className="h-4 w-4 mr-2" />
                                        <span>{subject.students_count || 0} students enrolled</span>
                                    </div>
                                    
                                    {subject.classrooms && subject.classrooms.length > 0 && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <AcademicCapIcon className="h-4 w-4 mr-2" />
                                            <span>Classes: {subject.classrooms.map(c => c.name).join(', ')}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 flex items-center justify-between">
                                    <Link
                                        href={route('teacher.results.create', { subject_id: subject.id })}
                                        className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                                    >
                                        Enter Results →
                                    </Link>
                                    <Link
                                        href={route('teacher.results.index', { subject_id: subject.id })}
                                        className="text-gray-600 hover:text-gray-500 text-sm"
                                    >
                                        <ChartBarIcon className="h-4 w-4" />
                                    </Link>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
} 
