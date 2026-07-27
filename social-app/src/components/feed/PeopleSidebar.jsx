import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFriends } from '../../hooks/useFriends';
import FriendRequestCard from '../friends/FriendRequestCard';
import SectionCard from '../ui/SectionCard';
import Button from '../ui/Button';
import { APP_NAME } from '../../constants/app';

/**
 * Feed sidebar — shows other users WITH friend-request actions.
 */
export default function PeopleSidebar() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const {
    suggestions,
    sendRequest,
    acceptRequestFromUser,
    rejectRequestFromUser,
    cancelRequestToUser,
    unfriend,
  } = useFriends(currentUser?.id);

  const people = suggestions.slice(0, 8);

  return (
    <SectionCard
      title={`People on ${APP_NAME}`}
      action={
        <Link
          to="/people"
          className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
        >
          See all
        </Link>
      }
    >
      {people.length === 0 ? (
        <div className="space-y-3 text-center">
          <p className="text-sm text-slate-400 dark:text-slate-500">
            No other users yet. Invite friends to join!
          </p>
          <Link to="/people">
            <Button size="sm" variant="outline" className="w-full">
              Find people
            </Button>
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {people.map(({ user, relationship, mutualCount, hasPosts }) => (
            <li key={user.id}>
              <FriendRequestCard
                user={user}
                relationship={relationship}
                mutualCount={mutualCount}
                hasPosts={hasPosts}
                compact
                onAdd={(id) => sendRequest(id)}
                onAccept={(id) => acceptRequestFromUser(id)}
                onReject={(id) => rejectRequestFromUser(id)}
                onCancel={(id) => cancelRequestToUser(id)}
                onUnfriend={(id) => unfriend(id)}
                onMessage={(id) => navigate(`/chat/${id}`)}
              />
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
