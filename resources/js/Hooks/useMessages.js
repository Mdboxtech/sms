import { useState, useEffect } from 'react';

export default function useMessages() {
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchUnreadMessagesCount = async () => {
        try {
            const response = await fetch('/api/messages/unread-count', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setUnreadMessagesCount(data.count);
            }
        } catch (error) {
            console.error('Error fetching unread messages count:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnreadMessagesCount();
        
        // Poll for updates every 30 seconds
        const interval = setInterval(fetchUnreadMessagesCount, 30000);
        
        return () => clearInterval(interval);
    }, []);

    return {
        unreadMessagesCount,
        loading,
        refreshCount: fetchUnreadMessagesCount
    };
}
