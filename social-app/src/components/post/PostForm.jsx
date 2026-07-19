import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../ui/Button';
import { readFileAsBase64 } from '../../utils/helpers';

const MAX_CHARS = 500;

// Shared form for both Create Post and Edit Post.
// `defaultValues` pre-fills the fields (used on the Edit page).
export default function PostForm({ defaultValues = {}, onSubmit, submitting }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      description: defaultValues.description || '',
      isPublic: defaultValues.isPublic ?? true,
    },
  });

  const [imagePreview, setImagePreview] = useState(defaultValues.image || null);
  const description = watch('description') || '';
  const charCount = description.length;
  const charColor =
    charCount >= 480 ? 'text-red-500' : charCount >= 400 ? 'text-amber-500' : 'text-gray-400';

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await readFileAsBase64(file);
    setImagePreview(base64);
  }

  function clearImage() {
    setImagePreview(null);
  }

  function submitAs(isDraft) {
    return handleSubmit((data) => {
      onSubmit({
        description: data.description,
        isPublic: data.isPublic === 'true' || data.isPublic === true,
        isDraft,
        image: imagePreview,
      });

    });
  }

  return (
    <form className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          What's on your mind?
        </label>
        <textarea
          rows={4}
          className="input-base resize-none"
          placeholder="Share something with your friends..."
          {...register('description', {
            required: 'Description is required',
            minLength: { value: 10, message: 'Minimum 10 characters' },
            maxLength: { value: MAX_CHARS, message: `Maximum ${MAX_CHARS} characters` },
          })}
        />
        <div className="mt-1 flex items-center justify-between">
          {errors.description ? (
            <p className="text-xs text-red-500">{errors.description.message}</p>
          ) : (
            <span />
          )}
          <span className={`text-xs ${charColor}`}>
            {charCount} / {MAX_CHARS} characters
          </span>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Image (optional)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700 dark:text-gray-300 dark:file:bg-brand-900 dark:file:text-brand-300"
        />
        {imagePreview && (
          <div className="relative mt-3 inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-64 rounded-xl border border-gray-200 dark:border-gray-700"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-gray-900 text-white shadow"
              aria-label="Remove image"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <input
            type="radio"
            value="true"
            {...register('isPublic')}
            defaultChecked={(defaultValues.isPublic ?? true) === true}
          />
          Public
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <input
            type="radio"
            value="false"
            {...register('isPublic')}
            defaultChecked={defaultValues.isPublic === false}
          />
          Private
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          variant="secondary"
          isLoading={submitting === 'draft'}
          onClick={submitAs(true)}
        >
          Save as Draft
        </Button>
        <Button
          variant="primary"
          isLoading={submitting === 'publish'}
          onClick={submitAs(false)}
        >
          Publish
        </Button>
      </div>
    </form>
  );
}
