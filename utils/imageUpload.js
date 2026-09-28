// Admin image uploads (hotel galleries, room-category photos).
//
// Files are received in memory (multer) and sent server-to-server to ImageKit
// using IMAGEKIT_PRIVATE_KEY; the private key never reaches the browser. A
// copy of every upload is also kept in Postgres (utils/mediaFiles.js) and used
// when ImageKit can't deliver it, or instead of ImageKit when the upload fails
// or no key is configured.

const path = require('path');
const multer = require('multer');

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);
const EXT_BY_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
};

const MAX_FILE_MB = 8;
const MAX_FILES = 12;

const IMAGEKIT_UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';
const IMAGEKIT_FILES_URL = 'https://api.imagekit.io/v1/files';

const uploadDirFor = (subdir) => path.join(__dirname, '..', 'uploads', subdir);

const privateKey = () => String(process.env.IMAGEKIT_PRIVATE_KEY || '').trim();
const isImageKitUploadConfigured = () => privateKey().length > 0;
const authHeader = () => `Basic ${Buffer.from(`${privateKey()}:`).toString('base64')}`;

const baseFolder = () => {
  const raw = String(process.env.IMAGEKIT_FOLDER || '/hotels').trim() || '/hotels';
  return `/${raw.replace(/^\/+|\/+$/g, '')}`;
};

// ASCII slug for folder names (Turkish characters transliterated).
const TURKISH_MAP = { 'İ': 'I', 'ı': 'i', 'Ş': 'S', 'ş': 's', 'Ğ': 'G', 'ğ': 'g', 'Ü': 'U', 'ü': 'u', 'Ö': 'O', 'ö': 'o', 'Ç': 'C', 'ç': 'c' };
const slugify = (value, max = 60) => String(value || '')
  .replace(/[İıŞşĞğÜüÖöÇç]/g, (ch) => TURKISH_MAP[ch] || ch)
  .normalize('NFKD')
  .replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, max);

/**
 * Folder layout (IDs first so renames never break anything; names are only
 * there to make the ImageKit library readable):
 *   /hotels/217-royan-hotel/
 *   /hotels/217-royan-hotel/rooms/448-standard/
 */
const folderFor = ({ hotelId, hotelName, roomId, roomLabel }) => {
  const parts = [baseFolder()];
  if (hotelId) parts.push([hotelId, slugify(hotelName)].filter(Boolean).join('-'));
  else parts.push('unassigned');
  if (roomId) parts.push('rooms', [roomId, slugify(roomLabel)].filter(Boolean).join('-'));
  return parts.join('/');
};

// Keep the original name (sanitised) so the library stays recognisable.
// ImageKit appends a unique suffix, so equal names never collide.
const safeFileName = (file) => {
  const ext = EXT_BY_MIME[file.mimetype] || '.jpg';
  const stem = slugify(path.parse(file.originalname || '').name, 50) || 'photo';
  return `${stem}${ext}`;
};

/** Upload one in-memory file to ImageKit. Resolves { url, fileId, filePath }. */
const uploadToImageKit = async (file, folder) => {
  const form = new FormData();
  form.append('file', new Blob([file.buffer], { type: file.mimetype }), safeFileName(file));
  form.append('fileName', safeFileName(file));
  form.append('folder', folder);
  form.append('useUniqueFileName', 'true');

  const res = await fetch(IMAGEKIT_UPLOAD_URL, {
    method: 'POST',
    headers: { Authorization: authHeader() },
    body: form,
    signal: AbortSignal.timeout(30_000),
  });
  let data = null;
  try { data = await res.json(); } catch (_e) { /* non-JSON error body */ }
  if (!res.ok || !data?.url) {
    const reason = data?.message || `HTTP ${res.status}`;
    throw new Error(`ImageKit upload failed: ${reason}`);
  }
  return { url: data.url, fileId: data.fileId || null, filePath: data.filePath || null };
};

/** Best-effort delete of an ImageKit file by id. Never throws. */
const deleteFromImageKit = async (fileId) => {
  if (!fileId || !isImageKitUploadConfigured()) return false;
  try {
    const res = await fetch(`${IMAGEKIT_FILES_URL}/${encodeURIComponent(fileId)}`, {
      method: 'DELETE',
      headers: { Authorization: authHeader() },
    });
    return res.ok || res.status === 404;
  } catch (err) {
    console.warn('[imagekit] delete failed:', err.message);
    return false;
  }
};

/**
 * Express middleware: accepts up to MAX_FILES images as multipart field
 * `files` (or a single `file`), in memory, onto req.uploadedFiles. Multer
 * errors become a clean 400 instead of a 500.
 */
const createImageUploader = () => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_MB * 1024 * 1024, files: MAX_FILES },
    fileFilter: (_req, file, cb) => {
      if (ALLOWED_MIME.has(file.mimetype)) return cb(null, true);
      cb(new Error('Only JPG, PNG, WEBP, GIF or AVIF images are allowed'));
    },
  }).fields([
    { name: 'files', maxCount: MAX_FILES },
    { name: 'file', maxCount: 1 },
  ]);

  return (req, res, next) =>
    upload(req, res, (err) => {
      if (err) {
        const msg = err.code === 'LIMIT_FILE_SIZE'
          ? `Image is too large (max ${MAX_FILE_MB} MB)`
          : err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE'
            ? `Too many images (max ${MAX_FILES} per upload)`
            : err.message || 'Upload failed';
        return res.status(400).json({ error: msg });
      }
      const f = req.files || {};
      req.uploadedFiles = [...(f.files || []), ...(f.file || [])];
      return next();
    });
};

// ImageKit delivery URLs, with or without transformation params.
const isImageKitUrl = (url) => {
  const endpoint = String(process.env.IMAGEKIT_ENDPOINT || '').replace(/\/+$/, '');
  return /^https:\/\/ik\.imagekit\.io\//i.test(url) || (endpoint && url.startsWith(endpoint));
};

// Stored URLs are kept clean (no ?tr=); display sizing is added when served.
const stripImageKitTransform = (url) => {
  if (!isImageKitUrl(url)) return url;
  const [base, query] = url.split('?');
  if (!query) return url;
  const kept = query.split('&').filter((p) => p && !/^tr=/i.test(p));
  return kept.length ? `${base}?${kept.join('&')}` : base;
};

const DISPLAY_TRANSFORM = 'tr=w-1200,h-900,q-78,fo-auto,c-maintain_ratio';
const withDisplayTransform = (url) => {
  if (typeof url !== 'string' || !isImageKitUrl(url) || /[?&]tr=/i.test(url)) return url;
  return `${url}${url.includes('?') ? '&' : '?'}${DISPLAY_TRANSFORM}`;
};

module.exports = {
  createImageUploader,
  uploadDirFor,
  folderFor,
  uploadToImageKit,
  deleteFromImageKit,
  isImageKitUploadConfigured,
  isImageKitUrl,
  stripImageKitTransform,
  withDisplayTransform,
  MAX_FILE_MB,
  MAX_FILES,
};
