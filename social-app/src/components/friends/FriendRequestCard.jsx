import { Link } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

function truncate(text = '', max = 60) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/**
 * Relationship actions:
 * none → Add Friend
 * outgoing → Request Sent + Cancel Request
 * incoming → Accept / Reject
 * friends → Friends badge + Message + Unfriend
 */
export default function FriendRequestCard({
  user,
  relationship,
  mutualCount = 0,
  hasPosts = false,
  compact = false,
  onAdd,
  onAccept,
  onReject,
  onCancel,
  onUnfriend,
  onMessage,
}) {
  return (
    <div
      className={
        compact
          ? 'flex flex-col gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800'
          : 'card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between'
      }
    >
      <div className="flex min-w-0 items-start gap-3">
        <Link to={`/profile/${user.id}`}>
          <Avatar src={user.avatar} name={user.name} size={compact ? 'sm' : 'md'} />
        </Link>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/profile/${user.id}`}
              className="font-semibold text-slate-900 hover:underline dark:text-slate-50"
            >
              {user.name}
            </Link>
            {hasPosts && !compact && (
              <Badge className="!bg-brand-50 !text-brand-700 dark:!bg-brand-950 dark:!text-brand-300">
                Active
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {truncate(user.bio || 'No bio yet.', compact ? 40 : 60)}
          </p>
          {!compact && (
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              {mutualCount} mutual friend{mutualCount === 1 ? '' : 's'}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {relationship === 'none' && (
          <Button size="sm" onClick={() => onAdd?.(user.id)}>
            Add Friend
          </Button>
        )}
        {relationship === 'outgoing' && (
          <>
            <Button size="sm" variant="secondary" disabled className="cursor-default opacity-70">
              Request Sent
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onCancel?.(user.id)}>
              Cancel Request
            </Button>
          </>
        )}
        {relationship === 'incoming' && (
          <>
            <Button size="sm" onClick={() => onAccept?.(user.id)}>
              Accept
            </Button>
            <Button size="sm" variant="secondary" onClick={() => onReject?.(user.id)}>
              Reject
            </Button>
          </>
        )}
        {relationship === 'friends' && (
          <>
            <Badge variant="public">Friends</Badge>
            <Button size="sm" variant="outline" onClick={() => onMessage?.(user.id)}>
              Message
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onUnfriend?.(user.id)}>
              Unfriend
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
