import { useState, useCallback } from 'react';

interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

export const useNotification = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const showNotification = useCallback((type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = Date.now().toString();
    const notification: NotificationData = { id, type, title, message };
    
    setNotifications(prev => [...prev, notification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showSuccess = useCallback((title: string, message: string) => {
    showNotification('success', title, message);
  }, [showNotification]);

  const showError = useCallback((title: string, message: string) => {
    showNotification('error', title, message);
  }, [showNotification]);

  const showInfo = useCallback((title: string, message: string) => {
    showNotification('info', title, message);
  }, [showNotification]);

  return {
    notifications,
    removeNotification,
    showSuccess,
    showError,
    showInfo
  };
};