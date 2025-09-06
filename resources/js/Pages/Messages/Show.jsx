import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Download, User, Clock, Eye, Paperclip } from 'lucide-react';

export default function Show({ message }) {
    const { auth } = usePage().props;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const downloadAttachment = (attachmentPath) => {
        window.open(route('messages.download', [message.id, attachmentPath]), '_blank');
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center space-x-4">
                    <Link
                        href={route('messages.inbox')}
                        className="text-blue-600 hover:text-blue-800 flex items-center space-x-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Inbox</span>
                    </Link>
                    <h2 className="font-bold text-xl text-gray-900 leading-tight">
                        Message Details
                    </h2>
                </div>
            }
        >
            <Head title={`Message: ${message.subject}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Message Header */}
                            <div className="border-b border-gray-200 pb-4 mb-6">
                                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                                    {message.subject}
                                </h1>
                                
                                <div className="flex flex-wrap items-center space-x-6 text-sm text-gray-600">
                                    <div className="flex items-center space-x-2">
                                        <User className="h-4 w-4" />
                                        <span>
                                            <strong>From:</strong> {message.sender?.name || 'Unknown'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <User className="h-4 w-4" />
                                        <span>
                                            <strong>To:</strong> {message.receiver?.name || 'Unknown'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-4 w-4" />
                                        <span>
                                            <strong>Sent:</strong> {formatDate(message.created_at)}
                                        </span>
                                    </div>
                                    
                                    {message.read_at && (
                                        <div className="flex items-center space-x-2">
                                            <Eye className="h-4 w-4" />
                                            <span>
                                                <strong>Read:</strong> {formatDate(message.read_at)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Message Body */}
                            <div className="mb-6">
                                <div className="prose max-w-none">
                                    <div className="whitespace-pre-wrap text-gray-800">
                                        {message.body}
                                    </div>
                                </div>
                            </div>

                            {/* Attachment */}
                            {message.attachment_path && (
                                <div className="border-t border-gray-200 pt-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                                        <Paperclip className="h-5 w-5" />
                                        <span>Attachment</span>
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="bg-blue-100 p-2 rounded">
                                                    <Paperclip className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {message.attachment_name || 'Attachment'}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Click to download
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => downloadAttachment(message.attachment_path)}
                                                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
                                            >
                                                <Download className="h-4 w-4" />
                                                <span>Download</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="mt-8 flex space-x-4">
                                <Link
                                    href={route('messages.inbox')}
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Back to Inbox
                                </Link>
                                
                                {(auth.user.role.name === 'admin' || auth.user.role.name === 'teacher') && (
                                    <Link
                                        href={route('messages.create')}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Compose New Message
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
