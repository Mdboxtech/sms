import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DataTable from '@/Components/DataTable';
import Button from '@/Components/ui/Button';
import Card from '@/Components/ui/Card';
import { FormInput, FormLabel, FormSelect } from '@/Components/UI';
import { CheckSquare, PenTool, BookOpen } from 'lucide-react';

export default function Index({ 
    auth, 
    exams, 
    subjects, 
    classrooms,
    filters 
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedSubject, setSelectedSubject] = useState(filters.subject_id || '');
    const [selectedClass, setSelectedClass] = useState(filters.classroom_id || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = () => {
        router.get(route('teacher.cbt.exams.index'), {
            search: searchTerm,
            subject_id: selectedSubject,
            classroom_id: selectedClass,
            status: selectedStatus,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedSubject('');
        setSelectedClass('');
        setSelectedStatus('');
        router.get(route('teacher.cbt.exams.index'));
    };

    const handleDelete = (examId) => {
        if (confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
            router.delete(route('teacher.cbt.exams.destroy', examId), {
                onSuccess: () => {
                    alert('Exam deleted successfully');
                },
                onError: (errors) => {
                    alert('Failed to delete exam');
                }
            });
        }
    };

    const toggleExamStatus = (examId, currentStatus) => {
        const action = currentStatus ? 'deactivate' : 'activate';
        if (confirm(`Are you sure you want to ${action} this exam?`)) {
            router.patch(route('teacher.cbt.exams.toggle-status', examId), {}, {
                onSuccess: () => {
                    alert(`Exam ${action}d successfully`);
                },
                onError: (errors) => {
                    alert(`Failed to ${action} exam`);
                }
            });
        }
    };

    const getBadgeClasses = (type, value) => {
        const baseClasses = 'inline-block px-2 py-1 text-xs font-semibold rounded-full';
        
        if (type === 'status') {
            return value ? baseClasses + ' bg-green-100 text-green-800' : baseClasses + ' bg-red-100 text-red-800';
        }
        
        if (type === 'exam_type') {
            switch (value) {
                case 'quiz': return baseClasses + ' bg-blue-100 text-blue-800';
                case 'test': return baseClasses + ' bg-yellow-100 text-yellow-800';
                case 'exam': return baseClasses + ' bg-purple-100 text-purple-800';
                default: return baseClasses + ' bg-gray-100 text-gray-800';
            }
        }
        
        return baseClasses + ' bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getExamStatus = (exam) => {
        const now = new Date();
        const startTime = new Date(exam.start_time);
        const endTime = new Date(exam.end_time);
        
        if (!exam.is_active) return { text: 'Inactive', color: 'gray' };
        if (now < startTime) return { text: 'Upcoming', color: 'blue' };
        if (now > endTime) return { text: 'Completed', color: 'green' };
        return { text: 'Active', color: 'yellow' };
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
                        {exam.subject?.name} - {exam.classroom?.name}
                    </p>
                    <div className="flex space-x-2 mt-1">
                        <span className={getBadgeClasses('exam_type', exam.exam_type)}>
                            {exam.exam_type?.charAt(0).toUpperCase() + exam.exam_type?.slice(1)}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: 'Schedule',
            render: (exam) => (
                <div className="text-sm">
                    <p className="font-medium">Start: {formatDate(exam.start_time)}</p>
                    <p className="text-gray-500">End: {formatDate(exam.end_time)}</p>
                    <p className="text-gray-500">{exam.duration} minutes</p>
                </div>
            )
        },
        {
            header: 'Questions',
            render: (exam) => (
                <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">{exam.questions_count || 0}</p>
                    <p className="text-sm text-gray-500">questions</p>
                    <p className="text-sm text-gray-500">{exam.total_marks || 0} marks</p>
                </div>
            )
        },
        {
            header: 'Students',
            render: (exam) => (
                <div className="text-center">
                    <p className="text-lg font-bold text-green-600">{exam.attempts_count || 0}</p>
                    <p className="text-sm text-gray-500">attempts</p>
                    <p className="text-sm text-gray-500">{exam.students_count || 0} eligible</p>
                </div>
            )
        },
        {
            header: 'Status',
            render: (exam) => {
                const status = getExamStatus(exam);
                return (
                    <div className="text-center">
                        <span className={`${getBadgeClasses('status', status.color === 'green')} ${
                            status.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                            status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            status.color === 'gray' ? 'bg-gray-100 text-gray-800' : ''
                        }`}>
                            {status.text}
                        </span>
                    </div>
                );
            }
        },
        {
            header: 'Actions',
            render: (exam) => (
                <div className="flex space-x-1">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.get(route('teacher.cbt.exams.show', exam.id))}
                    >
                        View
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.get(route('teacher.cbt.exams.edit', exam.id))}
                    >
                        Edit
                    </Button>
                    <Button
                        variant={exam.is_active ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => toggleExamStatus(exam.id, exam.is_active)}
                    >
                        {exam.is_active ? 'Deactivate' : 'Activate'}
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

    const stats = {
        total: exams.total || 0,
        active: exams.data?.filter(e => e.is_active).length || 0,
        upcoming: exams.data?.filter(e => {
            const now = new Date();
            return e.is_active && new Date(e.start_time) > now;
        }).length || 0,
        completed: exams.data?.filter(e => {
            const now = new Date();
            return new Date(e.end_time) < now;
        }).length || 0
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        My Exams
                    </h2>
                    <Link href={route('teacher.cbt.exams.create')}>
                        <Button variant="primary">
                            Create Exam
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title="My Exams" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <Card className="p-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                                <p className="text-sm text-gray-600">Total Exams</p>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                                <p className="text-sm text-gray-600">Active Exams</p>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-yellow-600">{stats.upcoming}</p>
                                <p className="text-sm text-gray-600">Upcoming</p>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
                                <p className="text-sm text-gray-600">Completed</p>
                            </div>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <Card className="mb-6 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link href={route('teacher.cbt.exams.create')}>
                                <Button variant="primary" className="w-full justify-center">
                                    <CheckSquare className="w-4 h-4 mr-2" />
                                    Create New Exam
                                </Button>
                            </Link>
                            <Link href={route('teacher.cbt.questions.create')}>
                                <Button variant="outline" className="w-full justify-center">
                                    <PenTool className="w-4 h-4 mr-2" />
                                    Add Questions
                                </Button>
                            </Link>
                            <Link href={route('teacher.cbt.questions.index')}>
                                <Button variant="outline" className="w-full justify-center">
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    Question Bank
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
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
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
                                            Class
                                        </FormLabel>
                                        <FormSelect
                                            value={selectedClass}
                                            onChange={(e) => setSelectedClass(e.target.value)}
                                            className="w-full"
                                        >
                                            <option value="">All Classes</option>
                                            {classrooms.map((classroom) => (
                                                <option key={classroom.id} value={classroom.id}>
                                                    {classroom.name}
                                                </option>
                                            ))}
                                        </FormSelect>
                                    </div>

                                    <div>
                                        <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                                            Status
                                        </FormLabel>
                                        <FormSelect
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            className="w-full"
                                        >
                                            <option value="">All Status</option>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="upcoming">Upcoming</option>
                                            <option value="completed">Completed</option>
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
                                My Exams ({exams.total} total)
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
            <Link href={route('teacher.cbt.exams.create')}>
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
