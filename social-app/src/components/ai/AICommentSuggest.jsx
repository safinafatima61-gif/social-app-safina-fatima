import Button from '../ui/Button';
import { useAI } from '../../hooks/useAI';
import { useAuth } from '../../hooks/useAuth';

/** Suggest Comment — Post Detail (logged-in users only) */
export default function AICommentSuggest({ postDescription, onSuggest }) {
  const { currentUser, isAuthenticated } = useAuth();
  const { loading, error, suggestComment, isConfigured } = useAI(currentUser?.id);

  if (!isAuthenticated) return null;

  async function handleClick() {
    const result = await suggestComment(postDescription);
    if (result) onSuggest?.(result);
  }

  return (
    <div className="mb-3 rounded-xl border-2 border-blue-300 bg-blue-50 p-3 dark:border-blue-700 dark:bg-blue-950/40">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleClick}
          isLoading={loading}
          disabled={!isConfigured || loading}
          className="border-blue-400 text-blue-800 dark:border-blue-600 dark:text-blue-200"
        >
          ✨ Suggest Comment
        </Button>
        <span className="text-xs text-blue-700 dark:text-blue-300">
          AI fills the comment box — you still click Post.
        </span>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {!isConfigured && (
        <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">
          Set VITE_OPENAI_API_KEY in social-app/.env and restart npm run dev.
        </p>
      )}
    </div>
  );
}
