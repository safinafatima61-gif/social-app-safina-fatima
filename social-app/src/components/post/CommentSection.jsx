import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../utils/storage';
import { formatDate } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import { usePosts } from '../../hooks/usePosts';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

export default function CommentSection({ postId }) {
  const { currentUser, isAuthenticated } = useAuth();
  const { getCommentsForPost, addComment, deleteComment } = usePosts();
  const navigate = useNavigate();

  const [text, setText] = useState('');
  const [confirmingId, setConfirmingId] = useState(null);

  const comments = getCommentsForPost(postId);
  const users = storage.getUsers();

  function handleAdd(e) {
    e.preventDefault();
    if (!text.trim()) return;
    addComment(postId, currentUser.id, text.trim());
    setText('');
  }

  return (
    <div className="mt-6">
      <h3 className="mb-3 font-semibold text-gray-800 dark:text-gray-200">
        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
      </h3>

      {isAuthenticated ? (
        <form onSubmit={handleAdd} className="mb-5 flex gap-3">
          <Avatar src={currentUser.avatar} name={currentUser.name} size="sm" />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            className="input-base"
          />
          <Button type="submit" size="sm">Post</Button>
        </form>
      ) : (
        <p className="mb-5 text-sm text-gray-500">
          <button onClick={() => navigate('/login')} className="text-brand-600 hover:underline">
            Login to comment
          </button>
        </p>
      )}

      <ul className="space-y-4">
        {comments.map((c) => {
          const author = users.find((u) => u.id === c.authorId);
          const isOwn = isAuthenticated && currentUser.id === c.authorId;
          return (
            <li key={c.id} className="flex gap-3">
              <Avatar src={author?.avatar} name={author?.name || '?'} size="sm" />
              <div className="flex-1 rounded-2xl bg-gray-100 px-4 py-2 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{author?.name || 'Unknown'}</span>
                  <span className="text-xs text-gray-400">{formatDate(c.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{c.text}</p>

                {isOwn && (
                  confirmingId === c.id ? (
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <span>Are you sure?</span>
                      <button
                        onClick={() => deleteComment(c.id)}
                        className="font-semibold text-red-600 hover:underline"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmingId(null)}
                        className="font-semibold text-gray-500 hover:underline"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmingId(c.id)}
                      className="mt-1 text-xs text-gray-400 hover:text-red-500"
                    >
                      Delete
                    </button>
                  )
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
