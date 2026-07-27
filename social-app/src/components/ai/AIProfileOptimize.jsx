import { useState } from 'react';
import Button from '../ui/Button';
import { useAI } from '../../hooks/useAI';
import { useAuth } from '../../hooks/useAuth';

export default function AIProfileOptimize({ name, bio, location, onUse }) {
  const { currentUser } = useAuth();
  const { loading, error, optimiseBio, isConfigured } = useAI(currentUser?.id);
  const [suggestion, setSuggestion] = useState('');

  async function handleOptimise() {
    const result = await optimiseBio({ name, bio, location });
    if (result) setSuggestion(result);
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handleOptimise}
        isLoading={loading}
        disabled={!isConfigured || loading}
      >
        ✨ Optimise with AI
      </Button>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {suggestion && (
        <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-3 dark:border-brand-900 dark:bg-brand-950/50">
          <p className="text-xs font-semibold text-brand-700 dark:text-brand-300">Suggested bio:</p>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{suggestion}</p>
          <Button size="sm" className="mt-2" onClick={() => onUse?.(suggestion)}>
            Use Suggestion
          </Button>
        </div>
      )}
    </div>
  );
}
