import { useState } from 'react';
import Avatar from '../ui/Avatar';
import Modal from '../ui/Modal';
import clsx from 'clsx';

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢'];

export default function MessageBubble({
  message,
  fromSelf,
  friend,
  showAvatar,
  onReact,
}) {
  const [lightbox, setLightbox] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const reactionMap = {};
  (message.reactions || []).forEach((r) => {
    if (!reactionMap[r.emoji]) reactionMap[r.emoji] = [];
    reactionMap[r.emoji].push(r.userId);
  });

  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={clsx('group mb-2 flex gap-2', fromSelf ? 'justify-end' : 'justify-start')}>
      {!fromSelf && (
        <div className="w-8 shrink-0">
          {showAvatar && <Avatar src={friend?.avatar} name={friend?.name || '?'} size="sm" />}
        </div>
      )}

      <div className={clsx('relative max-w-[70%]', fromSelf && 'ml-auto')}>
        <div
          className={clsx(
            'px-4 py-2',
            fromSelf
              ? 'rounded-2xl rounded-br-sm bg-blue-600 text-white'
              : 'rounded-2xl rounded-bl-sm bg-gray-100 text-gray-900 dark:bg-slate-800 dark:text-slate-100'
          )}
          onMouseEnter={() => setShowPicker(true)}
          onMouseLeave={() => setShowPicker(false)}
        >
          {message.aiGenerated && (
            <span className="mb-1 inline-flex items-center gap-1 text-[10px] opacity-80">
              ✨ AI
            </span>
          )}

          {message.type === 'text' && (
            <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
          )}

          {message.type === 'image' && (
            <button type="button" onClick={() => setLightbox(true)} className="block">
              <img
                src={message.content}
                alt="Shared"
                className="max-h-56 rounded-lg object-cover"
              />
            </button>
          )}

          {message.type === 'video' && (
            <video src={message.content} controls className="max-h-56 rounded-lg" />
          )}

          {showPicker && onReact && (
            <div
              className={clsx(
                'absolute -top-9 flex gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-sm dark:border-slate-700 dark:bg-slate-900',
                fromSelf ? 'right-0' : 'left-0'
              )}
            >
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="text-sm hover:scale-110"
                  onClick={() => onReact(message.id, emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {Object.keys(reactionMap).length > 0 && (
          <div className={clsx('mt-1 flex flex-wrap gap-1', fromSelf && 'justify-end')}>
            {Object.entries(reactionMap).map(([emoji, users]) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onReact?.(message.id, emoji)}
                className="rounded-full border border-slate-200 bg-white px-1.5 py-0.5 text-xs dark:border-slate-700 dark:bg-slate-900"
              >
                {emoji} {users.length}
              </button>
            ))}
          </div>
        )}

        <div
          className={clsx(
            'mt-0.5 flex items-center gap-1 text-[10px] text-slate-400',
            fromSelf ? 'justify-end' : 'justify-start'
          )}
        >
          <span>{time}</span>
          {fromSelf && <span>{message.read ? '✓✓' : '✓'}</span>}
        </div>
      </div>

      <Modal isOpen={lightbox} onClose={() => setLightbox(false)} title="Photo">
        <img src={message.content} alt="Full size" className="w-full rounded-xl" />
      </Modal>
    </div>
  );
}
