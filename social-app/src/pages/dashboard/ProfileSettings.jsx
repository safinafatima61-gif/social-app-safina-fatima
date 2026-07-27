import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { readFileAsBase64 } from '../../utils/helpers';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import AIProfileOptimize from '../../components/ai/AIProfileOptimize';
import { useToast } from '../../context/ToastContext';

const BIO_MAX = 150;

export default function ProfileSettings() {
  const { currentUser, updateCurrentUser } = useAuth();
  const { toast } = useToast();
  const [avatarPreview, setAvatarPreview] = useState(currentUser.avatar);
  const links = currentUser.socialLinks || {};

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: currentUser.name,
      bio: currentUser.bio || '',
      location: currentUser.location || '',
      education: currentUser.education || '',
      skills: Array.isArray(currentUser.skills)
        ? currentUser.skills.join(', ')
        : currentUser.skills || '',
      website: links.website || '',
      linkedin: links.linkedin || '',
      github: links.github || '',
      twitter: links.twitter || '',
    },
  });

  const bio = watch('bio') || '';
  const name = watch('name') || '';
  const location = watch('location') || '';

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
      education: data.education,
      skills: String(data.skills || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      socialLinks: {
        website: data.website || '',
        linkedin: data.linkedin || '',
        github: data.github || '',
        twitter: data.twitter || '',
      },
      avatar: avatarPreview,
    });
    toast('Profile updated', 'success');
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-5 text-xl font-bold text-slate-900 dark:text-slate-50">Profile Settings</h1>

      <div className="card p-6">
        <div className="mb-6 flex items-center gap-4">
          <Avatar src={avatarPreview} name={currentUser.name} size="lg" />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Change avatar
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="block text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700 dark:text-slate-300 dark:file:bg-brand-950 dark:file:text-brand-300"
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
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Bio
            </label>
            <textarea
              rows={3}
              className="input-base resize-none"
              {...register('bio', {
                maxLength: { value: BIO_MAX, message: `Maximum ${BIO_MAX} characters` },
              })}
            />
            <div className="mt-1 flex justify-between text-xs text-slate-400 dark:text-slate-500">
              <span>{errors.bio?.message}</span>
              <span>
                {bio.length} / {BIO_MAX}
              </span>
            </div>
            <div className="mt-2">
              <AIProfileOptimize
                name={name}
                bio={bio}
                location={location}
                onUse={(suggestion) =>
                  setValue('bio', suggestion, { shouldDirty: true, shouldValidate: true })
                }
              />
            </div>
          </div>

          <Input label="Location" {...register('location')} />
          <Input label="Education" placeholder="e.g. BS Computer Science" {...register('education')} />
          <Input
            label="Skills"
            placeholder="React, Node.js, UI Design (comma separated)"
            {...register('skills')}
          />

          <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
            <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
              Social links
            </p>
            <div className="space-y-3">
              <Input label="Website" placeholder="https://" {...register('website')} />
              <Input label="LinkedIn" placeholder="https://linkedin.com/in/..." {...register('linkedin')} />
              <Input label="GitHub" placeholder="https://github.com/..." {...register('github')} />
              <Input label="Twitter / X" placeholder="https://x.com/..." {...register('twitter')} />
            </div>
          </div>

          <Button type="submit">Save Changes</Button>
        </form>
      </div>
    </div>
  );
}
