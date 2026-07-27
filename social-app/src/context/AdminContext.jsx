import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { storage } from '../services/storage';
import { useAuth } from '../hooks/useAuth';

const AdminContext = createContext(null);

function buildFriendships(requests, users) {
  return requests
    .filter((r) => r.status === 'accepted')
    .map((r) => {
      const a = users.find((u) => u.id === r.fromUserId);
      const b = users.find((u) => u.id === r.toUserId);
      return {
        id: r.id,
        request: r,
        userA: a || { id: r.fromUserId, name: 'Unknown' },
        userB: b || { id: r.toUserId, name: 'Unknown' },
        since: r.respondedAt || r.sentAt,
      };
    });
}

export function AdminProvider({ children }) {
  const { currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState(() => storage.getUsers());
  const [posts, setPosts] = useState(() => storage.getPosts());
  const [comments, setComments] = useState(() => storage.getComments());
  const [requests, setRequests] = useState(() => storage.getFriendRequests());
  const [messages, setMessages] = useState(() => storage.getMessages());

  const refresh = useCallback(() => {
    setUsers(storage.getUsers());
    setPosts(storage.getPosts());
    setComments(storage.getComments());
    setRequests(storage.getFriendRequests());
    setMessages(storage.getMessages());
  }, []);

  useEffect(() => {
    function onStorage(e) {
      if (['users', 'posts', 'comments', 'friendRequests', 'messages', 'likes'].includes(e.key)) {
        refresh();
      }
    }
    function onAppStorage(e) {
      const key = e.detail?.key;
      if (['users', 'posts', 'comments', 'friendRequests', 'messages', 'likes'].includes(key)) {
        refresh();
      }
    }
    window.addEventListener('storage', onStorage);
    window.addEventListener('app-storage', onAppStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('app-storage', onAppStorage);
    };
  }, [refresh]);

  const deleteUser = useCallback(
    (userId) => {
      if (!isAdmin || !userId || userId === currentUser?.id) return false;

      storage.setUsers(storage.getUsers().filter((u) => u.id !== userId));

      const remainingPosts = storage.getPosts().filter((p) => p.authorId !== userId);
      const removedPostIds = new Set(
        storage.getPosts().filter((p) => p.authorId === userId).map((p) => p.id)
      );
      storage.setPosts(remainingPosts);

      storage.setComments(
        storage
          .getComments()
          .filter((c) => c.authorId !== userId && !removedPostIds.has(c.postId))
      );
      storage.setLikes(
        storage.getLikes().filter((l) => l.userId !== userId && !removedPostIds.has(l.postId))
      );
      storage.setFriendRequests(
        storage
          .getFriendRequests()
          .filter((r) => r.fromUserId !== userId && r.toUserId !== userId)
      );
      storage.setMessages(
        storage.getMessages().filter((m) => m.senderId !== userId && m.receiverId !== userId)
      );

      refresh();
      return true;
    },
    [isAdmin, currentUser?.id, refresh]
  );

  const deletePost = useCallback(
    (postId) => {
      if (!isAdmin || !postId) return false;
      storage.setPosts(storage.getPosts().filter((p) => p.id !== postId));
      storage.setComments(storage.getComments().filter((c) => c.postId !== postId));
      storage.setLikes(storage.getLikes().filter((l) => l.postId !== postId));
      refresh();
      return true;
    },
    [isAdmin, refresh]
  );

  const cancelFriendRequest = useCallback(
    (requestId) => {
      if (!isAdmin || !requestId) return false;
      storage.setFriendRequests(storage.getFriendRequests().filter((r) => r.id !== requestId));
      refresh();
      return true;
    },
    [isAdmin, refresh]
  );

  const removeFriendship = useCallback(
    (requestId) => {
      if (!isAdmin || !requestId) return false;
      storage.setFriendRequests(storage.getFriendRequests().filter((r) => r.id !== requestId));
      refresh();
      return true;
    },
    [isAdmin, refresh]
  );

  const friendships = useMemo(() => buildFriendships(requests, users), [requests, users]);
  const pendingRequests = useMemo(
    () => requests.filter((r) => r.status === 'pending'),
    [requests]
  );

  const value = useMemo(
    () => ({
      isAdmin,
      users,
      posts,
      comments,
      requests,
      pendingRequests,
      friendships,
      messages,
      stats: {
        users: users.length,
        posts: posts.length,
        comments: comments.length,
        pendingRequests: pendingRequests.length,
        friendships: friendships.length,
        messages: messages.length,
      },
      refresh,
      deleteUser,
      deletePost,
      cancelFriendRequest,
      removeFriendship,
    }),
    [
      isAdmin,
      users,
      posts,
      comments,
      requests,
      pendingRequests,
      friendships,
      messages,
      refresh,
      deleteUser,
      deletePost,
      cancelFriendRequest,
      removeFriendship,
    ]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return ctx;
}
