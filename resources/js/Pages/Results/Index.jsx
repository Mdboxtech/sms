import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, PageHeader } from '@/Components/UI';
import DataTable from '@/Components/DataTable';
import { debounce } from 'lodash';
import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import ResultCommentsModal from '@/Components/ResultCommentsModal';
import Button from '@/Components/UI/Button';
import {
    PlusIcon,
    PencilIcon,
    EyeIcon,
    SparklesIcon,
    ArrowDownTrayIcon,
    ArrowUpTrayIcon,
    CloudArrowUpIcon,
    FunnelIcon,
    ChartBarIcon,
    UserGroupIcon,
    BookOpenIcon,
    CalendarIcon,
    UserIcon,
    TrashIcon,
    ArrowPathIcon,
    ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import Dropdown from '@/Components/Dropdown';

export default function Results({ auth, results, students, subjects, classrooms, terms, teachers, filters }) {
    const [regeneratingRemarks, setRegeneratingRemarks] = useState({});
    const [selectedResults, setSelectedResults] = useState([]);
    const [isGeneratingRemarks, setIsGeneratingRemarks] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [selectedResult, setSelectedResult] = useState(null);

    const [availableStudents, setAvailableStudents] = useState(students);

    const { data, setData, get, processing } = useForm({
        classroom_id: filters?.classroom_id || '', // Classroom must be selected first
        term_id: filters?.term_id || '',
        student_id: filters?.student_id || '',
        subject_id: filters?.subject_id || '',
        teacher_id: filters?.teacher_id || '',
        min_score: filters?.min_score || '',
        max_score: filters?.max_score || '',
    });

    // Update available students when classroom changes
    const handleClassroomChange = (e) => {
        setData(data => ({
            ...data,
            classroom_id: e.target.value,
            student_id: '' // Reset student selection when classroom changes
        }));

        // If a classroom is selected, fetch its students
        if (e.target.value) {
            axios.get(route('admin.results.students-by-classroom', { classroom: e.target.value }))
                .then(response => {
                    setAvailableStudents(response.data);
                })
                .catch(error => {
                    console.error('Error fetching students:', error);
                });
        } else {
            setAvailableStudents([]);
        }

        debouncedApplyFilters();
    };

    // Create a memoized debounced function using useCallback
    const debouncedApplyFilters = React.useCallback(
        debounce(() => {
            applyFilters();
        }, 300),
        [] // Empty dependency array since we don't want to recreate this function
    );

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
        debouncedApplyFilters();
    };

    const applyFilters = (e) => {
        e?.preventDefault();
        router.get(route('admin.results.index'), data, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const resetFilters = () => {
        setData({
            student_id: '',
            subject_id: '',
            classroom_id: '',
            term_id: '',
            teacher_id: '',
            min_score: '',
            max_score: '',
        });
        get(route('admin.results.index'));
    };

    const toggleResultSelection = (resultId) => {
        setSelectedResults(prev => {
            if (prev.includes(resultId)) {
                return prev.filter(id => id !== resultId);
            } else {
                return [...prev, resultId];
            }
        });
    };

    const selectAllResults = () => {
        if (selectedResults.length === results.data.length) {
            setSelectedResults([]);
        } else {
            setSelectedResults(results.data.map(result => result.id));
        }
    };

    const generateBulkRemarks = async () => {
        if (!selectedResults?.length) {
            alert('Please select at least one result to generate remarks.');
            return;
        }

        setIsGeneratingRemarks(true);
        try {
            const response = await axios.post(route('admin.results.generate-remarks'), {
                result_ids: selectedResults
            });

            if (response.data.success) {
                router.reload({
                    onSuccess: () => {
                        alert('Remarks generated successfully!');
                    }
                });
            }
        } catch (error) {
            console.error('Error generating remarks:', error);
            alert('Failed to generate remarks: ' + (error.response?.data?.message || 'Please try again.'));
        } finally {
            setIsGeneratingRemarks(false);
        }
    };

    const deleteResult = (resultId) => {
        if (confirm('Are you sure you want to delete this result?')) {
            router.delete(route('admin.results.destroy', resultId));
        }
    };

    const getGrade = (score) => {
        if (score >= 70) return { grade: 'A', remark: 'Excellent', color: 'text-green-600' };
        if (score >= 60) return { grade: 'B', remark: 'Very Good', color: 'text-green-500' };
        if (score >= 50) return { grade: 'C', remark: 'Good', color: 'text-blue-500' };
        if (score >= 40) return { grade: 'D', remark: 'Pass', color: 'text-yellow-500' };
        return { grade: 'F', remark: 'Fail', color: 'text-red-500' };
    };

    const regenerateRemark = async (result) => {
        if (!result?.id || !result?.student?.user?.name || !result?.subject?.name) {
            console.error('Invalid result data for generating remark');
            return;
        }

        setRegeneratingRemarks(prev => ({ ...prev, [result.id]: true }));

        try {
            const response = await fetch(route('api.ai.remark'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify({
                    result_id: result.id,
                    student: result.student.user.name,
                    subjects: [{
                        name: result.subject.name,
                        score: result.total_score || 0
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.remark) {
                // Redirect to refresh the page with new data
                window.location.reload();
            }

        } catch (error) {
            console.error('Error regenerating remark:', error);
            alert('Failed to generate remark. Please try again.');
        } finally {
            setRegeneratingRemarks(prev => ({ ...prev, [result.id]: false }));
        }
    };

    const columns = [
        {
            header: (
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        checked={selectedResults.length === results.data.length && results.data.length > 0}
                        onChange={selectAllResults}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                </div>
            ),
            render: (row) => (
                <input
                    type="checkbox"
                    checked={selectedResults.includes(row.id)}
                    onChange={() => toggleResultSelection(row.id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
            ),
        },
        {
            header: 'Student',
            render: (row) => (
                <div>
                    <Link
                        href={route('admin.results.student', row?.student?.id)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-900"
                    >
                        {row?.student?.user?.name || 'Unknown Student'}
                    </Link>
                    <div className="text-xs text-gray-500">
                        {row?.student?.admission_number || 'N/A'}
                    </div>
                </div>
            ),
        },
        {
            header: 'Class',
            render: (row) => (
                <Link
                    href={route('admin.results.classroom', row?.student?.classroom?.id)}
                    className="text-sm text-blue-600 hover:text-blue-900"
                >
                    {row?.student?.classroom?.name || 'Not assigned'}
                </Link>
            ),
        },
        {
            header: 'Subject',
            render: (row) => (
                <div>
                    <Link href={route('admin.results.subject', row.subject?.id)} className="text-sm font-medium text-blue-600 hover:text-blue-900">
                        {row.subject?.name || 'Unknown Subject'}
                    </Link>
                    <div className="text-xs text-gray-500">{row.subject?.code}</div>
                </div>
            ),
        },
        {
            header: 'Term',
            render: (row) => {
                if (!row.term) return 'N/A';
                return (
                    <div>
                        <Link href={route('admin.results.term', row.term?.id)} className="text-sm font-medium text-blue-600 hover:text-blue-900">
                            {row.term?.name || 'Unknown Term'}
                        </Link>
                        <div className="text-xs text-gray-500">{(row.term?.academicSession || row.term?.academic_session)?.name}</div>
                    </div>
                );
            },
        },
        {
            header: 'CA Score',
            render: (row) => <div className="text-sm text-gray-900">{row.ca_score}/40</div>,
        },
        {
            header: 'Exam Score',
            render: (row) => <div className="text-sm text-gray-900">{row.exam_score}/60</div>,
        },
        {
            header: 'Total Score',
            render: (row) => {
                const { grade, color } = getGrade(row.total_score);
                return (
                    <div className={`text-sm font-medium ${color}`}>
                        {row.total_score}/100 ({grade})
                    </div>
                );
            },
        },
        {
            header: 'Status',
            render: (row) => (
                <div>
                    {parseFloat(row.total_score) >= 40 ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            <CheckCircleIcon className="h-4 w-4 mr-1" /> Pass
                        </span>
                    ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            <XCircleIcon className="h-4 w-4 mr-1" /> Fail
                        </span>
                    )}
                </div>
            ),
        },
        {
            header: 'Remark',
            render: (row) => (
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 max-w-xs truncate">
                        {row.remark || 'No remark'}
                    </span>
                    <button
                        onClick={() => regenerateRemark(row)}
                        disabled={regeneratingRemarks[row.id]}
                        className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                        title="Regenerate AI Remark"
                    >
                        <SparklesIcon className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex space-x-2">
                    {row.id && (
                        <>
                            {row.term_result && (
                                <>
                                    <Link
                                        href={route('admin.term-results.show', row.term_result)}
                                        className="text-purple-600 hover:text-purple-900"
                                        title="View Term Results"
                                    >
                                        <ChartBarIcon className="h-4 w-4" />
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setSelectedResult(row.term_result);
                                            setShowCommentsModal(true);
                                        }}
                                        className="text-indigo-600 hover:text-indigo-900"
                                        title="Edit Comments"
                                    >
                                        <ChatBubbleLeftIcon className="h-4 w-4" />
                                    </button>
                                </>
                            )}
                            <Link
                                href={route('admin.results.show', row.id)}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Result"
                            >
                                <EyeIcon className="h-4 w-4" />
                            </Link>
                            <Link
                                href={route('admin.results.edit', row.id)}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Edit Result"
                            >
                                <PencilIcon className="h-4 w-4" />
                            </Link>
                            <button
                                onClick={() => deleteResult(row.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete Result"
                            >
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </>
                    )}</div>
            ),
        },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<PageHeader>Results</PageHeader>}
        >
            <Head title="Results" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
                        <div className="flex flex-wrap gap-2">
                            <Button
                                as={Link}
                                href={route('admin.results.create')}
                                variant="primary"
                                className="inline-flex items-center"
                            >
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Add New Result
                            </Button>

                            <Button
                                as={Link}
                                href={route('admin.results.bulk-create')}
                                variant="warning"
                                className="inline-flex items-center"
                            >
                                <UserGroupIcon className="h-4 w-4 mr-2" />
                                Bulk Entry
                            </Button>

                            <Button
                                as={Link}
                                href={route('admin.results.compile')}
                                variant="success"
                                className="inline-flex items-center"
                            >
                                Compile Results
                            </Button>

                            <Button
                                as={Link}
                                href={route('admin.results.analysis')}
                                variant="purple"
                                className="inline-flex items-center"
                            >
                                <ChartBarIcon className="h-4 w-4 mr-2" />
                                Results Analysis
                            </Button>

                            <Button
                                onClick={() => setShowFilters(!showFilters)}
                                variant="secondary"
                                className="inline-flex items-center"
                            >
                                <FunnelIcon className="h-4 w-4 mr-2" />
                                {showFilters ? 'Hide Filters' : 'Show Filters'}
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150">
                                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                                        Export Options
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content>
                                    <Dropdown.Link href={route('admin.results.export', {
                                        classroom_id: data.classroom_id,
                                        subject_id: data.subject_id,
                                        term_id: data.term_id,
                                        teacher_id: data.teacher_id,
                                        min_score: data.min_score,
                                        max_score: data.max_score
                                    })}>
                                        Export Filtered Results
                                    </Dropdown.Link>
                                    <Dropdown.Link href={route('admin.results.export')}>
                                        Export All Results
                                    </Dropdown.Link>
                                    <Dropdown.Link href={route('admin.results.download-template')}>
                                        Download Import Template
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>                            <Link
                                href={route('admin.results.import')}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                            >
                                <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                                Import Results
                            </Link>

                            <button
                                onClick={generateBulkRemarks}
                                disabled={selectedResults.length === 0 || isGeneratingRemarks}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                            >
                                {isGeneratingRemarks ? (
                                    <>
                                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="h-4 w-4 mr-2" />
                                        Generate AI Remarks ({selectedResults.length})
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {showFilters && (
                        <Card className="mb-6">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Results</h3>
                                <form onSubmit={applyFilters}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <label htmlFor="classroom_id" className="block text-sm font-medium text-gray-700 mb-1">
                                                <UserGroupIcon className="h-4 w-4 inline mr-1" /> Class
                                            </label>
                                            <select
                                                id="classroom_id"
                                                name="classroom_id"
                                                value={data.classroom_id}
                                                onChange={handleClassroomChange}
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                            >
                                                <option value="">Select Class</option>
                                                {classrooms?.map(classroom => (
                                                    <option key={classroom.id} value={classroom.id}>
                                                        {classroom.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="student_id" className="block text-sm font-medium text-gray-700 mb-1">
                                                <UserIcon className="h-4 w-4 inline mr-1" /> Student
                                            </label>
                                            <select
                                                id="student_id"
                                                name="student_id"
                                                value={data.student_id}
                                                onChange={handleFilterChange}
                                                disabled={!data.classroom_id}
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            >
                                                <option value="">All Students</option>
                                                {availableStudents?.map(student => (
                                                    <option key={student.id} value={student.id}>
                                                        {student?.user?.name || 'Unknown Student'} ({student?.admission_number || 'N/A'})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="subject_id" className="block text-sm font-medium text-gray-700 mb-1">
                                                <BookOpenIcon className="h-4 w-4 inline mr-1" /> Subject
                                            </label>
                                            <select
                                                id="subject_id"
                                                name="subject_id"
                                                value={data.subject_id}
                                                onChange={handleFilterChange}
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                            >
                                                <option value="">All Subjects</option>
                                                {subjects?.map(subject => (
                                                    <option key={subject.id} value={subject.id}>
                                                        {subject.name} ({subject.code})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="term_id" className="block text-sm font-medium text-gray-700 mb-1">
                                                <CalendarIcon className="h-4 w-4 inline mr-1" /> Term
                                            </label>
                                            <select
                                                id="term_id"
                                                name="term_id"
                                                value={data.term_id}
                                                onChange={handleFilterChange}
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                            >
                                                <option value="">All Terms</option>
                                                {terms?.map(term => (
                                                    <option key={term.id} value={term.id}>
                                                        {(term?.academicSession || term?.academic_session)?.name || 'Unknown Session'} - {term?.name || 'Unknown Term'}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            {console.log('ttt', teachers)}
                                            <label htmlFor="teacher_id" className="block text-sm font-medium text-gray-700 mb-1">
                                                <UserIcon className="h-4 w-4 inline mr-1" /> Teacher
                                            </label>
                                            <select
                                                id="teacher_id"
                                                name="teacher_id"
                                                value={data.teacher_id}
                                                onChange={handleFilterChange}
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                            >
                                                <option value="">All Teachers</option>
                                                {teachers?.map(teacher => (
                                                    <option key={teacher.id} value={teacher.id}>
                                                        {teacher?.name || 'Unknown Teacher'}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Score Range
                                            </label>
                                            <div className="flex space-x-2">
                                                <input
                                                    type="number"
                                                    id="min_score"
                                                    name="min_score"
                                                    placeholder="Min"
                                                    min="0"
                                                    max="100"
                                                    value={data.min_score}
                                                    onChange={handleFilterChange}
                                                    className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                                />
                                                <input
                                                    type="number"
                                                    id="max_score"
                                                    name="max_score"
                                                    placeholder="Max"
                                                    min="0"
                                                    max="100"
                                                    value={data.max_score}
                                                    onChange={handleFilterChange}
                                                    className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <Button
                                            type="button"
                                            onClick={resetFilters}
                                            variant="secondary"
                                        >
                                            Reset
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            variant="primary"
                                        >
                                            {processing ? 'Applying...' : 'Apply Filters'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </Card>
                    )}

                    <Card className="shadow-sm">
                        <div className="p-6 w-full ">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Results List
                                </h2>
                                <div className="text-sm text-gray-500">
                                    {results.total} results found
                                </div>
                            </div>
                            <DataTable columns={columns} data={results.data} />

                            {results.data.length > 0 && results.links && (
                                <div className="mt-4 flex justify-between items-center">
                                    <div className="text-sm text-gray-500">
                                        Showing {results.from} to {results.to} of {results.total} results
                                    </div>
                                    <div className="flex space-x-2">
                                        {results.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-3 py-1 rounded ${link.active ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} ${!link.url ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    <ResultCommentsModal
                        show={showCommentsModal}
                        onClose={() => setShowCommentsModal(false)}
                        result={selectedResult}
                        userRole={auth.user.role.name}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
