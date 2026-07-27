import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFriends } from '../hooks/useFriends';
import { useToast } from '../context/ToastContext';
import FriendCard from '../components/friends/FriendCard';
import RequireAuth from '../components/RequireAuth';
import Button from '../components/ui/Button';

function FriendsContent() {
  const { currentUser } = useAuth();
  const { friends, friendsCount, unfriend } = useFriends(currentUser.id);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const message = location.state?.message;

  function handleUnfriend(id) {
    unfriend(id);
    toast('Removed from friends');
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-slate-900 dark:text-slate-50">Friends</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {friendsCount} friend{friendsCount === 1 ? '' : 's'} — Message to open chat
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => navigate('/people')}>
          Find people
        </Button>
      </div>

      {message && (
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
          {message}
        </p>
      )}

      {friends.length === 0 ? (
        <div className="card space-y-3 p-10 text-center text-slate-400 dark:text-slate-500">
          <p>No friends yet — go to People, send a request, then Accept on Requests.</p>
          <Link
            to="/people"
            className="inline-block font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            Open People You May Know
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {friends.map((friend) => (
            <FriendCard
              key={friend.id}
              user={friend}
              onMessage={(id) => navigate(`/chat/${id}`)}
              onUnfriend={handleUnfriend}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FriendsPage() {
  return (
    <RequireAuth>
      <FriendsContent />
    </RequireAuth>
  );
}
