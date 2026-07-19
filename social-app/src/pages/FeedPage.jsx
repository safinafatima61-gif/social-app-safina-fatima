import { useState, useMemo } from 'react';
import { usePosts } from '../hooks/usePosts';
import PostCard from '../components/post/PostCard';

export default function FeedPage() {
  const { posts } = usePosts();
  const [query, setQuery] = useState('');

  const publicPosts = useMemo(
    () =>
      posts
        .filter((p) => p.isPublic && !p.isDraft)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [posts]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return publicPosts;
    const q = query.toLowerCase();
    return publicPosts.filter((p) => p.description.toLowerCase().includes(q));
  }, [publicPosts, query]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold">Feed</h1>
      <p className="mb-5 text-sm text-gray-500">What's everyone sharing today</p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search posts..."
        className="input-base mb-6"
      />

      {filtered.length === 0 ? (
        <div className="card p-10 text-center text-gray-400">
          {query.trim()
            ? `No results found for "${query}"`
            : 'No posts yet — be the first to share!'}
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
