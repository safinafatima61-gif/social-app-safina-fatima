import { storage } from '../services/storage';
import { areFriends } from './friendHelpers';

/** Always sort IDs so A→B and B→A share the same conversation */
export function getConversationId(userId1, userId2) {
  return [userId1, userId2].sort().join('_');
}

/** Messages between two users, oldest → newest */
export function getMessages(userId1, userId2) {
  const conversationId = getConversationId(userId1, userId2);
  return storage
    .getMessages()
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

/** Conversation list for a user (friends only), most recent first */
export function getConversations(userId) {
  const users = storage.getUsers();
  const messages = storage.getMessages();
  const friendIds = new Set(
    users
      .filter((u) => u.id !== userId && areFriends(userId, u.id))
      .map((u) => u.id)
  );

  const byFriend = {};

  messages.forEach((msg) => {
    if (msg.senderId !== userId && msg.receiverId !== userId) return;
    const friendId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    if (!friendIds.has(friendId)) return;

    if (!byFriend[friendId]) {
      byFriend[friendId] = { lastMessage: msg, unread: 0 };
    } else if (new Date(msg.timestamp) > new Date(byFriend[friendId].lastMessage.timestamp)) {
      byFriend[friendId].lastMessage = msg;
    }

    if (msg.receiverId === userId && !msg.read) {
      byFriend[friendId].unread += 1;
    }
  });

  // Include friends with no messages yet so they still appear after Message click
  friendIds.forEach((friendId) => {
    if (!byFriend[friendId]) {
      byFriend[friendId] = { lastMessage: null, unread: 0 };
    }
  });

  return Object.entries(byFriend)
    .map(([friendId, data]) => ({
      friendId,
      friend: users.find((u) => u.id === friendId),
      lastMessage: data.lastMessage,
      unread: data.unread,
    }))
    .filter((c) => c.friend)
    .sort((a, b) => {
      const ta = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0;
      const tb = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0;
      return tb - ta;
    });
}

/** Total unread messages for navbar badge */
export function getUnreadMessageCount(userId) {
  return storage
    .getMessages()
    .filter((m) => m.receiverId === userId && !m.read).length;
}

/** Mark all messages in a conversation as read for the receiver */
export function markConversationRead(currentUserId, friendId) {
  const conversationId = getConversationId(currentUserId, friendId);
  const messages = storage.getMessages();
  let changed = false;
  const next = messages.map((m) => {
    if (
      m.conversationId === conversationId &&
      m.receiverId === currentUserId &&
      !m.read
    ) {
      changed = true;
      return { ...m, read: true };
    }
    return m;
  });
  if (changed) storage.setMessages(next);
  return next;
}

/** Is the friend "online"? lastSeen within 5 minutes */
export function isUserOnline(user) {
  if (!user?.lastSeen) return false;
  return Date.now() - new Date(user.lastSeen).getTime() < 5 * 60 * 1000;
}

/** Preview text for conversation list */
export function messagePreview(message, max = 40) {
  if (!message) return 'Say hello...';
  if (message.type === 'image') return '📷 Photo';
  if (message.type === 'video') return '🎬 Video';
  const text = message.content || '';
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
