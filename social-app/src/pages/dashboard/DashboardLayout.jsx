import { NavLink, Outlet } from 'react-router-dom';
import clsx from 'clsx';

const LINKS = [
  { to: '/dashboard/posts', label: 'My Posts', icon: '📄' },
  { to: '/dashboard/create', label: 'Create Post', icon: '➕' },
  { to: '/dashboard/settings', label: 'Profile Settings', icon: '⚙️' },
];

export default function DashboardLayout() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
        <aside className="card h-fit p-3 md:sticky md:top-20">
          <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium',
                    isActive
                      ? 'bg-brand-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  )
                }
              >
                <span>{link.icon}</span> {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
