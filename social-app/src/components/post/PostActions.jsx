import clsx from 'clsx';

export default function PostActions({ liked, likeCount, commentCount, onLike, onComment }) {
  return (
    <div className="mt-4 flex items-center gap-6 border-t border-gray-100 pt-3 text-sm dark:border-gray-800">
      <button
        onClick={onLike}
        className={clsx(
          'flex items-center gap-1.5 font-medium transition-colors',
          liked ? 'text-rose-600' : 'text-gray-500 hover:text-rose-500'
        )}
      >
        <span>{liked ? '❤️' : '🤍'}</span>
        <span>{likeCount}</span>
      </button>
      <button
        onClick={onComment}
        className="flex items-center gap-1.5 font-medium text-gray-500 hover:text-brand-600"
      >
        <span>💬</span>
        <span>{commentCount}</span>
      </button>
    </div>
  );
}
