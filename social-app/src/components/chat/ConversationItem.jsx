import { formatDate } from '../../utils/helpers';
import { messagePreview } from '../../utils/chatHelpers';
import Avatar from '../ui/Avatar';
import RequestBadge from '../friends/RequestBadge';
import clsx from 'clsx';

export default function ConversationItem({ conversation, active, onClick }) {
  const { friend, lastMessage, unread } = conversation;

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition dark:border-slate-800',
        active
          ? 'border-l-4 border-blue-600 bg-blue-50 dark:bg-brand-950'
          : 'border-l-4 border-l-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60'
      )}
    >
      <Avatar src={friend.avatar} name={friend.name} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
            {friend.name}
          </p>
          {lastMessage && (
            <span className="shrink-0 text-[11px] text-slate-400">
              {formatDate(lastMessage.timestamp)}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {messagePreview(lastMessage)}
          </p>
          <div className="relative">
            <RequestBadge count={unread} />
          </div>
        </div>
      </div>
    </button>
  );
}
