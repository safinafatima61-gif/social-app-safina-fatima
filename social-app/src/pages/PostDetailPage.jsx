import { useParams, useNavigate, Link } from 'react-router-dom';
import { storage } from '../services/storage';
import { formatFullDate } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';
import { usePosts } from '../hooks/usePosts';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import CommentSection from '../components/post/CommentSection';
import PostActions from '../components/post/PostActions';

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, isAuthenticated } = useAuth();
  const {
    posts,
    getLikesForPost,
    getCommentsForPost,
    isLikedByUser,
    toggleLike,
    deletePost,
    sharePost,
    toggleSavePost,
    isPostSaved,
  } = usePosts();

  const post = posts.find((p) => p.id === postId);

  if (!post) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-slate-400 dark:text-slate-500">
        Post not found.
      </div>
    );
  }

  const author = storage.getUsers().find((u) => u.id === post.authorId);
  const likeCount = getLikesForPost(post.id).length;
  const commentCount = getCommentsForPost(post.id).length;
  const liked = isAuthenticated && isLikedByUser(post.id, currentUser.id);
  const saved = isAuthenticated && isPostSaved(post.id, currentUser.id);
  const isOwner = isAuthenticated && currentUser.id === post.authorId;

  function requireAuth(fn) {
    if (!isAuthenticated) {
      navigate('/login', { state: { message: 'Please login to interact' } });
      return;
    }
    fn();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="card p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${post.authorId}`}>
              <Avatar src={author?.avatar} name={author?.name || '?'} size="md" />
            </Link>
            <div>
              <Link to={`/profile/${post.authorId}`} className="font-semibold hover:underline">
                {author?.name || 'Unknown user'}
              </Link>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {formatFullDate(post.createdAt)}
              </p>
            </div>
          </div>

          {isOwner && (
            <div className="flex gap-2">
              <Link to={`/dashboard/edit/${post.id}`}>
                <Button size="sm" variant="outline">
                  Edit
                </Button>
              </Link>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  deletePost(post.id, currentUser.id);
                  toast('Post deleted', 'success');
                  navigate('/');
                }}
              >
                Delete
              </Button>
            </div>
          )}
        </div>

        <p className="mt-4 whitespace-pre-wrap text-slate-800 dark:text-slate-100">{post.description}</p>

        {post.image && (
          <img
            src={post.image}
            alt="Post attachment"
            className="mt-4 w-full rounded-xl object-cover"
          />
        )}

        <PostActions
          liked={liked}
          likeCount={likeCount}
          commentCount={commentCount}
          shareCount={post.shareCount || 0}
          saved={saved}
          onLike={() => requireAuth(() => toggleLike(post.id, currentUser.id))}
          onComment={() => {}}
          onShare={() =>
            requireAuth(() => {
              sharePost(post.id, currentUser.id);
              toast('Link copied — post shared', 'success');
            })
          }
          onSave={() =>
            requireAuth(() => {
              const nowSaved = toggleSavePost(post.id, currentUser.id);
              toast(nowSaved ? 'Post saved' : 'Removed from saved', 'success');
            })
          }
        />

        <CommentSection postId={post.id} postDescription={post.description} />
      </div>
    </div>
  );
}
