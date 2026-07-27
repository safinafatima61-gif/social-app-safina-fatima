import { useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePosts } from '../../hooks/usePosts';
import { readFileAsBase64 } from '../../utils/helpers';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { PhotoIcon, CloseIcon } from '../icons/Icons';

export default function CreatePostComposer() {
  const { currentUser } = useAuth();
  const { createPost } = usePosts();
  const fileRef = useRef(null);
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await readFileAsBase64(file);
    setImage(base64);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const description = text.trim();
    if (description.length < 10) {
      setError('Write at least 10 characters.');
      return;
    }
    setError('');
    setLoading(true);
    createPost({
      authorId: currentUser.id,
      description,
      image,
      isPublic: true,
      isDraft: false,
    });
    setText('');
    setImage(null);
    if (fileRef.current) fileRef.current.value = '';
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="card overflow-hidden">
      <div className="flex gap-3 p-4">
        <Avatar src={currentUser.avatar} name={currentUser.name} size="md" />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="What's on your mind?"
          className="w-full resize-none border-0 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
        />
      </div>

      {image && (
        <div className="relative px-4 pb-3">
          <img src={image} alt="Preview" className="max-h-80 w-full rounded-xl object-cover" />
          <button
            type="button"
            onClick={() => setImage(null)}
            className="absolute right-6 top-2 grid h-8 w-8 place-items-center rounded-full bg-slate-900/80 text-white"
            aria-label="Remove image"
          >
            <CloseIcon />
          </button>
        </div>
      )}

      {error && <p className="px-4 pb-2 text-xs text-red-500">{error}</p>}

      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 dark:border-slate-800">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <PhotoIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
          Photo
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImage}
        />
        <Button type="submit" size="sm" isLoading={loading} disabled={!text.trim()}>
          Post
        </Button>
      </div>
    </form>
  );
}
