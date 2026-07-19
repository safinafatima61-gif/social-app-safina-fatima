import { forwardRef } from 'react';
import clsx from 'clsx';

const Input = forwardRef(function Input(
  { label, error, className, type = 'text', ...rest },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={clsx(
          'input-base',
          error && 'border-red-400 focus:ring-red-400',
          className
        )}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});

export default Input;
