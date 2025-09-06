import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DataTable from '@/Components/DataTable';
import Button from '@/Components/ui/Button';
import Card from '@/Components/ui/Card';
import { FormInput, FormLabel, FormSelect } from '@/Components/UI';
import { CheckSquare, PenTool, BookOpen, BarChart3 } from 'lucide-react';

export default function Index({ 
    auth, 
    exams, 
    subjects, 
    teachers, 
    filters
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedSubject, setSelectedSubject] = useState(filters.subject_id || '');
    const [selectedTeacher, setSelectedTeacher] = useState(filters.teacher_id || '');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = () => {
        router.get(route('admin.cbt.exams.index'), {
            search: searchTerm,
            subject_id: selectedSubject,
            teacher_id: selectedTeacher,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedSubject('');
        setSelectedTeacher('');
        router.get(route('admin.cbt.exams.index'));
    };

    const handleDelete = (examId) => {
        if (confirm('Are you sure you want to delete this exam?')) {
            router.delete(route('admin.cbt.exams.destroy', examId), {
                onSuccess: () => {
                    alert('Exam deleted successfully');
                },
                onError: (errors) => {
                    alert('Failed to delete exam');
                }
            });
        }
    };

    const getBadgeClasses = (type, value) => {
        const baseClasses = 'inline-block px-2 py-1 text-xs font-semibold rounded-full';
        
        if (type === 'status') {
            switch (value) {
                case 'draft': return baseClasses + ' bg-gray-100 text-gray-800';
                case 'scheduled': return baseClasses + ' bg-blue-100 text-blue-800';
                case 'active': return baseClasses + ' bg-green-100 text-green-800';
                case 'completed': return baseClasses + ' bg-purple-100 text-purple-800';
                case 'cancelled': return baseClasses + ' bg-red-100 text-red-800';
                default: return baseClasses + ' bg-gray-100 text-gray-800';
            }
        }
        
        if (type === 'exam_type') {
            switch (value) {
                case 'test': return baseClasses + ' bg-blue-100 text-blue-800';
                case 'exam': return baseClasses + ' bg-red-100 text-red-800';
                case 'quiz': return baseClasses + ' bg-green-100 text-green-800';
                case 'assignment': return baseClasses + ' bg-yellow-100 text-yellow-800';
                default: return baseClasses + ' bg-gray-100 text-gray-800';
            }
        }
        
        return baseClasses + ' bg-gray-100 text-gray-800';
    };

    const columns = [
        {
            header: 'Exam Details',
            render: (exam) => (
                <div className="max-w-md">
                    <p className="font-medium text-gray-900">
                        {exam.title}
                    </p>
                    <p className="text-sm text-gray-500">
                        {exam.subject?.name} - {exam.term?.name}
                    </p>
                    <p className="text-xs text-gray-400">
                        {exam.total_marks} marks • {exam.duration_minutes} minutes
                    </p>
                </div>
            )
        },
        {
            header: 'Teacher',
            render: (exam) => (
                <div>
                    <p className="text-sm font-medium text-gray-900">
                        {exam.teacher?.name || 'N/A'}
                    </p>
                </div>
            )
        },
        {
            header: 'Type',
            render: (exam) => (
                <span className={getBadgeClasses('exam_type', exam.exam_type)}>
                    {exam.exam_type?.replace('_', ' ').toUpperCase()}
                </span>
            )
        },
        {
            header: 'Status',
            render: (exam) => (
                <span className={getBadgeClasses('status', exam.is_published ? 'published' : 'draft')}>
                    {exam.is_published ? 'Published' : 'Draft'}
                </span>
            )
        },
        {
            header: 'Questions',
            render: (exam) => (
                <div>
                    <p className="text-sm text-gray-900">
                        {exam.questions_count || 0} questions
                    </p>
                </div>
            )
        },
        {
            header: 'Actions',
            render: (exam) => (
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.get(route('admin.cbt.exams.show', exam.id))}
                    >
                        View
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.get(route('admin.cbt.exams.edit', exam.id))}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(exam.id)}
                    >
                        Delete
                    </Button>
                </div>
            )
        }
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        CBT Exams Management
                    </h2>
                    <Link href={route('admin.cbt.exams.create')}>
                        <Button variant="primary">
                            Create Exam
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title="CBT Exams" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Quick Actions */}
                    <Card className="mb-6 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Link href={route('admin.cbt.exams.create')}>
                                <Button variant="primary" className="w-full justify-center">
                                    <CheckSquare className="w-4 h-4 mr-2" />
                                    Create New Exam
                                </Button>
                            </Link>
                            <Link href={route('admin.cbt.questions.create')}>
                                <Button variant="outline" className="w-full justify-center">
                                    <PenTool className="w-4 h-4 mr-2" />
                                    Add Questions
                                </Button>
                            </Link>
                            <Link href={route('admin.cbt.questions.index')}>
                                <Button variant="outline" className="w-full justify-center">
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    Question Bank
                                </Button>
                            </Link>
                            <Link href={route('admin.cbt.analytics')}>
                                <Button variant="outline" className="w-full justify-center">
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    Analytics
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    {/* Filter Section */}
                    <Card className="mb-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium">Search & Filter Exams</h3>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                                </Button>
                            </div>

                            {/* Search Bar */}
                            <div className="flex space-x-2">
                                <div className="flex-1">
                                    <FormInput
                                        type="text"
                                        placeholder="Search exams..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-full"
                                    />
                                </div>
                                <Button onClick={handleSearch}>
                                    Search
                                </Button>
                                <Button variant="outline" onClick={clearFilters}>
                                    Clear
                                </Button>
                            </div>

                            {/* Advanced Filters */}
                            {showFilters && (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                                    <div>
                                        <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                                            Subject
                                        </FormLabel>
                                        <FormSelect
                                            value={selectedSubject}
                                            onChange={(e) => setSelectedSubject(e.target.value)}
                                            className="w-full"
                                        >
                                            <option value="">All Subjects</option>
                                            {subjects.map((subject) => (
                                                <option key={subject.id} value={subject.id}>
                                                    {subject.name}
                                                </option>
                                            ))}
                                        </FormSelect>
                                    </div>

                                    <div>
                                        <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                                            Teacher
                                        </FormLabel>
                                        <FormSelect
                                            value={selectedTeacher}
                                            onChange={(e) => setSelectedTeacher(e.target.value)}
                                            className="w-full"
                                        >
                                            <option value="">All Teachers</option>
                                            {teachers.map((teacher) => (
                                                <option key={teacher.user ? teacher.user.id : teacher.id} value={teacher.user ? teacher.user.id : teacher.id}>
                                                    {teacher.user ? teacher.user.name : teacher.name}
                                                </option>
                                            ))}
                                        </FormSelect>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Exams Table */}
                    <Card>
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">
                                Exams ({exams.total} total)
                            </h3>
                            <DataTable
                                data={exams.data}
                                columns={columns}
                            />
                            
                            {/* Pagination */}
                            {exams.links && (
                                <div className="flex justify-center mt-6">
                                    <nav className="flex space-x-2">
                                        {exams.links.map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() => link.url && router.get(link.url)}
                                                disabled={!link.url}
                                                className={`px-3 py-2 text-sm rounded ${
                                                    link.active 
                                                        ? 'bg-blue-600 text-white' 
                                                        : link.url 
                                                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Floating Action Button */}
            <Link href={route('admin.cbt.exams.create')}>
                <button className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 z-50 group">
                    <CheckSquare className="w-6 h-6" />
                    <span className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        Create Exam
                    </span>
                </button>
            </Link>
        </AuthenticatedLayout>
    );
}
