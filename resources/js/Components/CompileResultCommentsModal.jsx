import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function CompileResultCommentsModal({ 
    show, 
    onClose, 
    student, 
    termResult, 
    canEditPrincipalComment,
    currentTerm // Add this prop to get current term info
}) {
    const [generatingTeacherComment, setGeneratingTeacherComment] = useState(false);
    const [generatingPrincipalComment, setGeneratingPrincipalComment] = useState(false);

    // Add safety checks for student and termResult
    if (!student) {
        console.error('Student is required but not provided');
        return null;
    }

    const { data, setData, patch, processing, errors, reset } = useForm({
        teacher_comment: termResult?.teacher_comment || '',
        principal_comment: termResult?.principal_comment || '',
    });

    const { post: postAI } = useForm();
    const { post: postCreateTerm } = useForm();
    
    const generateAIComment = (type) => {
        // Add safety check for student results
        if (!student.results || student.results.length === 0) {
            alert('No results available to generate comment from.');
            return;
        }

        const setGenerating = type === 'teacher' ? setGeneratingTeacherComment : setGeneratingPrincipalComment;
        setGenerating(true);
        
        postAI(route('admin.api.ai.analyze-performance'), {
            preserveScroll: true,
            data: {
                student_name: student.user?.name || 'Unknown Student',
                results: student.results || [],
                comment_type: type
            },
            onSuccess: (response) => {
                if (response.comment) {
                    setData(type === 'teacher' ? 'teacher_comment' : 'principal_comment', response.comment);
                }
                setGenerating(false);
            },
            onError: (error) => {
                console.error('AI Comment Generation Error:', error);
                alert('Failed to generate comment. Please try again.');
                setGenerating(false);
            }
        });
    };

    // Get term_id safely
    const getTermId = () => {
        // First try to get from termResult
        if (termResult?.term_id) {
            return termResult.term_id;
        }
        // Then try from student results
        if (student.results && student.results.length > 0) {
            return student.results[0].term_id;
        }
        // Finally try from currentTerm prop
        if (currentTerm?.id) {
            return currentTerm.id;
        }
        return null;
    };

    const getClassroomId = () => {
        // First try to get from student's current classroom
        if (student.classroom?.id) {
            return student.classroom.id;
        }
        // Then try to get from the first result's classroom
        if (student.results && student.results.length > 0) {
            return student.results[0].classroom_id;
        }
        return null;
    };

    const submit = (e) => {
        e.preventDefault();
        
        // Validate required data
        const termId = getTermId();
        if (!termId) {
            alert('Unable to determine term ID. Please refresh and try again.');
            return;
        }

        if (!student.id) {
            alert('Student ID is missing. Please refresh and try again.');
            return;
        }
        
        if (!termResult) {
            // First create the term result using Inertia
            const classroomId = getClassroomId();
            if (!classroomId) {
                alert('Unable to determine classroom. Please refresh and try again.');
                return;
            }

            postCreateTerm(route('admin.term-results.get-or-create'), {
                preserveScroll: true,
                data: {
                    student_id: student.id,
                    term_id: termId,
                    classroom_id: classroomId,
                },
                onSuccess: (response) => {
                    if (response.termResult && response.termResult.id) {
                        // Now update the comments using the new term result
                        patch(route('admin.term-results.comments', response.termResult.id), {
                            preserveScroll: true,
                            data: {
                                teacher_comment: data.teacher_comment,
                                principal_comment: data.principal_comment,
                            },
                            onSuccess: () => {
                                onClose();
                                reset();
                            },
                            onError: (errors) => {
                                console.error('Error updating comments:', errors);
                                alert('Failed to update comments. Please try again.');
                            }
                        });
                    } else {
                        console.error('Invalid response structure:', response);
                        alert('Failed to create term result. Invalid server response.');
                    }
                },
                onError: (errors) => {
                    console.error('Error creating term result:', errors);
                    alert('Failed to create term result. Please try again.');
                }
            });
        } else {
            // Update existing term result
            patch(route('admin.term-results.comments', termResult.id), {
                preserveScroll: true,
                data: {
                    teacher_comment: data.teacher_comment,
                    principal_comment: data.principal_comment,
                },
                onSuccess: () => {
                    onClose();
                    reset();
                },
                onError: (errors) => {
                    console.error('Error updating comments:', errors);
                    alert('Failed to update comments. Please try again.');
                }
            });
        }
    };

    // Don't render if essential data is missing
    if (!student || !student.user) {
        return (
            <Modal show={show} onClose={onClose} maxWidth="2xl">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-red-600">Error</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Student data is missing or incomplete. Please close this modal and try again.
                    </p>
                    <div className="mt-4 flex justify-end">
                        <SecondaryButton onClick={onClose}>Close</SecondaryButton>
                    </div>
                </div>
            </Modal>
        );
    }

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <form onSubmit={submit} className="p-6">
                <h2 className="text-lg font-medium text-gray-900">
                    Update Comments for {student.user.name}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    {student.admission_number} - {student.classroom?.name || 'No Class Assigned'}
                </p>

                <div className="mt-6 space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <InputLabel htmlFor="teacher_comment" value="Class Teacher's Comment" />
                            <button
                                type="button"
                                onClick={() => generateAIComment('teacher')}
                                className="inline-flex items-center px-3 py-1 text-sm text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                                disabled={generatingTeacherComment || !student.results || student.results.length === 0}
                            >
                                {generatingTeacherComment ? (
                                    <>
                                        <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="h-4 w-4 mr-1" />
                                        Generate AI Comment
                                    </>
                                )}
                            </button>
                        </div>
                        <textarea
                            id="teacher_comment"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            rows="4"
                            value={data.teacher_comment}
                            onChange={(e) => setData('teacher_comment', e.target.value)}
                            placeholder="Enter class teacher's comment..."
                        />
                        {errors.teacher_comment && (
                            <p className="mt-1 text-sm text-red-600">{errors.teacher_comment}</p>
                        )}
                    </div>

                    {canEditPrincipalComment && (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <InputLabel htmlFor="principal_comment" value="Principal's Comment" />
                                <button
                                    type="button"
                                    onClick={() => generateAIComment('principal')}
                                    className="inline-flex items-center px-3 py-1 text-sm text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                                    disabled={generatingPrincipalComment || !student.results || student.results.length === 0}
                                >
                                    {generatingPrincipalComment ? (
                                        <>
                                            <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <SparklesIcon className="h-4 w-4 mr-1" />
                                            Generate AI Comment
                                        </>
                                    )}
                                </button>
                            </div>
                            <textarea
                                id="principal_comment"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                rows="4"
                                value={data.principal_comment}
                                onChange={(e) => setData('principal_comment', e.target.value)}
                                placeholder="Enter principal's comment..."
                            />
                            {errors.principal_comment && (
                                <p className="mt-1 text-sm text-red-600">{errors.principal_comment}</p>
                            )}
                        </div>
                    )}
                </div>

                {(!student.results || student.results.length === 0) && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-700">
                            <strong>Note:</strong> No results available for this student. AI comment generation is disabled.
                        </p>
                    </div>
                )}

                <div className="mt-6 flex justify-end space-x-3">
                    <SecondaryButton onClick={onClose} type="button">Cancel</SecondaryButton>
                    <PrimaryButton type="submit" disabled={processing}>
                        {processing ? 'Saving...' : 'Save Comments'}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}