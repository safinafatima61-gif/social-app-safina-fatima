export default function RequestBadge({ count }) {
  if (!count || count < 1) return null;
  return (
    <span className="absolute -right-1 -top-1 grid min-w-[1.25rem] place-items-center rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold leading-none text-white">
      {count > 99 ? '99+' : count}
    </span>
  );
}
