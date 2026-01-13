import React, { useState, useEffect, useRef } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { Badge } from '@/Components/UI/badge';
import { Alert, AlertDescription } from '@/Components/UI/alert';
import { 
    Clock, 
    Flag, 
    ChevronLeft, 
    ChevronRight, 
    AlertCircle,
    CheckCircle2,
    Circle
} from 'lucide-react';

export default function Take({ exam, attempt, timeRemaining, student }) {
    const { auth } = usePage().props;
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
    const [timeLeft, setTimeLeft] = useState(timeRemaining);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [autoSaveStatus, setAutoSaveStatus] = useState('saved');
    const [lastSavedAnswers, setLastSavedAnswers] = useState({}); // Track what was last saved
    const timerRef = useRef(null);
    const autoSaveRef = useRef(null);

    const questions = exam.questions || [];
    const currentQuestion = questions[currentQuestionIndex];

    // Initialize answers and flagged questions from attempt
    useEffect(() => {
        if (attempt.answers) {
            const answersMap = {};
            const flaggedSet = new Set();
            
            attempt.answers.forEach(answer => {
                answersMap[answer.question_id] = answer.answer_text || answer.selected_option;
                if (answer.is_flagged) {
                    flaggedSet.add(answer.question_id);
                }
            });
            
            setAnswers(answersMap);
            setLastSavedAnswers(answersMap); // Initialize what was last saved
            setFlaggedQuestions(flaggedSet);
        }
    }, [attempt]);

    // Timer countdown
    useEffect(() => {
        if (timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleAutoSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [timeLeft]);

    // Save answers when page unloads
    useEffect(() => {
        const handleBeforeUnload = (event) => {
            // Save current answer if there are unsaved changes
            if (currentQuestion && 
                answers[currentQuestion.id] && 
                answers[currentQuestion.id] !== lastSavedAnswers[currentQuestion.id]) {
                // Use navigator.sendBeacon for reliable saving on page unload
                const formData = new FormData();
                formData.append('question_id', currentQuestion.id);
                formData.append('answer', answers[currentQuestion.id]);
                formData.append('_token', document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '');
                
                navigator.sendBeacon(
                    route('student.cbt.exam.answer', attempt.id),
                    formData
                );
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [currentQuestion, answers, lastSavedAnswers, attempt.id]);

    // Auto-save answers - only trigger when answer actually changes
    useEffect(() => {
        if (autoSaveRef.current) {
            clearTimeout(autoSaveRef.current);
        }

        // Only auto-save if:
        // 1. We have a current question and an answer for it
        // 2. The answer is different from what was last saved
        // 3. We're not currently saving
        if (currentQuestion && 
            answers[currentQuestion.id] && 
            answers[currentQuestion.id] !== lastSavedAnswers[currentQuestion.id] &&
            autoSaveStatus !== 'saving') {
            
            autoSaveRef.current = setTimeout(() => {
                saveCurrentAnswer();
            }, 8000); // Increased to 8 seconds for less frequent saves
        }

        return () => {
            if (autoSaveRef.current) {
                clearTimeout(autoSaveRef.current);
            }
        };
    }, [answers[currentQuestion?.id], currentQuestion?.id, lastSavedAnswers[currentQuestion?.id], autoSaveStatus]);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    };

    const saveCurrentAnswer = async () => {
        if (!currentQuestion || 
            !answers[currentQuestion.id] || 
            autoSaveStatus === 'saving' ||
            answers[currentQuestion.id] === lastSavedAnswers[currentQuestion.id]) {
            return;
        }

        setAutoSaveStatus('saving');

        try {
            router.post(route('student.cbt.exam.answer', attempt.id), {
                question_id: currentQuestion.id,
                answer: answers[currentQuestion.id]
            }, {
                preserveState: true,
                preserveScroll: true,
                only: [], // Don't reload any data from server
                onSuccess: (page) => {
                    setAutoSaveStatus('saved');
                    // Update what was last saved
                    setLastSavedAnswers(prev => ({
                        ...prev,
                        [currentQuestion.id]: answers[currentQuestion.id]
                    }));
                },
                onError: (errors) => {
                    console.error('Auto-save failed:', errors);
                    setAutoSaveStatus('error');
                    // Retry after 10 seconds on error
                    setTimeout(() => {
                        if (answers[currentQuestion.id] !== lastSavedAnswers[currentQuestion.id]) {
                            setAutoSaveStatus('pending');
                        }
                    }, 10000);
                }
            });
        } catch (error) {
            console.error('Auto-save error:', error);
            setAutoSaveStatus('error');
        }
    };

    const handleAnswerChange = (value) => {
        const previousValue = answers[currentQuestion.id];
        
        // Only update if the value actually changed
        if (previousValue !== value) {
            setAnswers(prev => ({
                ...prev,
                [currentQuestion.id]: value
            }));
            // Set status to pending only if different from last saved
            if (value !== lastSavedAnswers[currentQuestion.id]) {
                setAutoSaveStatus('pending');
            }
        }
    };

    const handleFlagQuestion = async () => {
        const isCurrentlyFlagged = flaggedQuestions.has(currentQuestion.id);
        
        try {
            router.post(route('student.cbt.exam.flag', attempt.id), {
                question_id: currentQuestion.id,
                flagged: !isCurrentlyFlagged
            }, {
                preserveState: true,
                preserveScroll: true,
                only: [], // Don't reload any data
                onSuccess: (page) => {
                    setFlaggedQuestions(prev => {
                        const newSet = new Set(prev);
                        if (isCurrentlyFlagged) {
                            newSet.delete(currentQuestion.id);
                        } else {
                            newSet.add(currentQuestion.id);
                        }
                        return newSet;
                    });
                },
                onError: (errors) => {
                    console.error('Failed to flag question:', errors);
                }
            });
        } catch (error) {
            console.error('Failed to flag question:', error);
        }
    };

    const handleAutoSubmit = () => {
        setIsSubmitting(true);
        router.post(route('student.cbt.exam.submit', attempt.id), {}, {
            onSuccess: (page) => {
                console.log('Exam auto-submitted successfully');
            },
            onError: (errors) => {
                console.error('Auto-submission failed:', errors);
            },
            onFinish: () => setIsSubmitting(false)
        });
    };

    const handleSubmit = () => {
        if (window.confirm('Are you sure you want to submit your exam? This action cannot be undone.')) {
            setIsSubmitting(true);
            
            // Save current answer before submitting
            if (currentQuestion && 
                answers[currentQuestion.id] && 
                answers[currentQuestion.id] !== lastSavedAnswers[currentQuestion.id]) {
                saveCurrentAnswer();
            }
            
            router.post(route('student.cbt.exam.submit', attempt.id), {}, {
                onSuccess: (page) => {
                    console.log('Exam submitted successfully');
                },
                onError: (errors) => {
                    console.error('Submission failed:', errors);
                    alert('Failed to submit exam. Please try again.');
                },
                onFinish: () => setIsSubmitting(false)
            });
        }
    };

    const goToQuestion = (index) => {
        // Save current answer before changing questions
        if (currentQuestion && 
            answers[currentQuestion.id] && 
            answers[currentQuestion.id] !== lastSavedAnswers[currentQuestion.id]) {
            saveCurrentAnswer();
        }
        setCurrentQuestionIndex(index);
    };

    const goToPrevious = () => {
        if (currentQuestionIndex > 0) {
            // Save current answer before changing questions
            if (currentQuestion && 
                answers[currentQuestion.id] && 
                answers[currentQuestion.id] !== lastSavedAnswers[currentQuestion.id]) {
                saveCurrentAnswer();
            }
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const goToNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            // Save current answer before changing questions
            if (currentQuestion && 
                answers[currentQuestion.id] && 
                answers[currentQuestion.id] !== lastSavedAnswers[currentQuestion.id]) {
                saveCurrentAnswer();
            }
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const getQuestionStatus = (question) => {
        const hasAnswer = answers[question.id];
        const isFlagged = flaggedQuestions.has(question.id);
        
        if (isFlagged) return 'flagged';
        if (hasAnswer) return 'answered';
        return 'unanswered';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'answered': return 'bg-green-100 text-green-800 border-green-300';
            case 'flagged': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    if (timeLeft <= 0) {
        return (
            <AuthenticatedLayout user={auth.user}>
                <Head title="Exam Time Expired" />
                <div className="py-12">
                    <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Your exam time has expired. Your answers have been automatically submitted.
                            </AlertDescription>
                        </Alert>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            {exam.title}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {exam.subject.name} | Question {currentQuestionIndex + 1} of {questions.length}
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Badge variant={timeLeft < 300 ? 'destructive' : 'default'}>
                            <Clock className="h-4 w-4 mr-1" />
                            {formatTime(timeLeft)}
                        </Badge>
                        <Badge variant={autoSaveStatus === 'saved' ? 'default' : 
                                     autoSaveStatus === 'saving' ? 'secondary' :
                                     autoSaveStatus === 'error' ? 'destructive' : 'outline'}>
                            {autoSaveStatus === 'saving' ? 'Saving...' : 
                             autoSaveStatus === 'saved' ? '✓ Saved' : 
                             autoSaveStatus === 'error' ? '⚠ Save Error' : 
                             autoSaveStatus === 'pending' ? '○ Unsaved' : 'Auto-save'}
                        </Badge>
                    </div>
                </div>
            }
        >
            <Head title={`Taking: ${exam.title}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Question Navigation */}
                        <div className="lg:col-span-1">
                            <Card className="p-4 sticky top-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Questions</h3>
                                <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                                    {questions.map((question, index) => {
                                        const status = getQuestionStatus(question);
                                        const isCurrent = index === currentQuestionIndex;
                                        
                                        return (
                                            <button
                                                key={question.id}
                                                onClick={() => goToQuestion(index)}
                                                className={`
                                                    w-10 h-10 rounded-lg border-2 flex items-center justify-center text-sm font-medium
                                                    ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                                                    ${getStatusColor(status)}
                                                    hover:shadow-md transition-all
                                                `}
                                            >
                                                {status === 'answered' && <CheckCircle2 className="h-4 w-4" />}
                                                {status === 'flagged' && <Flag className="h-4 w-4" />}
                                                {status === 'unanswered' && <Circle className="h-4 w-4" />}
                                                <span className="sr-only">Question {index + 1}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                
                                <div className="mt-4 space-y-2 text-xs">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                                        <span>Answered</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
                                        <span>Flagged</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
                                        <span>Unanswered</span>
                                    </div>
                                </div>

                                {/* Manual Save Button */}
                                <Button 
                                    onClick={saveCurrentAnswer}
                                    disabled={autoSaveStatus === 'saving' || !currentQuestion || !answers[currentQuestion?.id] || answers[currentQuestion?.id] === lastSavedAnswers[currentQuestion?.id]}
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-4"
                                >
                                    {autoSaveStatus === 'saving' ? 'Saving...' : 'Save Answer'}
                                </Button>

                                <Button 
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="w-full mt-6"
                                    variant="destructive"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                                </Button>
                            </Card>
                        </div>

                        {/* Current Question */}
                        <div className="lg:col-span-3">
                            {currentQuestion && (
                                <Card className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                Question {currentQuestionIndex + 1}
                                            </h3>
                                            {currentQuestion.points && (
                                                <Badge variant="outline" className="mb-3">
                                                    {currentQuestion.points} points
                                                </Badge>
                                            )}
                                        </div>
                                        
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleFlagQuestion}
                                            className={flaggedQuestions.has(currentQuestion.id) ? 'bg-yellow-50 border-yellow-300' : ''}
                                        >
                                            <Flag className="h-4 w-4 mr-1" />
                                            {flaggedQuestions.has(currentQuestion.id) ? 'Unflag' : 'Flag'}
                                        </Button>
                                    </div>

                                    <div className="prose max-w-none mb-6">
                                        <p className="text-gray-900 text-base leading-relaxed">
                                            {currentQuestion.question_text}
                                        </p>
                                    </div>

                                    {/* Answer Options */}
                                    <div className="space-y-3">
                                        {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options && (
                                            <div className="space-y-2">
                                                {(() => {
                                                    // Normalize options to handle different formats
                                                    const normalizeOptions = (options) => {
                                                        if (!options) return [];
                                                        
                                                        if (Array.isArray(options)) {
                                                            // Check if it's an array of objects with 'text' property
                                                            if (options.length > 0 && typeof options[0] === 'object' && options[0] !== null && options[0].text) {
                                                                return options;
                                                            }
                                                            // Simple array: ['Option A', 'Option B']
                                                            return options.map((text, index) => ({
                                                                text: text,
                                                                value: index
                                                            }));
                                                        }
                                                        
                                                        if (typeof options === 'object') {
                                                            // Associative array: {A: 'Option A', B: 'Option B'}
                                                            return Object.entries(options).map(([key, text]) => ({
                                                                text: text,
                                                                value: key
                                                            }));
                                                        }
                                                        
                                                        return [];
                                                    };

                                                    return normalizeOptions(currentQuestion.options).map((option, index) => (
                                                        <label 
                                                            key={index}
                                                            className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`question_${currentQuestion.id}`}
                                                                value={option.text || option}
                                                                checked={answers[currentQuestion.id] === (option.text || option)}
                                                                onChange={(e) => handleAnswerChange(e.target.value)}
                                                                className="form-radio text-blue-600"
                                                            />
                                                            <span className="text-gray-900">{option.text || option}</span>
                                                        </label>
                                                    ));
                                                })()}
                                            </div>
                                        )}

                                        {currentQuestion.question_type === 'true_false' && (
                                            <div className="space-y-2">
                                                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                                    <input
                                                        type="radio"
                                                        name={`question_${currentQuestion.id}`}
                                                        value="True"
                                                        checked={answers[currentQuestion.id] === 'True'}
                                                        onChange={(e) => handleAnswerChange(e.target.value)}
                                                        className="form-radio text-blue-600"
                                                    />
                                                    <span className="text-gray-900">True</span>
                                                </label>
                                                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                                    <input
                                                        type="radio"
                                                        name={`question_${currentQuestion.id}`}
                                                        value="False"
                                                        checked={answers[currentQuestion.id] === 'False'}
                                                        onChange={(e) => handleAnswerChange(e.target.value)}
                                                        className="form-radio text-blue-600"
                                                    />
                                                    <span className="text-gray-900">False</span>
                                                </label>
                                            </div>
                                        )}

                                        {(currentQuestion.question_type === 'short_answer' || currentQuestion.question_type === 'essay') && (
                                            <textarea
                                                value={answers[currentQuestion.id] || ''}
                                                onChange={(e) => handleAnswerChange(e.target.value)}
                                                placeholder="Enter your answer here..."
                                                rows={currentQuestion.question_type === 'essay' ? 8 : 3}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        )}
                                    </div>

                                    {/* Navigation */}
                                    <div className="flex justify-between items-center mt-8 pt-6 border-t">
                                        <Button
                                            variant="outline"
                                            onClick={goToPrevious}
                                            disabled={currentQuestionIndex === 0}
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Previous
                                        </Button>

                                        <span className="text-sm text-gray-600">
                                            {currentQuestionIndex + 1} of {questions.length}
                                        </span>

                                        <Button
                                            onClick={goToNext}
                                            disabled={currentQuestionIndex === questions.length - 1}
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
