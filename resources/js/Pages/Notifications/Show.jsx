import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Bell, User, Clock, Eye } from 'lucide-react';

export default function Show({ notification }) {
    const { auth } = usePage().props;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const getNotificationTypeColor = (type) => {
        switch (type) {
            case 'result': return 'bg-blue-100 text-blue-800';
            case 'announcement': return 'bg-green-100 text-green-800';
            case 'warning': return 'bg-yellow-100 text-yellow-800';
            case 'urgent': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center space-x-4">
                    <Link
                        href={route('notifications.index')}
                        className="text-blue-600 hover:text-blue-800 flex items-center space-x-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Notifications</span>
                    </Link>
                    <h2 className="font-bold text-xl text-gray-900 leading-tight">
                        Notification Details
                    </h2>
                </div>
            }
        >
            <Head title={`Notification: ${notification.title}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Notification Header */}
                            <div className="border-b border-gray-200 pb-4 mb-6">
                                <div className="flex items-start justify-between mb-4">
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {notification.title}
                                    </h1>
                                    
                                    {notification.type && (
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getNotificationTypeColor(notification.type)}`}>
                                            {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="flex flex-wrap items-center space-x-6 text-sm text-gray-600">
                                    <div className="flex items-center space-x-2">
                                        <User className="h-4 w-4" />
                                        <span>
                                            <strong>From:</strong> {notification.sender?.name || 'System'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-4 w-4" />
                                        <span>
                                            <strong>Sent:</strong> {formatDate(notification.created_at)}
                                        </span>
                                    </div>
                                    
                                    {notification.read_at && (
                                        <div className="flex items-center space-x-2">
                                            <Eye className="h-4 w-4" />
                                            <span>
                                                <strong>Read:</strong> {formatDate(notification.read_at)}
                                            </span>
                                        </div>
                                    )}

                                    {!notification.read_at && (
                                        <div className="flex items-center space-x-2">
                                            <Bell className="h-4 w-4 text-red-500" />
                                            <span className="text-red-500 font-medium">Unread</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Notification Body */}
                            <div className="mb-6">
                                <div className="prose max-w-none">
                                    <div className="whitespace-pre-wrap text-gray-800">
                                        {notification.body}
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information */}
                            {(notification.target_type || notification.reference_id) && (
                                <div className="border-t border-gray-200 pt-4 mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                        Additional Information
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        {notification.target_type && (
                                            <p className="text-sm text-gray-600 mb-2">
                                                <strong>Target:</strong> {notification.target_type}
                                                {notification.target_id && ` (ID: ${notification.target_id})`}
                                            </p>
                                        )}
                                        {notification.reference_id && (
                                            <p className="text-sm text-gray-600">
                                                <strong>Reference ID:</strong> {notification.reference_id}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex space-x-4">
                                <Link
                                    href={route('notifications.index')}
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Back to Notifications
                                </Link>
                                
                                {(auth.user.role.name === 'admin' || auth.user.role.name === 'teacher') && (
                                    <Link
                                        href={route('notifications.create')}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Create New Notification
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
