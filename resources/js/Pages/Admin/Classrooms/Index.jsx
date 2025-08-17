import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { 
    School,
    PlusCircle,
    Pencil,
    Trash2,
    Users,
    BookOpen,
    Eye
} from 'lucide-react';

export default function Index({ classrooms }) {
    const [deleteModal, setDeleteModal] = useState(false);
    const [classroomToDelete, setClassroomToDelete] = useState(null);

    const confirmDelete = (classroom) => {
        setClassroomToDelete(classroom);
        setDeleteModal(true);
    };

    const handleDelete = () => {
        if (classroomToDelete) {
            router.delete(route('admin.classrooms.destroy', classroomToDelete.id), {
                onSuccess: () => {
                    setDeleteModal(false);
                    setClassroomToDelete(null);
                },
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Classrooms" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center">
                                    <School className="w-8 h-8 text-indigo-500 mr-2" />
                                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                                        Classrooms
                                    </h2>
                                </div>
                                <Link
                                    href={route('admin.classrooms.create')}
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Add Classroom
                                </Link>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Class Details
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Section
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Students
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Subjects
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {classrooms.map((classroom) => (
                                            <tr key={classroom.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <School className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {classroom.name}
                                                            </div>
                                                            {classroom.description && (
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {classroom.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {classroom.section}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                        <Users className="w-4 h-4 mr-1" />
                                                        {classroom.students_count} / {classroom.capacity}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                        <BookOpen className="w-4 h-4 mr-1" />
                                                        {classroom.subjects_count}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                                    <Link
                                                        href={route('admin.classrooms.show', classroom.id)}
                                                        className="inline-flex items-center text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                                                    >
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        View
                                                    </Link>
                                                    <Link
                                                        href={route('admin.classrooms.edit', classroom.id)}
                                                        className="inline-flex items-center text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                    >
                                                        <Pencil className="w-4 h-4 mr-2" />
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => confirmDelete(classroom)}
                                                        className="inline-flex items-center text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {classrooms.length === 0 && (
                                    <div className="text-center py-12">
                                        <School className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                            No classrooms
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            Get started by creating a new classroom.
                                        </p>
                                        <div className="mt-6">
                                            <Link
                                                href={route('admin.classrooms.create')}
                                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                <PlusCircle className="w-5 h-5 mr-2" />
                                                New Classroom
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal show={deleteModal} onClose={() => setDeleteModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Delete Classroom
                    </h2>

                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to delete {classroomToDelete?.name}? This action cannot be undone
                        and will remove all class data.
                    </p>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-500 rounded-md font-semibold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-25 transition ease-in-out duration-150"
                            onClick={() => setDeleteModal(false)}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 active:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150"
                            onClick={handleDelete}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Classroom
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
