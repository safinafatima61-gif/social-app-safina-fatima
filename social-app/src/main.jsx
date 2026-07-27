import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { FriendsProvider } from './context/FriendsContext';
import { ChatProvider } from './context/ChatContext';
import { AdminProvider } from './context/AdminContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';
import App from './App';
import './styles/index.css';

try {
  const theme = JSON.parse(localStorage.getItem('theme') || '"light"');
  if (theme === 'dark') document.documentElement.classList.add('dark');
} catch {
  /* ignore */
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <FriendsProvider>
              <ChatProvider>
                <NotificationProvider>
                  <AdminProvider>
                    <App />
                  </AdminProvider>
                </NotificationProvider>
              </ChatProvider>
            </FriendsProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
