import { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '../services/storage';

const ThemeContext = createContext(null);

function applyThemeClass(theme) {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const saved = storage.getTheme();
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    applyThemeClass(theme);
    storage.setTheme(theme);
  }, [theme]);

  function setTheme(next) {
    setThemeState(next === 'dark' ? 'dark' : 'light');
  }

  function toggleTheme() {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === 'dark',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
