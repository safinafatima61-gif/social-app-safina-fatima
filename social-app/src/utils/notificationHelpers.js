import { storage, generateId } from '../services/storage';

/**
 * Create a notification for a user.
 * Types: friend_request | friend_accepted | like | comment | message | share
 */
export function createNotification({
  userId,
  type,
  fromUserId,
  message,
  link = '/',
  meta = {},
}) {
  if (!userId || userId === fromUserId) return null;

  const item = {
    id: generateId('ntf'),
    userId,
    type,
    fromUserId: fromUserId || null,
    message,
    link,
    meta,
    read: false,
    createdAt: new Date().toISOString(),
  };

  const next = [item, ...storage.getNotifications()].slice(0, 200);
  storage.setNotifications(next);
  return item;
}

export function getNotificationsFor(userId) {
  return storage
    .getNotifications()
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getUnreadNotificationCount(userId) {
  return getNotificationsFor(userId).filter((n) => !n.read).length;
}

export function markNotificationRead(notificationId) {
  const next = storage.getNotifications().map((n) =>
    n.id === notificationId ? { ...n, read: true } : n
  );
  storage.setNotifications(next);
  return next;
}

export function markAllNotificationsRead(userId) {
  const next = storage.getNotifications().map((n) =>
    n.userId === userId ? { ...n, read: true } : n
  );
  storage.setNotifications(next);
  return next;
}
