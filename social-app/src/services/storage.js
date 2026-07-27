// storage.js — shared data in localStorage; login session in sessionStorage (per-tab).

import { generateId } from '../utils/helpers';

const KEYS = {
  USERS: 'users',
  POSTS: 'posts',
  COMMENTS: 'comments',
  LIKES: 'likes',
  CURRENT_USER: 'currentUser',
  THEME: 'theme',
  FRIEND_REQUESTS: 'friendRequests',
  MESSAGES: 'messages',
  AI_SETTINGS: 'aiSettings',
  NOTIFICATIONS: 'notifications',
  SAVED_POSTS: 'savedPosts',
};

function safeGet(key, fallback, store = localStorage) {
  try {
    const raw = store.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error(`storage: failed to read ${key}`, err);
    return fallback;
  }
}

function safeSet(key, value, store = localStorage) {
  try {
    store.setItem(key, JSON.stringify(value));
    if (store === localStorage) {
      window.dispatchEvent(new CustomEvent('app-storage', { detail: { key } }));
    }
  } catch (err) {
    console.error(`storage: failed to write ${key}`, err);
  }
}

export const storage = {
  getUsers: () => safeGet(KEYS.USERS, []),
  setUsers: (users) => safeSet(KEYS.USERS, users),

  getPosts: () => safeGet(KEYS.POSTS, []),
  setPosts: (posts) => safeSet(KEYS.POSTS, posts),

  getComments: () => safeGet(KEYS.COMMENTS, []),
  setComments: (comments) => safeSet(KEYS.COMMENTS, comments),

  getLikes: () => safeGet(KEYS.LIKES, []),
  setLikes: (likes) => safeSet(KEYS.LIKES, likes),

  /**
   * Per-tab session — so Tab A can be User A and Tab B can be User B.
   * Friends / messages / requests stay in localStorage (shared).
   */
  getCurrentUser: () => {
    const fromSession = safeGet(KEYS.CURRENT_USER, null, sessionStorage);
    if (fromSession) return fromSession;
    // One-time migrate from old localStorage session
    const fromLocal = safeGet(KEYS.CURRENT_USER, null, localStorage);
    if (fromLocal) {
      safeSet(KEYS.CURRENT_USER, fromLocal, sessionStorage);
      try {
        localStorage.removeItem(KEYS.CURRENT_USER);
      } catch {
        /* ignore */
      }
    }
    return fromLocal;
  },
  setCurrentUser: (user) => safeSet(KEYS.CURRENT_USER, user, sessionStorage),
  clearCurrentUser: () => {
    try {
      sessionStorage.removeItem(KEYS.CURRENT_USER);
      localStorage.removeItem(KEYS.CURRENT_USER);
    } catch {
      /* ignore */
    }
  },

  getTheme: () => safeGet(KEYS.THEME, 'light'),
  setTheme: (theme) => safeSet(KEYS.THEME, theme),

  getFriendRequests: () => safeGet(KEYS.FRIEND_REQUESTS, []),
  setFriendRequests: (requests) => safeSet(KEYS.FRIEND_REQUESTS, requests),

  getMessages: () => safeGet(KEYS.MESSAGES, []),
  setMessages: (messages) => safeSet(KEYS.MESSAGES, messages),

  getAISettings: () => safeGet(KEYS.AI_SETTINGS, {}),
  setAISettings: (settings) => safeSet(KEYS.AI_SETTINGS, settings),

  getNotifications: () => safeGet(KEYS.NOTIFICATIONS, []),
  setNotifications: (items) => safeSet(KEYS.NOTIFICATIONS, items),

  getSavedPosts: () => safeGet(KEYS.SAVED_POSTS, []),
  setSavedPosts: (items) => safeSet(KEYS.SAVED_POSTS, items),
};

/** Ensure at least 2 demo people exist so People / Requests / Chat can be tested. */
export function ensureDemoUsers() {
  const users = storage.getUsers();
  const demos = [
    {
      id: 'usr_demo_alex',
      name: 'Alex Rivera',
      email: 'alex@demo.com',
      password: 'demo123',
      bio: 'Designer & collaborator. Happy to connect!',
      location: 'Karachi',
      education: 'BS Design',
      skills: ['UI/UX', 'Figma'],
      socialLinks: { website: '', twitter: '', linkedin: '', github: '' },
      avatar: null,
      coverImage: null,
      role: 'user',
      joinedAt: '2025-01-01T10:00:00.000Z',
    },
    {
      id: 'usr_demo_sam',
      name: 'Sam Khan',
      email: 'sam@demo.com',
      password: 'demo123',
      bio: 'Full-stack learner. Let’s build together.',
      location: 'Lahore',
      education: 'BS Computer Science',
      skills: ['React', 'Node'],
      socialLinks: { website: '', twitter: '', linkedin: '', github: '' },
      avatar: null,
      coverImage: null,
      role: 'user',
      joinedAt: '2025-01-02T10:00:00.000Z',
    },
  ];

  let next = [...users];
  let changed = false;
  demos.forEach((demo) => {
    const exists = next.some(
      (u) => u.id === demo.id || u.email.toLowerCase() === demo.email.toLowerCase()
    );
    if (!exists) {
      next.push(demo);
      changed = true;
    }
  });
  if (changed) storage.setUsers(next);
  return storage.getUsers();
}

export { KEYS, generateId };
