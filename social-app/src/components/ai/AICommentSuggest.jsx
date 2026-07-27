import Button from '../ui/Button';
import { useAI } from '../../hooks/useAI';
import { useAuth } from '../../hooks/useAuth';

export default function AICommentSuggest({ postDescription, onSuggest }) {
  const { currentUser, isAuthenticated } = useAuth();
  const { loading, error, suggestComment, isConfigured } = useAI(currentUser?.id);

  if (!isAuthenticated) return null;

  async function handleClick() {
    const result = await suggestComment(postDescription);
    if (result) onSuggest?.(result);
  }

  return (
    <div className="mb-2">
      <Button
        size="sm"
        variant="outline"
        onClick={handleClick}
        isLoading={loading}
        disabled={!isConfigured || loading}
      >
        ✨ Suggest Comment
      </Button>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {!isConfigured && (
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Set VITE_OPENAI_API_KEY in .env to enable AI suggestions.
        </p>
      )}
    </div>
  );
}
