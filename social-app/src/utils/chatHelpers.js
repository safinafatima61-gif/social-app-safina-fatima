import { storage } from '../services/storage';
import { areFriends, getFriendIds, resolveUser } from './friendHelpers';

function normId(id) {
  return id == null ? '' : String(id);
}

/** Always sort IDs so A→B and B→A share the same conversation */
export function getConversationId(userId1, userId2) {
  return [normId(userId1), normId(userId2)].filter(Boolean).sort().join('_');
}

/** Messages between two users, oldest → newest */
export function getMessages(userId1, userId2) {
  const a = normId(userId1);
  const b = normId(userId2);
  if (!a || !b) return [];
  const conversationId = getConversationId(a, b);

  return storage
    .getMessages()
    .filter((m) => {
      if (!m) return false;
      if (normId(m.conversationId) === conversationId) return true;
      // Fallback: match by participant pair (fixes bad/legacy conversationId)
      const participants = [normId(m.senderId), normId(m.receiverId)].sort().join('_');
      return participants === conversationId;
    })
    .sort((x, y) => new Date(x.timestamp) - new Date(y.timestamp));
}

/**
 * Conversation list — accepted friends only.
 * Friends with no messages still appear (so Message → /chat/:id works).
 * Sorted by most recent message first.
 */
export function getConversations(userId) {
  const uid = normId(userId);
  if (!uid) return [];

  const messages = storage.getMessages();
  const friendIds = getFriendIds(uid);

  const byFriend = {};
  friendIds.forEach((friendId) => {
    byFriend[friendId] = { lastMessage: null, unread: 0 };
  });

  messages.forEach((msg) => {
    const sender = normId(msg.senderId);
    const receiver = normId(msg.receiverId);
    if (sender !== uid && receiver !== uid) return;

    const friendId = sender === uid ? receiver : sender;
    if (!byFriend[friendId]) return; // not an accepted friend — skip

    if (
      !byFriend[friendId].lastMessage ||
      new Date(msg.timestamp) > new Date(byFriend[friendId].lastMessage.timestamp)
    ) {
      byFriend[friendId].lastMessage = msg;
    }

    if (receiver === uid && !msg.read) {
      byFriend[friendId].unread += 1;
    }
  });

  return Object.entries(byFriend)
    .map(([friendId, data]) => ({
      friendId,
      friend: resolveUser(friendId),
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

/** Total unread from accepted friends only (navbar badge) */
export function getUnreadMessageCount(userId) {
  const uid = normId(userId);
  if (!uid) return 0;
  const friendIds = new Set(getFriendIds(uid));
  return storage
    .getMessages()
    .filter(
      (m) =>
        normId(m.receiverId) === uid &&
        !m.read &&
        friendIds.has(normId(m.senderId))
    ).length;
}

/** Mark all messages in a conversation as read for the receiver */
export function markConversationRead(currentUserId, friendId) {
  const me = normId(currentUserId);
  const other = normId(friendId);
  if (!me || !other) return storage.getMessages();

  const conversationId = getConversationId(me, other);
  const messages = storage.getMessages();
  let changed = false;

  const next = messages.map((m) => {
    const sameThread =
      normId(m.conversationId) === conversationId ||
      [normId(m.senderId), normId(m.receiverId)].sort().join('_') === conversationId;

    if (sameThread && normId(m.receiverId) === me && !m.read) {
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

export { areFriends };
