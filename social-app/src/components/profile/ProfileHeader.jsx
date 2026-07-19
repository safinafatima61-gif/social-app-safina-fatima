import { Link } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { formatFullDate } from '../../utils/helpers';

export default function ProfileHeader({ user, isOwner }) {
  return (
    <div className="card overflow-hidden">
      <div
        className="h-40 w-full sm:h-56"
        style={
          user.coverImage
            ? { backgroundImage: `url(${user.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: 'linear-gradient(135deg,#3a6df0,#93bafc)' }
        }
      />
      <div className="relative px-6 pb-6">
        <div className="-mt-10 flex items-end justify-between">
          <Avatar
            src={user.avatar}
            name={user.name}
            size="lg"
            className="border-4 border-white dark:border-gray-900"
          />
          {isOwner && (
            <Link to="/dashboard/settings">
              <Button size="sm" variant="secondary">Edit Profile</Button>
            </Link>
          )}
        </div>
        <h1 className="mt-3 text-xl font-bold">{user.name}</h1>
        {user.bio && <p className="mt-1 text-gray-600 dark:text-gray-300">{user.bio}</p>}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400">
          {user.location && <span>📍 {user.location}</span>}
          <span>📅 Joined {formatFullDate(user.joinedAt)}</span>
        </div>
      </div>
    </div>
  );
}
