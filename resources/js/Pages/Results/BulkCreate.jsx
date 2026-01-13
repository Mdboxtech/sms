import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, PageHeader } from '@/Components/UI';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';
import SearchableSelect from '@/Components/SearchableSelect';
import { TrashIcon, PlusIcon, UserIcon, UsersIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

export default function BulkCreate({ auth, classrooms = [], subjects = [], terms = [] }) {
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        term_id: '',
        results: [{ student_id: '', subject_id: '', ca_score: '', exam_score: '' }]
    });

    const [selectedClassroom, setSelectedClassroom] = useState('');
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [entryMode, setEntryMode] = useState('multi'); // 'single' or 'multi'
    const [selectedStudent, setSelectedStudent] = useState(''); // For single student mode
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch students when classroom changes
    const handleClassroomChange = (classroomId) => {
        setSelectedClassroom(classroomId);
        setSelectedStudent('');
        setSuccessMessage('');
        setErrorMessage('');

        // Reset all student selections when classroom changes
        const resetResults = data.results.map(r => ({ ...r, student_id: '' }));
        setData('results', resetResults);

        if (classroomId) {
            setLoadingStudents(true);
            axios.get(route('admin.results.students-by-classroom', { classroom: classroomId }))
                .then(response => {
                    setStudents(response.data);
                })
                .catch(error => {
                    console.error('Error fetching students:', error);
                    setStudents([]);
                })
                .finally(() => {
                    setLoadingStudents(false);
                });
        } else {
            setStudents([]);
        }
    };

    // Handle single student selection - auto-populate student_id in all rows
    const handleSingleStudentChange = (studentId) => {
        setSelectedStudent(studentId);
        // Update all existing rows with this student
        const updatedResults = data.results.map(r => ({ ...r, student_id: studentId }));
        setData('results', updatedResults);
    };

    // Get grade remark based on score
    const getGradeRemark = (score) => {
        if (score >= 90) return { text: 'Excellent', color: 'text-green-600' };
        if (score >= 80) return { text: 'Excellent', color: 'text-green-600' };
        if (score >= 70) return { text: 'Very Good', color: 'text-blue-600' };
        if (score >= 60) return { text: 'Good', color: 'text-indigo-600' };
        if (score >= 50) return { text: 'Fair', color: 'text-yellow-600' };
        if (score >= 45) return { text: 'Pass', color: 'text-orange-500' };
        if (score >= 40) return { text: 'Pass', color: 'text-orange-500' };
        return { text: 'Fail', color: 'text-red-600' };
    };

    // Calculate total directly from the result values
    const getTotal = (result) => {
        const ca = parseFloat(result.ca_score) || 0;
        const exam = parseFloat(result.exam_score) || 0;
        return ca + exam;
    };

    const addRow = () => {
        setData('results', [
            ...data.results,
            {
                student_id: entryMode === 'single' ? selectedStudent : '',
                subject_id: '',
                ca_score: '',
                exam_score: ''
            }
        ]);
    };

    const removeRow = (index) => {
        if (data.results.length === 1) return; // Keep at least one row
        const newResults = data.results.filter((_, i) => i !== index);
        setData('results', newResults);
    };

    const updateResult = (index, field, value) => {
        const newResults = [...data.results];
        newResults[index] = { ...newResults[index], [field]: value };
        setData('results', newResults);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');

        post(route('admin.results.bulk-store'), {
            onSuccess: () => {
                setSuccessMessage(`Successfully saved ${data.results.length} result(s)!`);
                reset();
                setData('results', [{ student_id: entryMode === 'single' ? selectedStudent : '', subject_id: '', ca_score: '', exam_score: '' }]);
            },
            onError: (errors) => {
                setErrorMessage('Failed to save results. Please check the form for errors.');
            }
        });
    };

    // Toggle entry mode
    const toggleEntryMode = (mode) => {
        setEntryMode(mode);
        setSelectedStudent('');
        setData('results', [{ student_id: '', subject_id: '', ca_score: '', exam_score: '' }]);
    };

    // Create student options for SearchableSelect
    const studentOptions = students.map(student => ({
        id: student.id,
        name: `${student.user?.name || 'Unknown'} (${student.admission_number || 'N/A'})`
    }));

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<PageHeader>Bulk Create Results</PageHeader>}
        >
            <Head title="Bulk Create Results - SMS" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Success Message */}
                    {(successMessage || flash?.success) && (
                        <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                            <div className="flex items-center">
                                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                                <p className="text-green-700 font-medium">{successMessage || flash?.success}</p>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {(errorMessage || flash?.error) && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                            <div className="flex items-center">
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-3" />
                                <p className="text-red-700 font-medium">{errorMessage || flash?.error}</p>
                            </div>
                        </div>
                    )}

                    <Card>
                        <form onSubmit={handleSubmit} className="space-y-6 p-6">
                            {/* Entry Mode Toggle */}
                            <div className="flex items-center justify-center space-x-4 mb-6">
                                <button
                                    type="button"
                                    onClick={() => toggleEntryMode('single')}
                                    className={`flex items-center px-4 py-2 rounded-lg border-2 transition-all ${entryMode === 'single'
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                            : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                                        }`}
                                >
                                    <UserIcon className="h-5 w-5 mr-2" />
                                    Single Student
                                    <span className="ml-2 text-xs opacity-75">(Multiple Subjects)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleEntryMode('multi')}
                                    className={`flex items-center px-4 py-2 rounded-lg border-2 transition-all ${entryMode === 'multi'
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                            : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                                        }`}
                                >
                                    <UsersIcon className="h-5 w-5 mr-2" />
                                    Multiple Students
                                    <span className="ml-2 text-xs opacity-75">(Different Students)</span>
                                </button>
                            </div>

                            {/* Classroom, Term, and Student Selection */}
                            <div className={`grid grid-cols-1 gap-6 mb-6 ${entryMode === 'single' ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                                <div>
                                    <InputLabel htmlFor="classroom_id" value="Classroom" />
                                    <SearchableSelect
                                        value={selectedClassroom}
                                        onChange={handleClassroomChange}
                                        options={classrooms.map(c => ({ id: c.id, name: c.name }))}
                                        placeholder="Select a classroom first..."
                                        displayValue={(classroom) => classroom?.name || ''}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {students.length > 0
                                            ? `${students.length} students in this class`
                                            : selectedClassroom ? 'Loading students...' : 'Select a classroom to load students'
                                        }
                                    </p>
                                </div>
                                <div>
                                    <InputLabel htmlFor="term_id" value="Term" />
                                    <SearchableSelect
                                        value={data.term_id}
                                        onChange={value => setData('term_id', value)}
                                        options={terms.map(term => ({
                                            id: term.id,
                                            name: `${(term.academicSession || term.academic_session)?.name || 'Unknown'} - ${term.name}`
                                        }))}
                                        placeholder="Select a term"
                                        displayValue={(term) => term?.name || ''}
                                        error={errors.term_id}
                                    />
                                    <InputError message={errors.term_id} className="mt-2" />
                                </div>

                                {/* Single Student Mode: Student Selection */}
                                {entryMode === 'single' && (
                                    <div>
                                        <InputLabel htmlFor="student_id" value="Student" />
                                        <SearchableSelect
                                            value={selectedStudent}
                                            onChange={handleSingleStudentChange}
                                            options={studentOptions}
                                            placeholder={loadingStudents ? "Loading..." : "Select a student"}
                                            displayValue={(student) => student?.name || ''}
                                            disabled={!selectedClassroom || loadingStudents}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Enter results for multiple subjects for this student
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Results Entry */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-semibold text-gray-700">
                                        {entryMode === 'single' ? 'Subject Scores' : 'Student Results'}
                                    </h3>
                                    <span className="text-xs text-gray-500">
                                        {entryMode === 'single' ? 'Enter scores for each subject' : 'Enter results for different students'}
                                    </span>
                                </div>

                                {data.results.map((result, index) => (
                                    <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                                        <div className={`grid grid-cols-1 gap-4 flex-1 ${entryMode === 'single' ? 'md:grid-cols-4' : 'md:grid-cols-5'}`}>
                                            {/* Student selector only for multi mode */}
                                            {entryMode === 'multi' && (
                                                <div>
                                                    <SearchableSelect
                                                        value={result.student_id}
                                                        onChange={value => updateResult(index, 'student_id', value)}
                                                        options={studentOptions}
                                                        placeholder={loadingStudents ? "Loading..." : "Select Student"}
                                                        displayValue={(student) => student?.name || ''}
                                                        disabled={!selectedClassroom || loadingStudents}
                                                    />
                                                </div>
                                            )}
                                            <div>
                                                <SelectInput
                                                    value={result.subject_id}
                                                    onChange={e => updateResult(index, 'subject_id', e.target.value)}
                                                    className="block w-full"
                                                >
                                                    <option value="">Select Subject</option>
                                                    {subjects.map(subject => (
                                                        <option key={subject.id} value={subject.id}>
                                                            {subject.name || 'Unknown Subject'}
                                                        </option>
                                                    ))}
                                                </SelectInput>
                                            </div>
                                            <div>
                                                <TextInput
                                                    type="number"
                                                    min="0"
                                                    max="40"
                                                    placeholder="CA Score"
                                                    value={result.ca_score}
                                                    onChange={e => updateResult(index, 'ca_score', e.target.value)}
                                                    className="block w-full"
                                                />
                                            </div>
                                            <div>
                                                <TextInput
                                                    type="number"
                                                    min="0"
                                                    max="60"
                                                    placeholder="Exam Score"
                                                    value={result.exam_score}
                                                    onChange={e => updateResult(index, 'exam_score', e.target.value)}
                                                    className="block w-full"
                                                />
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {(() => {
                                                    const total = getTotal(result);
                                                    const grade = getGradeRemark(total);
                                                    return (
                                                        <div className="flex flex-col items-center min-w-[60px]">
                                                            <div className="bg-gray-100 px-3 py-1 rounded-md text-center text-sm font-semibold">
                                                                {total}
                                                            </div>
                                                            <span className={`text-xs font-medium ${grade.color}`}>
                                                                {total > 0 ? grade.text : '—'}
                                                            </span>
                                                        </div>
                                                    );
                                                })()}
                                                <button
                                                    type="button"
                                                    onClick={() => removeRow(index)}
                                                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                                    disabled={data.results.length === 1}
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={addRow}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <PlusIcon className="h-5 w-5 mr-2" />
                                    Add Another {entryMode === 'single' ? 'Subject' : 'Result'}
                                </button>

                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-600">
                                        Total Results: {data.results.length}
                                    </span>
                                    <PrimaryButton
                                        type="submit"
                                        className="bg-indigo-600 hover:bg-indigo-700"
                                        disabled={processing || !data.term_id || !selectedClassroom || (entryMode === 'single' && !selectedStudent)}
                                    >
                                        {processing ? 'Saving...' : 'Save All Results'}
                                    </PrimaryButton>
                                </div>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
