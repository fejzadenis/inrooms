import { useState, useEffect } from 'react';
import { connectionService } from '../services/connectionService';
import type { Notification } from '../types/connections';

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const loadNotifications = async () => {
      try {
        setLoading(true);
        setError(null);

        const userNotifications = await connectionService.getUserNotifications(userId);
        setNotifications(userNotifications);
        
        const unread = userNotifications.filter(n => !n.read).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error('Error loading notifications:', err);
        setError(err instanceof Error ? err.message : 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();

    // Refresh every 30 seconds to keep notifications current
    const interval = setInterval(loadNotifications, 30000);

    return () => clearInterval(interval);
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    try {
      await connectionService.markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const refreshNotifications = async () => {
    if (!userId) return;

    try {
      const userNotifications = await connectionService.getUserNotifications(userId);
      setNotifications(userNotifications);
      
      const unread = userNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Error refreshing notifications:', err);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    refreshNotifications
  };
}