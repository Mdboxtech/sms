import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Bell, Eye, Clock, User } from 'lucide-react';

export default function Index({ notifications, unreadCount }) {
    const { auth } = usePage().props;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const markAsRead = async (notificationId) => {
        try {
            await fetch(route('notifications.read', notificationId), {
                method: 'PATCH',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Accept': 'application/json',
                }
            });
            // Refresh the page or update state
            window.location.reload();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch(route('notifications.mark-all-read'), {
                method: 'PATCH',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Accept': 'application/json',
                }
            });
            window.location.reload();
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-xl text-gray-900 leading-tight">
                        Notifications {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-2">
                                {unreadCount}
                            </span>
                        )}
                    </h2>
                    <div className="flex space-x-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                            >
                                Mark All as Read
                            </button>
                        )}
                        {(auth.user.role.name === 'admin' || auth.user.role.name === 'teacher') && (
                            <Link
                                href={route('notifications.create')}
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm"
                            >
                                Create Notification
                            </Link>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Notifications" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {notifications.data.length === 0 ? (
                                <div className="text-center py-8">
                                    <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <p className="text-gray-500">No notifications yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {notifications.data.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`border rounded-lg p-4 transition-colors ${
                                                notification.read_at
                                                    ? 'bg-gray-50 border-gray-200'
                                                    : 'bg-blue-50 border-blue-200'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <h3 className="font-semibold text-lg">
                                                            {notification.title}
                                                        </h3>
                                                        {!notification.read_at && (
                                                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                                                New
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-700 mb-3">
                                                        {notification.body}
                                                    </p>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <div className="flex items-center space-x-1">
                                                            <User className="h-4 w-4" />
                                                            <span>
                                                                From: {notification.sender?.name || 'System'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Clock className="h-4 w-4" />
                                                            <span>{formatDate(notification.created_at)}</span>
                                                        </div>
                                                        {notification.read_at && (
                                                            <div className="flex items-center space-x-1">
                                                                <Eye className="h-4 w-4" />
                                                                <span>Read at {formatDate(notification.read_at)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Link
                                                        href={route('notifications.show', notification.id)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                    >
                                                        View
                                                    </Link>
                                                    {!notification.read_at && (
                                                        <button
                                                            onClick={() => markAsRead(notification.id)}
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
                            {notifications.links && (
                                <div className="mt-6 flex justify-center">
                                    <div className="flex space-x-1">
                                        {notifications.links.map((link, index) => (
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
