import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { CameraIcon } from '../icons/Icons';
import { readFileAsBase64 } from '../../utils/helpers';
import { storage } from '../../services/storage';
import { useAuth } from '../../hooks/useAuth';
import { useFriends } from '../../hooks/useFriends';
import { useToast } from '../../context/ToastContext';
import { getFriendsOf, getMutualFriendsCount } from '../../utils/friendHelpers';

const BIO_MAX = 150;

export default function ProfileHeader({ user, isOwner }) {
  const { currentUser, updateCurrentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    getRelationship,
    sendRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    unfriend,
    received,
    sent,
    friendsCount,
  } = useFriends(currentUser?.id);

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [bio, setBio] = useState(user.bio || '');
  const [editingBio, setEditingBio] = useState(false);
  const [draftBio, setDraftBio] = useState(user.bio || '');

  useEffect(() => {
    setBio(user.bio || '');
    setDraftBio(user.bio || '');
  }, [user.id, user.bio]);

  const relationship = isOwner ? 'self' : getRelationship(user.id);
  const postsCount = storage
    .getPosts()
    .filter((p) => p.authorId === user.id && !p.isDraft && p.isPublic).length;
  const profileFriendsCount = getFriendsOf(user.id).length;
  const mutualCount =
    currentUser && !isOwner ? getMutualFriendsCount(currentUser.id, user.id) : 0;

  const skills = Array.isArray(user.skills)
    ? user.skills
    : String(user.skills || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

  const social = user.socialLinks || {};

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file || !isOwner) return;
    const base64 = await readFileAsBase64(file);
    updateCurrentUser({ avatar: base64 });
  }

  async function handleCoverChange(e) {
    const file = e.target.files?.[0];
    if (!file || !isOwner) return;
    const base64 = await readFileAsBase64(file);
    updateCurrentUser({ coverImage: base64 });
  }

  function saveBio() {
    const next = draftBio.slice(0, BIO_MAX);
    setBio(next);
    updateCurrentUser({ bio: next });
    setEditingBio(false);
    toast('Bio updated', 'success');
  }

  function handleAccept() {
    const req = received.find((r) => r.fromUserId === user.id);
    if (req) {
      acceptRequest(req.id);
      toast('Friend request accepted', 'success');
    }
  }

  function handleReject() {
    const req = received.find((r) => r.fromUserId === user.id);
    if (req) rejectRequest(req.id);
  }

  function handleCancel() {
    const req = sent.find((r) => r.toUserId === user.id);
    if (req) {
      cancelRequest(req.id);
      toast('Request cancelled');
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="relative">
        <div
          className="h-44 w-full sm:h-56"
          style={
            user.coverImage
              ? {
                  backgroundImage: `url(${user.coverImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : { background: 'linear-gradient(135deg,#2563eb,#0ea5e9 55%,#6366f1)' }
          }
        />
        {isOwner && (
          <>
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-lg bg-white/95 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 backdrop-blur hover:bg-white dark:bg-slate-900/95 dark:text-slate-200 dark:ring-slate-700"
            >
              <CameraIcon />
              Cover
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverChange}
            />
          </>
        )}
      </div>

      <div className="px-5 pb-5 pt-0 sm:px-6">
        <div className="relative -mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div className="relative">
              <Avatar
                src={user.avatar}
                name={user.name}
                size="xl"
                className="border-4 border-white shadow-sm dark:border-slate-900"
              />
              {isOwner && (
                <>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute bottom-1 right-1 grid h-8 w-8 place-items-center rounded-full bg-slate-900 text-white shadow"
                    aria-label="Change avatar"
                  >
                    <CameraIcon className="h-3.5 w-3.5" />
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </>
              )}
            </div>
            <div className="pb-1">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">{user.name}</h1>
              <p className="text-sm text-slate-400">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {isOwner && (
              <>
                {!editingBio && (
                  <Button size="sm" variant="secondary" onClick={() => setEditingBio(true)}>
                    Edit bio
                  </Button>
                )}
                <Link to="/dashboard/settings">
                  <Button size="sm" variant="outline">
                    Edit Profile
                  </Button>
                </Link>
              </>
            )}

            {!isOwner && currentUser && relationship === 'none' && (
              <Button
                size="sm"
                onClick={() => {
                  sendRequest(user.id);
                  toast('Friend request sent', 'success');
                }}
              >
                Add Friend
              </Button>
            )}
            {!isOwner && relationship === 'outgoing' && (
              <>
                <Button size="sm" variant="secondary" disabled>
                  Request Sent
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancel}>
                  Cancel Request
                </Button>
              </>
            )}
            {!isOwner && relationship === 'incoming' && (
              <>
                <Button size="sm" onClick={handleAccept}>
                  Accept
                </Button>
                <Button size="sm" variant="secondary" onClick={handleReject}>
                  Reject
                </Button>
              </>
            )}
            {!isOwner && relationship === 'friends' && (
              <>
                <Button size="sm" onClick={() => navigate(`/chat/${user.id}`)}>
                  Message
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    unfriend(user.id);
                    toast('Unfriended');
                  }}
                >
                  Unfriend
                </Button>
              </>
            )}
            {!isOwner && !currentUser && (
              <Link to="/login">
                <Button size="sm">Log in to connect</Button>
              </Link>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 sm:max-w-md">
          <div className="rounded-xl bg-slate-50 px-3 py-2 text-center dark:bg-slate-800/60">
            <p className="text-lg font-bold text-slate-900 dark:text-slate-50">{postsCount}</p>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Posts</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2 text-center dark:bg-slate-800/60">
            <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
              {isOwner ? friendsCount : profileFriendsCount}
            </p>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Friends</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2 text-center dark:bg-slate-800/60">
            <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
              {isOwner ? '—' : mutualCount}
            </p>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Mutual</p>
          </div>
        </div>

        <div className="mt-5">
          {editingBio ? (
            <div>
              <textarea
                rows={3}
                value={draftBio}
                maxLength={BIO_MAX}
                onChange={(e) => setDraftBio(e.target.value)}
                className="input-base resize-none"
                placeholder="Tell people about yourself..."
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {draftBio.length} / {BIO_MAX}
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setEditingBio(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={saveBio}>
                    Save
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <p className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
              {bio || (isOwner ? 'Add a short bio about yourself.' : 'No bio yet.')}
            </p>
          )}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {user.location && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Location:</span>{' '}
              {user.location}
            </p>
          )}
          {user.education && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Education:</span>{' '}
              {user.education}
            </p>
          )}
        </div>

        {skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {(social.website || social.twitter || social.linkedin || social.github) && (
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            {social.website && (
              <a
                href={social.website}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                Website
              </a>
            )}
            {social.linkedin && (
              <a
                href={social.linkedin}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                LinkedIn
              </a>
            )}
            {social.github && (
              <a
                href={social.github}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                GitHub
              </a>
            )}
            {social.twitter && (
              <a
                href={social.twitter}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                Twitter
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
