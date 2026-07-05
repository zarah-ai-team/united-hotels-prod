const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeAdmin } = require('../middleware/rbacMiddleware');
const {
  UPLOAD_DIR,
  listPublicPosts,
  getPublicPostBySlug,
  listAdminPosts,
  getAdminPost,
  createPost,
  updatePost,
  deletePost,
  uploadImage,
} = require('../controllers/blog');

// ── Image upload plumbing ─────────────────────────────────────────────────────
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// SVG is intentionally excluded — it can carry inline scripts and would be an
// XSS vector if served same-origin. Raster/webp/avif only.
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);
const EXT_BY_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    // Never trust the client filename — derive a random name + a safe extension
    // from the (validated) mimetype.
    const ext = EXT_BY_MIME[file.mimetype] || '.jpg';
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) return cb(null, true);
    cb(new Error('Only JPG, PNG, WEBP, GIF or AVIF images are allowed'));
  },
});

// Wrap multer so its errors become a clean 400 instead of falling through to
// the generic 500 error handler.
const uploadSingle = (req, res, next) =>
  upload.single('file')(req, res, (err) => {
    if (!err) return next();
    const msg = err.code === 'LIMIT_FILE_SIZE'
      ? 'Image is too large (max 6 MB)'
      : err.message || 'Upload failed';
    return res.status(400).json({ error: msg });
  });

// ── Public reads ──────────────────────────────────────────────────────────────
router.get('/public', listPublicPosts);
router.get('/public/:slug', getPublicPostBySlug);

// Public, read-only serving of uploaded images. Long-cache immutable — every
// upload gets a unique filename.
router.use(
  '/media',
  express.static(UPLOAD_DIR, {
    index: false,
    setHeaders: (res) => res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'),
  }),
);

// ── Admin authoring (guarded) ────────────────────────────────────────────────
router.get('/admin', authenticate, authorizeAdmin, listAdminPosts);
router.get('/admin/:id', authenticate, authorizeAdmin, getAdminPost);
router.post('/admin', authenticate, authorizeAdmin, createPost);
router.put('/admin/:id', authenticate, authorizeAdmin, updatePost);
router.delete('/admin/:id', authenticate, authorizeAdmin, deletePost);
router.post('/admin/upload', authenticate, authorizeAdmin, uploadSingle, uploadImage);

module.exports = router;
