import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { APP_NAME, APP_SHORT } from '../../constants/app';

export default function Logo({ to = '/', light = false, className }) {
  return (
    <Link to={to} className={clsx('inline-flex items-center gap-2.5', className)}>
      <span
        className={clsx(
          'grid h-9 w-9 place-items-center rounded-xl text-xs font-extrabold tracking-tight text-white shadow-sm ring-1 ring-black/5',
          light
            ? 'bg-white/20 ring-white/40'
            : 'bg-gradient-to-br from-brand-500 to-brand-700'
        )}
      >
        {APP_SHORT}
      </span>
      <span
        className={clsx(
          'text-base font-bold tracking-tight sm:text-lg',
          light ? 'text-white' : 'text-slate-900 dark:text-slate-50'
        )}
      >
        {APP_NAME}
      </span>
    </Link>
  );
}
