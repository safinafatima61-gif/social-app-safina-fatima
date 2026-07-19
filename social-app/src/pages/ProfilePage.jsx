import { useParams } from 'react-router-dom';
import { storage } from '../utils/storage';
import { useAuth } from '../hooks/useAuth';
import { usePosts } from '../hooks/usePosts';
import ProfileHeader from '../components/profile/ProfileHeader';
import PostCard from '../components/post/PostCard';

export default function ProfilePage() {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const { posts } = usePosts();

  const user = storage.getUsers().find((u) => u.id === userId);

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-gray-400">
        User not found.
      </div>
    );
  }

  const isOwner = currentUser?.id === user.id;
  const publicPosts = posts
    .filter((p) => p.authorId === user.id && p.isPublic && !p.isDraft)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <ProfileHeader user={user} isOwner={isOwner} />

      <h2 className="mb-4 mt-8 text-lg font-semibold">Posts</h2>
      {publicPosts.length === 0 ? (
        <div className="card p-10 text-center text-gray-400">No public posts yet</div>
      ) : (
        <div className="space-y-5">
          {publicPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
