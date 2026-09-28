/**
 * One-time backfill: store REAL ImageKit URLs in the database.
 *
 * Until now hotel photos were found by guessing
 *   {IMAGEKIT_ENDPOINT}{IMAGEKIT_FOLDER}/{slug}/picture-{N}.png
 * and some guesses point at files that don't exist. This script checks which
 * of those files really exist on ImageKit and saves them:
 *   • hotels.images  (jsonb, ordered; first = cover) and hotels.image (cover)
 *     for hotels that don't have a saved gallery yet
 *   • rooms.images   drops ImageKit URLs that return 404
 *
 * With --copy it also stores a database copy (1600px JPEG, ~150-300 KB) of
 * every hotel/room photo, so the site can still show them if ImageKit stops
 * delivering (e.g. the free plan's monthly bandwidth runs out).
 *
 * Nothing is uploaded, moved or deleted on ImageKit. Galleries an admin has
 * already saved are left alone (but still get copies with --copy).
 *
 * Usage (from the project root, with DATABASE_URL pointing at the target DB):
 *   node scripts/backfillImageKitUrls.js                  # dry run, prints the plan
 *   node scripts/backfillImageKitUrls.js --apply          # writes the changes
 *   node scripts/backfillImageKitUrls.js --apply --copy   # + database fallback copies
 */

require('dotenv').config();
const pool = require('../db');
const { resolveSlug } = require('../utils/imageKit');
const { saveFallbackCopy, ensureMediaTable } = require('../utils/mediaFiles');

const APPLY = process.argv.includes('--apply');
const COPY = process.argv.includes('--copy');
const MAX_PICTURES = 8;
const ENDPOINT = String(process.env.IMAGEKIT_ENDPOINT || 'https://ik.imagekit.io/UnitedHotels').replace(/\/+$/, '');
const FOLDER = `/${String(process.env.IMAGEKIT_FOLDER || '/hotels').replace(/^\/+|\/+$/g, '')}`;

const existsCache = new Map();
// Ask for a tiny rendition so the check is cheap; 200 = file exists.
const exists = async (url) => {
  const clean = url.split('?')[0];
  if (existsCache.has(clean)) return existsCache.get(clean);
  let ok = false;
  try {
    const res = await fetch(`${clean}?tr=w-10,h-10`, { method: 'GET' });
    ok = res.ok;
    await res.arrayBuffer().catch(() => null);
  } catch (_e) {
    ok = false;
  }
  existsCache.set(clean, ok);
  return ok;
};

const asList = (value) => {
  let v = value;
  if (typeof v === 'string') {
    try { v = JSON.parse(v); } catch (_e) { v = [v]; }
  }
  return Array.isArray(v) ? v.filter((u) => typeof u === 'string' && u.trim()) : [];
};

const main = async () => {
  console.log(`${APPLY ? 'APPLY' : 'DRY RUN'} · ImageKit ${ENDPOINT}${FOLDER}\n`);

  if (APPLY) {
    await pool.query(`ALTER TABLE hotels ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb`);
  }
  const hasImagesCol = (await pool.query(
    `SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='hotels' AND column_name='images'`
  )).rowCount > 0;

  // ── Hotels ────────────────────────────────────────────────────────────────
  const hotels = (await pool.query(
    `SELECT id, name${hasImagesCol ? ', images' : ''} FROM hotels ORDER BY id`
  )).rows;

  let hotelsUpdated = 0;
  let hotelsWithout = 0;
  for (const h of hotels) {
    if (asList(h.images).length) {
      console.log(`  hotel ${h.id} ${h.name}: already has a saved gallery, skipped`);
      continue;
    }
    const slug = resolveSlug({ id: h.id, name: h.name });
    const found = [];
    if (slug) {
      for (let n = 1; n <= MAX_PICTURES; n++) {
        const url = `${ENDPOINT}${FOLDER}/${slug}/picture-${n}.png`;
        if (await exists(url)) found.push(url);
        else if (n > 3) break; // folders were seeded with up to 3; stop at first gap after that
      }
    }
    if (!found.length) {
      hotelsWithout += 1;
      console.log(`  hotel ${h.id} ${h.name}: no photos found (folder "${slug}")`);
      continue;
    }
    console.log(`  hotel ${h.id} ${h.name}: ${found.length} photo(s) in "${slug}"`);
    if (APPLY) {
      await pool.query(
        `UPDATE hotels SET images = $1::jsonb, image = $2 WHERE id = $3`,
        [JSON.stringify(found), found[0], h.id]
      );
    }
    hotelsUpdated += 1;
  }

  // ── Rooms ─────────────────────────────────────────────────────────────────
  const roomImagesType = (await pool.query(
    `SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='rooms' AND column_name='images'`
  )).rows[0]?.data_type;

  let roomsUpdated = 0;
  let brokenRemoved = 0;
  if (roomImagesType) {
    const rooms = (await pool.query(`SELECT id, hotel_id, images FROM rooms ORDER BY id`)).rows;
    for (const r of rooms) {
      const list = asList(r.images);
      if (!list.length) continue;
      const kept = [];
      for (const url of list) {
        const isImageKit = url.startsWith('https://ik.imagekit.io/') || url.startsWith(ENDPOINT);
        if (!isImageKit || await exists(url)) kept.push(url.split('?')[0]);
      }
      const removed = list.length - kept.length;
      if (!removed) continue;
      brokenRemoved += removed;
      roomsUpdated += 1;
      console.log(`  room ${r.id} (hotel ${r.hotel_id}): removing ${removed} missing photo(s)`);
      if (APPLY) {
        if (roomImagesType === 'ARRAY') {
          await pool.query(`UPDATE rooms SET images = $1 WHERE id = $2`, [kept, r.id]);
        } else {
          await pool.query(`UPDATE rooms SET images = $1::jsonb WHERE id = $2`, [JSON.stringify(kept), r.id]);
        }
      }
    }
  }

  // ── Database fallback copies ─────────────────────────────────────────────
  let copied = 0;
  let copyFailed = 0;
  if (COPY && APPLY) {
    await ensureMediaTable();
    const targets = new Map(); // clean url -> { hotelId, roomId }
    const hotelRows = (await pool.query(`SELECT id, images FROM hotels`)).rows;
    for (const h of hotelRows) {
      for (const u of asList(h.images)) targets.set(u.split('?')[0], { hotelId: h.id, roomId: null });
    }
    if (roomImagesType) {
      const roomRows = (await pool.query(`SELECT id, hotel_id, images FROM rooms`)).rows;
      for (const r of roomRows) {
        for (const u of asList(r.images)) {
          const clean = u.split('?')[0];
          if (!targets.has(clean)) targets.set(clean, { hotelId: r.hotel_id, roomId: r.id });
        }
      }
    }
    const have = new Set(
      (await pool.query(`SELECT url FROM media_files WHERE data IS NOT NULL`)).rows.map((r) => r.url)
    );
    for (const [url, ref] of targets) {
      const isImageKit = url.startsWith('https://ik.imagekit.io/') || url.startsWith(ENDPOINT);
      if (!isImageKit || have.has(url)) continue;
      try {
        const res = await fetch(`${url}?tr=w-1600,q-80,f-jpg`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buffer = Buffer.from(await res.arrayBuffer());
        await saveFallbackCopy({ url, buffer, mimeType: res.headers.get('content-type') || 'image/jpeg', ...ref });
        copied += 1;
      } catch (err) {
        copyFailed += 1;
        console.log(`  copy failed for ${url}: ${err.message}`);
      }
    }
  }

  console.log('\n────────────────────────────────────────');
  console.log(`Hotels given a saved gallery: ${hotelsUpdated}`);
  console.log(`Hotels with no photos found:  ${hotelsWithout}`);
  console.log(`Rooms cleaned:                ${roomsUpdated} (${brokenRemoved} missing photo links removed)`);
  if (COPY) {
    console.log(APPLY
      ? `Database copies saved:        ${copied}${copyFailed ? ` (${copyFailed} failed)` : ''}`
      : 'Database copies: add --apply to save them.');
  }
  console.log(APPLY ? 'Changes written.' : 'Dry run only. Re-run with --apply to write these changes.');
  await pool.end();
};

main().catch(async (err) => {
  console.error('Backfill failed:', err.message);
  try { await pool.end(); } catch (_e) { /* ignore */ }
  process.exit(1);
});
