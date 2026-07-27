import { useEffect, useRef, useState } from 'react';
import Button from '../ui/Button';
import MediaPreview from './MediaPreview';
import { readFileAsBase64 } from '../../utils/helpers';

export default function MessageInput({ onSend, disabled, initialText = '' }) {
  const [text, setText] = useState(initialText);
  const [fileUrl, setFileUrl] = useState(null);
  const [fileType, setFileType] = useState(null);
  const fileRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    setText(initialText || '');
  }, [initialText]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const next = Math.min(el.scrollHeight, 96);
    el.style.height = `${next}px`;
  }, [text]);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) return;
    const base64 = await readFileAsBase64(file);
    setFileUrl(base64);
    setFileType(isVideo ? 'video' : 'image');
  }

  function clearFile() {
    setFileUrl(null);
    setFileType(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  function submit() {
    if (disabled) return;
    if (!text.trim() && !fileUrl) return;

    if (fileUrl) {
      onSend?.({ type: fileType, content: fileUrl });
      clearFile();
    }
    if (text.trim()) {
      onSend?.({ type: 'text', content: text.trim() });
      setText('');
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  const canSend = Boolean(text.trim() || fileUrl);

  return (
    <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <MediaPreview fileUrl={fileUrl} fileType={fileType} onClear={clearFile} />
      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Attach image or video"
          aria-label="Attach"
        >
          📎
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFile}
        />
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Type a message..."
          className="max-h-24 min-h-[40px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        <Button size="sm" onClick={submit} disabled={!canSend || disabled}>
          Send
        </Button>
      </div>
    </div>
  );
}
