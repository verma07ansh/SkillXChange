import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { subscribeToAdminMessages, AdminMessage } from '../services/messageService';

export const useMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToAdminMessages((newMessages) => {
      setMessages(newMessages);
      
      if (user) {
        const unread = newMessages.filter(msg => !msg.seenBy.includes(user.uid)).length;
        setUnreadCount(unread);
      } else {
        setUnreadCount(0);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  return {
    messages,
    loading,
    unreadCount
  };
};