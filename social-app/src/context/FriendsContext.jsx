import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { storage, generateId } from '../services/storage';
import { useAuth } from '../hooks/useAuth';
import { createNotification } from '../utils/notificationHelpers';
import {
  areFriends as areFriendsHelper,
  getFriendsOf,
  getPendingRequest,
  getReceivedRequests,
  getSentRequests,
  getPeopleSuggestions,
  getRelationship as getRelationshipHelper,
  getMutualFriendsCount as getMutualFriendsCountHelper,
} from '../utils/friendHelpers';

const FriendsContext = createContext(null);

export function FriendsProvider({ children }) {
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id || null;

  const [requests, setRequests] = useState(() => storage.getFriendRequests());
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => {
    setRequests(storage.getFriendRequests());
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    function handleStorage(event) {
      if (event.key === 'friendRequests' || event.key === 'users') refresh();
    }
    function handleAppStorage(event) {
      const key = event.detail?.key;
      if (key === 'friendRequests' || key === 'users') refresh();
    }
    window.addEventListener('storage', handleStorage);
    window.addEventListener('app-storage', handleAppStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('app-storage', handleAppStorage);
    };
  }, [refresh]);

  const sendRequest = useCallback(
    (toUserId) => {
      if (!currentUserId || currentUserId === toUserId) return;
      if (areFriendsHelper(currentUserId, toUserId)) return;
      if (getPendingRequest(currentUserId, toUserId)) return;
      if (getPendingRequest(toUserId, currentUserId)) return;

      const next = [
        ...storage.getFriendRequests(),
        {
          id: generateId('req'),
          fromUserId: currentUserId,
          toUserId,
          status: 'pending',
          sentAt: new Date().toISOString(),
          respondedAt: null,
        },
      ];
      storage.setFriendRequests(next);
      setRequests(next);
      setVersion((v) => v + 1);

      createNotification({
        userId: toUserId,
        type: 'friend_request',
        fromUserId: currentUserId,
        message: `${currentUser?.name || 'Someone'} sent you a friend request`,
        link: '/requests',
      });
    },
    [currentUserId, currentUser?.name]
  );

  const acceptRequest = useCallback(
    (requestId) => {
      const req = storage.getFriendRequests().find((r) => r.id === requestId);
      const next = storage.getFriendRequests().map((r) =>
        r.id === requestId
          ? { ...r, status: 'accepted', respondedAt: new Date().toISOString() }
          : r
      );
      storage.setFriendRequests(next);
      setRequests(next);
      setVersion((v) => v + 1);

      if (req) {
        createNotification({
          userId: req.fromUserId,
          type: 'friend_accepted',
          fromUserId: currentUserId,
          message: `${currentUser?.name || 'Someone'} accepted your friend request`,
          link: '/friends',
        });
      }
    },
    [currentUserId, currentUser?.name]
  );

  const rejectRequest = useCallback((requestId) => {
    const next = storage.getFriendRequests().map((r) =>
      r.id === requestId
        ? { ...r, status: 'rejected', respondedAt: new Date().toISOString() }
        : r
    );
    storage.setFriendRequests(next);
    setRequests(next);
    setVersion((v) => v + 1);
  }, []);

  const cancelRequest = useCallback((requestId) => {
    const next = storage.getFriendRequests().filter((r) => r.id !== requestId);
    storage.setFriendRequests(next);
    setRequests(next);
    setVersion((v) => v + 1);
  }, []);

  const unfriend = useCallback(
    (friendId) => {
      if (!currentUserId) return;
      const next = storage.getFriendRequests().filter(
        (r) =>
          !(
            r.status === 'accepted' &&
            ((r.fromUserId === currentUserId && r.toUserId === friendId) ||
              (r.fromUserId === friendId && r.toUserId === currentUserId))
          )
      );
      storage.setFriendRequests(next);
      setRequests(next);
      setVersion((v) => v + 1);
    },
    [currentUserId]
  );

  const value = useMemo(() => {
    const friends = currentUserId ? getFriendsOf(currentUserId) : [];
    const received = currentUserId ? getReceivedRequests(currentUserId) : [];
    const sent = currentUserId ? getSentRequests(currentUserId) : [];
    const suggestions = currentUserId ? getPeopleSuggestions(currentUserId) : [];

    return {
      requests,
      friends,
      received,
      sent,
      suggestions,
      pendingReceivedCount: received.length,
      friendsCount: friends.length,
      refresh,
      sendRequest,
      acceptRequest,
      rejectRequest,
      cancelRequest,
      unfriend,
      areFriends: (otherId) => areFriendsHelper(currentUserId, otherId),
      getRelationship: (otherId) => getRelationshipHelper(currentUserId, otherId),
      getMutualFriendsCount: (otherId) =>
        getMutualFriendsCountHelper(currentUserId, otherId),
      _version: version,
    };
  }, [
    currentUserId,
    requests,
    version,
    refresh,
    sendRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    unfriend,
  ]);

  return <FriendsContext.Provider value={value}>{children}</FriendsContext.Provider>;
}

export function useFriendsContext() {
  const ctx = useContext(FriendsContext);
  if (!ctx) {
    throw new Error('useFriendsContext must be used within FriendsProvider');
  }
  return ctx;
}

export function useFriendRequests() {
  const ctx = useFriendsContext();
  return {
    requests: ctx.requests,
    received: ctx.received,
    sent: ctx.sent,
    pendingReceivedCount: ctx.pendingReceivedCount,
    sendRequest: ctx.sendRequest,
    acceptRequest: ctx.acceptRequest,
    rejectRequest: ctx.rejectRequest,
    cancelRequest: ctx.cancelRequest,
    refresh: ctx.refresh,
  };
}
