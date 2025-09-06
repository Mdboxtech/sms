import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, PageHeader } from '@/Components/UI';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function BulkCreate({ subjects, students, classrooms, terms, selected_classroom, selected_subject, selected_term }) {
    const [availableStudents, setAvailableStudents] = useState(students || []);
    const [selectedClassroom, setSelectedClassroom] = useState(selected_classroom || '');
    const [results, setResults] = useState([]);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        term_id: selected_term || '',
        subject_id: selected_subject || '',
        classroom_id: selected_classroom || '',
        results: []
    });

    // Fetch students when classroom changes
    useEffect(() => {
        if (selectedClassroom) {
            axios.get(route('teacher.results.classroom.students', { classroom: selectedClassroom }))
                .then(response => {
                    setAvailableStudents(response.data);
                    // Initialize results for all students
                    const initialResults = response.data.map(student => ({
                        student_id: student.id,
                        subject_id: data.subject_id,
                        ca_score: '',
                        exam_score: '',
                        total_score: 0
                    }));
                    setResults(initialResults);
                })
                .catch(error => {
                    console.error('Error fetching students:', error);
                    setAvailableStudents([]);
                    setResults([]);
                });
        } else {
            setAvailableStudents([]);
            setResults([]);
        }
    }, [selectedClassroom]);

    // Update results when subject changes
    useEffect(() => {
        if (data.subject_id && availableStudents.length > 0) {
            setResults(prev => prev.map(result => ({
                ...result,
                subject_id: data.subject_id
            })));
        }
    }, [data.subject_id]);

    const updateResult = (index, field, value) => {
        const newResults = [...results];
        newResults[index][field] = value;
        
        // Calculate total score
        if (field === 'ca_score' || field === 'exam_score') {
            const caScore = parseFloat(newResults[index].ca_score) || 0;
            const examScore = parseFloat(newResults[index].exam_score) || 0;
            newResults[index].total_score = caScore + examScore;
        }
        
        setResults(newResults);
        setData('results', newResults);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Filter out empty results
        const validResults = results.filter(result => 
            result.ca_score !== '' && result.exam_score !== ''
        );
        
        if (validResults.length === 0) {
            alert('Please enter at least one result.');
            return;
        }
        
        setData('results', validResults);
        
        post(route('teacher.results.bulk-store'), {
            onSuccess: () => {
                reset();
                setResults([]);
            }
        });
    };

    const getGrade = (score) => {
        if (score >= 70) return { grade: 'A', remark: 'Excellent', color: 'text-green-600' };
        if (score >= 60) return { grade: 'B', remark: 'Very Good', color: 'text-green-500' };
        if (score >= 50) return { grade: 'C', remark: 'Good', color: 'text-blue-500' };
        if (score >= 40) return { grade: 'D', remark: 'Pass', color: 'text-yellow-500' };
        return { grade: 'F', remark: 'Fail', color: 'text-red-500' };
    };

    const validResults = results.filter(r => r.ca_score !== '' && r.exam_score !== '');
    const averageScore = validResults.length > 0 ? 
        validResults.reduce((sum, r) => sum + r.total_score, 0) / validResults.length : 0;

    return (
        <AuthenticatedLayout>
            <Head title="Bulk Result Entry" />
            
            <div className="space-y-6">
                <PageHeader
                    title="Bulk Result Entry"
                    subtitle="Enter results for multiple students at once"
                    actions={
                        <Link
                            href={route('teacher.results.index')}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Back to Results
                        </Link>
                    }
                />

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Selection Filters */}
                    <Card>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Parameters</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Classroom *
                                </label>
                                <select
                                    value={selectedClassroom}
                                    onChange={(e) => {
                                        setSelectedClassroom(e.target.value);
                                        setData('classroom_id', e.target.value);
                                    }}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select classroom...</option>
                                    {classrooms.map((classroom) => (
                                        <option key={classroom.id} value={classroom.id}>
                                            {classroom.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject *
                                </label>
                                <select
                                    value={data.subject_id}
                                    onChange={(e) => setData('subject_id', e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select subject...</option>
                                    {subjects.map((subject) => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Term *
                                </label>
                                <select
                                    value={data.term_id}
                                    onChange={(e) => setData('term_id', e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select term...</option>
                                    {terms.map((term) => (
                                        <option key={term.id} value={term.id}>
                                            {term.name} - {term.academic_session?.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </Card>

                    {/* Results Entry */}
                    {availableStudents.length > 0 && data.subject_id && data.term_id && (
                        <Card>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Enter Results ({availableStudents.length} students)
                                </h3>
                                {validResults.length > 0 && (
                                    <div className="text-sm text-gray-600">
                                        Class Average: {averageScore.toFixed(2)}
                                    </div>
                                )}
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Student
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                CA Score (0-40)
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Exam Score (0-60)
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Grade
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {availableStudents.map((student, index) => {
                                            const result = results[index] || {};
                                            const gradeInfo = getGrade(result.total_score || 0);
                                            
                                            return (
                                                <tr key={student.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {student.user.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {student.admission_number}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="40"
                                                            step="0.01"
                                                            value={result.ca_score || ''}
                                                            onChange={(e) => updateResult(index, 'ca_score', e.target.value)}
                                                            className="w-20 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="60"
                                                            step="0.01"
                                                            value={result.exam_score || ''}
                                                            onChange={(e) => updateResult(index, 'exam_score', e.target.value)}
                                                            className="w-20 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm font-medium">
                                                            {result.total_score || 0}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${gradeInfo.color} bg-gray-100`}>
                                                            {gradeInfo.grade}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {errors.results && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                            <p className="text-sm text-red-600">{errors.results}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {availableStudents.length > 0 && data.subject_id && data.term_id && (
                        <div className="flex justify-end space-x-3">
                            <Link
                                href={route('teacher.results.index')}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing || validResults.length === 0}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : `Save ${validResults.length} Results`}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
