import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import { 
    School,
    Users,
    BookOpen,
    ArrowLeft,
    Pencil,
    UserCheck,
    GraduationCap
} from 'lucide-react';

export default function Show({ classroom, students }) {
    return (
        <AuthenticatedLayout>
            <Head title={`${classroom.name} - Classroom Details`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <School className="w-8 h-8 text-indigo-500 mr-2" />
                                    <div>
                                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                                            {classroom.name} - {classroom.section}
                                        </h2>
                                        {classroom.description && (
                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                {classroom.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-x-3">
                                    <Link
                                        href={route('admin.classrooms.index')}
                                        className="inline-flex items-center px-4 py-2 bg-gray-800 dark:bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-white dark:text-gray-800 uppercase tracking-widest hover:bg-gray-700 dark:hover:bg-white focus:bg-gray-700 dark:focus:bg-white active:bg-gray-900 dark:active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back to Classrooms
                                    </Link>
                                    <Link
                                        href={route('admin.classrooms.edit', classroom.id)}
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        <Pencil className="w-4 h-4 mr-2" />
                                        Edit Classroom
                                    </Link>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Students Section */}
                                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                                                <Users className="w-5 h-5 mr-2 text-indigo-500" />
                                                Students
                                            </h3>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {students?.total || 0} / {classroom.capacity}
                                            </span>
                                        </div>
                                        
                                        {students?.data && students.data.length > 0 ? (
                                            <>
                                                <div className="space-y-3 mb-4">
                                                    {students.data.map(student => (
                                                        <div 
                                                            key={student.id}
                                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                                        >
                                                            <div className="flex items-center">
                                                                <GraduationCap className="w-5 h-5 text-gray-400 mr-3" />
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                        {student.user?.name || 'Unknown Student'}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                        ID: {student.admission_number}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                
                                                {/* Pagination for students */}
                                                {students.links && students.links.length > 3 && (
                                                    <div className="mt-4">
                                                        <Pagination
                                                            links={students.links}
                                                            from={students.from}
                                                            to={students.to}
                                                            total={students.total}
                                                            currentPage={students.current_page}
                                                            lastPage={students.last_page}
                                                            perPage={students.per_page}
                                                            preserveState={true}
                                                            preserveScroll={true}
                                                        />
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                No students assigned to this classroom yet.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Teachers & Subjects Section */}
                                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700">
                                    <div className="p-6">
                                        <div className="mb-6">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center mb-4">
                                                <UserCheck className="w-5 h-5 mr-2 text-indigo-500" />
                                                Teachers
                                            </h3>
                                            {classroom.teachers && classroom.teachers.length > 0 ? (
                                                <div className="space-y-3">
                                                    {classroom.teachers.map(teacher => (
                                                        <div 
                                                            key={teacher.id}
                                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                                        >
                                                            <div className="flex items-center">
                                                                <UserCheck className="w-5 h-5 text-gray-400 mr-3" />
                                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {teacher.user?.name || teacher.name || 'Unknown Teacher'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    No teachers assigned to this classroom yet.
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center mb-4">
                                                <BookOpen className="w-5 h-5 mr-2 text-indigo-500" />
                                                Subjects
                                            </h3>
                                            {classroom.subjects && classroom.subjects.length > 0 ? (
                                                <div className="space-y-3">
                                                    {classroom.subjects.map(subject => (
                                                        <div 
                                                            key={subject.id}
                                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                                        >
                                                            <div className="flex items-center">
                                                                <BookOpen className="w-5 h-5 text-gray-400 mr-3" />
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                        {subject.name}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                        Code: {subject.code}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    No subjects assigned to this classroom yet.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
