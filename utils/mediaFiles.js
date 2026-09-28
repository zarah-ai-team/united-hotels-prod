// Image store with two layers:
//   1. ImageKit (primary): fast CDN delivery + resizing.
//   2. Postgres copy (fallback): every admin upload is also saved in
//      media_files.data. It is served if ImageKit can't deliver (e.g. the
//      free-plan bandwidth runs out) or if the ImageKit upload itself failed.
//
// Photos are shrunk in the browser before upload (~2000px, JPEG), so a copy is
// typically a few hundred KB.
//
// Only files recorded here are ever deleted from ImageKit; legacy
// hand-uploaded photos (no file_id) are never touched.

const pool = require('../db');
const { deleteFromImageKit, stripImageKitTransform } = require('./imageUpload');

const DB_MEDIA_PREFIX = '/api/hotels/media/db/';

let tableEnsured = false;
const ensureMediaTable = async () => {
  if (tableEnsured) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS media_files (
      id         serial PRIMARY KEY,
      url        text NOT NULL UNIQUE,
      file_id    text,
      file_path  text,
      hotel_id   integer,
      room_id    integer,
      created_at timestamptz NOT NULL DEFAULT now()
    )`);
  await pool.query(`
    ALTER TABLE media_files
      ADD COLUMN IF NOT EXISTS storage   text NOT NULL DEFAULT 'imagekit',
      ADD COLUMN IF NOT EXISTS mime_type text,
      ADD COLUMN IF NOT EXISTS byte_size integer,
      ADD COLUMN IF NOT EXISTS data      bytea`);
  tableEnsured = true;
};

/** Record an ImageKit upload together with its fallback copy. */
const recordImageKitUpload = async ({ url, fileId, filePath, hotelId, roomId, buffer, mimeType }) => {
  await ensureMediaTable();
  await pool.query(
    `INSERT INTO media_files (url, file_id, file_path, hotel_id, room_id, storage, mime_type, byte_size, data)
     VALUES ($1, $2, $3, $4, $5, 'imagekit', $6, $7, $8)
     ON CONFLICT (url) DO UPDATE
       SET data = COALESCE(EXCLUDED.data, media_files.data),
           mime_type = COALESCE(EXCLUDED.mime_type, media_files.mime_type),
           byte_size = COALESCE(EXCLUDED.byte_size, media_files.byte_size)`,
    [url, fileId || null, filePath || null, hotelId || null, roomId || null,
      mimeType || null, buffer ? buffer.length : null, buffer || null]
  );
};

/** Store an image only in Postgres (ImageKit unavailable). Returns its URL. */
const saveImageToDatabase = async ({ buffer, mimeType, hotelId, roomId }) => {
  await ensureMediaTable();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const placeholder = `pending:${Date.now()}:${Math.random().toString(36).slice(2)}`;
    const inserted = await client.query(
      `INSERT INTO media_files (url, hotel_id, room_id, storage, mime_type, byte_size, data)
       VALUES ($1, $2, $3, 'db', $4, $5, $6) RETURNING id`,
      [placeholder, hotelId || null, roomId || null, mimeType, buffer.length, buffer]
    );
    const id = inserted.rows[0].id;
    const url = `${DB_MEDIA_PREFIX}${id}`;
    await client.query('UPDATE media_files SET url = $1 WHERE id = $2', [url, id]);
    await client.query('COMMIT');
    return { url, fileId: null, filePath: null };
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
};

/** Store a fallback copy of an existing (legacy) ImageKit photo. */
const saveFallbackCopy = async ({ url, buffer, mimeType, hotelId, roomId }) => {
  await ensureMediaTable();
  await pool.query(
    `INSERT INTO media_files (url, hotel_id, room_id, storage, mime_type, byte_size, data)
     VALUES ($1, $2, $3, 'imagekit', $4, $5, $6)
     ON CONFLICT (url) DO UPDATE
       SET data = EXCLUDED.data, mime_type = EXCLUDED.mime_type, byte_size = EXCLUDED.byte_size`,
    [url, hotelId || null, roomId || null, mimeType, buffer.length, buffer]
  );
};

const readMediaById = async (id) => {
  await ensureMediaTable();
  const r = await pool.query('SELECT mime_type, data FROM media_files WHERE id = $1 AND data IS NOT NULL', [id]);
  return r.rows[0] || null;
};

const readMediaByUrl = async (url) => {
  await ensureMediaTable();
  const clean = stripImageKitTransform(String(url || ''));
  const r = await pool.query('SELECT mime_type, data FROM media_files WHERE url = $1 AND data IS NOT NULL', [clean]);
  return r.rows[0] || null;
};

// True if any hotel or room still references the URL (exact element match;
// to_jsonb handles jsonb and text[] columns alike).
const isStillReferenced = async (url) => {
  const checks = [
    `SELECT 1 FROM hotels WHERE to_jsonb(images) @> jsonb_build_array($1::text) OR image = $1 LIMIT 1`,
    `SELECT 1 FROM rooms WHERE to_jsonb(images) @> jsonb_build_array($1::text) LIMIT 1`,
  ];
  for (const sql of checks) {
    try {
      const r = await pool.query(sql, [url]);
      if (r.rowCount > 0) return true;
    } catch (_e) {
      // Column missing on this schema: be conservative and keep the file.
      return true;
    }
  }
  return false;
};

/**
 * Remove admin-uploaded images among `urls` that nothing references any more:
 * deletes the ImageKit file (if any) and the database copy. Best-effort; call
 * after the DB write has committed.
 */
const cleanupRemovedImages = async (urls) => {
  const list = [...new Set((urls || []).map((u) => stripImageKitTransform(String(u || ''))).filter(Boolean))];
  if (!list.length) return;
  try {
    await ensureMediaTable();
    for (const url of list) {
      const row = (await pool.query('SELECT id, file_id FROM media_files WHERE url = $1', [url])).rows[0];
      if (!row) continue; // not tracked: never delete
      if (await isStillReferenced(url)) continue;
      const ok = row.file_id ? await deleteFromImageKit(row.file_id) : true;
      if (ok) await pool.query('DELETE FROM media_files WHERE id = $1', [row.id]);
    }
  } catch (err) {
    console.warn('[media] cleanup skipped:', err.message);
  }
};

module.exports = {
  DB_MEDIA_PREFIX,
  ensureMediaTable,
  recordImageKitUpload,
  saveImageToDatabase,
  saveFallbackCopy,
  readMediaById,
  readMediaByUrl,
  cleanupRemovedImages,
};
