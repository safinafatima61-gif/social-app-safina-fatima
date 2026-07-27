import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFriends } from '../hooks/useFriends';
import { useToast } from '../context/ToastContext';
import FriendRequestCard from '../components/friends/FriendRequestCard';
import RequireAuth from '../components/RequireAuth';
import Button from '../components/ui/Button';

function PeoplePageContent() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    suggestions,
    received,
    sendRequest,
    acceptRequestFromUser,
    rejectRequestFromUser,
    cancelRequestToUser,
    unfriend,
  } = useFriends(currentUser.id);

  function handleAccept(userId) {
    const result = acceptRequestFromUser(userId);
    if (result?.ok) {
      toast('Accepted — opening Friends', 'success');
      navigate('/friends');
    } else {
      toast('No pending request from this user.', 'error');
    }
  }

  function handleReject(userId) {
    const result = rejectRequestFromUser(userId);
    if (result?.ok) toast('Request rejected');
    else toast('No pending request from this user.', 'error');
  }

  function handleCancel(userId) {
    const result = cancelRequestToUser(userId);
    if (result?.ok) toast('Request cancelled');
    else toast('No pending request to cancel.', 'error');
  }

  function handleAdd(userId) {
    const result = sendRequest(userId);
    if (result?.acceptedExisting) {
      toast('They already requested you — now friends!', 'success');
    } else if (result?.ok) {
      toast('Friend request sent — open Requests in other tab to Accept', 'success');
    } else if (result?.reason === 'already_friends') {
      toast('Already friends');
    } else if (result?.reason === 'already_sent') {
      toast('Request already sent');
    } else {
      toast('Could not send request.', 'error');
    }
  }

  function handleUnfriend(userId) {
    const result = unfriend(userId);
    if (result?.ok) toast('Removed from friends');
  }

  const incoming = suggestions.filter((s) => s.relationship === 'incoming');
  const others = suggestions.filter((s) => s.relationship !== 'incoming');

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6">
        <h1 className="page-title">People You May Know</h1>
        <p className="page-subtitle mt-1">
          Send a request → other user Accepts on{' '}
          <Link to="/requests" className="font-medium text-brand-600 hover:underline">
            Requests
          </Link>{' '}
          → then chat from{' '}
          <Link to="/friends" className="font-medium text-brand-600 hover:underline">
            Friends
          </Link>
          .
        </p>
      </div>

      <div className="card mb-5 border-brand-100 bg-brand-50/60 p-4 text-sm text-brand-900 dark:border-brand-900 dark:bg-brand-950/40 dark:text-brand-100">
        <p className="font-semibold">How to test with 2 users (2 tabs)</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-brand-800 dark:text-brand-200">
          <li>
            This tab: stay logged in as <strong>{currentUser.name}</strong>
          </li>
          <li>
            Open a <strong>new tab</strong> → Login as{' '}
            <code className="rounded bg-white/70 px-1 dark:bg-slate-900">alex@demo.com</code> /{' '}
            <code className="rounded bg-white/70 px-1 dark:bg-slate-900">demo123</code>
          </li>
          <li>
            Here: click <strong>Add Friend</strong> on Alex
          </li>
          <li>
            Other tab: open <strong>Requests</strong> → Accept
          </li>
          <li>
            Both tabs: open <strong>Friends</strong> → Message → Chat
          </li>
        </ol>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => navigate('/requests')}>
            Open Requests ({received.length})
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate('/friends')}>
            Open Friends
          </Button>
        </div>
      </div>

      {incoming.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
            Friend requests for you ({incoming.length})
          </h2>
          <div className="space-y-3">
            {incoming.map(({ user, relationship, mutualCount, hasPosts }) => (
              <FriendRequestCard
                key={user.id}
                user={user}
                relationship={relationship}
                mutualCount={mutualCount}
                hasPosts={hasPosts}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
          All people ({suggestions.length})
        </h2>
        {suggestions.length === 0 ? (
          <div className="card p-10 text-center text-slate-400 dark:text-slate-500">
            No other users yet. Sign up a second account in another tab, or use demo accounts.
          </div>
        ) : (
          <div className="space-y-3">
            {others.map(({ user, relationship, mutualCount, hasPosts }) => (
              <FriendRequestCard
                key={user.id}
                user={user}
                relationship={relationship}
                mutualCount={mutualCount}
                hasPosts={hasPosts}
                onAdd={handleAdd}
                onAccept={handleAccept}
                onReject={handleReject}
                onCancel={handleCancel}
                onUnfriend={handleUnfriend}
                onMessage={(id) => navigate(`/chat/${id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function PeoplePage() {
  return (
    <RequireAuth>
      <PeoplePageContent />
    </RequireAuth>
  );
}
