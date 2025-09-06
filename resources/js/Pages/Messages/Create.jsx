import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Send, Paperclip, Users, X } from 'lucide-react';

export default function Create({ students, teachers }) {
    const { auth } = usePage().props;
    const [selectedReceiverType, setSelectedReceiverType] = useState('student');
    const [selectedReceivers, setSelectedReceivers] = useState([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    
    const { data, setData, post, processing, errors } = useForm({
        receiver_id: '',
        receiver_ids: [],
        receiver_type: 'student',
        subject: '',
        body: '',
        attachment: null
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isBulkMode) {
            const formData = new FormData();
            formData.append('receiver_ids', JSON.stringify(selectedReceivers));
            formData.append('receiver_type', selectedReceiverType);
            formData.append('subject', data.subject);
            formData.append('body', data.body);
            if (data.attachment) {
                formData.append('attachment', data.attachment);
            }
            post(route('messages.store'), {
                data: formData,
                forceFormData: true
            });
        } else {
            post(route('messages.store'), {
                forceFormData: true
            });
        }
    };

    const handleReceiverTypeChange = (e) => {
        const receiverType = e.target.value;
        setSelectedReceiverType(receiverType);
        setData({
            ...data,
            receiver_type: receiverType,
            receiver_id: ''
        });
        setSelectedReceivers([]);
    };

    const getReceiverOptions = () => {
        const options = selectedReceiverType === 'student' ? students : teachers;
        return options.map(item => (
            <option key={item.user.id} value={item.user.id}>
                {item.user.name} {item.admission_number ? `- ${item.admission_number}` : ''}
            </option>
        ));
    };

    const addReceiver = (receiverId) => {
        if (receiverId && !selectedReceivers.includes(receiverId)) {
            setSelectedReceivers([...selectedReceivers, receiverId]);
        }
    };

    const removeReceiver = (receiverId) => {
        setSelectedReceivers(selectedReceivers.filter(id => id !== receiverId));
    };

    const getReceiverName = (receiverId) => {
        const options = selectedReceiverType === 'student' ? students : teachers;
        const receiver = options.find(item => item.user.id == receiverId);
        return receiver ? receiver.user.name : 'Unknown';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-bold text-xl text-gray-900 leading-tight">
                    Compose Message
                </h2>
            }
        >
            <Head title="Compose Message" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6">
                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            checked={!isBulkMode}
                                            onChange={() => setIsBulkMode(false)}
                                            className="form-radio"
                                        />
                                        <span>Send to One Person</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            checked={isBulkMode}
                                            onChange={() => setIsBulkMode(true)}
                                            className="form-radio"
                                        />
                                        <span>Send to Multiple People</span>
                                    </label>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Receiver Type */}
                                <div>
                                    <label htmlFor="receiver_type" className="block text-sm font-medium text-gray-700 mb-2">
                                        Send To
                                    </label>
                                    <select
                                        id="receiver_type"
                                        value={selectedReceiverType}
                                        onChange={handleReceiverTypeChange}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="student">Students</option>
                                        <option value="teacher">Teachers</option>
                                    </select>
                                </div>

                                {/* Single Receiver */}
                                {!isBulkMode && (
                                    <div>
                                        <label htmlFor="receiver_id" className="block text-sm font-medium text-gray-700 mb-2">
                                            Select {selectedReceiverType === 'student' ? 'Student' : 'Teacher'}
                                        </label>
                                        <select
                                            id="receiver_id"
                                            value={data.receiver_id}
                                            onChange={(e) => setData('receiver_id', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Choose...</option>
                                            {getReceiverOptions()}
                                        </select>
                                        {errors.receiver_id && (
                                            <p className="text-red-500 text-sm mt-1">{errors.receiver_id}</p>
                                        )}
                                    </div>
                                )}

                                {/* Multiple Receivers */}
                                {isBulkMode && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select {selectedReceiverType === 'student' ? 'Students' : 'Teachers'}
                                        </label>
                                        <div className="flex space-x-2 mb-3">
                                            <select
                                                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                onChange={(e) => addReceiver(e.target.value)}
                                                value=""
                                            >
                                                <option value="">Choose...</option>
                                                {getReceiverOptions()}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const options = selectedReceiverType === 'student' ? students : teachers;
                                                    const allIds = options.map(item => item.user.id);
                                                    setSelectedReceivers(allIds);
                                                }}
                                                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                            >
                                                Select All
                                            </button>
                                        </div>
                                        
                                        {/* Selected Receivers */}
                                        {selectedReceivers.length > 0 && (
                                            <div className="border border-gray-300 rounded-md p-3 mb-3">
                                                <p className="text-sm font-medium text-gray-700 mb-2">
                                                    Selected ({selectedReceivers.length}):
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedReceivers.map(receiverId => (
                                                        <span
                                                            key={receiverId}
                                                            className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
                                                        >
                                                            <span>{getReceiverName(receiverId)}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeReceiver(receiverId)}
                                                                className="text-blue-600 hover:text-blue-800"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Subject */}
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        value={data.subject}
                                        onChange={(e) => setData('subject', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter subject..."
                                        required
                                    />
                                    {errors.subject && (
                                        <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
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

                                {/* Attachment */}
                                <div>
                                    <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-2">
                                        Attachment
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <Paperclip className="h-5 w-5 text-gray-400" />
                                        <input
                                            type="file"
                                            id="attachment"
                                            onChange={(e) => setData('attachment', e.target.files[0])}
                                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.avi,.mov"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Supported formats: PDF, DOC, DOCX, JPG, PNG, MP4, AVI, MOV (Max: 10MB)
                                    </p>
                                    {errors.attachment && (
                                        <p className="text-red-500 text-sm mt-1">{errors.attachment}</p>
                                    )}
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
                                        disabled={processing || (isBulkMode && selectedReceivers.length === 0)}
                                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        <Send className="h-4 w-4" />
                                        <span>
                                            {processing 
                                                ? 'Sending...' 
                                                : isBulkMode 
                                                    ? `Send to ${selectedReceivers.length} recipients`
                                                    : 'Send Message'
                                            }
                                        </span>
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
