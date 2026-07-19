import { useNavigate, Link } from 'react-router-dom';
import { storage } from '../../utils/storage';
import { formatDate } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import { usePosts } from '../../hooks/usePosts';
import Avatar from '../ui/Avatar';
import PostActions from './PostActions';

export default function PostCard({ post }) {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { getCommentsForPost, getLikesForPost, isLikedByUser, toggleLike } = usePosts();

  const author = storage.getUsers().find((u) => u.id === post.authorId);
  const commentCount = getCommentsForPost(post.id).length;
  const likeCount = getLikesForPost(post.id).length;
  const liked = isAuthenticated && isLikedByUser(post.id, currentUser.id);

  function goToPost() {
    navigate(`/posts/${post.id}`);
  }

  function goToProfile(e) {
    e.stopPropagation();
    navigate(`/profile/${post.authorId}`);
  }

  function handleLikeClick(e) {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login', { state: { message: 'Please login to interact' } });
      return;
    }
    toggleLike(post.id, currentUser.id);
  }

  function handleCommentClick(e) {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login', { state: { message: 'Please login to interact' } });
      return;
    }
    navigate(`/posts/${post.id}`);
  }

  return (
    <article
      onClick={goToPost}
      className="card cursor-pointer p-5 transition hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <button onClick={goToProfile} className="flex-shrink-0">
          <Avatar src={author?.avatar} name={author?.name || 'Unknown'} size="md" />
        </button>
        <div>
          <button
            onClick={goToProfile}
            className="block font-semibold text-gray-900 hover:underline dark:text-gray-100"
          >
            {author?.name || 'Unknown user'}
          </button>
          <p className="text-xs text-gray-400">{formatDate(post.createdAt)}</p>
        </div>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-gray-800 dark:text-gray-200">
        {post.description}
      </p>

      {post.image && (
        <img
          src={post.image}
          alt="Post attachment"
          className="mt-3 max-h-96 w-full rounded-xl object-cover"
        />
      )}

      <PostActions
        liked={liked}
        likeCount={likeCount}
        commentCount={commentCount}
        onLike={handleLikeClick}
        onComment={handleCommentClick}
      />
    </article>
  );
}
