import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/helpers';
import RequestBadge from '../friends/RequestBadge';
import clsx from 'clsx';

export default function NotificationDropdown() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        title="Notifications"
        aria-label="Notifications"
      >
        <span className="text-base">🔔</span>
        <RequestBadge count={unreadCount} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-50">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
              >
                Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-slate-400">No notifications yet</li>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <li key={n.id}>
                  <Link
                    to={n.link || '/'}
                    onClick={() => {
                      markRead(n.id);
                      setOpen(false);
                    }}
                    className={clsx(
                      'block border-b border-slate-50 px-4 py-3 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60',
                      !n.read && 'bg-brand-50/60 dark:bg-brand-950/40'
                    )}
                  >
                    <p className="text-sm text-slate-800 dark:text-slate-100">{n.message}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">{formatDate(n.createdAt)}</p>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
