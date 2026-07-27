import { Link } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

function truncate(text = '', max = 80) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export default function FriendCard({ user, onMessage, onUnfriend }) {
  return (
    <div className="card flex flex-col gap-4 p-4">
      <div className="flex items-start gap-3">
        <Link to={`/profile/${user.id}`}>
          <Avatar src={user.avatar} name={user.name} size="md" />
        </Link>
        <div className="min-w-0">
          <Link
            to={`/profile/${user.id}`}
            className="font-semibold text-slate-900 hover:underline dark:text-slate-50"
          >
            {user.name}
          </Link>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {truncate(user.bio || 'No bio yet.')}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link to={`/profile/${user.id}`} className="flex-1">
          <Button size="sm" variant="outline" className="w-full">
            View Profile
          </Button>
        </Link>
        <Button size="sm" className="flex-1" onClick={() => onMessage?.(user.id)}>
          Message
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="flex-1"
          onClick={() => onUnfriend?.(user.id)}
        >
          Unfriend
        </Button>
      </div>
    </div>
  );
}
