import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    PlusIcon, 
    PencilIcon, 
    TrashIcon,
    BookOpenIcon,
    AcademicCapIcon,
    EyeIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';

export default function Subjects({ auth, subjects = [] }) {
    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this subject?')) {
            Inertia.delete(route('admin.subjects.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Subjects - SMS" />
            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
                        <Link
                            href={route('admin.subjects.create')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Add Subject
                        </Link>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            {subjects.length === 0 ? (
                                <div className="text-center py-12">
                                    <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No subjects</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Get started by creating a new subject.
                                    </p>
                                    <div className="mt-6">
                                        <Link
                                            href={route('admin.subjects.create')}
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            <PlusIcon className="h-4 w-4 mr-2" />
                                            Add Subject
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Subject
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Code
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Class
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Teacher
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {subjects.map((subject) => (
                                                <tr key={subject.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10">
                                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                                    <BookOpenIcon className="h-6 w-6 text-blue-600" />
                                                                </div>
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {subject.name}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {subject.description || 'No description'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {subject.code || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <AcademicCapIcon className="h-4 w-4 text-gray-400 mr-2" />
                                                            <div>
                                                                {subject.classrooms && subject.classrooms.length > 0 ? (
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {subject.classrooms.map((classroom) => (
                                                                            <span key={classroom.id} 
                                                                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                                                {classroom.name}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-sm text-gray-500">No classes assigned</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <UserGroupIcon className="h-4 w-4 text-gray-400 mr-2" />
                                                            <div>
                                                                {subject.teachers && subject.teachers.length > 0 ? (
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {subject.teachers.map((teacher) => (
                                                                            <span key={teacher.id} 
                                                                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                                                {teacher.user.name}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-sm text-gray-500">No teachers assigned</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-3">
                                                            <Link
                                                                href={route('admin.subjects.show', subject.id)}
                                                                className="text-blue-600 hover:text-blue-900"
                                                            >
                                                                <EyeIcon className="h-5 w-5" />
                                                            </Link>
                                                            <Link
                                                                href={route('admin.subjects.edit', subject.id)}
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                            >
                                                                <PencilIcon className="h-5 w-5" />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(subject.id)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                <TrashIcon className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}