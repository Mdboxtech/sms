import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    PlusIcon, 
    PencilIcon, 
    TrashIcon,
    UserGroupIcon,
    AcademicCapIcon
} from '@heroicons/react/24/outline';
import Pagination from '@/Components/Pagination';

export default function Classrooms({ auth, classrooms = [], filters }) {
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

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this classroom?')) {
            router.delete(route('admin.classrooms.destroy', id));
        }
    };

    // Handle both paginated and array data with extensive validation
    let classroomsData = [];
    
    // Debug logging to understand the data structure
    console.log('Raw classrooms prop:', classrooms);
    console.log('Type of classrooms:', typeof classrooms);
    console.log('Is classrooms an array?', Array.isArray(classrooms));
    console.log('Classrooms keys:', classrooms ? Object.keys(classrooms) : 'null/undefined');
    
    // Safe data extraction with multiple fallbacks
    if (classrooms) {
        if (Array.isArray(classrooms)) {
            classroomsData = classrooms;
            console.log('Using classrooms directly as array');
        } else if (classrooms.data && Array.isArray(classrooms.data)) {
            classroomsData = classrooms.data;
            console.log('Using classrooms.data as array');
        } else if (typeof classrooms === 'object' && classrooms !== null) {
            // Try to extract array from object values
            const values = Object.values(classrooms);
            const arrayValue = values.find(val => Array.isArray(val));
            if (arrayValue) {
                classroomsData = arrayValue;
                console.log('Found array in object values');
            } else {
                console.warn('No array found in classrooms object');
                classroomsData = [];
            }
        }
    }
    
    console.log('Final classroomsData:', classroomsData);
    console.log('Is classroomsData an array?', Array.isArray(classroomsData));
    console.log('classroomsData length:', classroomsData.length);
    
    const hasClassrooms = Array.isArray(classroomsData) && classroomsData.length > 0;

    return (
        <AuthenticatedLayout>
            <Head title="Classrooms - SMS" />
            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Classrooms</h1>
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
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Add Classroom
                            </Link>
                        </div>
                    </div>

                    {/* Statistics */}
                    {classrooms.total && (
                        <div className="mb-6 text-sm text-gray-600">
                            Showing {classrooms.from} to {classrooms.to} of {classrooms.total} classrooms
                        </div>
                    )}

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            {!hasClassrooms ? (
                                <div className="text-center py-12">
                                    <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No classrooms found</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Get started by creating a new classroom.
                                    </p>
                                    <div className="mt-6">
                                        <Link
                                            href={route('admin.classrooms.create')}
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            <PlusIcon className="h-4 w-4 mr-2" />
                                            Add Classroom
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Classroom
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Section
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Students
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Subjects
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {Array.isArray(classroomsData) && classroomsData.map((classroom) => (
                                                    <tr key={classroom.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="flex-shrink-0 h-10 w-10">
                                                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                                        <AcademicCapIcon className="h-6 w-6 text-indigo-600" />
                                                                    </div>
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {classroom.name}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {classroom.description || 'No description'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {classroom.section || 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <UserGroupIcon className="h-4 w-4 text-gray-400 mr-2" />
                                                                <span className="text-sm text-gray-900">
                                                                    {classroom.students_count || 0} students
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {classroom.subjects_count || 0} subjects
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <div className="flex space-x-3">
                                                                <Link
                                                                    href={route('admin.classrooms.edit', classroom.id)}
                                                                    className="text-indigo-600 hover:text-indigo-900"
                                                                >
                                                                    <PencilIcon className="h-5 w-5" />
                                                                </Link>
                                                                <button
                                                                    onClick={() => handleDelete(classroom.id)}
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
                                    
                                    {/* Pagination */}
                                    {classrooms.links && (
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
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}