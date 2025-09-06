import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Send, Users, User, School } from 'lucide-react';

export default function Create({ classrooms, students, teachers }) {
    const { auth } = usePage().props;
    const [selectedTargetType, setSelectedTargetType] = useState('all');
    
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        body: '',
        target_type: 'all',
        target_id: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/notifications');
    };

    const handleTargetTypeChange = (e) => {
        const targetType = e.target.value;
        setSelectedTargetType(targetType);
        setData({
            ...data,
            target_type: targetType,
            target_id: targetType === 'all' ? '' : data.target_id
        });
    };

    const getTargetOptions = () => {
        switch (selectedTargetType) {
            case 'classroom':
                return classrooms.map(classroom => (
                    <option key={classroom.id} value={classroom.id}>
                        {classroom.name}
                    </option>
                ));
            case 'student':
                return students.map(student => (
                    <option key={student.user.id} value={student.user.id}>
                        {student.user.name} - {student.admission_number}
                    </option>
                ));
            case 'teacher':
                return teachers.map(teacher => (
                    <option key={teacher.user.id} value={teacher.user.id}>
                        {teacher.user.name}
                    </option>
                ));
            default:
                return null;
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-bold text-xl text-gray-900 leading-tight">
                    Create Notification
                </h2>
            }
        >
            <Head title="Create Notification" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Title */}
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter notification title..."
                                        required
                                    />
                                    {errors.title && (
                                        <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                                    )}
                                </div>

                                {/* Body */}
                                <div>
                                    <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        id="body"
                                        value={data.body}
                                        onChange={(e) => setData('body', e.target.value)}
                                        rows={5}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter your message here..."
                                    />
                                    {errors.body && (
                                        <p className="text-red-500 text-sm mt-1">{errors.body}</p>
                                    )}
                                </div>

                                {/* Target Type */}
                                <div>
                                    <label htmlFor="target_type" className="block text-sm font-medium text-gray-700 mb-2">
                                        Send To
                                    </label>
                                    <select
                                        id="target_type"
                                        value={selectedTargetType}
                                        onChange={handleTargetTypeChange}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">Everyone</option>
                                        <option value="classroom">Specific Classroom</option>
                                        <option value="student">Specific Student</option>
                                        <option value="teacher">Specific Teacher</option>
                                    </select>
                                    {errors.target_type && (
                                        <p className="text-red-500 text-sm mt-1">{errors.target_type}</p>
                                    )}
                                </div>

                                {/* Target Selection */}
                                {selectedTargetType !== 'all' && (
                                    <div>
                                        <label htmlFor="target_id" className="block text-sm font-medium text-gray-700 mb-2">
                                            Select {selectedTargetType === 'classroom' ? 'Classroom' : selectedTargetType === 'student' ? 'Student' : 'Teacher'}
                                        </label>
                                        <select
                                            id="target_id"
                                            value={data.target_id}
                                            onChange={(e) => setData('target_id', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Choose...</option>
                                            {getTargetOptions()}
                                        </select>
                                        {errors.target_id && (
                                            <p className="text-red-500 text-sm mt-1">{errors.target_id}</p>
                                        )}
                                    </div>
                                )}

                                {/* Target Preview */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        {selectedTargetType === 'all' && (
                                            <>
                                                <Users className="h-4 w-4" />
                                                <span>This notification will be sent to everyone</span>
                                            </>
                                        )}
                                        {selectedTargetType === 'classroom' && (
                                            <>
                                                <School className="h-4 w-4" />
                                                <span>This notification will be sent to all students in the selected classroom</span>
                                            </>
                                        )}
                                        {(selectedTargetType === 'student' || selectedTargetType === 'teacher') && (
                                            <>
                                                <User className="h-4 w-4" />
                                                <span>This notification will be sent to the selected {selectedTargetType}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => window.history.back()}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        <Send className="h-4 w-4" />
                                        <span>{processing ? 'Sending...' : 'Send Notification'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
