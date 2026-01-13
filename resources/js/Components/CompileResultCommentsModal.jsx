import React, { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function CompileResultCommentsModal({ 
    show, 
    onClose, 
    student, 
    termResult, 
    canEditPrincipalComment,
    currentTerm, // Current term from parent
    currentClassroom, // Current classroom from parent
    selectedTermId, // Selected term ID
    selectedClassroomId, // Selected classroom ID
    userRole, // Current user's role
    currentUser // Current user information
}) {
    const [generatingTeacherComment, setGeneratingTeacherComment] = useState(false);
    const [generatingPrincipalComment, setGeneratingPrincipalComment] = useState(false);

    // Add safety checks for student and termResult
    if (!student) {
        console.error('Student is required but not provided');
        return null;
    }

    // Determine user permissions based on role
    const isAdmin = userRole === 'admin';
    const isTeacher = userRole === 'teacher';
    const isPrincipal = userRole === 'principal';
    
    // Check if user is the class teacher for this classroom
    const isClassTeacher = isTeacher && currentUser?.assigned_classrooms?.some(
        classroom => classroom.id === parseInt(selectedClassroomId)
    );
    
    // Determine what comments user can edit
    const canEditTeacherComment = isAdmin || isPrincipal || isClassTeacher;
    const canEditPrincipalCommentActual = isAdmin || isPrincipal;

    const { data, setData, patch, processing, errors, reset } = useForm({
        teacher_comment: termResult?.teacher_comment || '',
        principal_comment: termResult?.principal_comment || '',
    });

    // Update form data when termResult changes
    useEffect(() => {
        if (termResult) {
            setData({
                teacher_comment: termResult.teacher_comment || '',
                principal_comment: termResult.principal_comment || '',
            });
        }
    }, [termResult]);

    const { post: postAI } = useForm();
    
    const generateAIComment = (type) => {
        // Add safety check for student results
        if (!student.results || student.results.length === 0) {
            alert('No results available to generate comment from.');
            return;
        }

        const setGenerating = type === 'teacher' ? setGeneratingTeacherComment : setGeneratingPrincipalComment;
        setGenerating(true);
        
        // Calculate average score for fallback
        const totalScore = student.results.reduce((sum, result) => sum + (result.total_score || 0), 0);
        const averageScore = student.results.length > 0 ? totalScore / student.results.length : 0;
        
        // Try AI first
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
                
                // Fallback to auto-comment generation
                router.post(route('admin.api.ai.auto-comment'), {
                    average_score: averageScore,
                    results: student.results || [],
                    comment_type: type
                }, {
                    preserveScroll: true,
                    onSuccess: (response) => {
                        if (response.comment) {
                            setData(type === 'teacher' ? 'teacher_comment' : 'principal_comment', response.comment);
                        }
                        setGenerating(false);
                    },
                    onError: (fallbackError) => {
                        console.error('Auto Comment Generation Error:', fallbackError);
                        alert('Failed to generate comment. Please try again.');
                        setGenerating(false);
                    }
                });
            }
        });
    };

    // Get term_id safely
    const getTermId = () => {
        // First try to use the selected term ID from parent component
        if (selectedTermId) {
            return selectedTermId;
        }
        // Then try to get from termResult
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
        // First try to use the selected classroom ID from parent component
        if (selectedClassroomId) {
            return selectedClassroomId;
        }
        // Then try to get from student's current classroom
        if (student.classroom?.id) {
            return student.classroom.id;
        }
        // Then try to get from the first result's classroom
        if (student.results && student.results.length > 0) {
            return student.results[0].classroom_id;
        }
        return null;
    };

    // Debug function to show what data we have
    const debugClassroomAndTerm = () => {
        const classroomId = getClassroomId();
        const termId = getTermId();
        
        console.log('Debug - Modal Data:', {
            selectedClassroomId,
            selectedTermId,
            classroomId,
            termId,
            student: student ? {
                id: student.id,
                name: student.user?.name,
                classroom: student.classroom,
                results: student.results?.length || 0
            } : null,
            currentTerm,
            currentClassroom,
            userRole,
            canEditTeacherComment,
            canEditPrincipalCommentActual
        });
    };

    // Run debug on component mount
    useEffect(() => {
        if (show) {
            debugClassroomAndTerm();
        }
    }, [show, student]);

    const submit = (e) => {
        e.preventDefault();
        
        // Validate required data
        const termId = getTermId();
        const classroomId = getClassroomId();
        
        console.log('Submit - Validation Debug:', {
            termId,
            classroomId,
            studentId: student?.id,
            selectedTermId,
            selectedClassroomId,
            currentTerm,
            currentClassroom,
            student_classroom: student?.classroom,
            student_classroom_id: student?.classroom_id
        });
        
        if (!termId) {
            console.error('Missing term ID');
            alert('Unable to determine term ID. Please ensure you have selected a term and try again.');
            return;
        }

        if (!student.id) {
            console.error('Missing student ID');
            alert('Student ID is missing. Please refresh and try again.');
            return;
        }
        
        if (!classroomId) {
            console.error('Missing classroom ID');
            alert('Unable to determine classroom. Please ensure you have selected a classroom and try again.');
            return;
        }
        
        if (!termResult) {
            console.log('Creating new term result with data:', {
                student_id: student.id,
                term_id: termId,
                classroom_id: classroomId,
            });

            // First create the term result using Inertia
            router.post(route('admin.term-results.get-or-create'), {
                student_id: student.id,
                term_id: termId,
                classroom_id: classroomId,
            }, {
                preserveScroll: true,
                onSuccess: (page) => {
                    console.log('Term result creation response:', page);
                    // With Inertia back()->with(), the data is in page.props
                    const termResult = page.props.termResult;
                    if (termResult && termResult.id) {
                        // Now update the comments using the new term result
                        patch(route('admin.term-results.comments', termResult.id), {
                            preserveScroll: true,
                            data: {
                                teacher_comment: data.teacher_comment,
                                principal_comment: data.principal_comment,
                            },
                            onSuccess: () => {
                                alert('Comments updated successfully!');
                                onClose();
                                reset();
                            },
                            onError: (errors) => {
                                console.error('Error updating comments:', errors);
                                alert('Failed to update comments. Please try again.');
                            }
                        });
                    } else {
                        console.error('Invalid response structure:', page);
                        console.log('Available props:', Object.keys(page.props || {}));
                        alert('Failed to create term result. Invalid server response.');
                    }
                },
                onError: (errors) => {
                    console.error('Error creating term result:', errors);
                    
                    // Show specific error message if available
                    let errorMessage = 'Failed to create term result. Please try again.';
                    if (errors.error) {
                        errorMessage = errors.error;
                    } else if (errors.message) {
                        errorMessage = errors.message;
                    } else if (errors.details) {
                        // Handle validation errors
                        const validationErrors = Object.entries(errors.details)
                            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                            .join('; ');
                        errorMessage = `Validation failed: ${validationErrors}`;
                    } else if (typeof errors === 'string') {
                        errorMessage = errors;
                    }
                    
                    alert(errorMessage);
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
                    alert('Comments updated successfully!');
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

    // Check if classroom and term are selected
    const hasRequiredSelection = selectedClassroomId && selectedTermId;
    if (!hasRequiredSelection) {
        return (
            <Modal show={show} onClose={onClose} maxWidth="2xl">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-yellow-600">Selection Required</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Please select a classroom and term first before adding comments. 
                        Go back to the main page, choose a classroom and term, then try again.
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
                    {/* Teacher Comment Section - Only show if user can edit it */}
                    {canEditTeacherComment && (
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
                    )}
                    
                    {/* Show read-only teacher comment if user can't edit it but it exists */}
                    {!canEditTeacherComment && termResult?.teacher_comment && (
                        <div>
                            <InputLabel value="Class Teacher's Comment (Read Only)" />
                            <div className="mt-1 p-3 bg-gray-50 border border-gray-300 rounded-md">
                                <p className="text-sm text-gray-900">{termResult.teacher_comment}</p>
                            </div>
                        </div>
                    )}

                    {/* Principal Comment Section - Only show if user can edit it */}
                    {canEditPrincipalCommentActual && (
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
                    
                    {/* Show read-only principal comment if user can't edit it but it exists */}
                    {!canEditPrincipalCommentActual && termResult?.principal_comment && (
                        <div>
                            <InputLabel value="Principal's Comment (Read Only)" />
                            <div className="mt-1 p-3 bg-gray-50 border border-gray-300 rounded-md">
                                <p className="text-sm text-gray-900">{termResult.principal_comment}</p>
                            </div>
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
