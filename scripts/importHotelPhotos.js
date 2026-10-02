/**
 * Import a folder of hotel photos into the live site.
 *
 * Expected layout (as delivered by the hotels team):
 *   <root>/<Hotel name>/<Room category or "Extra"/"Rest">/<photos>
 *
 * Mapping:
 *   • hotel folder  → hotels row, matched by name (fails if any folder is
 *                     unmatched or ambiguous)
 *   • room folder   → the hotel's Standard / Superior / Deluxe room by keyword
 *                     (standart/single/double/twin/economy/classic → standard,
 *                      superior/comfort/balcony/king → superior,
 *                      deluxe/suite/grand → deluxe); several folders landing on
 *                     the same room are merged
 *   • Extra / Rest  → hotel gallery only
 *
 * Result per hotel:
 *   rooms.images   replaced with that room's new photos (rooms with no folder
 *                  are left untouched)
 *   hotels.images  Extra photos first, then all room photos; hotels.image =
 *                  first of them (cover)
 *
 * Photos go to ImageKit (same folder layout as admin uploads) with a ~1600px
 * JPEG fallback copy in media_files. Nothing is deleted. Uploaded files are
 * remembered in <root>/.import-manifest.json, so a re-run after a failure
 * resumes without uploading duplicates.
 *
 * Usage (project root, .env pointing at the target DB + IMAGEKIT_PRIVATE_KEY):
 *   node scripts/importHotelPhotos.js "<root>"          # dry run, prints the plan
 *   node scripts/importHotelPhotos.js "<root>" --apply  # uploads + writes
 *   node scripts/importHotelPhotos.js "<root>" --apply --disk
 *       # no ImageKit: copies into uploads/hotels/ on this server instead
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pool = require('../db');
const { folderFor, uploadToImageKit, isImageKitUploadConfigured } = require('../utils/imageUpload');
const { recordImageKitUpload, ensureMediaTable } = require('../utils/mediaFiles');

const APPLY = process.argv.includes('--apply');
// --disk: copy into uploads/hotels/ (served at /api/hotels/media/...) instead
// of ImageKit. Run it on the server that hosts the backend.
const DISK = process.argv.includes('--disk');
const MEDIA_ROOT = path.join(__dirname, '..', 'uploads', 'hotels');
const ROOT = process.argv.slice(2).find((a) => !a.startsWith('--'));

const MIME_BY_EXT = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif',
};

const TURKISH_MAP = { 'İ': 'I', 'ı': 'i', 'Ş': 'S', 'ş': 's', 'Ğ': 'G', 'ğ': 'g', 'Ü': 'U', 'ü': 'u', 'Ö': 'O', 'ö': 'o', 'Ç': 'C', 'ç': 'c' };
const normalize = (s) => String(s || '')
  .replace(/[İıŞşĞğÜüÖöÇç]/g, (ch) => TURKISH_MAP[ch] || ch)
  .normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .toLowerCase();

// Words that don't identify a hotel, plus spelling variants seen in the folders.
const STOPWORDS = new Set(['hotel', 'hotels', 'the']);
const SYNONYMS = { centre: 'center', suites: 'suite', bank: 'house' };
const nameTokens = (s) => new Set(
  normalize(s).split(/[^a-z0-9]+/).filter(Boolean)
    .map((t) => SYNONYMS[t] || t)
    .filter((t) => !STOPWORDS.has(t))
);

const matchHotel = (folderName, hotels) => {
  const a = nameTokens(folderName);
  const scored = hotels.map((h) => {
    const b = nameTokens(h.name);
    const common = [...a].filter((t) => b.has(t)).length;
    return { h, score: common / new Set([...a, ...b]).size };
  }).sort((x, y) => y.score - x.score);
  const [best, second] = scored;
  if (!best || best.score < 0.5) return { error: 'no match' };
  if (second && second.score === best.score) {
    return { error: `ambiguous: ${best.h.name} / ${second.h.name}` };
  }
  return { hotel: best.h, score: best.score };
};

const classifyFolder = (name) => {
  const n = normalize(name);
  if (/^(extra|rest)$/.test(n.trim())) return 'hotel';
  if (/deluxe|suite?\b|grand/.test(n)) return 'deluxe';
  if (/superior|comfort|balcony/.test(n)) return 'superior';
  if (/standar|single|double|twin|economy|classic/.test(n)) return 'standard';
  if (/king/.test(n)) return 'superior'; // "King room" alone; "Standart King" is standard
  return null;
};

const roomKind = (room) => {
  const n = normalize(`${room.category || ''} ${room.name || ''}`);
  if (n.includes('deluxe')) return 'deluxe';
  if (n.includes('superior')) return 'superior';
  if (n.includes('standard')) return 'standard';
  return null;
};

const naturalSort = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
const listDirs = (dir) => fs.readdirSync(dir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('.')).map((d) => d.name).sort(naturalSort);
const listImages = (dir) => fs.readdirSync(dir, { withFileTypes: true })
  .filter((d) => d.isFile() && MIME_BY_EXT[path.extname(d.name).toLowerCase()])
  .map((d) => d.name).sort(naturalSort);

// Accept either the hotel folders directly or a single wrapper folder (e.g. "OTEL").
const resolveRoot = (dir) => {
  const subs = listDirs(dir);
  if (subs.length === 1 && listDirs(path.join(dir, subs[0])).length > 1
      && !classifyFolder(listDirs(path.join(dir, subs[0]))[0])) {
    return path.join(dir, subs[0]);
  }
  return dir;
};

const main = async () => {
  if (!ROOT || !fs.existsSync(ROOT)) {
    console.error('Usage: node scripts/importHotelPhotos.js "<photos folder>" [--apply]');
    process.exit(1);
  }
  if (APPLY && !DISK && !isImageKitUploadConfigured()) {
    console.error('IMAGEKIT_PRIVATE_KEY is not set in .env. Set it, or pass --disk to store photos on this server.');
    process.exit(1);
  }

  const root = resolveRoot(path.resolve(ROOT));
  const manifestPath = path.join(root, '.import-manifest.json');
  const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};
  const saveManifest = () => fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`${APPLY ? 'APPLY' : 'DRY RUN'} · ${DISK ? `disk ${MEDIA_ROOT}` : 'ImageKit'} · ${root}\n`);

  const hotels = (await pool.query('SELECT id, name FROM hotels ORDER BY id')).rows;
  const rooms = (await pool.query('SELECT id, hotel_id, name, category FROM rooms ORDER BY id')).rows;

  // ── Build the plan; abort before uploading anything if it isn't clean ──────
  const problems = [];
  const plans = [];
  const claimed = new Map();
  for (const folder of listDirs(root)) {
    const m = matchHotel(folder, hotels);
    if (m.error) { problems.push(`hotel folder "${folder}": ${m.error}`); continue; }
    if (claimed.has(m.hotel.id)) {
      problems.push(`hotel folders "${claimed.get(m.hotel.id)}" and "${folder}" both match ${m.hotel.name}`);
      continue;
    }
    claimed.set(m.hotel.id, folder);

    const hotelRooms = rooms.filter((r) => r.hotel_id === m.hotel.id);
    const plan = { folder, hotel: m.hotel, extra: [], rooms: new Map(), sources: new Map() };
    for (const sub of listDirs(path.join(root, folder))) {
      const kind = classifyFolder(sub);
      if (!kind) { problems.push(`"${folder}/${sub}": can't tell the room type`); continue; }
      const files = listImages(path.join(root, folder, sub)).map((f) => path.join(root, folder, sub, f));
      if (kind === 'hotel') { plan.extra.push(...files); continue; }
      const room = hotelRooms.find((r) => roomKind(r) === kind);
      if (!room) { problems.push(`"${folder}/${sub}": hotel has no ${kind} room`); continue; }
      if (!plan.rooms.has(room.id)) plan.rooms.set(room.id, { room, files: [] });
      plan.rooms.get(room.id).files.push(...files);
      plan.sources.set(room.id, [...(plan.sources.get(room.id) || []), sub]);
    }
    plans.push(plan);
  }

  // Drop byte-identical duplicates ("3.webp" vs "3 (1).webp") within each list.
  const hashOf = (file) => crypto.createHash('sha1').update(fs.readFileSync(file)).digest('hex');
  let dupes = 0;
  const dedupe = (files, seen) => files.filter((f) => {
    const h = hashOf(f);
    if (seen.has(h)) { dupes += 1; return false; }
    seen.add(h);
    return true;
  });
  for (const p of plans) {
    p.extra = dedupe(p.extra, new Set());
    for (const entry of p.rooms.values()) entry.files = dedupe(entry.files, new Set());
  }

  let total = 0;
  for (const p of plans) {
    console.log(`hotel ${p.hotel.id} ${p.hotel.name}  ←  "${p.folder}"`);
    console.log(`    gallery extras: ${p.extra.length}`);
    for (const [roomId, { room, files }] of p.rooms) {
      console.log(`    room ${roomId} ${room.name}: ${files.length}  ←  ${p.sources.get(roomId).map((s) => `"${s}"`).join(' + ')}`);
      total += files.length;
    }
    total += p.extra.length;
  }
  const untouched = hotels.filter((h) => !claimed.has(h.id));
  console.log(`\nHotels without a folder (left as is): ${untouched.map((h) => h.name).join(', ') || 'none'}`);
  console.log(`Photos to import: ${total} (${dupes} duplicate file(s) skipped)`);

  if (problems.length) {
    console.error(`\n${problems.length} problem(s), nothing was changed:\n  - ${problems.join('\n  - ')}`);
    await pool.end();
    process.exit(1);
  }
  if (!APPLY) {
    console.log('\nDry run only. Re-run with --apply to upload and save.');
    await pool.end();
    return;
  }

  // ── Upload + save, one hotel at a time ─────────────────────────────────────
  await ensureMediaTable();
  await pool.query(`ALTER TABLE hotels ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb`);

  const upload = async (file, { hotel, room }) => {
    const hash = hashOf(file);
    const key = `${hotel.id}:${room ? room.id : 'hotel'}:${hash}`;
    if (manifest[key]) return manifest[key];
    const buffer = fs.readFileSync(file);
    const mimetype = MIME_BY_EXT[path.extname(file).toLowerCase()];
    const folder = folderFor({
      hotelId: hotel.id, hotelName: hotel.name,
      roomId: room ? room.id : null, roomLabel: room ? (room.category || room.name) : null,
    });

    if (DISK) {
      // folderFor() starts with the ImageKit base folder ("/hotels"); drop it.
      const rel = folder.split('/').filter(Boolean).slice(1).join('/');
      const name = `${path.parse(file).name.replace(/[^A-Za-z0-9]+/g, '-').slice(0, 40)}-${hash.slice(0, 8)}${path.extname(file).toLowerCase()}`;
      fs.mkdirSync(path.join(MEDIA_ROOT, rel), { recursive: true });
      fs.copyFileSync(file, path.join(MEDIA_ROOT, rel, name));
      manifest[key] = `/api/hotels/media/${rel}/${encodeURIComponent(name)}`;
      saveManifest();
      return manifest[key];
    }

    const ik = await uploadToImageKit({ buffer, mimetype, originalname: path.basename(file) }, folder);

    // Fallback copy: a 1600px JPEG rendition from ImageKit keeps media_files
    // small even for the multi-MB originals; fall back to the original bytes.
    let copy = { buffer, mimeType: mimetype };
    try {
      const res = await fetch(`${ik.url}?tr=w-1600,q-80,f-jpg`, { signal: AbortSignal.timeout(30_000) });
      if (res.ok) copy = { buffer: Buffer.from(await res.arrayBuffer()), mimeType: 'image/jpeg' };
    } catch (_e) { /* keep original bytes */ }

    await recordImageKitUpload({
      ...ik, hotelId: hotel.id, roomId: room ? room.id : null, buffer: copy.buffer, mimeType: copy.mimeType,
    });
    manifest[key] = ik.url;
    saveManifest();
    return ik.url;
  };

  let done = 0;
  for (const p of plans) {
    const extraUrls = [];
    for (const f of p.extra) {
      extraUrls.push(await upload(f, { hotel: p.hotel }));
      process.stdout.write(`\r  uploaded ${++done}/${total}`);
    }
    const roomUrls = new Map();
    for (const [roomId, { room, files }] of p.rooms) {
      const urls = [];
      for (const f of files) {
        urls.push(await upload(f, { hotel: p.hotel, room }));
        process.stdout.write(`\r  uploaded ${++done}/${total}`);
      }
      roomUrls.set(roomId, urls);
    }

    const gallery = [...new Set([...extraUrls, ...[...roomUrls.values()].flat()])];
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const [roomId, urls] of roomUrls) {
        await client.query('UPDATE rooms SET images = $1::jsonb WHERE id = $2', [JSON.stringify(urls), roomId]);
      }
      if (gallery.length) {
        await client.query(
          'UPDATE hotels SET images = $1::jsonb, image = $2 WHERE id = $3',
          [JSON.stringify(gallery), gallery[0], p.hotel.id]
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
    process.stdout.write(`\r  ${p.hotel.name}: saved ${gallery.length} photo(s)${' '.repeat(20)}\n`);
  }

  console.log(`\nDone. ${done} photo(s) imported across ${plans.length} hotel(s).`);
  await pool.end();
};

main().catch(async (err) => {
  console.error('\nImport failed:', err.message);
  console.error('Already-uploaded photos are recorded in the manifest; re-running resumes from here.');
  try { await pool.end(); } catch (_e) { /* ignore */ }
  process.exit(1);
});
