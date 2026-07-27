import { NavLink, Outlet } from 'react-router-dom';
import clsx from 'clsx';

const LINKS = [
  { to: '/dashboard', label: 'Overview', end: true },
  { to: '/dashboard/posts', label: 'My Posts' },
  { to: '/dashboard/create', label: 'Create Post' },
  { to: '/dashboard/settings', label: 'Settings' },
];

export default function DashboardLayout() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              clsx(
                'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition',
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800'
              )
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  );
}
