// storage.js — single source of truth for every localStorage read/write.
// Never call localStorage directly from a component — always go through here.

import { generateId } from './helpers';

const KEYS = {
  USERS: 'users',
  POSTS: 'posts',
  COMMENTS: 'comments',
  LIKES: 'likes',
  CURRENT_USER: 'currentUser',
  THEME: 'theme',
};

function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error(`storage: failed to read ${key}`, err);
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`storage: failed to write ${key}`, err);
  }
}

export const storage = {
  // Users
  getUsers: () => safeGet(KEYS.USERS, []),
  setUsers: (users) => safeSet(KEYS.USERS, users),

  // Posts
  getPosts: () => safeGet(KEYS.POSTS, []),
  setPosts: (posts) => safeSet(KEYS.POSTS, posts),

  // Comments
  getComments: () => safeGet(KEYS.COMMENTS, []),
  setComments: (comments) => safeSet(KEYS.COMMENTS, comments),

  // Likes
  getLikes: () => safeGet(KEYS.LIKES, []),
  setLikes: (likes) => safeSet(KEYS.LIKES, likes),

  // Current session
  getCurrentUser: () => safeGet(KEYS.CURRENT_USER, null),
  setCurrentUser: (user) => safeSet(KEYS.CURRENT_USER, user),
  clearCurrentUser: () => localStorage.removeItem(KEYS.CURRENT_USER),

  // Theme (dark mode bonus)
  getTheme: () => safeGet(KEYS.THEME, 'light'),
  setTheme: (theme) => safeSet(KEYS.THEME, theme),
};

export { KEYS, generateId };
