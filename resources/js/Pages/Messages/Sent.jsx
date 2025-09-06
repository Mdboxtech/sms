import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, PageHeader } from '@/Components/UI';
import { 
    ArrowLeftIcon,
    PaperClipIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    PaperAirplaneIcon
} from '@heroicons/react/24/outline';

export default function SentMessages({ auth, messages }) {
    const getStatusIcon = (status) => {
        switch (status) {
            case 'sent':
                return <PaperAirplaneIcon className="h-4 w-4 text-blue-500" />;
            case 'delivered':
                return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
            case 'failed':
                return <XCircleIcon className="h-4 w-4 text-red-500" />;
            case 'pending':
            default:
                return <ClockIcon className="h-4 w-4 text-yellow-500" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'sent':
                return 'Sent';
            case 'delivered':
                return 'Delivered';
            case 'failed':
                return 'Failed';
            case 'pending':
            default:
                return 'Pending';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'sent':
                return 'text-blue-600 bg-blue-50';
            case 'delivered':
                return 'text-green-600 bg-green-50';
            case 'failed':
                return 'text-red-600 bg-red-50';
            case 'pending':
            default:
                return 'text-yellow-600 bg-yellow-50';
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-xl text-gray-900 leading-tight">
                        Sent Messages
                    </h2>
                    <div className="flex space-x-2">
                        <Link
                            href="/messages/inbox"
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm"
                        >
                            Back to Inbox
                        </Link>
                        <Link
                            href="/messages/create"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                        >
                            Compose New
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Sent Messages" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <div className="p-6">
                            {messages.data && messages.data.length > 0 ? (
                                <div className="space-y-4">
                                    {messages.data.map((message) => (
                                        <div
                                            key={message.id}
                                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <h3 className="font-semibold text-lg">
                                                            {message.subject}
                                                        </h3>
                                                        {message.attachment_path && (
                                                            <PaperClipIcon className="h-4 w-4 text-gray-500" />
                                                        )}
                                                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                                                            {getStatusIcon(message.status)}
                                                            <span>{getStatusText(message.status)}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-700 mb-3 truncate">
                                                        {message.body && message.body.length > 100 
                                                            ? message.body.substring(0, 100) + '...'
                                                            : message.body
                                                        }
                                                    </p>
                                                    <div className="flex justify-between items-center text-sm text-gray-500">
                                                        <span>
                                                            To: {message.receiver?.name || 'Unknown'}
                                                        </span>
                                                        <div className="flex flex-col items-end space-y-1">
                                                            <span>
                                                                Sent: {new Date(message.created_at).toLocaleDateString()}
                                                            </span>
                                                            {message.sent_at && (
                                                                <span>
                                                                    Delivered: {new Date(message.sent_at).toLocaleString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="ml-4 flex flex-col space-y-2">
                                                    <Link
                                                        href={`/messages/${message.id}`}
                                                        className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                                                    >
                                                        View
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <PaperAirplaneIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No sent messages</h3>
                                    <p className="text-gray-500 mb-4">You haven't sent any messages yet.</p>
                                    <Link
                                        href="/messages/create"
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700"
                                    >
                                        Send Your First Message
                                    </Link>
                                </div>
                            )}

                            {/* Pagination */}
                            {messages.links && messages.links.length > 3 && (
                                <div className="mt-6 flex justify-center">
                                    <nav className="flex space-x-2">
                                        {messages.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-3 py-2 text-sm font-medium rounded-md ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white'
                                                        : link.url
                                                        ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
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
        </AuthenticatedLayout>
    );
}
