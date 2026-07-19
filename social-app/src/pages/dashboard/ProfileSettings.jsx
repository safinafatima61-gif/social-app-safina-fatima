import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { readFileAsBase64 } from '../../utils/helpers';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';

const BIO_MAX = 150;

export default function ProfileSettings() {
  const { currentUser, updateCurrentUser } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState(currentUser.avatar);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: currentUser.name,
      bio: currentUser.bio || '',
      location: currentUser.location || '',
    },
  });

  const bio = watch('bio') || '';

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await readFileAsBase64(file);
    setAvatarPreview(base64);
  }

  function onSubmit(data) {
    updateCurrentUser({
      name: data.name,
      bio: data.bio,
      location: data.location,
      avatar: avatarPreview,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-5 text-xl font-bold">Profile Settings</h1>

      {saved && (
        <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/40">
          Profile updated successfully
        </p>
      )}

      <div className="card p-6">
        <div className="mb-6 flex items-center gap-4">
          <Avatar src={avatarPreview} name={currentUser.name} size="lg" />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Change avatar
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="block text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700 dark:text-gray-300 dark:file:bg-brand-900 dark:file:text-brand-300"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full name"
            error={errors.name?.message}
            {...register('name', { required: 'Full name is required' })}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Bio
            </label>
            <textarea
              rows={3}
              className="input-base resize-none"
              {...register('bio', {
                maxLength: { value: BIO_MAX, message: `Maximum ${BIO_MAX} characters` },
              })}
            />
            <div className="mt-1 flex justify-between text-xs text-gray-400">
              <span>{errors.bio?.message}</span>
              <span>{bio.length} / {BIO_MAX}</span>
            </div>
          </div>

          <Input label="Location" {...register('location')} />

          <Button type="submit">Save Changes</Button>
        </form>
      </div>
    </div>
  );
}
