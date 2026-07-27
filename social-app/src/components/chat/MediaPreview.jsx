import { CloseIcon } from '../icons/Icons';

export default function MediaPreview({ fileUrl, fileType, onClear }) {
  if (!fileUrl) return null;

  return (
    <div className="relative mb-2 inline-block px-3 pt-2">
      {fileType === 'video' ? (
        <video src={fileUrl} className="h-24 rounded-lg object-cover" />
      ) : (
        <img src={fileUrl} alt="Attach preview" className="h-24 rounded-lg object-cover" />
      )}
      <button
        type="button"
        onClick={onClear}
        className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-slate-900 text-white"
        aria-label="Remove attachment"
      >
        <CloseIcon className="h-3 w-3" />
      </button>
    </div>
  );
}
