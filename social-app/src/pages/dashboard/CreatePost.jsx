import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePosts } from '../../hooks/usePosts';
import PostForm from '../../components/post/PostForm';

export default function CreatePost() {
  const { currentUser } = useAuth();
  const { createPost } = usePosts();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const [formKey, setFormKey] = useState(0);

  function handleSubmit({ description, isPublic, isDraft, image }) {
    setSubmitting(isDraft ? 'draft' : 'publish');
    createPost({ authorId: currentUser.id, description, image, isPublic, isDraft });
    setSubmitting(null);

    if (isDraft) {
      setDraftSaved(true);
      setFormKey((k) => k + 1);
      setTimeout(() => setDraftSaved(false), 3000);
    } else {
      navigate('/');
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-5 text-xl font-bold text-slate-900 dark:text-slate-50">Create Post</h1>
      {draftSaved && (
        <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
          Post saved as draft
        </p>
      )}
      <div className="card p-6">
        <PostForm key={formKey} onSubmit={handleSubmit} submitting={submitting} />
      </div>
    </div>
  );
}
