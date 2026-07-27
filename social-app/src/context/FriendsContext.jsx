import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { storage, generateId, ensureDemoUsers } from '../services/storage';
import { useAuth } from '../hooks/useAuth';
import { createNotification } from '../utils/notificationHelpers';
import {
  getFriendsOf,
  getFriendsCount,
  getPendingRequest,
  getReceivedRequests,
  getSentRequests,
  getPeopleSuggestions,
  getRelationship as getRelationshipHelper,
  getMutualFriendsCount as getMutualFriendsCountHelper,
  normalizeFriendRequests,
} from '../utils/friendHelpers';

const FriendsContext = createContext(null);

function readFriendRequestsFromStorage() {
  ensureDemoUsers();
  return normalizeFriendRequests(storage.getFriendRequests());
}

export function FriendsProvider({ children }) {
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id || null;

  const [requests, setRequests] = useState(() => readFriendRequestsFromStorage());
  const writingRef = useRef(false);

  const syncFromStorage = useCallback(() => {
    if (writingRef.current) return;
    setRequests(readFriendRequestsFromStorage());
  }, []);

  // Cross-tab + same-tab storage sync (skip our own writes)
  useEffect(() => {
    function onStorage(event) {
      if (event.key === 'friendRequests') syncFromStorage();
    }
    function onAppStorage(event) {
      // Only react to friendRequests — ignore 'users' heartbeat from ChatContext
      if (event.detail?.key === 'friendRequests') syncFromStorage();
    }
    window.addEventListener('storage', onStorage);
    window.addEventListener('app-storage', onAppStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('app-storage', onAppStorage);
    };
  }, [syncFromStorage]);

  useEffect(() => {
    syncFromStorage();
  }, [currentUserId, syncFromStorage]);

  /** Persist to localStorage and React state together. */
  const persist = useCallback((next) => {
    const normalized = normalizeFriendRequests(next);
    writingRef.current = true;
    try {
      storage.setFriendRequests(normalized);
      setRequests(normalized);
    } finally {
      queueMicrotask(() => {
        writingRef.current = false;
      });
    }
    return normalized;
  }, []);

  const sendRequest = useCallback(
    (toUserId) => {
      if (!currentUserId || !toUserId || currentUserId === toUserId) {
        return { ok: false, reason: 'invalid' };
      }

      // Always use fresh storage as source of truth
      const latest = readFriendRequestsFromStorage();

      if (getRelationshipHelper(currentUserId, toUserId, latest) === 'friends') {
        return { ok: false, reason: 'already_friends' };
      }
      if (getPendingRequest(currentUserId, toUserId, latest)) {
        return { ok: false, reason: 'already_sent' };
      }

      const incoming = getPendingRequest(toUserId, currentUserId, latest);
      if (incoming) {
        const next = latest.map((r) =>
          r.id === incoming.id
            ? { ...r, status: 'accepted', respondedAt: new Date().toISOString() }
            : r
        );
        persist(next);
        return { ok: true, acceptedExisting: true, requestId: incoming.id };
      }

      const request = {
        id: generateId('req'),
        fromUserId: currentUserId,
        toUserId,
        status: 'pending',
        sentAt: new Date().toISOString(),
        respondedAt: null,
      };
      persist([...latest, request]);

      createNotification({
        userId: toUserId,
        type: 'friend_request',
        fromUserId: currentUserId,
        message: `${currentUser?.name || 'Someone'} sent you a friend request`,
        link: '/requests',
      });

      return { ok: true, requestId: request.id };
    },
    [currentUserId, currentUser?.name, persist]
  );

  const acceptRequest = useCallback(
    (requestId) => {
      if (!currentUserId || !requestId) return { ok: false, reason: 'invalid' };

      const latest = readFriendRequestsFromStorage();
      const req = latest.find((r) => r.id === requestId);
      if (!req) return { ok: false, reason: 'not_found' };
      if (String(req.status).toLowerCase() !== 'pending') {
        return { ok: false, reason: 'not_pending' };
      }
      if (String(req.toUserId) !== String(currentUserId)) {
        return { ok: false, reason: 'not_receiver' };
      }

      const next = latest.map((r) =>
        r.id === requestId
          ? { ...r, status: 'accepted', respondedAt: new Date().toISOString() }
          : r
      );
      const saved = persist(next);

      // Verify friendship is visible for accepter
      const friendsNow = getFriendsOf(currentUserId, saved);
      if (!friendsNow.some((f) => String(f.id) === String(req.fromUserId))) {
        console.error('[friends] accept persisted but getFriendsOf missing sender', {
          currentUserId,
          fromUserId: req.fromUserId,
          saved,
          friendsNow,
        });
      }

      createNotification({
        userId: req.fromUserId,
        type: 'friend_accepted',
        fromUserId: currentUserId,
        message: `${currentUser?.name || 'Someone'} accepted your friend request`,
        link: '/friends',
      });

      return { ok: true, friendId: req.fromUserId, friendsCount: friendsNow.length };
    },
    [currentUserId, currentUser?.name, persist]
  );

  const acceptRequestFromUser = useCallback(
    (fromUserId) => {
      if (!currentUserId || !fromUserId) return { ok: false, reason: 'invalid' };
      const latest = readFriendRequestsFromStorage();
      const req = getPendingRequest(fromUserId, currentUserId, latest);
      if (!req) return { ok: false, reason: 'not_found' };
      return acceptRequest(req.id);
    },
    [currentUserId, acceptRequest]
  );

  const rejectRequest = useCallback(
    (requestId) => {
      if (!currentUserId || !requestId) return { ok: false, reason: 'invalid' };
      const latest = readFriendRequestsFromStorage();
      const req = latest.find((r) => r.id === requestId);
      if (!req) return { ok: false, reason: 'not_found' };
      if (String(req.status).toLowerCase() !== 'pending') {
        return { ok: false, reason: 'not_pending' };
      }
      if (String(req.toUserId) !== String(currentUserId)) {
        return { ok: false, reason: 'not_receiver' };
      }
      persist(
        latest.map((r) =>
          r.id === requestId
            ? { ...r, status: 'rejected', respondedAt: new Date().toISOString() }
            : r
        )
      );
      return { ok: true };
    },
    [currentUserId, persist]
  );

  const rejectRequestFromUser = useCallback(
    (fromUserId) => {
      if (!currentUserId || !fromUserId) return { ok: false, reason: 'invalid' };
      const latest = readFriendRequestsFromStorage();
      const req = getPendingRequest(fromUserId, currentUserId, latest);
      if (!req) return { ok: false, reason: 'not_found' };
      return rejectRequest(req.id);
    },
    [currentUserId, rejectRequest]
  );

  const cancelRequest = useCallback(
    (requestId) => {
      if (!currentUserId || !requestId) return { ok: false, reason: 'invalid' };
      const latest = readFriendRequestsFromStorage();
      const req = latest.find((r) => r.id === requestId);
      if (!req) return { ok: false, reason: 'not_found' };
      if (String(req.fromUserId) !== String(currentUserId)) {
        return { ok: false, reason: 'not_sender' };
      }
      persist(latest.filter((r) => r.id !== requestId));
      return { ok: true };
    },
    [currentUserId, persist]
  );

  const cancelRequestToUser = useCallback(
    (toUserId) => {
      if (!currentUserId || !toUserId) return { ok: false, reason: 'invalid' };
      const latest = readFriendRequestsFromStorage();
      const req = getPendingRequest(currentUserId, toUserId, latest);
      if (!req) return { ok: false, reason: 'not_found' };
      return cancelRequest(req.id);
    },
    [currentUserId, cancelRequest]
  );

  const unfriend = useCallback(
    (friendId) => {
      if (!currentUserId || !friendId) return { ok: false, reason: 'invalid' };
      const latest = readFriendRequestsFromStorage();
      const next = latest.filter(
        (r) =>
          !(
            String(r.status).toLowerCase() === 'accepted' &&
            ((String(r.fromUserId) === String(currentUserId) &&
              String(r.toUserId) === String(friendId)) ||
              (String(r.fromUserId) === String(friendId) &&
                String(r.toUserId) === String(currentUserId)))
          )
      );
      persist(next);
      return { ok: true };
    },
    [currentUserId, persist]
  );

  const value = useMemo(() => {
    const friends = currentUserId ? getFriendsOf(currentUserId, requests) : [];
    const received = currentUserId ? getReceivedRequests(currentUserId, requests) : [];
    const sent = currentUserId ? getSentRequests(currentUserId, requests) : [];
    const suggestions = currentUserId
      ? getPeopleSuggestions(currentUserId, requests)
      : [];
    const friendsCount = friends.length;

    return {
      requests,
      friends,
      received,
      sent,
      suggestions,
      pendingReceivedCount: received.length,
      friendsCount,
      refresh: syncFromStorage,
      sendRequest,
      acceptRequest,
      acceptRequestFromUser,
      rejectRequest,
      rejectRequestFromUser,
      cancelRequest,
      cancelRequestToUser,
      unfriend,
      areFriends: (otherId) =>
        getRelationshipHelper(currentUserId, otherId, requests) === 'friends',
      getRelationship: (otherId) =>
        getRelationshipHelper(currentUserId, otherId, requests),
      getMutualFriendsCount: (otherId) =>
        getMutualFriendsCountHelper(currentUserId, otherId, requests),
      getFriendsCountFor: (userId) => getFriendsCount(userId, requests),
    };
  }, [
    currentUserId,
    requests,
    syncFromStorage,
    sendRequest,
    acceptRequest,
    acceptRequestFromUser,
    rejectRequest,
    rejectRequestFromUser,
    cancelRequest,
    cancelRequestToUser,
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
