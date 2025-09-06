import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, PageHeader } from '@/Components/UI';
import DataTable from '@/Components/DataTable';
import { debounce } from 'lodash';
import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { 
    PlusIcon, 
    PencilIcon, 
    EyeIcon,
    TrashIcon,
    FunnelIcon,
    BookOpenIcon,
    CalendarIcon,
    UserGroupIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import Dropdown from '@/Components/Dropdown';

export default function Index({ results, subjects, classrooms, terms, filters }) {
    const [showFilters, setShowFilters] = useState(false);
    
    const { data, setData, get, processing } = useForm({
        subject_id: filters?.subject_id || '',
        classroom_id: filters?.classroom_id || '',
        term_id: filters?.term_id || '',
    });

    // Create a memoized debounced function
    const debouncedApplyFilters = React.useCallback(
        debounce(() => {
            applyFilters();
        }, 300),
        []
    );

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
        debouncedApplyFilters();
    };
    
    const applyFilters = (e) => {
        e?.preventDefault();
        router.get(route('teacher.results.index'), data, {
            preserveState: true,
            preserveScroll: true,
        });
    };
    
    const resetFilters = () => {
        setData({
            subject_id: '',
            classroom_id: '',
            term_id: '',
        });
        get(route('teacher.results.index'));
    };
    
    const deleteResult = (resultId) => {
        if (confirm('Are you sure you want to delete this result?')) {
            router.delete(route('teacher.results.destroy', resultId));
        }
    };
    
    const getGrade = (score) => {
        if (score >= 70) return { grade: 'A', remark: 'Excellent', color: 'text-green-600' };
        if (score >= 60) return { grade: 'B', remark: 'Very Good', color: 'text-green-500' };
        if (score >= 50) return { grade: 'C', remark: 'Good', color: 'text-blue-500' };
        if (score >= 40) return { grade: 'D', remark: 'Pass', color: 'text-yellow-500' };
        return { grade: 'F', remark: 'Fail', color: 'text-red-500' };
    };

    const columns = [
        {
            header: 'Student',
            accessorKey: 'student',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium text-gray-900">
                        {row.original.student.user.name}
                    </div>
                    <div className="text-sm text-gray-500">
                        {row.original.student.admission_number}
                    </div>
                    <div className="text-sm text-gray-500">
                        {row.original.student.classroom?.name}
                    </div>
                </div>
            ),
        },
        {
            header: 'Subject',
            accessorKey: 'subject.name',
        },
        {
            header: 'Term',
            accessorKey: 'term',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.term.name}</div>
                    <div className="text-sm text-gray-500">
                        {row.original.term.academic_session?.name}
                    </div>
                </div>
            ),
        },
        {
            header: 'Scores',
            accessorKey: 'scores',
            cell: ({ row }) => {
                const gradeInfo = getGrade(row.original.total_score);
                return (
                    <div>
                        <div className="flex space-x-2 text-sm">
                            <span>CA: {row.original.ca_score}</span>
                            <span>Exam: {row.original.exam_score}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="font-bold">
                                Total: {row.original.total_score}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${gradeInfo.color} bg-gray-100`}>
                                {gradeInfo.grade}
                            </span>
                        </div>
                    </div>
                );
            },
        },
        {
            header: 'Actions',
            accessorKey: 'actions',
            cell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    <Link
                        href={route('teacher.results.edit', row.original.id)}
                        className="text-blue-600 hover:text-blue-900"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                        onClick={() => deleteResult(row.original.id)}
                        className="text-red-600 hover:text-red-900"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="My Results" />
            
            <div className="space-y-6">
                <PageHeader
                    title="My Results"
                    subtitle={`Manage results for subjects you teach. Total: ${results.data.length} results`}
                    actions={
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <FunnelIcon className="h-4 w-4 mr-2" />
                                Filters
                            </button>
                            <Link
                                href={route('teacher.results.compile.index')}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                            >
                                <ChartBarIcon className="h-4 w-4 mr-2" />
                                Compile Results
                            </Link>
                            <Link
                                href={route('teacher.results.bulk-create')}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                                <UserGroupIcon className="h-4 w-4 mr-2" />
                                Bulk Entry
                            </Link>
                            <Link
                                href={route('teacher.results.create')}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                            >
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Add Result
                            </Link>
                        </div>
                    }
                />

                {/* Filters */}
                {showFilters && (
                    <Card>
                        <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Subject
                                </label>
                                <select
                                    name="subject_id"
                                    value={data.subject_id}
                                    onChange={handleFilterChange}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">All Subjects</option>
                                    {subjects.map((subject) => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.name}
                                            {subject.permission_type === 'class_assignment' && ' (Class Teacher)'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Classroom
                                </label>
                                <select
                                    name="classroom_id"
                                    value={data.classroom_id}
                                    onChange={handleFilterChange}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">All Classes</option>
                                    {classrooms?.map((classroom) => (
                                        <option key={classroom.id} value={classroom.id}>
                                            {classroom.name} {classroom.section && `- ${classroom.section}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Term
                                </label>
                                <select
                                    name="term_id"
                                    value={data.term_id}
                                    onChange={handleFilterChange}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">All Terms</option>
                                    {terms.map((term) => (
                                        <option key={term.id} value={term.id}>
                                            {term.name} - {term.academic_session?.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-end space-x-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Apply
                                </button>
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                >
                                    Reset
                                </button>
                            </div>
                        </form>
                    </Card>
                )}

                <Card>
                    <DataTable
                        data={results.data}
                        columns={columns}
                        pagination={results}
                        searchable={false}
                        emptyMessage="No results found. Start by adding some results."
                    />
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
