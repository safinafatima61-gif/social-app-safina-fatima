import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../services/storage';
import { formatDate } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import { usePosts } from '../../hooks/usePosts';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import AICommentSuggest from '../ai/AICommentSuggest';

export default function CommentSection({ postId, postDescription = '' }) {
  const { currentUser, isAuthenticated } = useAuth();
  const { getCommentsForPost, addComment, updateComment, deleteComment } = usePosts();
  const navigate = useNavigate();

  const [text, setText] = useState('');
  const [confirmingId, setConfirmingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const comments = getCommentsForPost(postId);
  const users = storage.getUsers();

  function handleAdd(e) {
    e.preventDefault();
    if (!text.trim()) return;
    addComment(postId, currentUser.id, text.trim());
    setText('');
  }

  function startEdit(comment) {
    setEditingId(comment.id);
    setEditText(comment.text);
    setConfirmingId(null);
  }

  function saveEdit(commentId) {
    if (!editText.trim()) return;
    updateComment(commentId, editText.trim(), currentUser.id);
    setEditingId(null);
    setEditText('');
  }

  return (
    <div className="mt-6">
      <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-100">
        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
      </h3>

      {isAuthenticated ? (
        <div className="mb-5">
          <AICommentSuggest
            postDescription={postDescription}
            onSuggest={(suggestion) => setText(suggestion)}
          />
          <form onSubmit={handleAdd} className="flex gap-3">
            <Avatar src={currentUser.avatar} name={currentUser.name} size="sm" />
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a comment..."
              className="input-base"
            />
            <Button type="submit" size="sm">
              Post
            </Button>
          </form>
        </div>
      ) : (
        <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-brand-600 hover:underline dark:text-brand-400"
          >
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
              <div className="flex-1 rounded-2xl bg-slate-100 px-4 py-2 dark:bg-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {author?.name || 'Unknown'}
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(c.createdAt)}</span>
                </div>

                {editingId === c.id ? (
                  <div className="mt-2 space-y-2">
                    <textarea
                      rows={2}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="input-base resize-none"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEdit(c.id)}>
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-700 dark:text-slate-300">{c.text}</p>
                )}

                {isOwn && editingId !== c.id && (
                  <div className="mt-1 flex gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      className="text-slate-400 hover:text-brand-600"
                    >
                      Edit
                    </button>
                    {confirmingId === c.id ? (
                      <span className="text-slate-600 dark:text-slate-300">
                        Delete?{' '}
                        <button
                          type="button"
                          onClick={() => deleteComment(c.id, currentUser.id)}
                          className="font-semibold text-red-600 hover:underline"
                        >
                          Yes
                        </button>{' '}
                        <button
                          type="button"
                          onClick={() => setConfirmingId(null)}
                          className="font-semibold text-slate-500 hover:underline"
                        >
                          No
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmingId(c.id)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
