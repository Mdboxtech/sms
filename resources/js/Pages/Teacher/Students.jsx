import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, PageHeader } from '@/Components/UI';
import { useState } from 'react';
import { 
    UserGroupIcon, 
    MagnifyingGlassIcon,
    AcademicCapIcon,
    BookOpenIcon,
    DocumentTextIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';

export default function TeacherStudents({ students = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClass, setSelectedClass] = useState('');

    // Get unique classrooms from students
    const classrooms = [...new Set(students.map(student => student.classroom?.name).filter(Boolean))];

    // Filter students based on search and class selection
    const filteredStudents = students.filter(student => {
        const matchesSearch = student.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            student.admission_number.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = !selectedClass || student.classroom?.name === selectedClass;
        return matchesSearch && matchesClass;
    });

    return (
        <AuthenticatedLayout>
            <Head title="My Students - SMS" />
            
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <PageHeader 
                        title="My Students"
                        subtitle={`Managing ${students.length} student${students.length !== 1 ? 's' : ''} across your classes`}
                    />
                    <Link
                        href={route('teacher.results.create')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <DocumentTextIcon className="w-4 h-4 mr-2" />
                        Enter Results
                    </Link>
                </div>

                {/* Search and Filter */}
                <Card className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search Input */}
                        <div className="flex-1">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search students by name or admission number..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Class Filter */}
                        <div className="sm:w-48">
                            <div className="relative">
                                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <select
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                                >
                                    <option value="">All Classes</option>
                                    {classrooms.map(classroom => (
                                        <option key={classroom} value={classroom}>
                                            {classroom}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Students Grid */}
                {filteredStudents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStudents.map(student => (
                            <Card key={student.id} className="p-6 hover:shadow-lg transition-shadow duration-200">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                            <UserGroupIcon className="w-6 h-6 text-indigo-600" />
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-medium text-gray-900 truncate">
                                            {student.user.name}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Admission: {student.admission_number}
                                        </p>
                                        {student.classroom && (
                                            <div className="flex items-center mt-2">
                                                <AcademicCapIcon className="w-4 h-4 text-gray-400 mr-1" />
                                                <span className="text-sm text-gray-600">{student.classroom.name}</span>
                                            </div>
                                        )}
                                        
                                        {/* Student Subjects */}
                                        {student.classroom?.subjects && student.classroom.subjects.length > 0 && (
                                            <div className="mt-3">
                                                <div className="flex items-center mb-2">
                                                    <BookOpenIcon className="w-4 h-4 text-gray-400 mr-1" />
                                                    <span className="text-xs text-gray-500 font-medium">Subjects</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {student.classroom.subjects.slice(0, 3).map(subject => (
                                                        <span
                                                            key={subject.id}
                                                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                                        >
                                                            {subject.name}
                                                        </span>
                                                    ))}
                                                    {student.classroom.subjects.length > 3 && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                                            +{student.classroom.subjects.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Action Buttons */}
                                        <div className="flex space-x-2 mt-4">
                                            <Link
                                                href={route('teacher.results.create', { student_id: student.id })}
                                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                <DocumentTextIcon className="w-3 h-3 mr-1" />
                                                Add Result
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="p-12 text-center">
                        <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm || selectedClass 
                                ? "Try adjusting your search criteria."
                                : "You don't have any students assigned to your subjects yet."
                            }
                        </p>
                    </Card>
                )}

                {/* Quick Stats */}
                {filteredStudents.length > 0 && (
                    <Card className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-indigo-600">
                                    {filteredStudents.length}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {filteredStudents.length === 1 ? 'Student' : 'Students'} Found
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {classrooms.length}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {classrooms.length === 1 ? 'Class' : 'Classes'}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    {students.reduce((total, student) => 
                                        total + (student.classroom?.subjects?.length || 0), 0
                                    )}
                                </div>
                                <div className="text-sm text-gray-500">Total Subject Enrollments</div>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
