import clsx from 'clsx';

export default function PostActions({
  liked,
  likeCount,
  commentCount,
  shareCount = 0,
  saved = false,
  onLike,
  onComment,
  onShare,
  onSave,
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-3 text-sm dark:border-slate-800 sm:gap-6">
      <button
        type="button"
        onClick={onLike}
        className={clsx(
          'flex items-center gap-1.5 font-medium transition-colors',
          liked
            ? 'text-rose-600 dark:text-rose-400'
            : 'text-slate-500 hover:text-rose-500 dark:text-slate-400'
        )}
      >
        <span>{liked ? '❤️' : '🤍'}</span>
        <span>{likeCount}</span>
      </button>
      <button
        type="button"
        onClick={onComment}
        className="flex items-center gap-1.5 font-medium text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
      >
        <span>💬</span>
        <span>{commentCount}</span>
      </button>
      <button
        type="button"
        onClick={onShare}
        className="flex items-center gap-1.5 font-medium text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
      >
        <span>↗</span>
        <span>{shareCount > 0 ? shareCount : 'Share'}</span>
      </button>
      <button
        type="button"
        onClick={onSave}
        className={clsx(
          'ml-auto flex items-center gap-1.5 font-medium transition-colors',
          saved
            ? 'text-brand-600 dark:text-brand-400'
            : 'text-slate-500 hover:text-brand-600 dark:text-slate-400'
        )}
      >
        <span>{saved ? '🔖' : '📑'}</span>
        <span>{saved ? 'Saved' : 'Save'}</span>
      </button>
    </div>
  );
}
