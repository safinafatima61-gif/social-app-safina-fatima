import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { storage, generateId } from '../services/storage';
import { useAuth } from '../hooks/useAuth';
import {
  getConversationId,
  getMessages,
  getConversations,
  getUnreadMessageCount,
  markConversationRead,
  isUserOnline,
  messagePreview,
} from '../utils/chatHelpers';
import { areFriends } from '../utils/friendHelpers';
import { createNotification } from '../utils/notificationHelpers';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id || null;

  const [conversations, setConversations] = useState(() =>
    currentUserId ? getConversations(currentUserId) : []
  );
  const [unreadCount, setUnreadCount] = useState(() =>
    currentUserId ? getUnreadMessageCount(currentUserId) : 0
  );
  const [activeFriendId, setActiveFriendId] = useState(null);
  const [messages, setMessages] = useState([]);

  const refreshConversations = useCallback(() => {
    if (!currentUserId) {
      setConversations([]);
      setUnreadCount(0);
      return;
    }
    setConversations(getConversations(currentUserId));
    setUnreadCount(getUnreadMessageCount(currentUserId));
  }, [currentUserId]);

  const refreshMessages = useCallback(() => {
    if (!currentUserId || !activeFriendId) {
      setMessages([]);
      return;
    }
    setMessages(getMessages(currentUserId, activeFriendId));
  }, [currentUserId, activeFriendId]);

  const refreshAll = useCallback(() => {
    refreshConversations();
    refreshMessages();
  }, [refreshConversations, refreshMessages]);

  useEffect(() => {
    refreshAll();
  }, [currentUserId, refreshAll]);

  useEffect(() => {
    function handleStorage(event) {
      if (event.key === 'messages' || event.key === 'friendRequests') {
        refreshAll();
      }
    }
    function handleAppStorage(event) {
      const key = event.detail?.key;
      if (key === 'messages' || key === 'friendRequests' || key === 'users') {
        refreshAll();
      }
    }
    window.addEventListener('storage', handleStorage);
    window.addEventListener('app-storage', handleAppStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('app-storage', handleAppStorage);
    };
  }, [refreshAll]);

  useEffect(() => {
    if (!currentUserId || !activeFriendId) return;
    markConversationRead(currentUserId, activeFriendId);
    refreshAll();
  }, [currentUserId, activeFriendId, refreshAll]);

  // Online presence placeholder (lastSeen heartbeat)
  useEffect(() => {
    if (!currentUserId) return;
    const touch = () => {
      const next = storage.getUsers().map((u) =>
        u.id === currentUserId ? { ...u, lastSeen: new Date().toISOString() } : u
      );
      storage.setUsers(next);
    };
    touch();
    const interval = setInterval(touch, 60_000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  const sendMessage = useCallback(
    ({ receiverId, type = 'text', content, aiGenerated = false }) => {
      if (!currentUserId || !receiverId || !content) return null;
      if (!areFriends(currentUserId, receiverId)) {
        throw new Error('You can only message friends');
      }

      const message = {
        id: generateId('msg'),
        conversationId: getConversationId(currentUserId, receiverId),
        senderId: currentUserId,
        receiverId,
        type,
        content,
        timestamp: new Date().toISOString(),
        read: false,
        aiGenerated: !!aiGenerated,
        reactions: [],
      };

      storage.setMessages([...storage.getMessages(), message]);

      const sender = storage.getUsers().find((u) => u.id === currentUserId);
      createNotification({
        userId: receiverId,
        type: 'message',
        fromUserId: currentUserId,
        message: `${sender?.name || 'Someone'} sent you a message`,
        link: `/chat/${currentUserId}`,
      });

      if (activeFriendId === receiverId) {
        setMessages(getMessages(currentUserId, receiverId));
      }
      refreshConversations();
      return message;
    },
    [currentUserId, activeFriendId, refreshConversations]
  );

  const toggleReaction = useCallback(
    (messageId, emoji) => {
      if (!currentUserId) return;
      const next = storage.getMessages().map((m) => {
        if (m.id !== messageId) return m;
        const reactions = Array.isArray(m.reactions) ? [...m.reactions] : [];
        const existing = reactions.find(
          (r) => r.emoji === emoji && r.userId === currentUserId
        );
        const updated = existing
          ? reactions.filter((r) => !(r.emoji === emoji && r.userId === currentUserId))
          : [...reactions, { emoji, userId: currentUserId }];
        return { ...m, reactions: updated };
      });
      storage.setMessages(next);
      refreshMessages();
    },
    [currentUserId, refreshMessages]
  );

  const value = useMemo(
    () => ({
      conversations,
      unreadCount,
      messages,
      activeFriendId,
      setActiveFriendId,
      refreshAll,
      refreshConversations,
      refreshMessages,
      sendMessage,
      toggleReaction,
      getConversationId,
      areFriends: (otherId) => areFriends(currentUserId, otherId),
      isUserOnline,
      messagePreview,
    }),
    [
      conversations,
      unreadCount,
      messages,
      activeFriendId,
      refreshAll,
      refreshConversations,
      refreshMessages,
      sendMessage,
      toggleReaction,
      currentUserId,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return ctx;
}
