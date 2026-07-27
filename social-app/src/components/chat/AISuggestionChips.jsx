export default function AISuggestionChips({ suggestions = [], onSelect }) {
  if (!suggestions.length) return null;

  return (
    <div className="mb-3 flex flex-wrap gap-2 pl-10">
      {suggestions.map((text) => (
        <button
          key={text}
          type="button"
          onClick={() => onSelect?.(text)}
          className="cursor-pointer rounded-full border border-blue-200 bg-white px-3 py-1 text-sm text-blue-700 hover:bg-blue-50 dark:border-brand-800 dark:bg-slate-900 dark:text-brand-300 dark:hover:bg-brand-950"
        >
          {text}
        </button>
      ))}
    </div>
  );
}
