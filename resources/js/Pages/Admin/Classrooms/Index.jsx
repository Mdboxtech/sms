import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import Button from '@/Components/UI/Button';
import Pagination from '@/Components/Pagination';
import { 
    School,
    PlusCircle,
    Pencil,
    Trash2,
    Users,
    BookOpen,
    Eye
} from 'lucide-react';

export default function Index({ classrooms, filters }) {
    const [deleteModal, setDeleteModal] = useState(false);
    const [classroomToDelete, setClassroomToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== (filters?.search || '')) {
                router.get(route('admin.classrooms.index'), {
                    search: searchTerm
                }, {
                    preserveState: true,
                    preserveScroll: true,
                });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

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

    // Safe data extraction with null checks
    const classroomsData = React.useMemo(() => {
        try {
            if (!classrooms) return [];
            
            if (Array.isArray(classrooms)) {
                return classrooms;
            }
            
            if (classrooms && typeof classrooms === 'object' && classrooms.data) {
                if (Array.isArray(classrooms.data)) {
                    return classrooms.data;
                }
            }
            
            return [];
        } catch (error) {
            console.error('Error extracting classrooms data:', error);
            return [];
        }
    }, [classrooms]);
    
    const hasClassrooms = classroomsData.length > 0;

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
                                <div className="flex items-center space-x-4">
                                    {/* Search Bar */}
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search classrooms..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                    
                                    <Link
                                        href={route('admin.classrooms.create')}
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        <PlusCircle className="w-4 h-4 mr-2" />
                                        Add Classroom
                                    </Link>
                                </div>
                            </div>

                            {/* Statistics */}
                            {classrooms?.total && (
                                <div className="mb-6 text-sm text-gray-600">
                                    Showing {classrooms.from} to {classrooms.to} of {classrooms.total} classrooms
                                </div>
                            )}

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
                                        {hasClassrooms ? (
                                            classroomsData.map((classroom, index) => {
                                                if (!classroom || typeof classroom !== 'object') {
                                                    return null;
                                                }
                                                return (
                                                    <tr key={classroom.id || `classroom-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <School className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                        {classroom.name || 'Unnamed'}
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
                                                            {classroom.section || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                                <Users className="w-4 h-4 mr-1" />
                                                                {classroom.students_count || 0} / {classroom.capacity || 0}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                                <BookOpen className="w-4 h-4 mr-1" />
                                                                {classroom.subjects_count || 0}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                            <Button
                                                                as={Link}
                                                                href={route('admin.classrooms.show', classroom.id)}
                                                                variant="primary"
                                                                size="sm"
                                                                className="inline-flex items-center"
                                                            >
                                                                <Eye className="w-4 h-4 mr-1" />
                                                                View
                                                            </Button>
                                                            <Button
                                                                as={Link}
                                                                href={route('admin.classrooms.edit', classroom.id)}
                                                                variant="secondary"
                                                                size="sm"
                                                                className="inline-flex items-center"
                                                            >
                                                                <Pencil className="w-4 h-4 mr-1" />
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                onClick={() => confirmDelete(classroom)}
                                                                variant="danger"
                                                                size="sm"
                                                                className="inline-flex items-center"
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-1" />
                                                                Delete
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center">
                                                    <School className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                                        No classrooms found
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
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                {/* Pagination */}
                                {classrooms?.links && Array.isArray(classrooms.links) && classrooms.links.length > 3 && (
                                    <div className="mt-6">
                                        <Pagination
                                            links={classrooms.links}
                                            from={classrooms.from}
                                            to={classrooms.to}
                                            total={classrooms.total}
                                            currentPage={classrooms.current_page}
                                            lastPage={classrooms.last_page}
                                            perPage={classrooms.per_page}
                                            preserveState={true}
                                            preserveScroll={true}
                                        />
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
                        <Button
                            variant="secondary"
                            onClick={() => setDeleteModal(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="danger"
                            onClick={handleDelete}
                            className="inline-flex items-center"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Classroom
                        </Button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
