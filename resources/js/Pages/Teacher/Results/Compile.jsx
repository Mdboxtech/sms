import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, PageHeader } from '@/Components/UI';
import { useState } from 'react';
import { 
    ChartBarIcon,
    DocumentTextIcon,
    UserGroupIcon,
    AcademicCapIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';

export default function Compile({ 
    classrooms = [], 
    terms = [], 
    compiledResults = [], 
    selectedClassroom = null, 
    selectedTerm = null,
    statistics = {}
}) {
    const { data, setData, post, processing, errors } = useForm({
        classroom_id: selectedClassroom?.id || '',
        term_id: selectedTerm?.id || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('teacher.results.compile'));
    };

    const getGrade = (score) => {
        if (score >= 70) return { grade: 'A', color: 'bg-green-100 text-green-800' };
        if (score >= 60) return { grade: 'B', color: 'bg-blue-100 text-blue-800' };
        if (score >= 50) return { grade: 'C', color: 'bg-yellow-100 text-yellow-800' };
        if (score >= 40) return { grade: 'D', color: 'bg-orange-100 text-orange-800' };
        return { grade: 'F', color: 'bg-red-100 text-red-800' };
    };

    return (
        <AuthenticatedLayout>
            <Head title="Compile Results - Teacher" />
            
            <div className="space-y-6">
                <PageHeader
                    title="Compile Results"
                    subtitle="Compile and view results for your subjects"
                />

                {/* Compilation Form */}
                <Card className="p-6">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <UserGroupIcon className="h-4 w-4 inline mr-1" />
                                Select Classroom
                            </label>
                            <select
                                value={data.classroom_id}
                                onChange={(e) => setData('classroom_id', e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            >
                                <option value="">Choose a classroom...</option>
                                {classrooms.map((classroom) => (
                                    <option key={classroom.id} value={classroom.id}>
                                        {classroom.name}
                                    </option>
                                ))}
                            </select>
                            {errors.classroom_id && (
                                <p className="mt-1 text-sm text-red-600">{errors.classroom_id}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <DocumentTextIcon className="h-4 w-4 inline mr-1" />
                                Select Term
                            </label>
                            <select
                                value={data.term_id}
                                onChange={(e) => setData('term_id', e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            >
                                <option value="">Choose a term...</option>
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

                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={processing || !data.classroom_id || !data.term_id}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Compiling...' : 'Compile Results'}
                            </button>
                        </div>
                    </form>

                    {errors.compilation && (
                        <div className="mt-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-md">
                            {errors.compilation}
                        </div>
                    )}

                    {errors.classroom && (
                        <div className="mt-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-md">
                            {errors.classroom}
                        </div>
                    )}
                </Card>

                {/* Statistics */}
                {compiledResults.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="p-6">
                            <div className="flex items-center">
                                <UserGroupIcon className="h-8 w-8 text-blue-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-500">Total Students</p>
                                    <p className="text-2xl font-bold text-gray-900">{statistics.total_students || 0}</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center">
                                <AcademicCapIcon className="h-8 w-8 text-green-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-500">Subjects Taught</p>
                                    <p className="text-2xl font-bold text-gray-900">{statistics.subjects_taught || 0}</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center">
                                <ChartBarIcon className="h-8 w-8 text-purple-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-500">Classroom</p>
                                    <p className="text-lg font-bold text-gray-900">{selectedClassroom?.name}</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Compiled Results */}
                {compiledResults.length > 0 && (
                    <Card className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-6">
                            Compiled Results - {selectedClassroom?.name} ({selectedTerm?.name})
                        </h3>

                        <div className="space-y-6">
                            {compiledResults.map((studentResult) => (
                                <div key={studentResult.student.id} className="border border-gray-200 rounded-lg p-4">
                                    {/* Student Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h4 className="text-lg font-medium text-gray-900">
                                                {studentResult.student.user?.name || 'Unknown Student'}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                Admission: {studentResult.student.admission_number}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Overall Performance</p>
                                            <p className="text-lg font-bold text-blue-600">
                                                {studentResult.subjects.length} Subject{studentResult.subjects.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Subject Results */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {studentResult.subjects.map((subject) => {
                                            const gradeInfo = getGrade(subject.total_score);
                                            return (
                                                <div key={subject.subject_id} className="bg-gray-50 p-3 rounded-md">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h5 className="font-medium text-gray-900">{subject.subject_name}</h5>
                                                        <span className={`px-2 py-1 text-xs rounded-full ${gradeInfo.color}`}>
                                                            {gradeInfo.grade}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                                        <div>
                                                            <span className="text-gray-500">CA:</span>
                                                            <span className="ml-1 font-medium">{subject.ca_score}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Exam:</span>
                                                            <span className="ml-1 font-medium">{subject.exam_score}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Total:</span>
                                                            <span className="ml-1 font-bold">{subject.total_score}</span>
                                                        </div>
                                                    </div>
                                                    {subject.teacher_comment && (
                                                        <div className="mt-2 text-xs text-gray-600">
                                                            <span className="font-medium">Comment:</span> {subject.teacher_comment}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Empty State */}
                {compiledResults.length === 0 && selectedClassroom && selectedTerm && (
                    <Card className="p-12 text-center">
                        <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No results to compile</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            No results found for your subjects in {selectedClassroom.name} for {selectedTerm.name}.
                        </p>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
