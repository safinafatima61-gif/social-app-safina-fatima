import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePosts } from '../hooks/usePosts';
import CreatePostComposer from '../components/feed/CreatePostComposer';
import PeopleSidebar from '../components/feed/PeopleSidebar';
import PostCard from '../components/post/PostCard';
import Button from '../components/ui/Button';
import { APP_NAME, APP_TAGLINE } from '../constants/app';

export default function FeedPage() {
  const { isAuthenticated } = useAuth();
  const { posts } = usePosts();

  const publicPosts = useMemo(
    () =>
      posts
        .filter((p) => p.isPublic && !p.isDraft)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [posts]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          {isAuthenticated ? (
            <CreatePostComposer />
          ) : (
            <div className="card flex flex-col items-start gap-3 bg-gradient-to-br from-brand-50 to-white p-6 dark:from-brand-950/40 dark:to-slate-900 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                  Welcome to {APP_NAME}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">{APP_TAGLINE}</p>
              </div>
              <Link to="/login">
                <Button size="sm">Log in</Button>
              </Link>
            </div>
          )}

          {publicPosts.length === 0 ? (
            <div className="card p-10 text-center text-slate-400 dark:text-slate-500">
              No posts yet — be the first to share something!
            </div>
          ) : (
            publicPosts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            {isAuthenticated ? (
              <PeopleSidebar />
            ) : (
              <div className="card p-5">
                <h2 className="mb-2 text-base font-bold text-slate-900 dark:text-slate-50">
                  Join {APP_NAME}
                </h2>
                <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                  Create an account to post, connect, and collaborate.
                </p>
                <Link to="/signup">
                  <Button className="w-full" size="sm">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
