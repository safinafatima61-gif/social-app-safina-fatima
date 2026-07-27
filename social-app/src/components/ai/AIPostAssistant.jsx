import { useState } from 'react';
import Button from '../ui/Button';
import { useAI } from '../../hooks/useAI';
import { useAuth } from '../../hooks/useAuth';

export default function AIPostAssistant({ onUseContent }) {
  const { currentUser } = useAuth();
  const { loading, error, generatePostContent, isConfigured } = useAI(currentUser?.id);
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [suggestion, setSuggestion] = useState('');

  async function handleGenerate() {
    if (!prompt.trim()) return;
    const result = await generatePostContent(prompt.trim());
    if (result) setSuggestion(result);
  }

  return (
    <div className="mb-4 rounded-xl border border-brand-100 bg-brand-50/50 dark:border-brand-900 dark:bg-brand-950/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-brand-700 dark:text-brand-300"
      >
        <span>✨ AI Writing Assistant</span>
        <span>{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-brand-100 px-4 py-3 dark:border-brand-900">
          {!isConfigured && (
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Add <code className="font-mono">VITE_OPENAI_API_KEY</code> to your{' '}
              <code className="font-mono">.env</code> file, then restart the dev server.
            </p>
          )}
          <textarea
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. I just completed a React project"
            className="input-base resize-none"
          />
          <Button
            size="sm"
            onClick={handleGenerate}
            isLoading={loading}
            disabled={!prompt.trim() || !isConfigured}
          >
            Generate Post Content
          </Button>
          {error && <p className="text-xs text-red-500">{error}</p>}
          {suggestion && (
            <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-sm text-slate-700 dark:text-slate-200">{suggestion}</p>
              <Button size="sm" className="mt-3" onClick={() => onUseContent?.(suggestion)}>
                Use This Content
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
