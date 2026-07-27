import { useParams } from 'react-router-dom';
import { storage } from '../services/storage';
import { useAuth } from '../hooks/useAuth';
import { usePosts } from '../hooks/usePosts';
import ProfileHeader from '../components/profile/ProfileHeader';
import PostCard from '../components/post/PostCard';

export default function ProfilePage() {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const { posts } = usePosts();

  const user = storage.getUsers().find((u) => u.id === userId);
  const displayUser =
    currentUser?.id === userId
      ? { ...user, ...currentUser, email: user?.email || currentUser.email }
      : user;

  if (!displayUser) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-400 dark:text-slate-500">
        User not found.
      </div>
    );
  }

  const isOwner = currentUser?.id === displayUser.id;
  const publicPosts = posts
    .filter((p) => p.authorId === displayUser.id && p.isPublic && !p.isDraft)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <ProfileHeader user={displayUser} isOwner={isOwner} />

      <h2 className="mb-3 mt-6 text-lg font-bold text-slate-900 dark:text-slate-50">Posts</h2>
      {publicPosts.length === 0 ? (
        <div className="card p-12 text-center text-slate-400 dark:text-slate-500">No posts yet.</div>
      ) : (
        <div className="space-y-4">
          {publicPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
