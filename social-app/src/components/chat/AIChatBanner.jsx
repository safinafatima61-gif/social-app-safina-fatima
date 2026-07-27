export default function AIChatBanner({ personality, onDisable }) {
  return (
    <button
      type="button"
      onClick={onDisable}
      className="w-full border-b border-brand-100 bg-brand-50 px-4 py-2 text-left text-sm text-brand-800 dark:border-brand-900 dark:bg-brand-950 dark:text-brand-200"
    >
      ✨ AI is responding on your behalf
      {personality ? ` (${personality})` : ''} — tap to disable
    </button>
  );
}
