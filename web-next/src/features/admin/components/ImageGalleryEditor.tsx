import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, Trash2 } from 'lucide-react';
import { hotelService } from '@/shared/api/services';
import { databaseFallbackUrl } from '@/shared/lib/hotelImages';

// Originals up to 25 MB can be picked; they are shrunk in the browser first.
// The server accepts up to 8 MB per (already shrunk) image.
const MAX_PICK_MB = 25;
const MAX_UPLOAD_MB = 8;
const MAX_EDGE_PX = 2000;
const JPEG_QUALITY = 0.85;
const MAX_PER_UPLOAD = 12;
const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/avif';

// Small ImageKit rendition for thumbnails, so the editor doesn't pull
// multi-megabyte originals. Non-ImageKit URLs are shown as-is.
const thumbUrl = (url: string) => {
  if (!url.startsWith('https://ik.imagekit.io/')) return url;
  const [base, query] = url.split('?');
  const rest = (query || '').split('&').filter((p) => p && !/^tr=/i.test(p));
  return `${base}?${['tr=w-480,h-360,c-maintain_ratio,q-70', ...rest].join('&')}`;
};

// Shrink a photo to at most MAX_EDGE_PX on its longest side and re-encode as
// JPEG. Keeps ImageKit storage/bandwidth and the database fallback copy small.
// GIFs (may be animated) and anything the browser can't decode go as-is.
async function shrinkImage(file: File): Promise<File> {
  if (file.type === 'image/gif' || typeof createImageBitmap !== 'function') return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE_PX / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.fillStyle = '#ffffff'; // flatten transparency for JPEG
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
    if (!blob) return file;
    // Already small and not resized: keep the original bytes.
    if (scale === 1 && blob.size >= file.size) return file;
    const dot = file.name.lastIndexOf('.');
    const stem = (dot > 0 ? file.name.slice(0, dot) : file.name) || 'photo';
    return new File([blob], `${stem}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    return file;
  }
}

type Props = {
  images: string[];
  onChange: (next: string[]) => void;
  /** Label for the first image, e.g. "Cover" for hotels, "Main" for rooms. */
  primaryLabel?: string;
  disabled?: boolean;
  /** Smaller thumbnails for use inside table rows. */
  compact?: boolean;
  /** Where uploads belong; decides the ImageKit folder. */
  target?: { hotelId?: number | string | null; roomId?: number | string | null };
};

/**
 * Ordered photo list editor: upload (multi-select), reorder, set primary,
 * remove. The parent owns the list and decides when to persist it.
 */
export function ImageGalleryEditor({ images, onChange, primaryLabel = 'Cover', disabled, compact, target }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const remove = (index: number) => onChange(images.filter((_, i) => i !== index));

  const handleFiles = async (list: FileList | null) => {
    if (!list || list.length === 0) return;
    setError(null);
    setNotice(null);
    const picked = Array.from(list);
    const tooBig = picked.find((f) => f.size > MAX_PICK_MB * 1024 * 1024);
    if (tooBig) {
      setError(`"${tooBig.name}" is larger than ${MAX_PICK_MB} MB.`);
      return;
    }
    if (picked.length > MAX_PER_UPLOAD) {
      setError(`Select up to ${MAX_PER_UPLOAD} images at a time.`);
      return;
    }
    setUploading(true);
    // One photo per request: keeps every request far below the server's
    // 25 MB body limit and keeps photos that succeeded if a later one fails.
    const added: string[] = [];
    let lastWarning: string | null = null;
    try {
      for (let i = 0; i < picked.length; i++) {
        setProgress({ done: i, total: picked.length });
        const file = await shrinkImage(picked[i]);
        if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
          throw { message: `"${picked[i].name}" is still larger than ${MAX_UPLOAD_MB} MB after compression.` };
        }
        const { urls, warning } = await hotelService.uploadImages([file], target);
        added.push(...urls);
        if (warning) lastWarning = warning;
      }
    } catch (e: any) {
      const reason = e?.data?.error || e?.message || 'Upload failed';
      setError(added.length ? `${added.length} photo(s) uploaded, then: ${reason}` : reason);
    } finally {
      if (added.length) onChange([...images, ...added.filter((u) => !images.includes(u))]);
      if (lastWarning) setNotice(lastWarning);
      setUploading(false);
      setProgress(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const thumb = compact ? 'h-20' : 'h-32';

  return (
    <div>
      <div className={`grid gap-3 ${compact ? 'grid-cols-3 sm:grid-cols-5 lg:grid-cols-7' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'}`}>
        {images.map((url, i) => (
          <div key={url} className="group relative rounded-lg overflow-hidden border border-[#eaeaea] bg-[#fafafa]">
            <img
              src={thumbUrl(url)}
              alt=""
              className={`w-full ${thumb} object-cover`}
              loading="lazy"
              onError={(e) => {
                // ImageKit unavailable: show our database copy instead.
                const img = e.currentTarget;
                if (img.dataset.fallback) return;
                img.dataset.fallback = '1';
                const dbCopy = databaseFallbackUrl(url);
                if (dbCopy) img.src = dbCopy;
              }}
            />
            {i === 0 && (
              <span className="absolute top-1.5 left-1.5 rounded-full bg-[#2F80ED] text-white text-[10px] font-semibold px-2 py-0.5">
                {primaryLabel}
              </span>
            )}
            <div className="flex items-center justify-between gap-1 px-1.5 py-1 bg-white border-t border-[#eaeaea]">
              <div className="flex items-center gap-0.5">
                <IconBtn title="Move left" onClick={() => move(i, i - 1)} disabled={disabled || i === 0}>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </IconBtn>
                <IconBtn title="Move right" onClick={() => move(i, i + 1)} disabled={disabled || i === images.length - 1}>
                  <ArrowRight className="w-3.5 h-3.5" />
                </IconBtn>
                {i !== 0 && (
                  <IconBtn title={`Make ${primaryLabel.toLowerCase()}`} onClick={() => move(i, 0)} disabled={disabled}>
                    <Star className="w-3.5 h-3.5" />
                  </IconBtn>
                )}
              </div>
              <IconBtn title="Remove" onClick={() => remove(i)} disabled={disabled} danger>
                <Trash2 className="w-3.5 h-3.5" />
              </IconBtn>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
          className={`flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-[#cfd8e3] text-[#2F80ED] hover:border-[#2F80ED] hover:bg-[#f5f9ff] disabled:opacity-60 ${compact ? 'min-h-[110px]' : 'min-h-[164px]'}`}
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
          <span className="text-xs font-semibold">{uploading ? (progress && progress.total > 1 ? `Uploading ${progress.done + 1}/${progress.total}…` : 'Uploading…') : 'Upload photos'}</span>
          {!compact && <span className="text-[10px] text-[#8c8c8c]">JPG, PNG, WEBP · max {MAX_PICK_MB} MB</span>}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {notice && <p className="mt-2 text-xs text-amber-700">{notice}</p>}
    </div>
  );
}

function IconBtn({
  children, title, onClick, disabled, danger,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={`p-1 rounded disabled:opacity-30 ${danger ? 'text-red-600 hover:bg-red-50' : 'text-[#6b7280] hover:bg-[#f0f0f0] hover:text-[#3b3b3b]'}`}
    >
      {children}
    </button>
  );
}
