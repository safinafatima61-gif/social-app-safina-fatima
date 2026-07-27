import { useEffect } from 'react';
import { useChatContext } from '../context/ChatContext';

/**
 * Chat state lives in ChatContext.
 * Pass friendId when viewing /chat/:userId — opens that conversation.
 *
 * Important: do NOT clear activeFriendId in an effect cleanup.
 * Clearing caused messages to wipe on StrictMode remounts / route transitions.
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
    activeFriendId,
  } = useChatContext();

  useEffect(() => {
    setActiveFriendId(friendId || null);
  }, [friendId, setActiveFriendId]);

  return {
    messages,
    conversations,
    unreadCount,
    activeFriendId,
    refreshAll,
    sendMessage,
    toggleReaction,
    getConversationId,
    areFriends,
    isUserOnline,
    messagePreview,
  };
}
