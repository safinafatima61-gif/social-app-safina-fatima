import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storage } from '../../services/storage';
import { formatDate } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import { usePosts } from '../../hooks/usePosts';
import { useToast } from '../../context/ToastContext';
import Avatar from '../ui/Avatar';
import PostActions from './PostActions';

export default function PostCard({ post }) {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const {
    getCommentsForPost,
    getLikesForPost,
    isLikedByUser,
    toggleLike,
    deletePost,
    sharePost,
    toggleSavePost,
    isPostSaved,
  } = usePosts();

  const [menuOpen, setMenuOpen] = useState(false);
  const author = storage.getUsers().find((u) => u.id === post.authorId);
  const commentCount = getCommentsForPost(post.id).length;
  const likeCount = getLikesForPost(post.id).length;
  const liked = isAuthenticated && isLikedByUser(post.id, currentUser.id);
  const saved = isAuthenticated && isPostSaved(post.id, currentUser.id);
  const isOwner = isAuthenticated && currentUser.id === post.authorId;

  function requireAuth(action) {
    if (!isAuthenticated) {
      navigate('/login', { state: { message: 'Please login to interact' } });
      return false;
    }
    action();
    return true;
  }

  function goToPost() {
    navigate(`/posts/${post.id}`);
  }

  function goToProfile(e) {
    e.stopPropagation();
    navigate(`/profile/${post.authorId}`);
  }

  return (
    <article className="card group relative overflow-hidden p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:hover:border-slate-700 dark:hover:shadow-none">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <button type="button" onClick={goToProfile} className="flex-shrink-0">
            <Avatar src={author?.avatar} name={author?.name || 'Unknown'} size="md" />
          </button>
          <div>
            <button
              type="button"
              onClick={goToProfile}
              className="block font-semibold text-slate-900 hover:underline dark:text-slate-50"
            >
              {author?.name || 'Unknown user'}
            </button>
            <p className="text-xs text-slate-400">{formatDate(post.createdAt)}</p>
          </div>
        </div>

        {isOwner && (
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              aria-label="Post menu"
            >
              •••
            </button>
            {menuOpen && (
              <div className="absolute right-0 z-20 mt-1 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                <Link
                  to={`/dashboard/edit/${post.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Edit post
                </Link>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePost(post.id, currentUser.id);
                    setMenuOpen(false);
                    toast('Post deleted', 'success');
                  }}
                  className="block w-full px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  Delete post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <button type="button" onClick={goToPost} className="mt-3 block w-full text-left">
        <p className="whitespace-pre-wrap text-slate-800 dark:text-slate-200">{post.description}</p>
        {post.image && (
          <img
            src={post.image}
            alt="Post attachment"
            className="mt-3 max-h-96 w-full rounded-xl object-cover"
          />
        )}
      </button>

      <PostActions
        liked={liked}
        likeCount={likeCount}
        commentCount={commentCount}
        shareCount={post.shareCount || 0}
        saved={saved}
        onLike={(e) => {
          e.stopPropagation();
          requireAuth(() => toggleLike(post.id, currentUser.id));
        }}
        onComment={(e) => {
          e.stopPropagation();
          requireAuth(() => navigate(`/posts/${post.id}`));
        }}
        onShare={(e) => {
          e.stopPropagation();
          requireAuth(() => {
            sharePost(post.id, currentUser.id);
            toast('Link copied — post shared', 'success');
          });
        }}
        onSave={(e) => {
          e.stopPropagation();
          requireAuth(() => {
            const nowSaved = toggleSavePost(post.id, currentUser.id);
            toast(nowSaved ? 'Post saved' : 'Removed from saved', 'success');
          });
        }}
      />
    </article>
  );
}
