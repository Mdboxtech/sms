import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    PencilIcon,
    TrashIcon,
    EyeIcon,
    PlusIcon,
    BookOpenIcon,
    AcademicCapIcon
} from '@heroicons/react/24/outline';
import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import Button from '@/Components/UI/Button';
import Pagination from '@/Components/Pagination';

export default function TeachersIndex({ auth, teachers, subjects, classrooms, flash, filters }) {
    const [showSubjectModal, setShowSubjectModal] = useState(false);
    const [showClassroomModal, setShowClassroomModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== (filters?.search || '')) {
                router.get(route('admin.teachers.index'), {
                    search: searchTerm
                }, {
                    preserveState: true,
                    preserveScroll: true,
                });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const subjectForm = useForm({
        teacher_id: '',
        subject_id: '',
    });

    const classroomForm = useForm({
        teacher_id: '',
        classroom_id: '',
    });

    const openSubjectModal = (teacher) => {
        setSelectedTeacher(teacher);
        subjectForm.setData('teacher_id', teacher.id);
        setShowSubjectModal(true);
    };

    const openClassroomModal = (teacher) => {
        setSelectedTeacher(teacher);
        classroomForm.setData('teacher_id', teacher.id);
        setShowClassroomModal(true);
    };

    const submitSubjectForm = (e) => {
        e.preventDefault();
        subjectForm.post(route('admin.teachers.assign.subject'), {
            onSuccess: () => {
                setShowSubjectModal(false);
                subjectForm.reset();
            },
        });
    };

    const submitClassroomForm = (e) => {
        e.preventDefault();
        classroomForm.post(route('admin.teachers.assign.classroom'), {
            onSuccess: () => {
                setShowClassroomModal(false);
                classroomForm.reset();
            },
        });
    };

    const handleDelete = (teacher) => {
        if (confirm(`Are you sure you want to delete ${teacher.user.name}?`)) {
            router.delete(route('admin.teachers.destroy', teacher.id));
        }
    };

    // Handle both paginated and array data
    const teachersData = teachers.data || teachers;
    const hasTeachers = Array.isArray(teachersData) ? teachersData.length > 0 : false;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Teachers</h2>}
        >
            <Head title="Teachers" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {flash.success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <span className="block sm:inline">{flash.success}</span>
                        </div>
                    )}
                    
                    {flash.error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <span className="block sm:inline">{flash.error}</span>
                        </div>
                    )}

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-medium text-gray-900">All Teachers</h2>
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
                                            placeholder="Search teachers..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                    
                                    <Link
                                        href={route('admin.teachers.create')}
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        <PlusIcon className="h-4 w-4 mr-1" />
                                        Add Teacher
                                    </Link>
                                </div>
                            </div>

                            {/* Statistics */}
                            {teachers.total && (
                                <div className="mb-6 text-sm text-gray-600">
                                    Showing {teachers.from} to {teachers.to} of {teachers.total} teachers
                                </div>
                            )}

                            {!hasTeachers ? (
                                <div className="text-center py-12">
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                        />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No teachers found</h3>
                                    <p className="mt-1 text-sm text-gray-500">Get started by adding a new teacher.</p>
                                    <div className="mt-6">
                                        <Link
                                            href={route('admin.teachers.create')}
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                            Add Teacher
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Name
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Employee ID
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Subjects
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Classes
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {teachersData.map((teacher) => (
                                                    <tr key={teacher.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                                    <span className="text-indigo-800 font-medium text-sm">
                                                                        {teacher.user.name.split(' ').map(n => n[0]).join('')}
                                                                    </span>
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-medium text-gray-900">{teacher.user.name}</div>
                                                                    <div className="text-sm text-gray-500">{teacher.user.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">{teacher.employee_id}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                                    {teacher.subjects.length}
                                                                </span>
                                                                <Button
                                                                    onClick={() => openSubjectModal(teacher)}
                                                                    variant="primary"
                                                                    size="xs"
                                                                    className="ml-2 flex items-center"
                                                                >
                                                                    <BookOpenIcon className="h-3 w-3 mr-1" />
                                                                    Assign
                                                                </Button>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                                    {teacher.classrooms.length}
                                                                </span>
                                                                <Button
                                                                    onClick={() => openClassroomModal(teacher)}
                                                                    variant="primary"
                                                                    size="xs"
                                                                    className="ml-2 flex items-center"
                                                                >
                                                                    <AcademicCapIcon className="h-3 w-3 mr-1" />
                                                                    Assign
                                                                </Button>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <div className="flex space-x-2">
                                                                <Button
                                                                    as={Link}
                                                                    href={route('admin.teachers.show', teacher.id)}
                                                                    variant="primary"
                                                                    size="sm"
                                                                    className="p-2"
                                                                >
                                                                    <EyeIcon className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    as={Link}
                                                                    href={route('admin.teachers.edit', teacher.id)}
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    className="p-2"
                                                                >
                                                                    <PencilIcon className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    onClick={() => handleDelete(teacher)}
                                                                    variant="danger"
                                                                    size="sm"
                                                                    className="p-2"
                                                                >
                                                                    <TrashIcon className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    {/* Pagination */}
                                    {teachers.links && (
                                        <div className="mt-6">
                                            <Pagination
                                                links={teachers.links}
                                                from={teachers.from}
                                                to={teachers.to}
                                                total={teachers.total}
                                                currentPage={teachers.current_page}
                                                lastPage={teachers.last_page}
                                                perPage={teachers.per_page}
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

            {/* Subject Assignment Modal */}
            <Modal show={showSubjectModal} onClose={() => setShowSubjectModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Assign Subject to {selectedTeacher?.user.name}
                    </h2>
                    <form onSubmit={submitSubjectForm}>
                        <div className="mb-4">
                            <label htmlFor="subject_id" className="block text-sm font-medium text-gray-700">
                                Select Subject
                            </label>
                            <select
                                id="subject_id"
                                name="subject_id"
                                value={subjectForm.data.subject_id}
                                onChange={(e) => subjectForm.setData('subject_id', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            >
                                <option value="">Select a subject</option>
                                {subjects.map((subject) => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </option>
                                ))}
                            </select>
                            {subjectForm.errors.subject_id && (
                                <div className="text-red-600 text-sm mt-1">{subjectForm.errors.subject_id}</div>
                            )}
                        </div>
                        <div className="flex justify-end space-x-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setShowSubjectModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={subjectForm.processing}
                            >
                                {subjectForm.processing ? 'Assigning...' : 'Assign Subject'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Classroom Assignment Modal */}
            <Modal show={showClassroomModal} onClose={() => setShowClassroomModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Assign Classroom to {selectedTeacher?.user.name}
                    </h2>
                    <form onSubmit={submitClassroomForm}>
                        <div className="mb-4">
                            <label htmlFor="classroom_id" className="block text-sm font-medium text-gray-700">
                                Select Classroom
                            </label>
                            <select
                                id="classroom_id"
                                name="classroom_id"
                                value={classroomForm.data.classroom_id}
                                onChange={(e) => classroomForm.setData('classroom_id', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            >
                                <option value="">Select a classroom</option>
                                {classrooms.map((classroom) => (
                                    <option key={classroom.id} value={classroom.id}>
                                        {classroom.name}
                                    </option>
                                ))}
                            </select>
                            {classroomForm.errors.classroom_id && (
                                <div className="text-red-600 text-sm mt-1">{classroomForm.errors.classroom_id}</div>
                            )}
                        </div>
                        <div className="flex justify-end space-x-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setShowClassroomModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={classroomForm.processing}
                            >
                                {classroomForm.processing ? 'Assigning...' : 'Assign Classroom'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
