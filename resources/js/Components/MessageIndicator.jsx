import React from 'react';
import useMessages from '@/Hooks/useMessages';

export default function MessageIndicator() {
    const { unreadMessagesCount } = useMessages();

    if (unreadMessagesCount === 0) {
        return null;
    }

    return (
        <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
    );
}
