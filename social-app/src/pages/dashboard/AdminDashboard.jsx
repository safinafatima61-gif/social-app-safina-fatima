import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAdmin } from '../../context/AdminContext';
import { formatFullDate } from '../../utils/helpers';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';

function formatJoined(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB');
}

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const {
    isAdmin,
    users,
    posts,
    comments,
    pendingRequests,
    friendships,
    stats,
    deleteUser,
    deletePost,
    cancelFriendRequest,
    removeFriendship,
  } = useAdmin();

  if (!isAdmin) {
    return (
      <div className="card p-10 text-center">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">
          Admin access required
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Only the first registered account can open the admin dashboard.
        </p>
        <Link
          to="/"
          className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
        >
          Back to feed
        </Link>
      </div>
    );
  }

  function confirmAction(message, action) {
    if (window.confirm(message)) action();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Admin dashboard</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Full platform control — users, posts, friend requests, and friendships.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Users" value={stats.users} />
        <StatCard label="Posts" value={stats.posts} />
        <StatCard label="Comments" value={stats.comments} />
        <StatCard label="Pending requests" value={stats.pendingRequests} />
        <StatCard label="Friendships" value={stats.friendships} />
        <StatCard label="Messages" value={stats.messages} />
      </div>

      <div className="space-y-4">
        <SectionCard title={`Users (${users.length})`}>
          <ul className="space-y-3">
            {users.map((user) => (
              <li
                key={user.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar src={user.avatar} name={user.name} size="md" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/profile/${user.id}`}
                        className="font-semibold text-slate-900 hover:underline dark:text-slate-50"
                      >
                        {user.name}
                      </Link>
                      {user.role === 'admin' && <Badge variant="admin">Admin</Badge>}
                      {user.id === currentUser.id && (
                        <span className="text-xs text-slate-400 dark:text-slate-500">(you)</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 dark:text-slate-500">{user.email}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      joined {formatJoined(user.joinedAt)}
                    </p>
                  </div>
                </div>
                {user.id !== currentUser.id && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      confirmAction(
                        `Delete user "${user.name}" and all their content?`,
                        () => deleteUser(user.id)
                      )
                    }
                  >
                    Delete user
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title={`All posts (${posts.length})`}>
          {posts.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">No posts yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {posts
                .slice()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((post) => {
                  const author = users.find((u) => u.id === post.authorId);
                  return (
                    <li
                      key={post.id}
                      className="flex flex-col gap-3 py-3 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                          {post.description}
                        </p>
                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                          by {author?.name || 'Unknown'} · {formatFullDate(post.createdAt)}
                          {post.isDraft ? ' · Draft' : post.isPublic ? ' · Public' : ' · Private'}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Link
                          to={`/posts/${post.id}`}
                          className="inline-flex items-center text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
                        >
                          View
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            confirmAction('Delete this post and its comments?', () =>
                              deletePost(post.id, null, { allowAdmin: true })
                            )
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </li>
                  );
                })}
            </ul>
          )}
        </SectionCard>

        <SectionCard title={`Friend requests (${pendingRequests.length} pending)`}>
          {pendingRequests.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">No pending requests.</p>
          ) : (
            <ul className="space-y-3">
              {pendingRequests.map((req) => {
                const from = users.find((u) => u.id === req.fromUserId);
                const to = users.find((u) => u.id === req.toUserId);
                return (
                  <li
                    key={req.id}
                    className="flex flex-col gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="text-sm text-slate-700 dark:text-slate-200">
                      <span className="font-semibold">{from?.name || 'Unknown'}</span>
                      {' → '}
                      <span className="font-semibold">{to?.name || 'Unknown'}</span>
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        sent {formatFullDate(req.sentAt)} · pending
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        confirmAction('Cancel / remove this friend request?', () =>
                          cancelFriendRequest(req.id)
                        )
                      }
                    >
                      Cancel request
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard title={`Friendships (${friendships.length})`}>
          {friendships.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">No friendships yet.</p>
          ) : (
            <ul className="space-y-3">
              {friendships.map((f) => (
                <li
                  key={f.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={f.userA.avatar} name={f.userA.name} size="sm" />
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      {f.userA.name}
                    </span>
                    <span className="text-slate-400">↔</span>
                    <Avatar src={f.userB.avatar} name={f.userB.name} size="sm" />
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      {f.userB.name}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      confirmAction('Remove this friendship?', () => removeFriendship(f.id))
                    }
                  >
                    Remove friendship
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title={`All comments (${comments.length})`}>
          {comments.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">No comments yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {comments
                .slice()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 40)
                .map((comment) => {
                  const author = users.find((u) => u.id === comment.authorId);
                  return (
                    <li key={comment.id} className="py-3">
                      <p className="text-sm text-slate-800 dark:text-slate-100">{comment.text}</p>
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        by {author?.name || 'Unknown'} · {formatFullDate(comment.createdAt)}
                      </p>
                    </li>
                  );
                })}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
