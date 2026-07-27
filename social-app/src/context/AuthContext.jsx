import { createContext, useState } from 'react';
import { storage, generateId, ensureDemoUsers } from '../services/storage';

export const AuthContext = createContext(null);

function stripPassword(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

function ensureRoles(users) {
  if (!users.length) return users;
  let changed = false;
  const next = users.map((u, index) => {
    if (u.role) return u;
    changed = true;
    return { ...u, role: index === 0 ? 'admin' : 'user' };
  });
  if (changed) storage.setUsers(next);
  return next;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    ensureDemoUsers();
    const users = ensureRoles(storage.getUsers());
    const session = storage.getCurrentUser();
    if (!session) return null;
    const fresh = users.find((u) => u.id === session.id);
    return fresh ? stripPassword(fresh) : session;
  });

  function signup({ name, email, password }) {
    ensureDemoUsers();
    const users = storage.getUsers();
    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      throw new Error('Email already registered');
    }

    const newUser = {
      id: generateId('usr'),
      name,
      email,
      password,
      bio: '',
      location: '',
      education: '',
      skills: [],
      socialLinks: { website: '', twitter: '', linkedin: '', github: '' },
      avatar: null,
      coverImage: null,
      role: users.length === 0 ? 'admin' : 'user',
      joinedAt: new Date().toISOString(),
    };

    storage.setUsers([...users, newUser]);
    const safeUser = stripPassword(newUser);
    // Auto-login this tab after signup
    setCurrentUser(safeUser);
    storage.setCurrentUser(safeUser);
    return safeUser;
  }

  function login(email, password) {
    ensureDemoUsers();
    const users = ensureRoles(storage.getUsers());
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) {
      throw new Error('Invalid email or password');
    }
    const safeUser = stripPassword(found);
    setCurrentUser(safeUser);
    storage.setCurrentUser(safeUser);
    return safeUser;
  }

  function logout() {
    setCurrentUser(null);
    storage.clearCurrentUser();
  }

  function updateCurrentUser(updatedData) {
    if (!currentUser) return;
    const merged = { ...currentUser, ...updatedData };
    setCurrentUser(merged);
    storage.setCurrentUser(merged);

    const users = storage.getUsers();
    const nextUsers = users.map((u) =>
      u.id === merged.id ? { ...u, ...updatedData } : u
    );
    storage.setUsers(nextUsers);
  }

  const value = {
    currentUser,
    signup,
    login,
    logout,
    updateCurrentUser,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
