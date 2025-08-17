import { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, PageHeader } from '@/Components/UI';
import { ArrowLeftIcon, DocumentArrowDownIcon, DocumentTextIcon, SparklesIcon, PencilIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import CompileResultCommentsModal from '@/Components/CompileResultCommentsModal';

export default function CompileResults({ auth, classrooms, terms, results = null, selected_classroom = null, selected_term = null }) {
    const [loading, setLoading] = useState(false);
    const [generatingRemarks, setGeneratingRemarks] = useState(false);
    const [selectedResults, setSelectedResults] = useState([]);
    const [groupedResults, setGroupedResults] = useState({});
    const [showFilters, setShowFilters] = useState(!results);
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        classroom_id: selected_classroom || '',
        term_id: selected_term || ''
    });

    // Get current term object
    const getCurrentTerm = () => {
        if (!selected_term) return null;
        return terms.find(t => t.id === parseInt(selected_term));
    };

    // Get current classroom object
    const getCurrentClassroom = () => {
        if (!selected_classroom) return null;
        return classrooms.find(c => c.id === parseInt(selected_classroom));
    };

    useEffect(() => {
        if (results) {
            // Group results by student
            const grouped = {};
            results.forEach(result => {
                const studentId = result.student.id;
                if (!grouped[studentId]) {
                    grouped[studentId] = {
                        student: result.student,
                        results: []
                    };
                }
                grouped[studentId].results.push(result);
            });
            setGroupedResults(grouped);
            setShowFilters(false);
        }
    }, [results]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        post(route('admin.results.compile'), {
            onSuccess: () => {
                setLoading(false);
            },
            onError: () => {
                setLoading(false);
            }
        });
    };

    const handleGenerateRemarks = () => {
        if (selectedResults.length === 0) {
            alert('Please select at least one result to generate remarks for.');
            return;
        }

        setGeneratingRemarks(true);
        post(route('admin.results.generate-remarks'), {
            result_ids: selectedResults
        }, {
            onSuccess: () => {
                setGeneratingRemarks(false);
                setSelectedResults([]);
            },
            onError: () => {
                setGeneratingRemarks(false);
            }
        });
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

    const toggleAllResults = (studentResults) => {
        const resultIds = studentResults.map(result => result.id);
        const allSelected = resultIds.every(id => selectedResults.includes(id));
        
        if (allSelected) {
            // Remove all
            setSelectedResults(prev => prev.filter(id => !resultIds.includes(id)));
        } else {
            // Add all
            setSelectedResults(prev => {
                const newSelection = [...prev];
                resultIds.forEach(id => {
                    if (!newSelection.includes(id)) {
                        newSelection.push(id);
                    }
                });
                return newSelection;
            });
        }
    };

    const getGrade = (score) => {
        if (score >= 70) return { grade: 'A', remark: 'Excellent', color: 'text-green-600' };
        if (score >= 60) return { grade: 'B', remark: 'Very Good', color: 'text-green-500' };
        if (score >= 50) return { grade: 'C', remark: 'Good', color: 'text-blue-500' };
        if (score >= 40) return { grade: 'D', remark: 'Pass', color: 'text-yellow-500' };
        return { grade: 'F', remark: 'Fail', color: 'text-red-500' };
    };

    const calculateAverage = (studentResults) => {
        if (!studentResults || studentResults.length === 0) return 0;
        const sum = studentResults.reduce((acc, result) => acc + parseFloat(result.total_score || 0), 0);
        return (sum / studentResults.length).toFixed(1);
    };

    const getClassroomName = () => {
        if (!selected_classroom) return '';
        const classroom = classrooms.find(c => c.id === parseInt(selected_classroom));
        return classroom ? classroom.name : '';
    };

    const getTermName = () => {
        if (!selected_term) return '';
        const term = terms.find(t => t.id === parseInt(selected_term));
        return term ? `${term.academic_session?.name || ''} - ${term.name}` : '';
    };

    // Function to prepare student data for modal
    const prepareStudentForModal = (student, studentResults) => {
        // Create a complete student object with results
        const studentWithResults = {
            ...student,
            results: studentResults || [] // Ensure results array exists
        };

        return studentWithResults;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<PageHeader>Compile Results</PageHeader>}
        >
            <Head title="Compile Results - SMS" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6 flex justify-between items-center">
                        <Link
                            href={route('admin.results.index')}
                            className="inline-flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Back to Results
                        </Link>

                        {results && (
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    {showFilters ? 'Hide Filters' : 'Change Filters'}
                                </button>
                                <Link
                                    href={route('admin.results.export', { classroom_id: selected_classroom, term_id: selected_term })}
                                    className="inline-flex items-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50"
                                >
                                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                                    Export Results
                                </Link>
                                <button
                                    onClick={handleGenerateRemarks}
                                    disabled={generatingRemarks || selectedResults.length === 0}
                                    className="inline-flex items-center px-4 py-2 border border-indigo-300 text-sm font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 disabled:opacity-50"
                                >
                                    <SparklesIcon className="h-4 w-4 mr-2" />
                                    {generatingRemarks ? 'Generating...' : 'Generate AI Remarks'}
                                </button>
                            </div>
                        )}
                    </div>

                    {(showFilters || !results) && (
                        <Card className="mb-6">
                            <div className="p-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Select Class and Term</h2>
                                <form onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label htmlFor="classroom_id" className="block text-sm font-medium text-gray-700 mb-1">
                                                Classroom
                                            </label>
                                            <select
                                                id="classroom_id"
                                                name="classroom_id"
                                                value={data.classroom_id}
                                                onChange={e => setData('classroom_id', e.target.value)}
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                                required
                                            >
                                                <option value="">Select a classroom</option>
                                                {classrooms.map(classroom => (
                                                    <option key={classroom.id} value={classroom.id}>
                                                        {classroom.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.classroom_id && <p className="text-red-500 text-xs mt-1">{errors.classroom_id}</p>}
                                        </div>

                                        <div>
                                            <label htmlFor="term_id" className="block text-sm font-medium text-gray-700 mb-1">
                                                Term
                                            </label>
                                            <select
                                                id="term_id"
                                                name="term_id"
                                                value={data.term_id}
                                                onChange={e => setData('term_id', e.target.value)}
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                                required
                                            >
                                                <option value="">Select a term</option>
                                                {terms.map(term => (
                                                    <option key={term.id} value={term.id}>
                                                        {term.academic_session?.name} - {term.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.term_id && <p className="text-red-500 text-xs mt-1">{errors.term_id}</p>}
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={processing || loading}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                        >
                                            {processing || loading ? 'Loading...' : 'Compile Results'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </Card>
                    )}

                    {results && (
                        <div>
                            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                                <div className="px-4 py-5 sm:px-6">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        Results Summary
                                    </h3>
                                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                        {getClassroomName()} | {getTermName()}
                                    </p>
                                </div>
                                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                                    <dl className="sm:divide-y sm:divide-gray-200">
                                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500">Total Students</dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                                {Object.keys(groupedResults).length}
                                            </dd>
                                        </div>
                                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500">Total Results</dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                                {results.length}
                                            </dd>
                                        </div>
                                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500">Average Results</dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                                {(results.reduce((acc, result) => acc + parseFloat(result.total_score || 0), 0) / results.length).toFixed(1)}%
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            {/* Comments Modal with proper data passing */}
                            {showCommentsModal && selectedStudent && (
                                <CompileResultCommentsModal
                                    show={showCommentsModal}
                                    onClose={() => {
                                        setShowCommentsModal(false);
                                        setSelectedStudent(null);
                                    }}
                                    student={prepareStudentForModal(selectedStudent.student, selectedStudent.results)}
                                    termResult={selectedStudent.termResult}
                                    currentTerm={getCurrentTerm()}
                                    canEditPrincipalComment={auth.user?.roles?.some(role => ['admin', 'principal'].includes(role.name)) || false}
                                />
                            )}

                            {Object.values(groupedResults).map(({ student, results: studentResults }) => (
                                <Card key={student.id} className="mb-6">
                                    <div className="p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-800">{student.user?.name || 'Unknown Student'}</h2>
                                                <p className="text-sm text-gray-500">Admission Number: {student.admission_number}</p>
                                            </div>
                                            <div className="flex items-center space-x-6">
                                                <button
                                                    onClick={() => {
                                                        // Set selectedStudent with both student and results data
                                                        setSelectedStudent({
                                                            student,
                                                            results: studentResults, // Pass the student's results
                                                            termResult: studentResults[0]?.term_result
                                                        });
                                                        setShowCommentsModal(true);
                                                    }}
                                                    className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
                                                >
                                                    <ChatBubbleLeftIcon className="h-5 w-5 mr-1" />
                                                    {studentResults[0]?.term_result?.teacher_comment ? 'Edit Comments' : 'Add Comments'}
                                                </button>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500">Average Score</p>
                                                    <p className="text-xl font-bold">{calculateAverage(studentResults)}%</p>
                                                    <p className={`text-sm ${getGrade(calculateAverage(studentResults)).color}`}>
                                                        {getGrade(calculateAverage(studentResults)).remark}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            <div className="flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                                    checked={studentResults.every(result => selectedResults.includes(result.id))}
                                                                    onChange={() => toggleAllResults(studentResults)}
                                                                />
                                                            </div>
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Subject
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            CA Score
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Exam Score
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Total Score
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Grade
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {studentResults.map(result => {
                                                        const { grade, remark, color } = getGrade(result.total_score);
                                                        return (
                                                            <tr key={result.id}>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                                        checked={selectedResults.includes(result.id)}
                                                                        onChange={() => toggleResultSelection(result.id)}
                                                                    />
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm font-medium text-gray-900">{result.subject?.name || 'Unknown Subject'}</div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm text-gray-900">{result.ca_score}/40</div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm text-gray-900">{result.exam_score}/60</div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm font-medium text-gray-900">{result.total_score}/100</div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className={`text-sm font-medium ${color}`}>{grade} ({remark})</div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    {parseFloat(result.total_score) >= 40 ? (
                                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                                            <CheckCircleIcon className="h-4 w-4 mr-1" /> Pass
                                                                        </span>
                                                                    ) : (
                                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                                            <XCircleIcon className="h-4 w-4 mr-1" /> Fail
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                    <div className="flex space-x-2">
                                                                        <Link
                                                                            href={route('admin.results.show', result.id)}
                                                                            className="text-indigo-600 hover:text-indigo-900"
                                                                        >
                                                                            <DocumentTextIcon className="h-5 w-5" />
                                                                        </Link>
                                                                        <Link
                                                                            href={route('admin.results.edit', result.id)}
                                                                            className="text-blue-600 hover:text-blue-900"
                                                                        >
                                                                            <PencilIcon className="h-5 w-5" />
                                                                        </Link>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {results && Object.keys(groupedResults).length === 0 && (
                        <Card>
                            <div className="p-6 text-center">
                                <p className="text-gray-500">No results found for the selected class and term.</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}