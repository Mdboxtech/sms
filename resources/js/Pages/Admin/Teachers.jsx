import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    UserIcon,
    AcademicCapIcon,
    BookOpenIcon
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import Card from '@/Components/UI/Card';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import SelectInput from '@/Components/SelectInput';

export default function Teachers({ auth, teachers = [], subjects = [], classrooms = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [assignmentType, setAssignmentType] = useState('subject'); // 'subject' or 'classroom'
    
    const { data, setData, post, processing, errors, reset } = useForm({
        teacher_id: '',
        subject_id: '',
        classroom_id: '',
    });

    const openAssignModal = (teacher, type) => {
        setSelectedTeacher(teacher);
        setAssignmentType(type);
        setData('teacher_id', teacher.id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (assignmentType === 'subject') {
            post(route('admin.teachers.assign.subject'), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('admin.teachers.assign.classroom'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this teacher?')) {
            // Handle delete
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Teachers - SMS" />
            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
                        <Link
                            href={route('admin.teachers.create')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Add Teacher
                        </Link>
                    </div>

                    <Card>
                        {teachers.length === 0 ? (
                            <div className="text-center py-12">
                                <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No teachers</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Get started by creating a new teacher.
                                </p>
                                <div className="mt-6">
                                    <Link
                                        href={route('admin.teachers.create')}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        <PlusIcon className="h-4 w-4 mr-2" />
                                        Add Teacher
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Teacher
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Employee ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Assigned Subjects
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Assigned Classes
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {teachers.map((teacher) => (
                                            <tr key={teacher.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                                <UserIcon className="h-6 w-6 text-indigo-600" />
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {teacher.user?.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {teacher.user?.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {teacher.employee_id || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center mb-2">
                                                            <BookOpenIcon className="h-4 w-4 text-gray-400 mr-2" />
                                                            <span className="text-sm text-gray-900">
                                                                {teacher.subjects?.length || 0} subjects
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => openAssignModal(teacher, 'subject')}
                                                            className="text-xs text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Assign Subject
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center mb-2">
                                                            <AcademicCapIcon className="h-4 w-4 text-gray-400 mr-2" />
                                                            <span className="text-sm text-gray-900">
                                                                {teacher.classrooms?.length || 0} classes
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => openAssignModal(teacher, 'classroom')}
                                                            className="text-xs text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Assign Class
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-3">
                                                        <Link
                                                            href={route('admin.teachers.edit', teacher.id)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            <PencilIcon className="h-5 w-5" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(teacher.id)}
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
                    </Card>
                </div>
            </div>

            {/* Assignment Modal */}
            <Modal show={isModalOpen} onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        {assignmentType === 'subject' ? 'Assign Subject' : 'Assign Class'} to {selectedTeacher?.user?.name}
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                        {assignmentType === 'subject' ? (
                            <div>
                                <InputLabel htmlFor="subject_id" value="Subject" />
                                <SelectInput
                                    id="subject_id"
                                    name="subject_id"
                                    value={data.subject_id}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('subject_id', e.target.value)}
                                    required
                                >
                                    <option value="">Select a subject</option>
                                    {subjects.map((subject) => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.name} ({subject.code})
                                        </option>
                                    ))}
                                </SelectInput>
                                <InputError message={errors.subject_id} className="mt-2" />
                            </div>
                        ) : (
                            <div>
                                <InputLabel htmlFor="classroom_id" value="Classroom" />
                                <SelectInput
                                    id="classroom_id"
                                    name="classroom_id"
                                    value={data.classroom_id}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('classroom_id', e.target.value)}
                                    required
                                >
                                    <option value="">Select a classroom</option>
                                    {classrooms.map((classroom) => (
                                        <option key={classroom.id} value={classroom.id}>
                                            {classroom.name}
                                        </option>
                                    ))}
                                </SelectInput>
                                <InputError message={errors.classroom_id} className="mt-2" />
                            </div>
                        )}

                        <div className="flex items-center justify-end mt-4">
                            <button
                                type="button"
                                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150 mr-3"
                                onClick={closeModal}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                disabled={processing}
                            >
                                {processing ? 'Assigning...' : 'Assign'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}