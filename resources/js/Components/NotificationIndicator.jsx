import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { BellIcon, InboxIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid, InboxIcon as InboxIconSolid } from '@heroicons/react/24/solid';
import useNotifications from '@/Hooks/useNotifications';
import useMessages from '@/Hooks/useMessages';

export default function NotificationIndicator({ user }) {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const { unreadMessagesCount } = useMessages();
    const [showDropdown, setShowDropdown] = useState(false);

    const totalUnread = unreadCount + unreadMessagesCount;

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900 transition duration-150 ease-in-out"
            >
                {totalUnread > 0 ? (
                    <BellIconSolid className="h-6 w-6" />
                ) : (
                    <BellIcon className="h-6 w-6" />
                )}
                
                {totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {totalUnread > 99 ? '99+' : totalUnread}
                    </span>
                )}

                {/* Small dot indicator for new items */}
                {totalUnread > 0 && (
                    <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 border-2 border-white rounded-full"></span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-gray-900">Notifications & Messages</h3>
                        {totalUnread > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-800"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="px-4 py-2 border-b border-gray-200">
                        <div className="flex space-x-2">
                            <Link
                                href={route('notifications.index')}
                                className="flex-1 flex items-center justify-center space-x-2 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded"
                            >
                                <BellIcon className="h-4 w-4" />
                                <span>Notifications ({unreadCount})</span>
                            </Link>
                            <Link
                                href={route('messages.inbox')}
                                className="flex-1 flex items-center justify-center space-x-2 text-xs bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded"
                            >
                                <InboxIcon className="h-4 w-4" />
                                <span>Messages ({unreadMessagesCount})</span>
                            </Link>
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 && unreadMessagesCount === 0 ? (
                            <div className="px-4 py-8 text-center text-gray-500">
                                <BellIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">No unread notifications or messages</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer"
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-gray-900">
                                                {notification.title}
                                            </h4>
                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                {notification.body}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {new Date(notification.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="ml-2">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-200">
                            <Link
                                href="/notifications"
                                className="text-sm text-blue-600 hover:text-blue-800 text-center block"
                                onClick={() => setShowDropdown(false)}
                            >
                                View all notifications
                            </Link>
                        </div>
                    )}
                </div>
            )}
            
            {showDropdown && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowDropdown(false)}
                ></div>
            )}
        </div>
    );
}
