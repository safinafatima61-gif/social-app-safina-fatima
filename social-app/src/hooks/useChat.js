import { useEffect } from 'react';
import { useChatContext } from '../context/ChatContext';

/**
 * Chat state lives in ChatContext.
 * Pass friendId when viewing a specific conversation thread.
 */
export function useChat(_currentUserId, friendId = null) {
  const {
    messages,
    conversations,
    unreadCount,
    refreshAll,
    sendMessage,
    toggleReaction,
    getConversationId,
    areFriends,
    isUserOnline,
    messagePreview,
    setActiveFriendId,
  } = useChatContext();

  useEffect(() => {
    setActiveFriendId(friendId || null);
    return () => setActiveFriendId(null);
  }, [friendId, setActiveFriendId]);

  return {
    messages,
    conversations,
    unreadCount,
    refreshAll,
    sendMessage,
    toggleReaction,
    getConversationId,
    areFriends,
    isUserOnline,
    messagePreview,
  };
}
