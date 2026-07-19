import clsx from 'clsx';

const SIZES = { sm: 32, md: 48, lg: 80 };

const BG_COLORS = [
  'bg-rose-400', 'bg-amber-400', 'bg-emerald-400',
  'bg-sky-400', 'bg-violet-400', 'bg-pink-400',
];

function colorForName(name = '') {
  const code = name.charCodeAt(0) || 0;
  return BG_COLORS[code % BG_COLORS.length];
}

export default function Avatar({ src, name = '?', size = 'md', className }) {
  const px = SIZES[size] || SIZES.md;
  const style = { width: px, height: px };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={style}
        className={clsx('rounded-full object-cover flex-shrink-0', className)}
      />
    );
  }

  return (
    <div
      style={style}
      className={clsx(
        'rounded-full flex-shrink-0 flex items-center justify-center text-white font-semibold',
        colorForName(name),
        className
      )}
    >
      <span style={{ fontSize: px * 0.42 }}>{name.charAt(0).toUpperCase()}</span>
    </div>
  );
}
