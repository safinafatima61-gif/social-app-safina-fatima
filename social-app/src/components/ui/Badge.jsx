import clsx from 'clsx';

const VARIANTS = {
  draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  public: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  private: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  admin: 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
};

export default function Badge({ variant = 'draft', children, className }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold',
        VARIANTS[variant] || VARIANTS.draft,
        className
      )}
    >
      {children}
    </span>
  );
}
