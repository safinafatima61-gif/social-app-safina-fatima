import { useState, useEffect } from 'react';

// Generic state hook synced to a localStorage key.
// Handy for small one-off preferences like dark mode.
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`useLocalStorage: failed to persist ${key}`, err);
    }
  }, [key, value]);

  return [value, setValue];
}
