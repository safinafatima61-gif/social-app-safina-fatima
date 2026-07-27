import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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

  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeFriendId, setActiveFriendId] = useState(null);
  const [messages, setMessages] = useState([]);
  const writingRef = useRef(false);
  const activeFriendRef = useRef(null);

  // Keep a ref so storage handlers always see the open thread
  useEffect(() => {
    activeFriendRef.current = activeFriendId;
  }, [activeFriendId]);

  const refreshConversations = useCallback(() => {
    if (!currentUserId) {
      setConversations([]);
      setUnreadCount(0);
      return;
    }
    setConversations(getConversations(currentUserId));
    setUnreadCount(getUnreadMessageCount(currentUserId));
  }, [currentUserId]);

  const refreshMessages = useCallback(
    (friendId = activeFriendRef.current) => {
      if (!currentUserId || !friendId) {
        setMessages([]);
        return;
      }
      setMessages(getMessages(currentUserId, friendId));
    },
    [currentUserId]
  );

  const refreshAll = useCallback(() => {
    refreshConversations();
    refreshMessages(activeFriendRef.current);
  }, [refreshConversations, refreshMessages]);

  // Load when user logs in / changes
  useEffect(() => {
    refreshAll();
  }, [currentUserId, refreshAll]);

  // Real-time: native storage (other tabs) + app-storage (same-tab writes)
  useEffect(() => {
    function handleStorage(event) {
      if (event.key === 'messages' || event.key === 'friendRequests') {
        refreshAll();
      }
    }
    function handleAppStorage(event) {
      const key = event.detail?.key;
      if (key === 'messages' || key === 'friendRequests') {
        if (writingRef.current && key === 'messages') return;
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

  // Open a conversation: load messages + mark read
  useEffect(() => {
    if (!currentUserId || !activeFriendId) {
      setMessages([]);
      return;
    }
    if (!areFriends(currentUserId, activeFriendId)) {
      setMessages([]);
      return;
    }
    setMessages(getMessages(currentUserId, activeFriendId));
    markConversationRead(currentUserId, activeFriendId);
    refreshConversations();
  }, [currentUserId, activeFriendId, refreshConversations]);

  // Presence heartbeat — silent write (no app-storage)
  useEffect(() => {
    if (!currentUserId) return;
    const touch = () => {
      try {
        const users = storage.getUsers();
        const next = users.map((u) =>
          u.id === currentUserId ? { ...u, lastSeen: new Date().toISOString() } : u
        );
        localStorage.setItem('users', JSON.stringify(next));
      } catch {
        /* ignore */
      }
    };
    touch();
    const interval = setInterval(touch, 60_000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  const sendMessage = useCallback(
    ({ receiverId, type = 'text', content, aiGenerated = false }) => {
      if (!currentUserId || !receiverId || content == null || content === '') {
        return null;
      }
      if (!areFriends(currentUserId, receiverId)) {
        throw new Error('You can only message friends');
      }

      const message = {
        id: generateId('msg'),
        conversationId: getConversationId(currentUserId, receiverId),
        senderId: currentUserId,
        receiverId,
        type: type || 'text',
        content,
        timestamp: new Date().toISOString(),
        read: false,
        aiGenerated: !!aiGenerated,
        reactions: [],
      };

      writingRef.current = true;
      try {
        storage.setMessages([...storage.getMessages(), message]);
      } finally {
        queueMicrotask(() => {
          writingRef.current = false;
        });
      }

      // Update open thread immediately for the sender
      if (String(activeFriendRef.current) === String(receiverId)) {
        setMessages(getMessages(currentUserId, receiverId));
      }
      refreshConversations();

      const sender = storage.getUsers().find((u) => u.id === currentUserId);
      createNotification({
        userId: receiverId,
        type: 'message',
        fromUserId: currentUserId,
        message: `${sender?.name || 'Someone'} sent you a message`,
        link: `/chat/${currentUserId}`,
      });

      return message;
    },
    [currentUserId, refreshConversations]
  );

  const toggleReaction = useCallback(
    (messageId, emoji) => {
      if (!currentUserId) return;
      writingRef.current = true;
      try {
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
      } finally {
        queueMicrotask(() => {
          writingRef.current = false;
        });
      }
      refreshMessages(activeFriendRef.current);
    },
    [currentUserId, refreshMessages]
  );

  const openConversation = useCallback((friendId) => {
    setActiveFriendId(friendId ? String(friendId) : null);
  }, []);

  const value = useMemo(
    () => ({
      conversations,
      unreadCount,
      messages,
      activeFriendId,
      setActiveFriendId: openConversation,
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
      openConversation,
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
