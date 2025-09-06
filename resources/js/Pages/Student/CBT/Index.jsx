import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/ui/Button';
import Card from '@/Components/ui/Card';
import { FormInput, FormLabel, FormSelect } from '@/Components/UI';

export default function Index({ 
    auth, 
    availableExams, 
    completedExams, 
    upcomingExams,
    subjects,
    filters 
}) {
    const [activeTab, setActiveTab] = useState('available');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedSubject, setSelectedSubject] = useState(filters.subject_id || '');

    const handleSearch = () => {
        router.get(route('student.cbt.index'), {
            search: searchTerm,
            subject_id: selectedSubject,
            tab: activeTab
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedSubject('');
        router.get(route('student.cbt.index'), { tab: activeTab });
    };

    const startExam = (examId) => {
        if (confirm('Are you ready to start this exam? Once started, the timer will begin.')) {
            router.get(route('student.cbt.exam.start', examId));
        }
    };

    const viewResult = (examId) => {
        router.get(route('student.cbt.exam.result', examId));
    };

    const getBadgeClasses = (type, value) => {
        const baseClasses = 'inline-block px-2 py-1 text-xs font-semibold rounded-full';
        
        if (type === 'exam_type') {
            switch (value) {
                case 'quiz': return baseClasses + ' bg-blue-100 text-blue-800';
                case 'test': return baseClasses + ' bg-yellow-100 text-yellow-800';
                case 'exam': return baseClasses + ' bg-purple-100 text-purple-800';
                default: return baseClasses + ' bg-gray-100 text-gray-800';
            }
        }
        
        if (type === 'difficulty') {
            switch (value) {
                case 'easy': return baseClasses + ' bg-green-100 text-green-800';
                case 'medium': return baseClasses + ' bg-yellow-100 text-yellow-800';
                case 'hard': return baseClasses + ' bg-red-100 text-red-800';
                default: return baseClasses + ' bg-gray-100 text-gray-800';
            }
        }
        
        return baseClasses + ' bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeRemaining = (endTime) => {
        const now = new Date();
        const end = new Date(endTime);
        const diff = end - now;
        
        if (diff <= 0) return 'Expired';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const ExamCard = ({ exam, type }) => (
        <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                        <p className="text-sm text-gray-600">
                            {exam.subject?.name} • {exam.classroom?.name}
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <span className={getBadgeClasses('exam_type', exam.exam_type)}>
                            {exam.exam_type?.charAt(0).toUpperCase() + exam.exam_type?.slice(1)}
                        </span>
                        {exam.difficulty_level && (
                            <span className={getBadgeClasses('difficulty', exam.difficulty_level)}>
                                {exam.difficulty_level}
                            </span>
                        )}
                    </div>
                </div>

                {/* Description */}
                {exam.description && (
                    <p className="text-sm text-gray-700">{exam.description}</p>
                )}

                {/* Exam Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 border-t border-b">
                    <div className="text-center">
                        <p className="text-lg font-bold text-blue-600">{exam.questions_count || 0}</p>
                        <p className="text-xs text-gray-500">Questions</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold text-green-600">{exam.total_marks || 0}</p>
                        <p className="text-xs text-gray-500">Total Marks</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold text-purple-600">{exam.duration}</p>
                        <p className="text-xs text-gray-500">Minutes</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold text-orange-600">{exam.attempts_allowed || 1}</p>
                        <p className="text-xs text-gray-500">Attempts</p>
                    </div>
                </div>

                {/* Schedule Info */}
                <div className="space-y-2">
                    {type === 'available' && (
                        <>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Available until:</span>
                                <span className="font-medium">{formatDate(exam.end_time)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Time remaining:</span>
                                <span className={`font-medium ${
                                    getTimeRemaining(exam.end_time) === 'Expired' 
                                        ? 'text-red-600' 
                                        : 'text-green-600'
                                }`}>
                                    {getTimeRemaining(exam.end_time)}
                                </span>
                            </div>
                        </>
                    )}
                    
                    {type === 'upcoming' && (
                        <>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Starts at:</span>
                                <span className="font-medium">{formatDate(exam.start_time)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Ends at:</span>
                                <span className="font-medium">{formatDate(exam.end_time)}</span>
                            </div>
                        </>
                    )}
                    
                    {type === 'completed' && exam.student_attempt && (
                        <>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Completed:</span>
                                <span className="font-medium">{formatDate(exam.student_attempt.completed_at)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Score:</span>
                                <span className="font-medium text-blue-600">
                                    {exam.student_attempt.score} / {exam.total_marks} 
                                    ({Math.round((exam.student_attempt.score / exam.total_marks) * 100)}%)
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                    {type === 'available' && (
                        <Button
                            variant="primary"
                            onClick={() => startExam(exam.id)}
                            className="flex-1"
                            disabled={getTimeRemaining(exam.end_time) === 'Expired'}
                        >
                            {getTimeRemaining(exam.end_time) === 'Expired' ? 'Expired' : 'Start Exam'}
                        </Button>
                    )}
                    
                    {type === 'upcoming' && (
                        <Button
                            variant="outline"
                            disabled
                            className="flex-1"
                        >
                            Not Yet Available
                        </Button>
                    )}
                    
                    {type === 'completed' && (
                        <Button
                            variant="outline"
                            onClick={() => viewResult(exam.id)}
                            className="flex-1"
                        >
                            View Results
                        </Button>
                    )}
                    
                    <Button
                        variant="outline"
                        onClick={() => router.get(route('student.cbt.exam.details', exam.id))}
                    >
                        Details
                    </Button>
                </div>
            </div>
        </Card>
    );

    const getCurrentExams = () => {
        switch (activeTab) {
            case 'available': return availableExams;
            case 'upcoming': return upcomingExams;
            case 'completed': return completedExams;
            default: return availableExams;
        }
    };

    const currentExams = getCurrentExams();

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    My Exams
                </h2>
            }
        >
            <Head title="My Exams" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <Card className="p-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">{availableExams.length}</p>
                                <p className="text-sm text-gray-600">Available Exams</p>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">{upcomingExams.length}</p>
                                <p className="text-sm text-gray-600">Upcoming Exams</p>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-purple-600">{completedExams.length}</p>
                                <p className="text-sm text-gray-600">Completed Exams</p>
                            </div>
                        </Card>
                    </div>

                    {/* Search & Filter */}
                    <Card className="mb-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Search & Filter</h3>
                            
                            <div className="flex space-x-2">
                                <div className="flex-1">
                                    <FormInput
                                        type="text"
                                        placeholder="Search exams..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-full"
                                    />
                                </div>
                                <div className="w-48">
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
                                <Button onClick={handleSearch}>Search</Button>
                                <Button variant="outline" onClick={clearFilters}>Clear</Button>
                            </div>
                        </div>
                    </Card>

                    {/* Tabs */}
                    <Card className="mb-6">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8">
                                {[
                                    { key: 'available', label: 'Available Exams', count: availableExams.length },
                                    { key: 'upcoming', label: 'Upcoming', count: upcomingExams.length },
                                    { key: 'completed', label: 'Completed', count: completedExams.length }
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === tab.key
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        {tab.label} ({tab.count})
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </Card>

                    {/* Exams Grid */}
                    {currentExams.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {currentExams.map((exam) => (
                                <ExamCard 
                                    key={exam.id} 
                                    exam={exam} 
                                    type={activeTab}
                                />
                            ))}
                        </div>
                    ) : (
                        <Card className="text-center py-12">
                            <div className="text-gray-500">
                                <h3 className="text-lg font-medium mb-2">
                                    No {activeTab} exams found
                                </h3>
                                <p>
                                    {activeTab === 'available' && 'There are no exams available for you to take right now.'}
                                    {activeTab === 'upcoming' && 'You have no upcoming exams scheduled.'}
                                    {activeTab === 'completed' && 'You haven\'t completed any exams yet.'}
                                </p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
