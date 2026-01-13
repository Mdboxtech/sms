import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/UI/Button';
import Card from '@/Components/UI/Card';
import { Plus, X, ArrowUp, ArrowDown, Edit } from 'lucide-react';
import { normalizeOptions, mapOptions } from '@/Utils/optionsUtils';

export default function Show({ auth, exam, questions, questionTypes = {}, difficultyLevels = {}, availableQuestions }) {
    const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const handleAddQuestion = (questionId, marks = null) => {
        router.post(route('admin.cbt.exams.questions.attach', exam.id), {
            question_id: questionId,
            marks_allocated: marks
        }, {
            onSuccess: () => {
                setShowAddQuestionModal(false);
                alert('Question added successfully');
            },
            onError: (errors) => {
                alert('Failed to add question');
                console.error(errors);
            }
        });
    };

    const handleRemoveQuestion = (questionId) => {
        if (confirm('Are you sure you want to remove this question from the exam?')) {
            router.delete(route('admin.cbt.exams.questions.detach', [exam.id, questionId]), {
                onSuccess: () => {
                    alert('Question removed successfully');
                },
                onError: (errors) => {
                    alert('Failed to remove question');
                }
            });
        }
    };

    const handleReorderQuestion = (questionId, direction) => {
        router.post(route('admin.cbt.exams.questions.reorder', exam.id), {
            question_id: questionId,
            direction: direction
        }, {
            onSuccess: () => {
                // Refresh the page to show new order
                router.reload();
            },
            onError: (errors) => {
                alert('Failed to reorder question');
            }
        });
    };

    const filteredAvailableQuestions = (availableQuestions || []).filter(q => 
        q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.subject?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
            router.delete(route('admin.cbt.exams.destroy', exam.id), {
                onSuccess: () => {
                    alert('Exam deleted successfully');
                    router.get(route('admin.cbt.exams.index'));
                },
                onError: (errors) => {
                    alert('Failed to delete exam');
                }
            });
        }
    };

    const handlePublish = () => {
        const action = exam.is_published ? 'unpublish' : 'publish';
        if (confirm(`Are you sure you want to ${action} this exam?`)) {
            router.post(route(`admin.cbt.exams.${action}`, exam.id), {}, {
                onSuccess: () => {
                    alert(`Exam ${action}ed successfully`);
                },
                onError: (errors) => {
                    alert(`Failed to ${action} exam`);
                }
            });
        }
    };

    const handleClone = () => {
        if (confirm('Are you sure you want to clone this exam?')) {
            router.post(route('admin.cbt.exams.clone', exam.id), {}, {
                onSuccess: () => {
                    alert('Exam cloned successfully');
                },
                onError: (errors) => {
                    alert('Failed to clone exam');
                }
            });
        }
    };

    const getBadgeClasses = (type, value) => {
        const baseClasses = 'inline-block px-3 py-1 text-sm font-semibold rounded-full';
        
        if (type === 'status') {
            return value ? baseClasses + ' bg-green-100 text-green-800' : baseClasses + ' bg-red-100 text-red-800';
        }
        
        if (type === 'published') {
            return value ? baseClasses + ' bg-blue-100 text-blue-800' : baseClasses + ' bg-gray-100 text-gray-800';
        }
        
        return baseClasses + ' bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getExamStatus = () => {
        if (!exam.is_active) return { text: 'Inactive', color: 'gray' };
        
        // Use the status field from database if available
        if (exam.status) {
            const statusColors = {
                'draft': { text: 'Draft', color: 'gray' },
                'scheduled': { text: 'Scheduled', color: 'blue' },
                'active': { text: 'Active', color: 'green' },
                'completed': { text: 'Completed', color: 'purple' },
                'cancelled': { text: 'Cancelled', color: 'red' }
            };
            return statusColors[exam.status] || { text: exam.status, color: 'gray' };
        }
        
        return { text: 'Active', color: 'green' };
    };

    const status = getExamStatus();

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Exam Details
                    </h2>
                    <div className="space-x-2">
                        <Button 
                            variant={exam.is_published ? 'outline' : 'primary'}
                            onClick={handlePublish}
                        >
                            {exam.is_published ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Button 
                            variant="outline"
                            onClick={handleClone}
                        >
                            Clone Exam
                        </Button>
                        <Link href={route('admin.cbt.exams.edit', exam.id)}>
                            <Button variant="outline">
                                Edit Exam
                            </Button>
                        </Link>
                        <Button 
                            variant="destructive"
                            onClick={handleDelete}
                        >
                            Delete Exam
                        </Button>
                        <Link href={route('admin.cbt.exams.index')}>
                            <Button variant="outline">
                                Back to Exams
                            </Button>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Exam - ${exam.title}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Exam Overview */}
                    <Card className="space-y-4">
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-semibold">{exam.title}</h3>
                            <div className="flex space-x-2">
                                <span className={getBadgeClasses('published', exam.is_published)}>
                                    {exam.is_published ? 'Published' : 'Draft'}
                                </span>
                                <span className={getBadgeClasses('status', exam.is_active)}>
                                    {exam.is_active ? 'Active' : 'Inactive'}
                                </span>
                                {exam.status && (
                                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                                        exam.status === 'active' ? 'bg-green-100 text-green-800' :
                                        exam.status === 'published' ? 'bg-blue-100 text-blue-800' :
                                        exam.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                                        exam.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                                    </span>
                                )}
                                <span className={`${getBadgeClasses('status', status.color === 'green')} ${
                                    status.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                                    status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                    status.color === 'gray' ? 'bg-gray-100 text-gray-800' : ''
                                }`}>
                                    {status.text}
                                </span>
                            </div>
                        </div>

                        {exam.description && (
                            <p className="text-gray-700">{exam.description}</p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-700 mb-2">Basic Information</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subject:</span>
                                        <span className="font-medium">{exam.subject?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Teacher:</span>
                                        <span className="font-medium">{exam.teacher?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Term:</span>
                                        <span className="font-medium">{exam.term?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Exam Type:</span>
                                        <span className="font-medium capitalize">{exam.exam_type || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Duration:</span>
                                        <span className="font-medium">{exam.duration_minutes || exam.duration} minutes</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Marks:</span>
                                        <span className="font-medium">{exam.total_marks}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Passing Marks:</span>
                                        <span className="font-medium">{exam.passing_marks || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className="font-medium capitalize">{exam.status || 'Draft'}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-700 mb-2">Schedule</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Created:</span>
                                        <span className="font-medium">{formatDate(exam.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Updated:</span>
                                        <span className="font-medium">{formatDate(exam.updated_at)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Exam Settings */}
                    <Card className="space-y-4">
                        <h3 className="text-lg font-semibold">Exam Settings</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Questions per Page:</span>
                                    <span className="font-medium">{exam.questions_per_page || 1}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shuffle Questions:</span>
                                    <span className="font-medium">{exam.randomize_questions ? 'Yes' : 'No'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shuffle Options:</span>
                                    <span className="font-medium">{exam.randomize_options ? 'Yes' : 'No'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Show Results:</span>
                                    <span className="font-medium">{exam.show_results_immediately ? 'Immediately' : 'Later'}</span>
                                </div>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Allow Review:</span>
                                    <span className="font-medium">{exam.allow_review ? 'Yes' : 'No'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Enable Proctoring:</span>
                                    <span className="font-medium">{exam.enable_proctoring ? 'Yes' : 'No'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Attempts Allowed:</span>
                                    <span className="font-medium">{exam.attempts_allowed || 'Unlimited'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Auto Submit:</span>
                                    <span className="font-medium">{exam.auto_submit ? 'Yes' : 'No'}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Assigned Classes */}
                    {exam.classrooms && exam.classrooms.length > 0 && (
                        <Card className="space-y-4">
                            <h3 className="text-lg font-semibold">Assigned Classes</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {exam.classrooms.map((classroom) => (
                                    <div key={classroom.id} className="bg-gray-50 p-3 rounded-lg">
                                        <p className="font-medium">{classroom.name}</p>
                                        <p className="text-sm text-gray-600">{classroom.students_count || 0} students</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Questions Management */}
                    {questions && questions.length > 0 ? (
                        <Card className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
                                <Button 
                                    variant="primary" 
                                    onClick={() => setShowAddQuestionModal(true)}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Question
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {questions.map((question, index) => (
                                    <div key={question.id} className="border rounded-lg p-4 bg-white">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
                                                <div className="flex space-x-1">
                                                    <button
                                                        onClick={() => handleReorderQuestion(question.id, 'up')}
                                                        disabled={index === 0}
                                                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Move Up"
                                                    >
                                                        <ArrowUp className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReorderQuestion(question.id, 'down')}
                                                        disabled={index === questions.length - 1}
                                                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Move Down"
                                                    >
                                                        <ArrowDown className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                                    {questionTypes[question.question_type] || question.question_type}
                                                </span>
                                                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                                                    {question.pivot?.marks_allocated || question.marks} marks
                                                </span>
                                                <Link href={route('admin.cbt.questions.edit', question.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="w-3 h-3 mr-1" />
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Button 
                                                    variant="destructive" 
                                                    size="sm"
                                                    onClick={() => handleRemoveQuestion(question.id)}
                                                >
                                                    <X className="w-3 h-3 mr-1" />
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                        <p className="text-gray-900 mb-2">{question.question_text}</p>
                                        
                                        {question.question_type === 'multiple_choice' && question.options && (
                                            <div className="ml-4 space-y-1">
                                                {mapOptions(question.options, (option, optIndex) => {
                                                    const isCorrect = option.is_correct || question.correct_answer === option.text;
                                                    
                                                    return (
                                                        <div key={optIndex} className={`text-sm p-2 rounded ${
                                                            isCorrect ? 'bg-green-50 text-green-800' : 'bg-gray-50'
                                                        }`}>
                                                            {String.fromCharCode(65 + optIndex)}. {option.text}
                                                            {isCorrect && <span className="ml-2 text-green-600">✓</span>}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ) : (
                        <Card className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Questions (0)</h3>
                                <Button 
                                    variant="primary" 
                                    onClick={() => setShowAddQuestionModal(true)}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Question
                                </Button>
                            </div>
                            <div className="text-center py-8">
                                <p className="text-gray-500 mb-4">No questions added to this exam yet.</p>
                                <Button 
                                    variant="primary" 
                                    onClick={() => setShowAddQuestionModal(true)}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Your First Question
                                </Button>
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            {/* Add Question Modal */}
            {showAddQuestionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Add Questions to Exam</h3>
                            <button
                                onClick={() => setShowAddQuestionModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Search questions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {filteredAvailableQuestions.length > 0 ? (
                                filteredAvailableQuestions.map((question) => (
                                    <div key={question.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                                        {questionTypes[question.question_type] || question.question_type}
                                                    </span>
                                                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                                                        {question.subject?.name}
                                                    </span>
                                                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                                                        {question.marks} marks
                                                    </span>
                                                </div>
                                                <p className="text-gray-900 text-sm mb-2">{question.question_text}</p>
                                                
                                                {question.question_type === 'multiple_choice' && question.options && (
                                                    <div className="ml-4 space-y-1">
                                                        {mapOptions(question.options, (option, optIndex) => {
                                                            const displayText = option.text && option.text.length > 50 ? option.text.substring(0, 50) + '...' : option.text;
                                                            
                                                            return (
                                                                <div key={optIndex} className="text-xs text-gray-600">
                                                                    {String.fromCharCode(65 + optIndex)}. {displayText}
                                                                </div>
                                                            );
                                                        }).slice(0, 2)}
                                                        {normalizeOptions(question.options).length > 2 && (
                                                            <div className="text-xs text-gray-500">
                                                                +{normalizeOptions(question.options).length - 2} more options
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => handleAddQuestion(question.id, question.marks)}
                                                >
                                                    <Plus className="w-3 h-3 mr-1" />
                                                    Add
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">
                                        {searchTerm ? 'No questions found matching your search.' : 'No available questions found.'}
                                    </p>
                                    <Link href={route('admin.cbt.questions.create')}>
                                        <Button variant="outline" className="mt-2">
                                            Create New Question
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-2 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setShowAddQuestionModal(false)}
                            >
                                Cancel
                            </Button>
                            <Link href={route('admin.cbt.questions.create')}>
                                <Button variant="primary">
                                    Create New Question
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
