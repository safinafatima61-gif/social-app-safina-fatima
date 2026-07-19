import { useParams, useNavigate, Link } from 'react-router-dom';
import { storage } from '../utils/storage';
import { formatFullDate } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';
import { usePosts } from '../hooks/usePosts';
import Avatar from '../components/ui/Avatar';
import CommentSection from '../components/post/CommentSection';

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { posts, getLikesForPost, isLikedByUser, toggleLike } = usePosts();

  const post = posts.find((p) => p.id === postId);

  if (!post) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-gray-400">
        Post not found.
      </div>
    );
  }

  const author = storage.getUsers().find((u) => u.id === post.authorId);
  const likeCount = getLikesForPost(post.id).length;
  const liked = isAuthenticated && isLikedByUser(post.id, currentUser.id);

  function handleLike() {
    if (!isAuthenticated) {
      navigate('/login', { state: { message: 'Please login to interact' } });
      return;
    }
    toggleLike(post.id, currentUser.id);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="card p-6">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.authorId}`}>
            <Avatar src={author?.avatar} name={author?.name || '?'} size="md" />
          </Link>
          <div>
            <Link
              to={`/profile/${post.authorId}`}
              className="font-semibold hover:underline"
            >
              {author?.name || 'Unknown user'}
            </Link>
            <p className="text-xs text-gray-400">{formatFullDate(post.createdAt)}</p>
          </div>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-gray-800 dark:text-gray-200">
          {post.description}
        </p>

        {post.image && (
          <img
            src={post.image}
            alt="Post attachment"
            className="mt-4 w-full rounded-xl object-cover"
          />
        )}

        <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-sm font-medium ${
              liked ? 'text-rose-600' : 'text-gray-500 hover:text-rose-500'
            }`}
          >
            <span>{liked ? '❤️' : '🤍'}</span>
            <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
          </button>
        </div>

        <CommentSection postId={post.id} />
      </div>
    </div>
  );
}
