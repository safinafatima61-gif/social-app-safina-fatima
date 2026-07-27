import { useState } from 'react';
import Button from '../ui/Button';
import { useAI } from '../../hooks/useAI';
import { useAuth } from '../../hooks/useAuth';

/** Optimise bio with AI — Profile Settings */
export default function AIProfileOptimize({ name, bio, location, onUse }) {
  const { currentUser } = useAuth();
  const { loading, error, optimiseBio, isConfigured } = useAI(currentUser?.id);
  const [suggestion, setSuggestion] = useState('');

  async function handleOptimise() {
    const result = await optimiseBio({ name, bio, location });
    if (result) setSuggestion(result);
  }

  return (
    <div className="rounded-xl border-2 border-blue-300 bg-blue-50 p-3 dark:border-blue-700 dark:bg-blue-950/40">
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handleOptimise}
        isLoading={loading}
        disabled={!isConfigured || loading}
        className="border-blue-400 text-blue-800 dark:border-blue-600 dark:text-blue-200"
      >
        ✨ Optimise with AI
      </Button>
      {!isConfigured && (
        <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">
          Set VITE_OPENAI_API_KEY in social-app/.env and restart npm run dev.
        </p>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {suggestion && (
        <div className="mt-3 rounded-xl border border-blue-200 bg-white p-3 dark:border-blue-800 dark:bg-slate-900">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Suggested bio:</p>
          <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">{suggestion}</p>
          <Button size="sm" className="mt-2" onClick={() => onUse?.(suggestion)}>
            Use Suggestion
          </Button>
        </div>
      )}
    </div>
  );
}
