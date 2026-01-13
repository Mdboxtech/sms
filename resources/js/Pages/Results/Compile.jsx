import { useState, useEffect, useMemo } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, PageHeader } from '@/Components/UI';
import Button from '@/Components/UI/Button';
import { ArrowLeftIcon, DocumentArrowDownIcon, DocumentTextIcon, SparklesIcon, PencilIcon, ChatBubbleLeftIcon, MagnifyingGlassIcon, XMarkIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import CompileResultCommentsModal from '@/Components/CompileResultCommentsModal';

export default function CompileResults({ 
    auth, 
    classrooms = [], 
    terms = [], 
    results = null, 
    compiled_results = null,
    statistics = null,
    students = [], 
    selected_classroom = null, 
    selected_term = null, 
    filters = {},
    compilation_success = false 
}) {
    const [loading, setLoading] = useState(false);
    const [generatingRemarks, setGeneratingRemarks] = useState(false);
    const [selectedResults, setSelectedResults] = useState([]);
    const [groupedResults, setGroupedResults] = useState({});
    const [showFilters, setShowFilters] = useState(!(results || compiled_results));
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [availableStudents, setAvailableStudents] = useState(students || []);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        classroom_id: selected_classroom || '',
        term_id: selected_term || '',
        student_id: filters.student_id || '',
        subject_id: filters.subject_id || '',
        teacher_id: filters.teacher_id || '',
        min_score: filters.min_score || '',
        max_score: filters.max_score || ''
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

    // Fetch students when classroom changes
    const fetchStudentsByClassroom = async (classroomId) => {
        if (!classroomId) {
            setAvailableStudents([]);
            return;
        }

        try {
            const response = await fetch(route('admin.results.students-by-classroom', classroomId));
            if (response.ok) {
                const students = await response.json();
                setAvailableStudents(students);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            setAvailableStudents([]);
        }
    };

    useEffect(() => {
        // Handle both regular results and compiled results
        const resultsToProcess = results || compiled_results;
        
        if (resultsToProcess) {
            // Group results by student
            const grouped = {};
            
            if (compiled_results && Array.isArray(compiled_results)) {
                // Handle compiled results format
                compiled_results.forEach(compiledResult => {
                    if (compiledResult?.student?.id) {
                        const studentId = compiledResult.student.id;
                        grouped[studentId] = {
                            student: compiledResult.student,
                            results: compiledResult.results || []
                        };
                    }
                });
            } else if (results && Array.isArray(results)) {
                // Handle regular results format
                results.forEach(result => {
                    if (result?.student?.id) {
                        const studentId = result.student.id;
                        if (!grouped[studentId]) {
                            grouped[studentId] = {
                                student: result.student,
                                results: []
                            };
                        }
                        grouped[studentId].results.push(result);
                    }
                });
            }
            
            setGroupedResults(grouped);
            setShowFilters(false);
        }
    }, [results, compiled_results]);

    // Debug effect to log compiled results
    useEffect(() => {
        if (compiled_results) {
            console.log('Compiled results received:', compiled_results);
        }
        if (compilation_success) {
            console.log('Compilation success flag:', compilation_success);
        }
    }, [compiled_results, compilation_success]);

    // Filter grouped results based on search query
    const filteredGroupedResults = useMemo(() => {
        if (!searchQuery.trim()) {
            return groupedResults;
        }

        const query = searchQuery.toLowerCase();
        const filtered = {};

        Object.entries(groupedResults).forEach(([studentId, data]) => {
            const student = data.student;
            const studentName = student.user?.name?.toLowerCase() || '';
            const admissionNumber = student.admission_number?.toLowerCase() || '';

            // Check if student matches search query
            if (studentName.includes(query) || admissionNumber.includes(query)) {
                filtered[studentId] = data;
            }
        });

        return filtered;
    }, [groupedResults, searchQuery]);

    // Clear search
    const clearSearch = () => {
        setSearchQuery('');
    };

    // Handle classroom change
    const handleClassroomChange = (classroomId) => {
        setData(prev => ({
            ...prev,
            classroom_id: classroomId,
            student_id: '' // Reset student selection when classroom changes
        }));
        
        // Fetch students for the selected classroom
        fetchStudentsByClassroom(classroomId);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!data.classroom_id || !data.term_id) {
            alert('Please select both classroom and term before compiling results.');
            return;
        }
        
        console.log('Submitting compilation with data:', data);
        setLoading(true);
        
        post(route('admin.results.compile'), {
            data: data,
            onSuccess: (page) => {
                setLoading(false);
                console.log('Compilation successful:', page);
                // The backend should redirect back with compiled results
            },
            onError: (errors) => {
                setLoading(false);
                console.error('Compilation errors:', errors);
                alert('Compilation failed: ' + (errors.compilation || 'Please try again.'));
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

    // Handle filter changes for advanced filtering
    const handleFilterChange = (key, value) => {
        setData(prev => ({
            ...prev,
            [key]: value
        }));

        // If classroom changes, fetch students
        if (key === 'classroom_id') {
            fetchStudentsByClassroom(value);
            setData(prev => ({
                ...prev,
                student_id: '' // Reset student selection
            }));
        }
    };

    // Apply filters without compilation
    const handleApplyFilters = () => {
        const params = new URLSearchParams();
        
        Object.entries(data).forEach(([key, value]) => {
            if (value) {
                params.append(key, value);
            }
        });

        router.get(route('admin.results.index'), Object.fromEntries(params), {
            preserveState: true,
            preserveScroll: true,
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
        // Get current classroom information
        const currentClassroomInfo = getCurrentClassroom();
        
        // Ensure we have valid IDs
        const classroomId = selected_classroom ? parseInt(selected_classroom) : 
                           (student.classroom_id ? parseInt(student.classroom_id) : null);
        
        // Create a complete student object with results and classroom info
        const studentWithResults = {
            ...student,
            results: studentResults || [], // Ensure results array exists
            classroom: currentClassroomInfo || student.classroom, // Use current classroom or fallback
            classroom_id: classroomId // Ensure classroom_id is available as integer
        };

        console.log('Preparing student for modal:', {
            original_student: student,
            studentResults: studentResults?.length || 0,
            selected_classroom,
            selected_term,
            classroomId,
            studentWithResults
        });

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

                        {(results || compiled_results) && (
                            <div className="flex space-x-2">
                                <Button
                                    onClick={() => setShowFilters(!showFilters)}
                                    variant="secondary"
                                    className="inline-flex items-center"
                                >
                                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                                </Button>
                                <Button
                                    as={Link}
                                    href={route('admin.results.export', { 
                                        classroom_id: selected_classroom, 
                                        term_id: selected_term 
                                    })}
                                    variant="success"
                                    className="inline-flex items-center"
                                    disabled={!selected_classroom || !selected_term}
                                    target="_blank"
                                >
                                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                                    Export Results
                                </Button>
                                <Button
                                    onClick={handleGenerateRemarks}
                                    disabled={generatingRemarks || selectedResults.length === 0}
                                    variant="purple"
                                    className="inline-flex items-center"
                                >
                                    <SparklesIcon className="h-4 w-4 mr-2" />
                                    {generatingRemarks ? 'Generating...' : 'Generate AI Remarks'}
                                </Button>
                            </div>
                        )}
                    </div>

                    {(showFilters || (!results && !compiled_results)) && (
                        <Card className="mb-6">
                            <div className="p-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">
                                    {(results || compiled_results) ? 'Filter Results' : 'Select Class and Term'}
                                </h2>
                                <form onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                        <div>
                                            <label htmlFor="classroom_id" className="block text-sm font-medium text-gray-700 mb-1">
                                                Classroom
                                            </label>
                                            <select
                                                id="classroom_id"
                                                name="classroom_id"
                                                value={data.classroom_id}
                                                onChange={e => handleClassroomChange(e.target.value)}
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                                required={!results && !compiled_results}
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
                                                required={!results && !compiled_results}
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

                                        {/* Student Filter - Only show when classroom is selected or when filtering existing results */}
                                        {(data.classroom_id || results) && (
                                            <div>
                                                <label htmlFor="student_id" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Student (Optional)
                                                </label>
                                                <select
                                                    id="student_id"
                                                    name="student_id"
                                                    value={data.student_id}
                                                    onChange={e => setData('student_id', e.target.value)}
                                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                                >
                                                    <option value="">All Students</option>
                                                    {availableStudents.map(student => (
                                                        <option key={student.id} value={student.id}>
                                                            {student.user?.name} ({student.admission_number})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    {/* Advanced Filters - Only show when we have results */}
                                    {results && (
                                        <div className="border-t border-gray-200 pt-6 mt-6">
                                            <h3 className="text-md font-medium text-gray-900 mb-4">Advanced Filters</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                <div>
                                                    <label htmlFor="min_score" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Min Score
                                                    </label>
                                                    <input
                                                        type="number"
                                                        id="min_score"
                                                        name="min_score"
                                                        value={data.min_score}
                                                        onChange={e => setData('min_score', e.target.value)}
                                                        placeholder="0"
                                                        min="0"
                                                        max="100"
                                                        className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="max_score" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Max Score
                                                    </label>
                                                    <input
                                                        type="number"
                                                        id="max_score"
                                                        name="max_score"
                                                        value={data.max_score}
                                                        onChange={e => setData('max_score', e.target.value)}
                                                        placeholder="100"
                                                        min="0"
                                                        max="100"
                                                        className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end space-x-3 mt-6">
                                        {results && (
                                            <Button
                                                type="button"
                                                onClick={handleApplyFilters}
                                                variant="secondary"
                                                className="inline-flex items-center"
                                            >
                                                Apply Filters
                                            </Button>
                                        )}
                                        <Button
                                            type="submit"
                                            disabled={processing || loading}
                                            variant="primary"
                                            className="inline-flex items-center"
                                        >
                                            {processing || loading ? 'Loading...' : ((results || compiled_results) ? 'Update Compilation' : 'Compile Results')}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </Card>
                    )}

                    {(results || compiled_results) && (
                        <div>
                            {/* Search Bar */}
                            <Card className="mb-6">
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">Search Students</h3>
                                        <button
                                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                            className="text-sm text-indigo-600 hover:text-indigo-500"
                                        >
                                            {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
                                        </button>
                                    </div>
                                    
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search by student name or admission number..."
                                            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                        {searchQuery && (
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                <button
                                                    onClick={clearSearch}
                                                    className="text-gray-400 hover:text-gray-500"
                                                >
                                                    <XMarkIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {showAdvancedFilters && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Min Score
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={data.min_score}
                                                        onChange={e => setData('min_score', e.target.value)}
                                                        placeholder="0"
                                                        min="0"
                                                        max="100"
                                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Max Score
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={data.max_score}
                                                        onChange={e => setData('max_score', e.target.value)}
                                                        placeholder="100"
                                                        min="0"
                                                        max="100"
                                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    />
                                                </div>
                                                <div className="flex items-end">
                                                    <Button
                                                        onClick={handleApplyFilters}
                                                        variant="primary"
                                                        className="w-full"
                                                    >
                                                        Apply Filters
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                                <div className="px-4 py-5 sm:px-6">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        Results Summary
                                    </h3>
                                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                        {getClassroomName()} | {getTermName()}
                                        {data.student_id && ` | Student: ${availableStudents.find(s => s.id === parseInt(data.student_id))?.user?.name || 'Selected Student'}`}
                                    </p>
                                </div>
                                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                                    <dl className="sm:divide-y sm:divide-gray-200">
                                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500">Total Students</dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                                {Object.keys(filteredGroupedResults).length} 
                                                {searchQuery && ` (filtered from ${Object.keys(groupedResults).length})`}
                                            </dd>
                                        </div>
                                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500">Total Results</dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                                {results?.length || compiled_results?.length || 0}
                                            </dd>
                                        </div>
                                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500">Average Results</dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                                {(() => {
                                                    try {
                                                        const resultsToUse = results || compiled_results || [];
                                                        if (results && Array.isArray(results) && results.length > 0) {
                                                            const validResults = results.filter(result => result && typeof result.total_score !== 'undefined');
                                                            if (validResults.length === 0) return '0%';
                                                            return (validResults.reduce((acc, result) => acc + parseFloat(result.total_score || 0), 0) / validResults.length).toFixed(1) + '%';
                                                        } else if (compiled_results && Array.isArray(compiled_results) && compiled_results.length > 0) {
                                                            const validResults = compiled_results.filter(compiledResult => 
                                                                compiledResult && 
                                                                compiledResult !== null && 
                                                                compiledResult !== undefined && 
                                                                typeof compiledResult.average_score !== 'undefined'
                                                            );
                                                            if (validResults.length === 0) return '0%';
                                                            const totalAverage = validResults.reduce((acc, compiledResult) => 
                                                                acc + parseFloat(compiledResult.average_score || 0), 0
                                                            );
                                                            return (totalAverage / validResults.length).toFixed(1) + '%';
                                                        }
                                                        return '0%';
                                                    } catch (error) {
                                                        console.error('Error calculating average:', error);
                                                        return '0%';
                                                    }
                                                })()}
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
                                    currentClassroom={getCurrentClassroom()}
                                    selectedTermId={selected_term ? parseInt(selected_term) : null}
                                    selectedClassroomId={selected_classroom ? parseInt(selected_classroom) : null}
                                    userRole={auth.user?.role?.name}
                                    currentUser={auth.user}
                                    canEditPrincipalComment={auth.user?.role?.name === 'admin' || auth.user?.role?.name === 'principal'}
                                />
                            )}

                            {Object.values(filteredGroupedResults).map(({ student, results: studentResults }) => (
                                <Card key={student.id} className="mb-6">
                                    <div className="p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-800">{student.user?.name || 'Unknown Student'}</h2>
                                                <p className="text-sm text-gray-500">Admission Number: {student.admission_number}</p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <Button
                                                    onClick={() => {
                                                        // Set selectedStudent with both student and results data
                                                        // Handle both regular results and compiled results structure
                                                        let termResult = null;
                                                        
                                                        if (compiled_results) {
                                                            // For compiled results, termResult is at the compiledResult level
                                                            const compiledResult = compiled_results.find(cr => cr.student.id === student.id);
                                                            termResult = compiledResult?.term_result;
                                                        } else {
                                                            // For regular results, termResult is attached to individual results
                                                            termResult = studentResults[0]?.termResult;
                                                        }
                                                        
                                                        setSelectedStudent({
                                                            student,
                                                            results: studentResults, // Pass the student's results
                                                            termResult: termResult
                                                        });
                                                        setShowCommentsModal(true);
                                                    }}
                                                    variant="secondary"
                                                    className="inline-flex items-center text-sm"
                                                >
                                                    <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                                                    {(() => {
                                                        // Check for comments in both structures
                                                        let hasTeacherComment = false;
                                                        
                                                        if (compiled_results) {
                                                            const compiledResult = compiled_results.find(cr => cr.student.id === student.id);
                                                            hasTeacherComment = compiledResult?.term_result?.teacher_comment;
                                                        } else {
                                                            hasTeacherComment = studentResults[0]?.termResult?.teacher_comment;
                                                        }
                                                        
                                                        return hasTeacherComment ? 'Edit Comments' : 'Add Comments';
                                                    })()}
                                                </Button>
                                                <Button
                                                    as={Link}
                                                    href={route('admin.reports.student-report-card', {
                                                        student: student.id,
                                                        term: selected_term,
                                                        classroom: selected_classroom
                                                    })}
                                                    variant="primary"
                                                    className="inline-flex items-center text-sm"
                                                    disabled={!selected_term || !selected_classroom}
                                                >
                                                    <PrinterIcon className="h-4 w-4 mr-1" />
                                                    Print Report Card
                                                </Button>
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

                    {(results || compiled_results) && Object.keys(filteredGroupedResults).length === 0 && (
                        <Card>
                            <div className="p-6 text-center">
                                {searchQuery ? (
                                    <div>
                                        <p className="text-gray-500 mb-2">No students found matching "{searchQuery}"</p>
                                        <Button
                                            onClick={clearSearch}
                                            variant="secondary"
                                            size="sm"
                                        >
                                            Clear search
                                        </Button>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No results found for the selected filters.</p>
                                )}
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
