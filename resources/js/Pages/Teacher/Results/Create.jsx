import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, PageHeader } from '@/Components/UI';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function Create({ subjects, students, classrooms, terms, selected_classroom }) {
    const [availableStudents, setAvailableStudents] = useState(students || []);
    const [selectedClassroom, setSelectedClassroom] = useState(selected_classroom || '');
    
    const { data, setData, post, processing, errors, reset } = useForm({
        student_id: '',
        subject_id: '',
        term_id: '',
        ca_score: '',
        exam_score: '',
        generate_remark: false
    });

    // Fetch students when classroom changes
    useEffect(() => {
        if (selectedClassroom) {
            axios.get(route('teacher.results.classroom.students', { classroom: selectedClassroom }))
                .then(response => {
                    setAvailableStudents(response.data);
                })
                .catch(error => {
                    console.error('Error fetching students:', error);
                    setAvailableStudents([]);
                });
        } else {
            setAvailableStudents([]);
        }
    }, [selectedClassroom]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('teacher.results.store'), {
            onSuccess: () => {
                reset();
            }
        });
    };

    const totalScore = (parseFloat(data.ca_score) || 0) + (parseFloat(data.exam_score) || 0);

    const getGrade = (score) => {
        if (score >= 70) return { grade: 'A', remark: 'Excellent', color: 'text-green-600' };
        if (score >= 60) return { grade: 'B', remark: 'Very Good', color: 'text-green-500' };
        if (score >= 50) return { grade: 'C', remark: 'Good', color: 'text-blue-500' };
        if (score >= 40) return { grade: 'D', remark: 'Pass', color: 'text-yellow-500' };
        return { grade: 'F', remark: 'Fail', color: 'text-red-500' };
    };

    const gradeInfo = getGrade(totalScore);

    return (
        <AuthenticatedLayout>
            <Head title="Add Result" />
            
            <div className="space-y-6">
                <PageHeader
                    title="Add New Result"
                    subtitle="Enter result for a student"
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Classroom Selection (for filtering students) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Classroom (to filter students)
                                    </label>
                                    <select
                                        value={selectedClassroom}
                                        onChange={(e) => setSelectedClassroom(e.target.value)}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">Select a classroom...</option>
                                        {classrooms.map((classroom) => (
                                            <option key={classroom.id} value={classroom.id}>
                                                {classroom.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Student Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Student *
                                        </label>
                                        <select
                                            value={data.student_id}
                                            onChange={(e) => setData('student_id', e.target.value)}
                                            className={`w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                                errors.student_id ? 'border-red-500' : ''
                                            }`}
                                            required
                                        >
                                            <option value="">Select student...</option>
                                            {availableStudents.map((student) => (
                                                <option key={student.id} value={student.id}>
                                                    {student.user.name} ({student.admission_number})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.student_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.student_id}</p>
                                        )}
                                    </div>

                                    {/* Subject Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Subject *
                                        </label>
                                        <select
                                            value={data.subject_id}
                                            onChange={(e) => setData('subject_id', e.target.value)}
                                            className={`w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                                errors.subject_id ? 'border-red-500' : ''
                                            }`}
                                            required
                                        >
                                            <option value="">Select subject...</option>
                                            {subjects.map((subject) => (
                                                <option key={subject.id} value={subject.id}>
                                                    {subject.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.subject_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.subject_id}</p>
                                        )}
                                    </div>

                                    {/* Term Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Term *
                                        </label>
                                        <select
                                            value={data.term_id}
                                            onChange={(e) => setData('term_id', e.target.value)}
                                            className={`w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                                errors.term_id ? 'border-red-500' : ''
                                            }`}
                                            required
                                        >
                                            <option value="">Select term...</option>
                                            {terms.map((term) => (
                                                <option key={term.id} value={term.id}>
                                                    {term.name} - {term.academic_session?.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.term_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.term_id}</p>
                                        )}
                                    </div>

                                    {/* CA Score */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            CA Score (0-40) *
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="40"
                                            step="0.01"
                                            value={data.ca_score}
                                            onChange={(e) => setData('ca_score', e.target.value)}
                                            className={`w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                                errors.ca_score ? 'border-red-500' : ''
                                            }`}
                                            required
                                        />
                                        {errors.ca_score && (
                                            <p className="mt-1 text-sm text-red-600">{errors.ca_score}</p>
                                        )}
                                    </div>

                                    {/* Exam Score */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Exam Score (0-60) *
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="60"
                                            step="0.01"
                                            value={data.exam_score}
                                            onChange={(e) => setData('exam_score', e.target.value)}
                                            className={`w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                                errors.exam_score ? 'border-red-500' : ''
                                            }`}
                                            required
                                        />
                                        {errors.exam_score && (
                                            <p className="mt-1 text-sm text-red-600">{errors.exam_score}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Options */}
                                <div>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={data.generate_remark}
                                            onChange={(e) => setData('generate_remark', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">
                                            Generate AI-powered remark
                                        </span>
                                    </label>
                                </div>

                                {errors.duplicate && (
                                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                        <p className="text-sm text-red-600">{errors.duplicate}</p>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-3">
                                    <Link
                                        href={route('teacher.results.index')}
                                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                                    >
                                        {processing ? 'Saving...' : 'Save Result'}
                                    </button>
                                </div>
                            </form>
                        </Card>
                    </div>

                    {/* Score Preview */}
                    <div>
                        <Card>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Score Preview</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">CA Score:</span>
                                    <span className="font-medium">{data.ca_score || '0'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Exam Score:</span>
                                    <span className="font-medium">{data.exam_score || '0'}</span>
                                </div>
                                <hr />
                                <div className="flex justify-between text-lg">
                                    <span className="font-medium">Total:</span>
                                    <span className="font-bold">{totalScore}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Grade:</span>
                                    <span className={`font-medium ${gradeInfo.color}`}>
                                        {gradeInfo.grade}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Remark:</span>
                                    <span className={`text-sm ${gradeInfo.color}`}>
                                        {gradeInfo.remark}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
