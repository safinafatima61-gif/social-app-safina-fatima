import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFriends } from '../hooks/useFriends';
import { useToast } from '../context/ToastContext';
import { storage } from '../services/storage';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import RequireAuth from '../components/RequireAuth';
import clsx from 'clsx';

function FriendRequestsContent() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { received, sent, acceptRequest, rejectRequest, cancelRequest } = useFriends(
    currentUser.id
  );
  const [tab, setTab] = useState('received');
  const users = storage.getUsers();

  function onAccept(reqId) {
    acceptRequest(reqId);
    toast('Friend added! Open Friends to message them.', 'success');
  }

  function onReject(reqId) {
    rejectRequest(reqId);
    toast('Request rejected');
  }

  function onCancel(reqId) {
    cancelRequest(reqId);
    toast('Request cancelled');
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Friend Requests</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Accept to add friends — then Message from Friends or Chat.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => navigate('/friends')}>
          Go to Friends
        </Button>
      </div>

      <div className="mb-5 flex gap-2">
        {[
          { key: 'received', label: `Received (${received.length})` },
          { key: 'sent', label: `Sent (${sent.length})` },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={clsx(
              'rounded-full px-4 py-2 text-sm font-medium',
              tab === item.key
                ? 'bg-brand-600 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'received' && (
        <div className="space-y-3">
          {received.length === 0 ? (
            <div className="card space-y-3 p-10 text-center text-slate-400 dark:text-slate-500">
              <p>No received requests yet.</p>
              <p className="text-sm">
                Ask another user (other tab) to click <strong>Add Friend</strong> on your profile
                from{' '}
                <Link to="/people" className="text-brand-600 hover:underline">
                  People
                </Link>
                .
              </p>
            </div>
          ) : (
            received.map((req) => {
              const sender = users.find((u) => u.id === req.fromUserId);
              if (!sender) return null;
              return (
                <div
                  key={req.id}
                  className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <Link to={`/profile/${sender.id}`} className="flex items-center gap-3">
                    <Avatar src={sender.avatar} name={sender.name} size="md" />
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-slate-50">
                        {sender.name}
                      </span>
                      <p className="text-xs text-slate-400">wants to be friends</p>
                    </div>
                  </Link>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => onAccept(req.id)}>
                      Accept
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => onReject(req.id)}>
                      Reject
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === 'sent' && (
        <div className="space-y-3">
          {sent.length === 0 ? (
            <div className="card p-10 text-center text-slate-400 dark:text-slate-500">
              No sent requests.{' '}
              <Link to="/people" className="text-brand-600 hover:underline">
                Find people
              </Link>
            </div>
          ) : (
            sent.map((req) => {
              const receiver = users.find((u) => u.id === req.toUserId);
              if (!receiver) return null;
              return (
                <div
                  key={req.id}
                  className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <Link to={`/profile/${receiver.id}`} className="flex items-center gap-3">
                    <Avatar src={receiver.avatar} name={receiver.name} size="md" />
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-slate-50">
                        {receiver.name}
                      </span>
                      <p className="text-xs text-slate-400">Request pending</p>
                    </div>
                  </Link>
                  <Button size="sm" variant="ghost" onClick={() => onCancel(req.id)}>
                    Cancel Request
                  </Button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default function FriendRequestsPage() {
  return (
    <RequireAuth>
      <FriendRequestsContent />
    </RequireAuth>
  );
}
