import clsx from 'clsx';

const SIZES = { sm: 32, md: 40, lg: 80, xl: 112 };

export default function Avatar({ src, name = '?', size = 'md', className }) {
  const px = SIZES[size] || SIZES.md;
  const style = { width: px, height: px };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={style}
        className={clsx('flex-shrink-0 rounded-full object-cover', className)}
      />
    );
  }

  return (
    <div
      style={style}
      className={clsx(
        'flex flex-shrink-0 items-center justify-center rounded-full bg-brand-600 font-semibold text-white',
        className
      )}
    >
      <span style={{ fontSize: px * 0.42 }}>{name.charAt(0).toUpperCase()}</span>
    </div>
  );
}
