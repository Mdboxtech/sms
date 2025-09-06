import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Mail, Paperclip, Clock, User, Eye } from 'lucide-react';

export default function Inbox({ messages, unreadCount }) {
    const { auth } = usePage().props;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const markAsRead = async (messageId) => {
        try {
            await fetch(route('messages.read', messageId), {
                method: 'PATCH',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Accept': 'application/json',
                }
            });
            window.location.reload();
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-xl text-gray-900 leading-tight">
                        Inbox {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-2">
                                {unreadCount}
                            </span>
                        )}
                    </h2>
                    <div className="flex space-x-2">
                        <Link
                            href={route('messages.sent')}
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm"
                        >
                            Sent Messages
                        </Link>
                        {(auth.user.role.name === 'admin' || auth.user.role.name === 'teacher') && (
                            <Link
                                href={route('messages.create')}
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm"
                            >
                                Compose Message
                            </Link>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Inbox" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {messages.data.length === 0 ? (
                                <div className="text-center py-8">
                                    <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <p className="text-gray-500">No messages in your inbox.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.data.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`border rounded-lg p-4 transition-colors ${
                                                message.read_at
                                                    ? 'bg-gray-50 border-gray-200'
                                                    : 'bg-blue-50 border-blue-200'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <h3 className="font-semibold text-lg">
                                                            {message.subject}
                                                        </h3>
                                                        {!message.read_at && (
                                                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                                                New
                                                            </span>
                                                        )}
                                                        {message.attachment_path && (
                                                            <Paperclip className="h-4 w-4 text-gray-500" />
                                                        )}
                                                    </div>
                                                    <p className="text-gray-700 mb-3 truncate">
                                                        {message.body && message.body.length > 100 
                                                            ? message.body.substring(0, 100) + '...'
                                                            : message.body
                                                        }
                                                    </p>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <div className="flex items-center space-x-1">
                                                            <User className="h-4 w-4" />
                                                            <span>
                                                                From: {message.sender?.name || 'Unknown'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Clock className="h-4 w-4" />
                                                            <span>{formatDate(message.created_at)}</span>
                                                        </div>
                                                        {message.read_at && (
                                                            <div className="flex items-center space-x-1">
                                                                <Eye className="h-4 w-4" />
                                                                <span>Read</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Link
                                                        href={route('messages.show', message.id)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                    >
                                                        Read
                                                    </Link>
                                                    {!message.read_at && (
                                                        <button
                                                            onClick={() => markAsRead(message.id)}
                                                            className="text-green-600 hover:text-green-800 text-sm"
                                                        >
                                                            Mark as Read
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {messages.links && (
                                <div className="mt-6 flex justify-center">
                                    <div className="flex space-x-1">
                                        {messages.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-3 py-2 text-sm rounded ${
                                                    link.active
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
