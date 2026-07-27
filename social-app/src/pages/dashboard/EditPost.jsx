import { useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePosts } from '../../hooks/usePosts';
import PostForm from '../../components/post/PostForm';

export default function EditPost() {
  const { postId } = useParams();
  const { currentUser } = useAuth();
  const { posts, updatePost } = usePosts();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(null);

  const post = posts.find((p) => p.id === postId);

  if (!post || post.authorId !== currentUser.id) {
    return <Navigate to="/dashboard/posts" replace />;
  }

  function handleSubmit({ description, isPublic, isDraft, image }) {
    setSubmitting(isDraft ? 'draft' : 'publish');
    updatePost(post.id, { description, isPublic, isDraft, image }, currentUser.id);
    setSubmitting(null);
    navigate('/dashboard/posts');
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-5 text-xl font-bold text-slate-900 dark:text-slate-50">Edit Post</h1>
      <div className="card p-6">
        <PostForm defaultValues={post} onSubmit={handleSubmit} submitting={submitting} />
      </div>
    </div>
  );
}
