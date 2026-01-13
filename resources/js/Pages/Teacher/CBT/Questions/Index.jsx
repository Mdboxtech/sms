import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DataTable from '@/Components/DataTable';
import Button from '@/Components/UI/Button';
import Card from '@/Components/UI/Card';
import { FormInput, FormLabel, FormSelect } from '@/Components/UI';
import { PenTool, CheckSquare, BookOpen } from 'lucide-react';

export default function Index({ 
    auth, 
    questions, 
    subjects, 
    filters, 
    questionTypes, 
    difficultyLevels 
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedSubject, setSelectedSubject] = useState(filters.subject_id || '');
    const [selectedType, setSelectedType] = useState(filters.question_type || '');
    const [selectedDifficulty, setSelectedDifficulty] = useState(filters.difficulty_level || '');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = () => {
        router.get(route('teacher.cbt.questions.index'), {
            search: searchTerm,
            subject_id: selectedSubject,
            question_type: selectedType,
            difficulty_level: selectedDifficulty,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedSubject('');
        setSelectedType('');
        setSelectedDifficulty('');
        router.get(route('teacher.cbt.questions.index'));
    };

    const handleDelete = (questionId) => {
        if (confirm('Are you sure you want to delete this question?')) {
            router.delete(route('teacher.cbt.questions.destroy', questionId), {
                onSuccess: () => {
                    alert('Question deleted successfully');
                },
                onError: (errors) => {
                    alert('Failed to delete question');
                }
            });
        }
    };

    const getBadgeClasses = (type, value) => {
        const baseClasses = 'inline-block px-2 py-1 text-xs font-semibold rounded-full';
        
        if (type === 'difficulty') {
            switch (value) {
                case 'easy': return baseClasses + ' bg-green-100 text-green-800';
                case 'medium': return baseClasses + ' bg-yellow-100 text-yellow-800';
                case 'hard': return baseClasses + ' bg-red-100 text-red-800';
                default: return baseClasses + ' bg-gray-100 text-gray-800';
            }
        }
        
        if (type === 'question_type') {
            switch (value) {
                case 'multiple_choice': return baseClasses + ' bg-blue-100 text-blue-800';
                case 'true_false': return baseClasses + ' bg-purple-100 text-purple-800';
                case 'essay': return baseClasses + ' bg-orange-100 text-orange-800';
                case 'fill_blank': return baseClasses + ' bg-teal-100 text-teal-800';
                default: return baseClasses + ' bg-gray-100 text-gray-800';
            }
        }
        
        if (type === 'status') {
            return value ? baseClasses + ' bg-green-100 text-green-800' : baseClasses + ' bg-red-100 text-red-800';
        }
        
        return baseClasses + ' bg-gray-100 text-gray-800';
    };

    const columns = [
        {
            header: 'Question',
            render: (question) => (
                <div className="max-w-md">
                    <p className="font-medium text-gray-900 truncate">
                        {question.question_text}
                    </p>
                    <p className="text-sm text-gray-500">
                        {question.subject?.name}
                    </p>
                </div>
            )
        },
        {
            header: 'Type',
            render: (question) => (
                <span className={getBadgeClasses('question_type', question.question_type)}>
                    {questionTypes[question.question_type]}
                </span>
            )
        },
        {
            header: 'Difficulty',
            render: (question) => (
                <span className={getBadgeClasses('difficulty', question.difficulty_level)}>
                    {difficultyLevels[question.difficulty_level]}
                </span>
            )
        },
        {
            header: 'Marks',
            render: (question) => (
                <span className="text-sm font-medium">{question.marks}</span>
            )
        },
        {
            header: 'Status',
            render: (question) => (
                <span className={getBadgeClasses('status', question.is_active)}>
                    {question.is_active ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            header: 'Actions',
            render: (question) => (
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.get(route('teacher.cbt.questions.show', question.id))}
                    >
                        View
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.get(route('teacher.cbt.questions.edit', question.id))}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(question.id)}
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
                        My Question Bank
                    </h2>
                    <Link href={route('teacher.cbt.questions.create')}>
                        <Button variant="primary">
                            Create Question
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title="My Questions" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <Card className="p-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">
                                    {questions.total || 0}
                                </p>
                                <p className="text-sm text-gray-600">Total Questions</p>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">
                                    {questions.data?.filter(q => q.is_active).length || 0}
                                </p>
                                <p className="text-sm text-gray-600">Active Questions</p>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-purple-600">
                                    {subjects.length || 0}
                                </p>
                                <p className="text-sm text-gray-600">Subjects</p>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-orange-600">
                                    {questions.data?.filter(q => q.question_type === 'multiple_choice').length || 0}
                                </p>
                                <p className="text-sm text-gray-600">Multiple Choice</p>
                            </div>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <Card className="mb-6 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link href={route('teacher.cbt.questions.create')}>
                                <Button variant="primary" className="w-full justify-center">
                                    <PenTool className="w-4 h-4 mr-2" />
                                    Create Question
                                </Button>
                            </Link>
                            <Link href={route('teacher.cbt.questions.import')}>
                                <Button variant="outline" className="w-full justify-center">
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    Import Questions
                                </Button>
                            </Link>
                            <Link href={route('teacher.cbt.exams.index')}>
                                <Button variant="outline" className="w-full justify-center">
                                    <CheckSquare className="w-4 h-4 mr-2" />
                                    Manage Exams
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    {/* Filter Section */}
                    <Card className="mb-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium">Search & Filter Questions</h3>
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
                                        placeholder="Search questions..."
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
                                            Type
                                        </FormLabel>
                                        <FormSelect
                                            value={selectedType}
                                            onChange={(e) => setSelectedType(e.target.value)}
                                            className="w-full"
                                        >
                                            <option value="">All Types</option>
                                            {Object.entries(questionTypes).map(([key, label]) => (
                                                <option key={key} value={key}>
                                                    {label}
                                                </option>
                                            ))}
                                        </FormSelect>
                                    </div>

                                    <div>
                                        <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                                            Difficulty
                                        </FormLabel>
                                        <FormSelect
                                            value={selectedDifficulty}
                                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                                            className="w-full"
                                        >
                                            <option value="">All Levels</option>
                                            {Object.entries(difficultyLevels).map(([key, label]) => (
                                                <option key={key} value={key}>
                                                    {label}
                                                </option>
                                            ))}
                                        </FormSelect>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Questions Table */}
                    <Card>
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">
                                My Questions ({questions.total} total)
                            </h3>
                            <DataTable
                                data={questions.data}
                                columns={columns}
                            />
                            
                            {/* Pagination */}
                            {questions.links && (
                                <div className="flex justify-center mt-6">
                                    <nav className="flex space-x-2">
                                        {questions.links.map((link, index) => (
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
            <Link href={route('teacher.cbt.questions.create')}>
                <button className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 z-50 group">
                    <PenTool className="w-6 h-6" />
                    <span className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        Create Question
                    </span>
                </button>
            </Link>
        </AuthenticatedLayout>
    );
}
