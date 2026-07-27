import { NavLink, Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../hooks/useAuth';
import { useFriends } from '../hooks/useFriends';
import { useChatContext } from '../context/ChatContext';
import Logo from '../components/ui/Logo';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import ThemeToggle from '../components/ui/ThemeToggle';
import RequestBadge from '../components/friends/RequestBadge';
import NotificationDropdown from '../components/layout/NotificationDropdown';
import { HomeIcon, UserIcon, ShieldIcon, LogoutIcon } from '../components/icons/Icons';

const navIconClass = ({ isActive }) =>
  clsx(
    'relative rounded-xl p-2 transition-colors',
    isActive
      ? 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400'
      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
  );

const textLinkClass = ({ isActive }) =>
  clsx(
    'relative inline-flex items-center rounded-lg px-2 py-1.5 text-xs font-semibold transition sm:px-2.5 sm:text-sm',
    isActive
      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
  );

export default function Navbar() {
  const { currentUser, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { pendingReceivedCount } = useFriends(currentUser?.id);
  const { unreadCount } = useChatContext();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-3 py-3 sm:px-4">
        <Logo />

        <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              <NavLink to="/" end className={navIconClass} title="Home" aria-label="Home">
                <HomeIcon />
              </NavLink>
              <NavLink
                to={`/profile/${currentUser.id}`}
                className={navIconClass}
                title="Profile"
                aria-label="Profile"
              >
                <UserIcon />
              </NavLink>
              {isAdmin && (
                <NavLink to="/dashboard" className={navIconClass} title="Admin" aria-label="Admin">
                  <ShieldIcon />
                </NavLink>
              )}

              <NavLink to="/dashboard/create" className={textLinkClass}>
                Create
              </NavLink>
              <NavLink to="/dashboard/settings" className={textLinkClass}>
                Settings
              </NavLink>
              <NavLink to="/people" className={textLinkClass}>
                People
              </NavLink>
              <NavLink to="/requests" className={textLinkClass}>
                Requests
                <RequestBadge count={pendingReceivedCount} />
              </NavLink>
              <NavLink to="/friends" className={textLinkClass}>
                Friends
              </NavLink>
              <NavLink to="/chat" className={textLinkClass}>
                Chat
                <RequestBadge count={unreadCount} />
              </NavLink>

              <NotificationDropdown />

              <div className="ml-1 flex items-center gap-2 rounded-full bg-brand-50/80 py-1 pl-1 pr-2 ring-1 ring-brand-100 dark:bg-brand-950/60 dark:ring-brand-900 sm:pr-3">
                <Link to={`/profile/${currentUser.id}`} className="flex items-center gap-2">
                  <Avatar src={currentUser.avatar} name={currentUser.name} size="sm" />
                  <span className="hidden max-w-[100px] truncate text-sm font-medium text-slate-800 dark:text-slate-100 sm:block">
                    {currentUser.name}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white hover:text-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                  title="Log out"
                  aria-label="Log out"
                >
                  <LogoutIcon className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
