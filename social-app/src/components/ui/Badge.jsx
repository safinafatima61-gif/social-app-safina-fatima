import clsx from 'clsx';

const VARIANTS = {
  draft: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
  public: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  private: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
};

export default function Badge({ variant = 'draft', children }) {
  return (
    <span
      className={clsx(
        'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
        VARIANTS[variant]
      )}
    >
      {children}
    </span>
  );
}
