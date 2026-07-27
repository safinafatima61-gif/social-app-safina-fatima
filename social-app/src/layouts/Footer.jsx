import { APP_NAME, APP_TAGLINE } from '../constants/app';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/80 py-6 text-center text-sm text-slate-400 dark:border-slate-800 dark:text-slate-500">
      © {new Date().getFullYear()} {APP_NAME} · {APP_TAGLINE}
    </footer>
  );
}
