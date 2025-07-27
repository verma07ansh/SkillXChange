import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { subscribeToConversations, ChatConversation } from '../services/chatService';

export const useChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setConversations([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToConversations(user.uid, (newConversations) => {
      setConversations(newConversations);
      
      // Calculate total unread messages
      const totalUnread = newConversations.reduce((total, conv) => {
        return total + (conv.unreadCount[user.uid] || 0);
      }, 0);
      
      setUnreadCount(totalUnread);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  return {
    conversations,
    loading,
    unreadCount
  };
};