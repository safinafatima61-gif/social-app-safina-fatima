import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-6xl font-extrabold text-brand-600 dark:text-brand-400">404</p>
      <h1 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-50">Page not found</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link to="/" className="mt-6 font-medium text-brand-600 hover:underline dark:text-brand-400">
        Back to feed
      </Link>
    </div>
  );
}
