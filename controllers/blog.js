const path = require('path');
const pool = require('../db');

// Where uploaded blog images are written. Served publicly (read-only) at
// /api/blog/media/<file>. Kept outside version control (see .gitignore).
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'blog');

// ─────────────────────────────────────────────────────────────────────────────
// Blog CMS controller.
//
// Public reads (no auth):   GET /api/blog/public, GET /api/blog/public/:slug
// Admin writes (guarded):   GET/POST/PUT/DELETE under /api/blog/admin
//
// Posts are authored by the admin team from a standalone editor page. The body
// is an ordered list of content blocks stored as JSONB, so nothing renders raw
// HTML on the public site.
// ─────────────────────────────────────────────────────────────────────────────

const MAX_TITLE_LEN = 200;
const MAX_SLUG_LEN = 200;
const MAX_BLOCKS = 400;
const MAX_TABLE_ROWS = 200;
const MAX_TABLE_COLS = 12;
// Content blocks carry their own data; positional/structural blocks
// (title/cover/author/divider) let the admin place the header pieces anywhere.
const VALID_BLOCK_TYPES = new Set([
  'title', 'cover', 'author', 'divider',
  'heading', 'paragraph', 'image', 'quote', 'list', 'table',
]);

// Slugs that would collide with real app routes now that posts live at the
// site root (/<slug>). A post can never claim one of these.
const RESERVED_SLUGS = new Set([
  '', 'blog', 'listing', 'groups', 'hotel', 'hotels', 'booking', 'bookings',
  'auth', 'login', 'register', 'admin', 'blog-admin', 'vendor', 'portal',
  'payment', 'payments', 'support', 'privacy', 'terms', 'api', 'destinations',
  'sitemap', 'sitemap.xml', 'robots.txt', 'ads.txt', 'assets', '_next',
  'budget-hotels-in-turkey', 'about', 'contact', 'home',
]);

const isReservedSlug = (slug) => RESERVED_SLUGS.has(String(slug || '').toLowerCase());

// Turn any string into a URL-safe slug. Used as a fallback when the editor
// leaves the slug blank, and to normalise whatever the admin typed.
const slugify = (input) =>
  String(input || '')
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')   // strip diacritics (Türkiye → turkiye)
    .replace(/[^a-z0-9]+/g, '-')       // non-alphanumerics → hyphen
    .replace(/^-+|-+$/g, '')           // trim leading/trailing hyphens
    .slice(0, MAX_SLUG_LEN);

// Only allow http(s) or site-relative image URLs — blocks javascript:/data:
// smuggling into an <img src> and keeps the CSP happy.
const isSafeUrl = (url) => {
  if (typeof url !== 'string' || !url.trim()) return false;
  const u = url.trim();
  return /^https?:\/\//i.test(u) || u.startsWith('/');
};

// A colour is safe if it's a hex value or a plain CSS colour name — never an
// arbitrary string (which could smuggle CSS into an inline style).
const isSafeColor = (c) =>
  typeof c === 'string' && (/^#[0-9a-fA-F]{3,8}$/.test(c.trim()) || /^[a-zA-Z]{3,20}$/.test(c.trim()));

const ALIGNS = new Set(['left', 'center', 'right']);
const LIST_STYLES = new Set(['bullet', 'number', 'dash', 'check']);
const TABLE_VARIANTS = new Set(['lined', 'striped', 'bordered']);
const cleanAlign = (a) => (ALIGNS.has(a) ? a : undefined);

// Validate + normalise the incoming block array. Unknown block types and
// unsafe image URLs are dropped rather than trusted. Returns a clean array.
const sanitizeBody = (body) => {
  if (!Array.isArray(body)) return [];
  const out = [];
  for (const raw of body.slice(0, MAX_BLOCKS)) {
    if (!raw || typeof raw !== 'object') continue;
    const type = String(raw.type || '');
    if (!VALID_BLOCK_TYPES.has(type)) continue;

    if (type === 'title') {
      // Positional block — renders the post title as the page H1. Optional
      // text override; otherwise the article pulls post.title.
      const text = String(raw.text || '').trim();
      out.push({ type, ...(text ? { text } : {}) });
    } else if (type === 'cover') {
      // Full-width hero image. Own URL (optional — falls back to coverImage).
      // `fit`: 'cover' (crop to fill, default) or 'contain' (show whole image).
      const url = String(raw.url || '').trim();
      const caption = String(raw.caption || '').trim();
      out.push({
        type,
        ...(url && isSafeUrl(url) ? { url } : {}),
        ...(caption ? { caption } : {}),
        ...(raw.fit === 'contain' ? { fit: 'contain' } : {}),
      });
    } else if (type === 'author') {
      // Positional byline — renders the post's author + date + read time.
      out.push({ type });
    } else if (type === 'divider') {
      out.push({ type });
    } else if (type === 'heading') {
      const text = String(raw.text || '').trim();
      if (!text) continue;
      const level = raw.level === 3 ? 3 : 2;
      const align = cleanAlign(raw.align);
      out.push({ type, level, text, ...(align ? { align } : {}) });
    } else if (type === 'paragraph') {
      const text = String(raw.text || '').trim();
      if (!text) continue;
      const align = cleanAlign(raw.align);
      out.push({ type, text, ...(align ? { align } : {}) });
    } else if (type === 'quote') {
      const text = String(raw.text || '').trim();
      if (!text) continue;
      const label = String(raw.label || '').trim();
      out.push({
        type, text,
        ...(label ? { label } : {}),
        ...(isSafeColor(raw.bg) ? { bg: raw.bg.trim() } : {}),
      });
    } else if (type === 'image') {
      const url = String(raw.url || '').trim();
      if (!isSafeUrl(url)) continue;
      const caption = String(raw.caption || '').trim();
      const alt = String(raw.alt || '').trim();
      out.push({
        type, url,
        ...(caption ? { caption } : {}),
        ...(alt ? { alt } : {}),
        ...(raw.fit === 'contain' ? { fit: 'contain' } : {}),
      });
    } else if (type === 'list') {
      const items = Array.isArray(raw.items)
        ? raw.items.map((i) => String(i || '').trim()).filter(Boolean)
        : [];
      if (!items.length) continue;
      out.push({ type, items, ...(LIST_STYLES.has(raw.style) ? { style: raw.style } : {}) });
    } else if (type === 'table') {
      // Normalise to a rectangular grid: header row + body rows, every row
      // padded/truncated to the column count. Drop an entirely-empty table.
      const rawHeaders = Array.isArray(raw.headers) ? raw.headers : [];
      const rawRows = Array.isArray(raw.rows) ? raw.rows : [];
      const cols = Math.min(
        MAX_TABLE_COLS,
        Math.max(rawHeaders.length, ...(rawRows.map((r) => (Array.isArray(r) ? r.length : 0))), 0),
      );
      if (!cols) continue;
      const headers = Array.from({ length: cols }, (_, i) => String(rawHeaders[i] ?? '').trim());
      const rows = rawRows
        .slice(0, MAX_TABLE_ROWS)
        .map((r) => Array.from({ length: cols }, (_, i) => String((Array.isArray(r) ? r[i] : '') ?? '').trim()));
      const anyContent = headers.some(Boolean) || rows.some((r) => r.some(Boolean));
      if (!anyContent) continue;
      const variant = TABLE_VARIANTS.has(raw.variant) ? raw.variant : undefined;
      const align = Array.isArray(raw.align)
        ? Array.from({ length: cols }, (_, i) => cleanAlign(raw.align[i]) || 'left')
        : null;
      // Bold whole rows / columns: keep only unique, in-range integer indices.
      const cleanIdx = (arr, max) =>
        Array.isArray(arr)
          ? [...new Set(arr.map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n < max))].sort((a, b) => a - b)
          : [];
      const boldCols = cleanIdx(raw.boldCols, cols);
      const boldRows = cleanIdx(raw.boldRows, rows.length);
      out.push({
        type, headers, rows,
        ...(variant ? { variant } : {}),
        ...(align && align.some((a) => a !== 'left') ? { align } : {}),
        ...(boldCols.length ? { boldCols } : {}),
        ...(boldRows.length ? { boldRows } : {}),
      });
    }
  }
  return out;
};

// DB row (snake_case) → API shape (camelCase, nested author).
const mapPost = (row) => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  excerpt: row.excerpt || '',
  category: row.category || '',
  coverImage: row.cover_image || '',
  author: {
    name: row.author_name || '',
    avatar: row.author_avatar || '',
    title: row.author_title || '',
  },
  readTime: row.read_time || '',
  body: Array.isArray(row.body) ? row.body : [],
  status: row.status,
  publishedAt: row.published_at ? new Date(row.published_at).toISOString() : null,
  createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
  updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
});

// Lightweight list shape for cards/tables — omit the heavy body payload.
const mapPostSummary = (row) => {
  const { body, ...rest } = mapPost(row);
  return rest;
};

const COLUMNS = `id, slug, title, excerpt, category, cover_image, author_name,
  author_avatar, author_title, read_time, body, status, published_at,
  created_at, updated_at`;

// ── Public reads ─────────────────────────────────────────────────────────────

const listPublicPosts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${COLUMNS} FROM blog_posts
        WHERE status = 'published'
        ORDER BY COALESCE(published_at, created_at) DESC
        LIMIT 200`,
    );
    return res.status(200).json({
      posts: result.rows.map(mapPostSummary),
      count: result.rowCount,
    });
  } catch (err) {
    console.error('[blog] listPublicPosts failed:', err.message);
    return res.status(500).json({ error: 'Could not load blog posts' });
  }
};

const getPublicPostBySlug = async (req, res) => {
  try {
    const slug = slugify(req.params.slug);
    const result = await pool.query(
      `SELECT ${COLUMNS} FROM blog_posts
        WHERE slug = $1 AND status = 'published'
        LIMIT 1`,
      [slug],
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Post not found' });
    }
    return res.status(200).json({ post: mapPost(result.rows[0]) });
  } catch (err) {
    console.error('[blog] getPublicPostBySlug failed:', err.message);
    return res.status(500).json({ error: 'Could not load blog post' });
  }
};

// ── Admin reads ──────────────────────────────────────────────────────────────

const listAdminPosts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${COLUMNS} FROM blog_posts ORDER BY updated_at DESC LIMIT 500`,
    );
    return res.status(200).json({
      posts: result.rows.map(mapPostSummary),
      count: result.rowCount,
    });
  } catch (err) {
    console.error('[blog] listAdminPosts failed:', err.message);
    return res.status(500).json({ error: 'Could not load blog posts' });
  }
};

const getAdminPost = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid post id' });
    const result = await pool.query(`SELECT ${COLUMNS} FROM blog_posts WHERE id = $1`, [id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Post not found' });
    return res.status(200).json({ post: mapPost(result.rows[0]) });
  } catch (err) {
    console.error('[blog] getAdminPost failed:', err.message);
    return res.status(500).json({ error: 'Could not load blog post' });
  }
};

// ── Admin writes ─────────────────────────────────────────────────────────────

const createPost = async (req, res) => {
  try {
    const b = req.body || {};
    const title = String(b.title || '').trim();
    if (!title) return res.status(400).json({ error: 'Title is required' });
    if (title.length > MAX_TITLE_LEN) {
      return res.status(400).json({ error: `Title must be ${MAX_TITLE_LEN} characters or fewer` });
    }

    // Use the provided slug, else derive one from the title.
    const slug = slugify(b.slug) || slugify(title);
    if (!slug) return res.status(400).json({ error: 'Could not derive a valid slug — add a title or URL' });
    if (isReservedSlug(slug)) {
      return res.status(409).json({ error: `"/${slug}" is a reserved path and can't be used as a post URL. Pick a different one.` });
    }

    const status = b.status === 'published' ? 'published' : 'draft';
    const body = sanitizeBody(b.body);
    const author = b.author || {};

    // Reject duplicate slugs up front for a clean error (the UNIQUE index is
    // the real guard, but this gives a friendlier message).
    const dupe = await pool.query('SELECT 1 FROM blog_posts WHERE slug = $1', [slug]);
    if (dupe.rowCount > 0) {
      return res.status(409).json({ error: `A post already uses the URL "/blog/${slug}". Pick a different URL.` });
    }

    const result = await pool.query(
      `INSERT INTO blog_posts
         (slug, title, excerpt, category, cover_image, author_name, author_avatar,
          author_title, read_time, body, status, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, CASE WHEN $11 = 'published' THEN now() ELSE NULL END)
       RETURNING ${COLUMNS}`,
      [
        slug,
        title,
        String(b.excerpt || '').trim() || null,
        String(b.category || '').trim() || null,
        String(b.coverImage || '').trim() || null,
        String(author.name || '').trim() || null,
        String(author.avatar || '').trim() || null,
        String(author.title || '').trim() || null,
        String(b.readTime || '').trim() || null,
        JSON.stringify(body),
        status,
      ],
    );
    return res.status(201).json({ post: mapPost(result.rows[0]) });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'That URL is already taken. Pick a different one.' });
    }
    console.error('[blog] createPost failed:', err.message);
    return res.status(500).json({ error: 'Could not create the post' });
  }
};

const updatePost = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid post id' });

    const existing = await pool.query('SELECT id, status FROM blog_posts WHERE id = $1', [id]);
    if (!existing.rows[0]) return res.status(404).json({ error: 'Post not found' });

    const b = req.body || {};
    const title = String(b.title || '').trim();
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const slug = slugify(b.slug) || slugify(title);
    if (!slug) return res.status(400).json({ error: 'Could not derive a valid slug — add a title or URL' });
    if (isReservedSlug(slug)) {
      return res.status(409).json({ error: `"/${slug}" is a reserved path and can't be used as a post URL. Pick a different one.` });
    }

    // Slug must stay unique across other posts.
    const dupe = await pool.query('SELECT 1 FROM blog_posts WHERE slug = $1 AND id <> $2', [slug, id]);
    if (dupe.rowCount > 0) {
      return res.status(409).json({ error: `Another post already uses "/blog/${slug}". Pick a different URL.` });
    }

    const status = b.status === 'published' ? 'published' : 'draft';
    const body = sanitizeBody(b.body);
    const author = b.author || {};

    const result = await pool.query(
      `UPDATE blog_posts SET
         slug = $2, title = $3, excerpt = $4, category = $5, cover_image = $6,
         author_name = $7, author_avatar = $8, author_title = $9, read_time = $10,
         body = $11, status = $12,
         -- Stamp published_at the first time it goes live; keep it otherwise.
         published_at = CASE
           WHEN $12 = 'published' AND published_at IS NULL THEN now()
           WHEN $12 = 'draft' THEN NULL
           ELSE published_at
         END
       WHERE id = $1
       RETURNING ${COLUMNS}`,
      [
        id,
        slug,
        title,
        String(b.excerpt || '').trim() || null,
        String(b.category || '').trim() || null,
        String(b.coverImage || '').trim() || null,
        String(author.name || '').trim() || null,
        String(author.avatar || '').trim() || null,
        String(author.title || '').trim() || null,
        String(b.readTime || '').trim() || null,
        JSON.stringify(body),
        status,
      ],
    );
    return res.status(200).json({ post: mapPost(result.rows[0]) });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'That URL is already taken. Pick a different one.' });
    }
    console.error('[blog] updatePost failed:', err.message);
    return res.status(500).json({ error: 'Could not update the post' });
  }
};

// ── Image upload ─────────────────────────────────────────────────────────────

// Multer has already written the file to UPLOAD_DIR by the time we get here.
// Return the public URL the editor drops into a cover/image field.
const uploadImage = (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image was uploaded' });
  return res.status(201).json({
    url: `/api/blog/media/${req.file.filename}`,
    filename: req.file.filename,
    size: req.file.size,
  });
};

const deletePost = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid post id' });
    const result = await pool.query('DELETE FROM blog_posts WHERE id = $1 RETURNING id', [id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Post not found' });
    return res.status(200).json({ message: 'Post deleted', id: result.rows[0].id });
  } catch (err) {
    console.error('[blog] deletePost failed:', err.message);
    return res.status(500).json({ error: 'Could not delete the post' });
  }
};

module.exports = {
  slugify,
  UPLOAD_DIR,
  listPublicPosts,
  getPublicPostBySlug,
  listAdminPosts,
  getAdminPost,
  createPost,
  updatePost,
  deletePost,
  uploadImage,
};
