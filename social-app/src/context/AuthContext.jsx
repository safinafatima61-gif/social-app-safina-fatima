import { createContext, useState } from 'react';
import { storage, generateId } from '../utils/storage';

export const AuthContext = createContext(null);

function stripPassword(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => storage.getCurrentUser());

  function signup({ name, email, password }) {
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
      avatar: null,
      coverImage: null,
      joinedAt: new Date().toISOString(),
    };
    storage.setUsers([...users, newUser]);
    return stripPassword(newUser);
  }

  function login(email, password) {
    const users = storage.getUsers();
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
