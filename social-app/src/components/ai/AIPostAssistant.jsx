import { useState } from 'react';
import Button from '../ui/Button';
import { useAI } from '../../hooks/useAI';
import { useAuth } from '../../hooks/useAuth';

/** Collapsible AI Writing Assistant — Create / Edit / Feed composer */
export default function AIPostAssistant({ onUseContent }) {
  const { currentUser } = useAuth();
  const { loading, error, generatePostContent, isConfigured } = useAI(currentUser?.id);
  const [open, setOpen] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [suggestion, setSuggestion] = useState('');

  async function handleGenerate() {
    if (!prompt.trim()) return;
    const result = await generatePostContent(prompt.trim());
    if (result) setSuggestion(result);
  }

  return (
    <div className="mb-3 rounded-xl border-2 border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-bold text-blue-800 dark:text-blue-200"
      >
        <span>✨ AI Writing Assistant</span>
        <span className="text-xs font-semibold uppercase tracking-wide opacity-80">
          {open ? 'Hide' : 'Show'}
        </span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-blue-200 px-4 py-3 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Type a short idea, generate a post, then click Use This Content.
          </p>
          {!isConfigured && (
            <p className="rounded-lg bg-amber-100 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">
              Add <code className="font-mono">VITE_OPENAI_API_KEY</code> in{' '}
              <code className="font-mono">social-app/.env</code>, then restart{' '}
              <code className="font-mono">npm run dev</code>.
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
          {error && <p className="text-xs text-red-600">{error}</p>}
          {suggestion && (
            <div className="rounded-xl border border-blue-200 bg-white p-3 dark:border-blue-800 dark:bg-slate-900">
              <p className="text-sm text-slate-800 dark:text-slate-100">{suggestion}</p>
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
