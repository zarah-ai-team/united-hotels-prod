/**
 * db.js — In-Memory SQLite mock (pg Pool-compatible API)
 *
 * Boots an in-memory SQLite3 database, creates all required tables,
 * seeds hotel data from hotels.json, and exports a pg Pool-shaped object
 * so all existing controllers work without modification.
 *
 * Complex PostgreSQL-only queries (LEFT JOIN LATERAL, json_agg,
 * json_build_object) are detected and replaced with equivalent SQLite logic.
 */

const Database   = require('better-sqlite3');
const path       = require('path');
const fs         = require('fs');

// ─── Bootstrap ────────────────────────────────────────────────────────────────

const db = new Database(':memory:');
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Schema ───────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    email         TEXT    NOT NULL UNIQUE,
    password      TEXT    NOT NULL,
    "phoneNumber" TEXT,
    "isAdmin"     INTEGER NOT NULL DEFAULT 0,
    "isManager"   INTEGER NOT NULL DEFAULT 0,
    verified_at   TEXT,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  -- Audit log for every transactional email attempt (welcome / verify /
  -- reset / booking confirmation / password changed). Populated by
  -- utils/emails/client.js so we can show the most recent sends in the
  -- admin panel and debug Resend failures without scraping logs.
  CREATE TABLE IF NOT EXISTS email_logs (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    type          TEXT    NOT NULL,
    recipient     TEXT    NOT NULL,
    subject       TEXT,
    status        TEXT    NOT NULL DEFAULT 'pending',
    provider_id   TEXT,
    error_message TEXT,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS hotels (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    hotel_name         TEXT    NOT NULL,
    information_raw    TEXT,
    total_rooms        INTEGER,
    contact_raw        TEXT,
    contact_name       TEXT,
    contact_phone      TEXT,
    location_raw       TEXT    NOT NULL DEFAULT '',
    email              TEXT,
    hotel_link         TEXT,
    star_rating        INTEGER,
    property_label_raw TEXT,
    hotel_description  TEXT,
    check_in_time      TEXT,
    check_out_time     TEXT,
    check_in_out_raw   TEXT,
    child_policy       TEXT,
    pet_policy         TEXT,
    smoking_policy     TEXT,
    google_maps_link   TEXT,
    amenities          TEXT,
    status             TEXT    NOT NULL DEFAULT 'active',
    manager_id         INTEGER,
    created_at         TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at         TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS hotel_room_categories (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    hotel_id       INTEGER NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    room_name      TEXT,
    room_category  TEXT,
    occupancy_code TEXT,
    occupancy_type TEXT    NOT NULL DEFAULT 'unknown',
    base_price     REAL,
    currency_code  TEXT    NOT NULL DEFAULT 'TRY',
    price_raw      TEXT,
    created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at     TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS amenity_types (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT    NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS hotel_amenities (
    hotel_id        INTEGER NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    amenity_type_id INTEGER NOT NULL REFERENCES amenity_types(id) ON DELETE RESTRICT,
    PRIMARY KEY (hotel_id, amenity_type_id)
  );

  CREATE TABLE IF NOT EXISTS rooms (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    hotel_id        INTEGER NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    room_number     TEXT    NOT NULL DEFAULT '',
    category        TEXT    NOT NULL DEFAULT 'standard',
    max_count       INTEGER NOT NULL DEFAULT 1,
    price_per_night REAL    NOT NULL DEFAULT 0,
    is_available    INTEGER NOT NULL DEFAULT 1,
    total_rooms     INTEGER,
    available_rooms INTEGER,
    images          TEXT    NOT NULL DEFAULT '[]',
    currentbookings TEXT    NOT NULL DEFAULT '[]',
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    room            TEXT,
    roomid          INTEGER REFERENCES rooms(id),
    hotelid         INTEGER REFERENCES hotels(id),
    userid          INTEGER REFERENCES users(id),
    fromdate        TEXT,
    todate          TEXT,
    totalamount     REAL,
    totaldays       INTEGER,
    status          TEXT    NOT NULL DEFAULT 'booked',
    transactionid   TEXT,
    payment_mode    TEXT,
    special_request TEXT,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

// ─── Schema migration: add Mayank's seedNeon columns ─────────────────────────
//
// Mayank's controllers query columns like `name`, `district`, `address`,
// `rating`, `slug`, `min_price`, `max_price`, etc. Add them idempotently so
// the SQLite mock matches the production Postgres schema.

const addColumn = (table, col, type) => {
  try {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`);
  } catch (_e) {
    // Column already exists — fine.
  }
};

addColumn('hotels', 'name',          'TEXT');
addColumn('hotels', 'location',      'TEXT');
addColumn('hotels', 'district',      'TEXT');
addColumn('hotels', 'address',       'TEXT');
addColumn('hotels', 'description',   'TEXT');
addColumn('hotels', 'rating',        'REAL');
addColumn('hotels', '"reviewCount"', 'INTEGER DEFAULT 0');
addColumn('hotels', '"totalRooms"',  'INTEGER');
addColumn('hotels', 'image',         'TEXT');
addColumn('hotels', 'slug',          'TEXT');
addColumn('hotels', 'contact',       'TEXT');
addColumn('hotels', 'role',          'TEXT');
addColumn('hotels', 'vendor_id',     'INTEGER');

addColumn('rooms', 'name',          'TEXT');
addColumn('rooms', 'occupancy_type', 'TEXT');
addColumn('rooms', 'min_price',      'REAL');
addColumn('rooms', 'max_price',      'REAL');
addColumn('rooms', 'currency_code',  'TEXT DEFAULT \'USD\'');
addColumn('rooms', 'description',    'TEXT');

addColumn('users', 'role',           'TEXT NOT NULL DEFAULT \'user\'');
addColumn('users', 'country',        'TEXT');

// Mayank's admin/dashboard expects a `payments` table for revenue rollups.
// The mock skips it normally; create it here so the dashboard query succeeds.
db.exec(`
  CREATE TABLE IF NOT EXISTS payments (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id    INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    amount        REAL    NOT NULL DEFAULT 0,
    status        TEXT    NOT NULL DEFAULT 'paid',
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

// ─── Seed from frontendHotels.json (Mayank's 39-hotel dataset) ────────────────
//
// Mirrors scripts/seedNeon.js: each hotel gets 3 room tiers (Standard,
// Superior, Deluxe) with prices in USD, scaled by location tier, and image
// URLs pointing at the production ImageKit CDN.

const IMAGEKIT_BASE = 'https://ik.imagekit.io/UnitedHotels/hotels';

const ROOM_TEMPLATES = [
  { suffix: 'standard', name: 'Standard Room', category: 'standard',
    occupancyType: 'double', bedType: 'Double Bed', size: '18 m²', maxGuests: 2, pictureIndex: 2,
    description: 'Cozy room with modern furnishings and all essentials for a comfortable stay.',
    amenities: ['Free WiFi', 'Air Conditioning', 'Minibar', 'Safe', 'Flat-screen TV'],
    basePriceUsd: 75, minBandPct: 0.85, maxBandPct: 1.30 },
  { suffix: 'superior', name: 'Superior Room', category: 'superior',
    occupancyType: 'double', bedType: 'Queen Bed', size: '22 m²', maxGuests: 2, pictureIndex: 3,
    description: 'Spacious room with upgraded décor and partial city or sea views from the upper floors.',
    amenities: ['Free WiFi', 'Air Conditioning', 'Minibar', 'Safe', 'Flat-screen TV', 'City View'],
    basePriceUsd: 100, minBandPct: 0.85, maxBandPct: 1.30 },
  { suffix: 'deluxe',   name: 'Deluxe Room',   category: 'deluxe',
    occupancyType: 'double', bedType: 'King Bed',  size: '26 m²', maxGuests: 2, pictureIndex: 2,
    description: 'Premium room with the best views, generous space, and luxury amenities for a memorable stay.',
    amenities: ['Free WiFi', 'Air Conditioning', 'Minibar', 'Safe', 'Flat-screen TV', 'Premium View', 'Bathrobe & Slippers'],
    basePriceUsd: 130, minBandPct: 0.85, maxBandPct: 1.35 },
];

const locationTierMultiplier = (loc = '') => {
  const l = String(loc).toLowerCase();
  if (l.includes('sultanahmet') || l.includes('cankurtaran')) return 1.15;
  if (l.includes('galata')) return 1.20;
  if (l.includes('karaköy') || l.includes('karakoy')) return 1.10;
  if (l.includes('sirkeci')) return 1.00;
  if (l.includes('beyoğlu') || l.includes('beyoglu') || l.includes('pera')) return 0.95;
  return 1.00;
};

const round2 = (n) => Number(Number(n).toFixed(2));

const frontendHotelsPath = path.join(__dirname, 'frontendHotels.json');
if (fs.existsSync(frontendHotelsPath)) {
  const hotels = JSON.parse(fs.readFileSync(frontendHotelsPath, 'utf8'));

  const insertHotel = db.prepare(`
    INSERT INTO hotels (
      hotel_name, name, slug, location_raw, location, district, address,
      hotel_description, description, rating, "reviewCount", "totalRooms",
      total_rooms, contact_phone, contact, contact_name, email, image,
      amenities, status
    ) VALUES (
      @hotel_name, @name, @slug, @location, @location, @district, @address,
      @description, @description, @rating, @reviewCount, @totalRooms,
      @totalRooms, @contact, @contact, @contactPerson, @email, @image,
      @amenities, 'active'
    )
  `);

  const insertRoom = db.prepare(`
    INSERT INTO rooms (
      hotel_id, name, room_number, category, occupancy_type,
      max_count, price_per_night, min_price, max_price, currency_code,
      description, total_rooms, available_rooms, is_available, images
    ) VALUES (
      @hotel_id, @name, @name, @category, @occupancy_type,
      @max_count, @price_per_night, @min_price, @max_price, 'USD',
      @description, @total_rooms, @total_rooms, 1, @images
    )
  `);

  // Mirror each room into hotel_room_categories — the controller queries that
  // table first when present, so we keep both populated so either code path
  // returns the same Standard/Superior/Deluxe trio.
  const insertRoomCategory = db.prepare(`
    INSERT INTO hotel_room_categories (
      hotel_id, room_name, room_category, occupancy_type,
      base_price, currency_code, price_raw
    ) VALUES (
      @hotel_id, @name, @category, @occupancy_type,
      @price_per_night, 'USD', @price_raw
    )
  `);

  const defaultAmenities = JSON.stringify([
    'Free WiFi', 'Breakfast', 'Air Conditioning',
    '24/7 Front Desk', 'Room Service', 'Laundry Service',
  ]);

  const seedAll = db.transaction((hotels) => {
    for (const h of hotels) {
      const tierMul = locationTierMultiplier(h.location);
      const slug = h.id;
      const result = insertHotel.run({
        hotel_name:    h.name,
        name:          h.name,
        slug,
        location:      h.location || '',
        district:      h.district || null,
        address:       h.address || null,
        description:   h.description || null,
        rating:        Number.isFinite(h.rating) ? h.rating : 4,
        reviewCount:   Number.isFinite(h.reviewCount) ? h.reviewCount : 250,
        totalRooms:    Number.isFinite(h.totalRooms) ? h.totalRooms : null,
        contact:       h.contact || null,
        contactPerson: h.contactPerson || null,
        email:         h.email || null,
        image:         `${IMAGEKIT_BASE}/${slug}/picture-1.png`,
        amenities:     defaultAmenities,
      });
      const hotelId = result.lastInsertRowid;

      for (const tpl of ROOM_TEMPLATES) {
        const basePrice = round2(tpl.basePriceUsd * tierMul);
        const minPrice  = round2(basePrice * tpl.minBandPct);
        const maxPrice  = round2(basePrice * tpl.maxBandPct);
        const totalRoomsForTier = Math.max(1, Math.floor((h.totalRooms || 30) / ROOM_TEMPLATES.length));
        const desc = `${tpl.bedType} • ${tpl.size} • ${tpl.amenities.join(', ')} — ${tpl.description}`;
        insertRoom.run({
          hotel_id:        hotelId,
          name:            tpl.name,
          category:        tpl.category,
          occupancy_type:  tpl.occupancyType,
          max_count:       tpl.maxGuests,
          price_per_night: basePrice,
          min_price:       minPrice,
          max_price:       maxPrice,
          description:     desc,
          total_rooms:     totalRoomsForTier,
          images:          JSON.stringify([`${IMAGEKIT_BASE}/${slug}/picture-${tpl.pictureIndex}.png`]),
        });
        insertRoomCategory.run({
          hotel_id:        hotelId,
          name:            tpl.name,
          category:        tpl.category,
          occupancy_type:  tpl.occupancyType,
          price_per_night: basePrice,
          price_raw:       `$${basePrice}/night`,
        });
      }
    }
  });

  seedAll(hotels);
  console.log(`[Mock DB] Seeded ${hotels.length} hotels from frontendHotels.json (3 rooms each)`);
}

// ─── Seed admin user ──────────────────────────────────────────────────────────

try {
  const bcrypt  = require('bcrypt');
  const adminHash  = bcrypt.hashSync('admin123', 10);
  const vendorHash = bcrypt.hashSync('vendor123', 10);
  const userHash   = bcrypt.hashSync('user123', 10);

  // Seed the canonical admin so the dashboard's role tally has an admin in it.
  db.prepare(`
    INSERT OR IGNORE INTO users (name, email, password, "isAdmin", "isManager", role)
    VALUES ('Admin User', 'admin@unitedhotels.com', ?, 1, 1, 'admin')
  `).run(adminHash);

  // A demo vendor + a regular user so usersByRole shows non-zero counts on
  // first boot. Real signups via /auth/register replace these as needed.
  db.prepare(`
    INSERT OR IGNORE INTO users (name, email, password, "isAdmin", "isManager", role)
    VALUES ('Demo Vendor', 'vendor@unitedhotels.com', ?, 0, 1, 'vendor')
  `).run(vendorHash);

  db.prepare(`
    INSERT OR IGNORE INTO users (name, email, password, "isAdmin", "isManager", role)
    VALUES ('Demo Guest', 'guest@unitedhotels.com', ?, 0, 0, 'user')
  `).run(userHash);
} catch (_e) {
  // bcrypt unavailable — seed a placeholder; login won't work but other routes will
}

// `country` column is needed by getBookingsByCountry. Add it lazily so the
// real booking flow can populate it without errors.
addColumn('bookings', 'country', 'TEXT');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build room JSON for a hotel by querying hotel_room_categories.
 * Returns an array suitable for the `rooms` field that controllers expect.
 */
function buildRoomsForHotel(hotelId) {
  const cats = db.prepare(`
    SELECT * FROM hotel_room_categories WHERE hotel_id = ? ORDER BY id
  `).all(hotelId);

  return cats.map((rc) => ({
    id:             rc.id,
    hotel_id:       rc.hotel_id,
    room_name:      rc.room_name,
    room_category:  rc.room_category,
    occupancy_code: rc.occupancy_code,
    occupancy_type: rc.occupancy_type,
    base_price:     rc.base_price,
    currency_code:  rc.currency_code,
    price_raw:      rc.price_raw,
    category:       rc.room_category,
    max_count:      null,
    total_rooms:    null,
    available_rooms: null,
    price_per_night: rc.base_price,
    vendor_id:      null,
    tax_percent:    null,
    tax_amount:     null,
    is_available:   true,
    images:         [],
    room_number:    rc.room_name,
    created_at:     rc.created_at,
    updated_at:     rc.updated_at,
  }));
}

/**
 * Attach rooms to an array of hotel rows (in-memory join to replace LATERAL).
 */
function attachRooms(hotelRows) {
  return hotelRows.map((h) => {
    const rooms = buildRoomsForHotel(h.id);
    return { ...h, rooms };
  });
}

// ─── Query Translator ─────────────────────────────────────────────────────────

/**
 * Detect PostgreSQL LATERAL join / json_agg / json_build_object queries
 * (used by hotels controller's fetchHotels) and execute them as plain
 * SQLite SELECT + in-process room attachment.
 *
 * The outer SQL shape is always:
 *   SELECT base.*, COALESCE(room_data.rooms, '[]'::json) AS rooms
 *   FROM (
 *     SELECT h.* FROM hotels h [WHERE ...] ORDER BY ... LIMIT $N OFFSET $M
 *   ) base
 *   LEFT JOIN LATERAL (...) room_data ON true
 *   ORDER BY ...
 *
 * params are passed in order: [...whereParams, limitVal, offsetVal]
 */
function tryHandleLateralQuery(sql, params) {
  if (!/LEFT\s+JOIN\s+LATERAL/i.test(sql) && !/json_agg/i.test(sql)) {
    return null;
  }

  // Pull WHERE filters from the base subquery
  // The status filter looks like:  h."status" = $1   (always first param)
  // manager_id filter might follow: h."manager_id" = $2
  // LIMIT is second-to-last param, OFFSET is last param
  const whereParts   = [];
  const sqliteParams = [];

  const idIdx       = (sql.match(/h\.\s*["']?id["']?\s*=\s*\$(\d+)/i)        || [])[1];
  const statusIdx   = (sql.match(/h\.\s*["']?status["']?\s*=\s*\$(\d+)/i)    || [])[1];
  const managerIdx  = (sql.match(/h\.\s*["']?manager_id["']?\s*=\s*\$(\d+)/i) || [])[1];
  const limitIdx    = (sql.match(/LIMIT\s+\$(\d+)/i)  || [])[1];
  const offsetIdx   = (sql.match(/OFFSET\s+\$(\d+)/i) || [])[1];
  const limitLitMatch  = sql.match(/LIMIT\s+(\d+)\b/i);
  const offsetLitMatch = sql.match(/OFFSET\s+(\d+)\b/i);

  if (idIdx !== undefined) {
    const val = params[parseInt(idIdx, 10) - 1];
    if (val !== undefined) { whereParts.push('id = ?'); sqliteParams.push(val); }
  }
  if (statusIdx !== undefined) {
    const val = params[parseInt(statusIdx, 10) - 1];
    if (val !== undefined) { whereParts.push('status = ?'); sqliteParams.push(val); }
  }
  if (managerIdx !== undefined) {
    const val = params[parseInt(managerIdx, 10) - 1];
    if (val !== undefined) { whereParts.push('manager_id = ?'); sqliteParams.push(val); }
  }

  const limitVal  = limitIdx  !== undefined ? (parseInt(params[parseInt(limitIdx,  10) - 1], 10) || 50)
                  : (limitLitMatch  ? parseInt(limitLitMatch[1],  10) : 50);
  const offsetVal = offsetIdx !== undefined ? (parseInt(params[parseInt(offsetIdx, 10) - 1], 10) || 0)
                  : (offsetLitMatch ? parseInt(offsetLitMatch[1], 10) : 0);

  sqliteParams.push(limitVal, offsetVal);

  const whereSql  = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';
  const hotelRows = db.prepare(
    `SELECT * FROM hotels ${whereSql} ORDER BY updated_at DESC, id DESC LIMIT ? OFFSET ?`
  ).all(...sqliteParams);

  return { rows: attachRooms(hotelRows), rowCount: hotelRows.length };
}


/**
 * Handle COUNT(*) OVER() window function used for pagination totals.
 * Returns { rows, rowCount } with a `total_count` column added to each row.
 */
function tryHandleWindowCount(sql, params) {
  if (!/COUNT\(\*\)\s+OVER\s*\(\)/i.test(sql)) return null;

  // Strip the window function and execute the base query, then add total_count
  const stripped = sql.replace(/,\s*COUNT\(\*\)\s+OVER\s*\(\)\s+AS\s+\w+/gi, '');
  try {
    const result = runQuery(stripped, params);
    const total  = result.rows.length; // approximate for mock
    result.rows  = result.rows.map((r) => ({ ...r, total_count: total }));
    return result;
  } catch (_e) {
    return null;
  }
}

/**
 * Core SQLite query runner.
 * Translates pg placeholders ($1, $2…) → ? and handles pg-only constructs.
 */
function runQuery(sql, params = []) {
  const trim = sql.trim();

  // ── information_schema.tables shim ───────────────────────────────────────
  if (/information_schema\.tables/i.test(trim)) {
    const tnMatch = trim.match(/table_name\s*=\s*\$(\d+)/i);
    const tableName = tnMatch ? String(params[parseInt(tnMatch[1], 10) - 1] || '') : '';
    const exists = tableName
      ? db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(tableName) !== undefined
      : false;
    return { rows: [{ table_exists: exists }], rowCount: 1 };
  }

  // ── information_schema.columns shim ──────────────────────────────────────
  if (/information_schema\.columns/i.test(trim)) {
    const tnParamMatch = trim.match(/table_name\s*=\s*\$(\d+)/i);
    const tnLiteralMatch = trim.match(/table_name\s*=\s*'([^']+)'/i);
    let tableName = '';
    if (tnParamMatch) {
      tableName = String(params[parseInt(tnParamMatch[1], 10) - 1] || '');
    } else if (tnLiteralMatch) {
      tableName = tnLiteralMatch[1];
    } else if (params[0]) {
      tableName = String(params[0]);
    }

    const rows = tableName
      ? db.prepare(`PRAGMA table_info("${tableName}")`).all().map((col) => ({
          column_name:    col.name,
          data_type:      col.type || 'text',
          is_nullable:    col.notnull ? 'NO' : 'YES',
          column_default: col.dflt_value || null,
        }))
      : [];
    return { rows, rowCount: rows.length };
  }

  // ── LATERAL / json_agg / json_build_object → custom handler ─────────────
  const lateralResult = tryHandleLateralQuery(trim, params);
  if (lateralResult) return lateralResult;

  // ── Window function COUNT(*) OVER() ──────────────────────────────────────
  const windowResult = tryHandleWindowCount(trim, params);
  if (windowResult) return windowResult;

  // ── Translate $N → ? ─────────────────────────────────────────────────────
  let s = trim.replace(/\$(\d+)/g, '?');

  // COALESCE with json cast arg — simplify to just first arg for SQLite
  // e.g. COALESCE(room_data.rooms, '[]'::json) → room_data.rooms
  s = s.replace(/COALESCE\s*\([^,]+,\s*'[^']*'::[a-zA-Z]+\)/gi, (m) => {
    const first = m.replace(/^COALESCE\s*\(/i, '').split(',')[0].trim();
    return first;
  });

  // Strip Postgres-specific casts BEFORE aliasing so we don't end up with
  // `COUNT(*)::int AS count` becoming `COUNT(*) AS count AS count`.
  s = s.replace(/::[a-zA-Z_]+(\([^)]*\))?/g, '');

  // Alias COUNT(*) so controllers can do rows[0].count — only when the
  // expression isn't already aliased (e.g. `COUNT(*) AS bookings`).
  s = s.replace(/COUNT\(\*\)(?!\s+(OVER|AS))/gi, 'COUNT(*) AS count');

  // NOW() → SQLite equivalent
  s = s.replace(/\bNOW\(\)/gi, "datetime('now')");

  // Postgres camelCase identifiers → snake_case for the SQLite mock.
  // The Neon production schema uses "createdAt"/"updatedAt"; the mock seeds
  // them as created_at/updated_at, so silently rewrite the references.
  s = s.replace(/"createdAt"/g, 'created_at');
  s = s.replace(/"updatedAt"/g, 'updated_at');

  // Postgres `NULLS LAST` ordering → SQLite handles natively from 3.30+,
  // but strip it just in case the embedded library is older.
  s = s.replace(/\bNULLS\s+(FIRST|LAST)\b/gi, '');

  // FOR UPDATE (no-op in SQLite)
  s = s.replace(/\bFOR\s+UPDATE\b/gi, '');

  // RETURNING clause — capture intent, strip from SQL
  const hasReturning = /\bRETURNING\b/i.test(s);
  if (hasReturning) {
    s = s.replace(/\bRETURNING\b.*/is, '');
  }

  // Transaction keywords
  const upper = s.trim().toUpperCase().replace(/\s*;$/, '');
  if (upper === 'BEGIN')    { db.prepare('BEGIN').run();    return { rows: [], rowCount: 0 }; }
  if (upper === 'COMMIT')   { db.prepare('COMMIT').run();   return { rows: [], rowCount: 0 }; }
  if (upper === 'ROLLBACK') { db.prepare('ROLLBACK').run(); return { rows: [], rowCount: 0 }; }

  // ALTER TABLE — silently ignore (schema already created)
  if (/^\s*ALTER\s+TABLE/i.test(s)) return { rows: [], rowCount: 0 };

  // ── Execute ───────────────────────────────────────────────────────────────
  const isSelect = /^\s*(SELECT|WITH|PRAGMA)/i.test(s);
  const isInsert = /^\s*INSERT/i.test(s);
  const isUpdate = /^\s*UPDATE/i.test(s);
  const isDelete = /^\s*DELETE/i.test(s);

  // SQLite3 only binds numbers, strings, bigints, buffers, and null. Postgres
  // controllers happily pass booleans and Date objects, so coerce them on the
  // way in. Anything else gets stringified as JSON so we don't crash.
  const coerceParam = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'boolean') return value ? 1 : 0;
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object') {
      try { return JSON.stringify(value); } catch { return String(value); }
    }
    return value;
  };
  params = params.map(coerceParam);

  try {
    const stmt = db.prepare(s);

    if (isSelect) {
      const rows = stmt.all(...params);
      // Auto-parse known JSON string columns so controllers get proper arrays/objects
      const jsonCols = ['amenities', 'images', 'currentbookings', 'rooms', 'room_categories'];
      const parsed = rows.map((row) => {
        const out = { ...row };
        for (const col of jsonCols) {
          if (typeof out[col] === 'string' && (out[col].startsWith('[') || out[col].startsWith('{'))) {
            try { out[col] = JSON.parse(out[col]); } catch (_) {}
          }
        }
        return out;
      });
      return { rows: parsed, rowCount: parsed.length };
    }

    if (isInsert) {
      const info = stmt.run(...params);
      let rows = [];
      if (hasReturning && info.lastInsertRowid) {
        const tableMatch = s.match(/INSERT\s+(?:OR\s+\w+\s+)?INTO\s+["']?(\w+)["']?/i);
        if (tableMatch) {
          rows = db.prepare(`SELECT * FROM "${tableMatch[1]}" WHERE rowid = ?`).all(info.lastInsertRowid);
        }
      }
      return { rows, rowCount: info.changes };
    }

    if (isUpdate || isDelete) {
      const info = stmt.run(...params);
      return { rows: [], rowCount: info.changes };
    }

    stmt.run(...params);
    return { rows: [], rowCount: 0 };
  } catch (err) {
    const enhanced = new Error(`[Mock DB] SQL Error: ${err.message}\n  SQL: ${s}`);
    enhanced.code = err.code;
    throw enhanced;
  }
}

// ─── pg Pool–compatible interface ────────────────────────────────────────────

const pool = {
  async query(sql, params = []) {
    return runQuery(sql, params);
  },

  async connect() {
    return {
      async query(sql, params = []) {
        return runQuery(sql, params);
      },
      release() { /* no-op */ },
    };
  },

  on(event, handler) {
    if (event === 'connect') setTimeout(handler, 100);
  },
};

console.log('[Mock DB] In-memory SQLite database ready ✔');

module.exports = pool;
