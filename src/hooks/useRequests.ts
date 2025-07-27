import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { subscribeToRequests, SkillRequest } from '../services/requestService';

export const useRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<SkillRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setRequests([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToRequests(user.uid, (newRequests) => {
      setRequests(newRequests);
      const unread = newRequests.filter(req => !req.isRead && req.status === 'pending').length;
      setUnreadCount(unread);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  return {
    requests,
    loading,
    unreadCount
  };
};