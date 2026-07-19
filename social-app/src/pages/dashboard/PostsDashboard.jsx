import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePosts } from '../../hooks/usePosts';
import { formatDate } from '../../utils/helpers';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

function statusOf(post) {
  if (post.isDraft) return 'draft';
  return post.isPublic ? 'public' : 'private';
}

export default function PostsDashboard() {
  const { currentUser } = useAuth();
  const { posts, updatePost, deletePost, getCommentsForPost, getLikesForPost } = usePosts();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const myPosts = posts
    .filter((p) => p.authorId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  function togglePublic(post) {
    updatePost(post.id, { isPublic: !post.isPublic });
  }

  function publish(post) {
    updatePost(post.id, { isDraft: false, isPublic: true });
  }

  function confirmDelete() {
    if (deleteTarget) {
      deletePost(deleteTarget);
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold">My Posts</h1>
        <Link to="/dashboard/create">
          <Button size="sm">New Post</Button>
        </Link>
      </div>

      {myPosts.length === 0 ? (
        <div className="card p-10 text-center text-gray-400">
          You haven't created any posts yet. Create your first post!
        </div>
      ) : (
        <div className="space-y-3">
          {myPosts.map((post) => {
            const status = statusOf(post);
            return (
              <div key={post.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant={status}>{status[0].toUpperCase() + status.slice(1)}</Badge>
                    <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
                  </div>
                  <p className="truncate text-sm text-gray-700 dark:text-gray-300">
                    {post.description}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    ❤️ {getLikesForPost(post.id).length} · 💬 {getCommentsForPost(post.id).length}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {post.isDraft && (
                    <Button size="sm" variant="primary" onClick={() => publish(post)}>
                      Publish
                    </Button>
                  )}
                  {!post.isDraft && (
                    <Button size="sm" variant="secondary" onClick={() => togglePublic(post)}>
                      {post.isPublic ? 'Make Private' : 'Make Public'}
                    </Button>
                  )}
                  <Link to={`/dashboard/edit/${post.id}`}>
                    <Button size="sm" variant="ghost">Edit</Button>
                  </Link>
                  <Button size="sm" variant="danger" onClick={() => setDeleteTarget(post.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete this post?"
      >
        <p className="mb-5 text-sm text-gray-500">
          This action cannot be undone. The post, its comments, and likes will be permanently removed.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
