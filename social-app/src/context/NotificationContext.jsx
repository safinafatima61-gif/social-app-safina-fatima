import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  getNotificationsFor,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '../utils/notificationHelpers';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || null;

  const [notifications, setNotifications] = useState(() =>
    userId ? getNotificationsFor(userId) : []
  );
  const [unreadCount, setUnreadCount] = useState(() =>
    userId ? getUnreadNotificationCount(userId) : 0
  );

  const refresh = useCallback(() => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    setNotifications(getNotificationsFor(userId));
    setUnreadCount(getUnreadNotificationCount(userId));
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    function onStorage(e) {
      if (e.key === 'notifications') refresh();
    }
    function onAppStorage(e) {
      if (e.detail?.key === 'notifications') refresh();
    }
    window.addEventListener('storage', onStorage);
    window.addEventListener('app-storage', onAppStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('app-storage', onAppStorage);
    };
  }, [refresh]);

  const markRead = useCallback(
    (id) => {
      markNotificationRead(id);
      refresh();
    },
    [refresh]
  );

  const markAllRead = useCallback(() => {
    if (!userId) return;
    markAllNotificationsRead(userId);
    refresh();
  }, [userId, refresh]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      refresh,
      markRead,
      markAllRead,
    }),
    [notifications, unreadCount, refresh, markRead, markAllRead]
  );

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
