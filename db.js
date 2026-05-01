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

// ─── Seed from hotels.json ────────────────────────────────────────────────────

const hotelsJsonPath = path.join(__dirname, 'hotels.json');
if (fs.existsSync(hotelsJsonPath)) {
  const hotels = JSON.parse(fs.readFileSync(hotelsJsonPath, 'utf8'));

  const insertHotel = db.prepare(`
    INSERT INTO hotels (
      hotel_name, information_raw, total_rooms, contact_raw, contact_name,
      contact_phone, location_raw, email, hotel_link, star_rating,
      property_label_raw, hotel_description, check_in_time, check_out_time,
      check_in_out_raw, child_policy, pet_policy, smoking_policy,
      google_maps_link, amenities, status, manager_id
    ) VALUES (
      @hotel_name, @information_raw, @total_rooms, @contact_raw, @contact_name,
      @contact_phone, @location_raw, @email, @hotel_link, @star_rating,
      @property_label_raw, @hotel_description, @check_in_time, @check_out_time,
      @check_in_out_raw, @child_policy, @pet_policy, @smoking_policy,
      @google_maps_link, @amenities, @status, @manager_id
    )
  `);

  const insertRoomCategory = db.prepare(`
    INSERT INTO hotel_room_categories (hotel_id, room_name, room_category,
      occupancy_code, occupancy_type, base_price, currency_code, price_raw)
    VALUES (@hotel_id, @room_name, @room_category, @occupancy_code,
      @occupancy_type, @base_price, @currency_code, @price_raw)
  `);

  const insertRoom = db.prepare(`
    INSERT INTO rooms (hotel_id, room_number, category, max_count,
      price_per_night, is_available, total_rooms, available_rooms)
    VALUES (@hotel_id, @room_number, @category, @max_count,
      @price_per_night, 1, @total_rooms, @total_rooms)
  `);

  const seedAll = db.transaction((hotels) => {
    for (const h of hotels) {
      const res = insertHotel.run({
        hotel_name:         h.hotel_name         || '',
        information_raw:    h.information_raw    || null,
        total_rooms:        h.total_rooms        || null,
        contact_raw:        h.contact_raw        || null,
        contact_name:       h.contact_name       || null,
        contact_phone:      h.contact_phone      || null,
        location_raw:       h.location_raw       || '',
        email:              h.email              || null,
        hotel_link:         h.hotel_link         || null,
        star_rating:        h.star_rating        || null,
        property_label_raw: h.property_label_raw || null,
        hotel_description:  h.hotel_description  || null,
        check_in_time:      h.check_in_time      || null,
        check_out_time:     h.check_out_time     || null,
        check_in_out_raw:   h.check_in_out_raw   || null,
        child_policy:       h.child_policy       || null,
        pet_policy:         h.pet_policy         || null,
        smoking_policy:     h.smoking_policy     || null,
        google_maps_link:   h.google_maps_link   || null,
        amenities:          JSON.stringify(h.amenities || []),
        status:             h.status             || 'active',
        manager_id:         h.manager_id         || null,
      });

      const hotelId = res.lastInsertRowid;

      if (Array.isArray(h.room_categories)) {
        for (const rc of h.room_categories) {
          insertRoomCategory.run({
            hotel_id:       hotelId,
            room_name:      rc.room_name      || null,
            room_category:  rc.room_category  || 'unknown',
            occupancy_code: rc.occupancy_code || null,
            occupancy_type: rc.occupancy_type || 'unknown',
            base_price:     rc.base_price     || null,
            currency_code:  rc.currency_code  || 'TRY',
            price_raw:      rc.price_raw      || null,
          });
          insertRoom.run({
            hotel_id:       hotelId,
            room_number:    rc.room_name      || `${hotelId}-room`,
            category:       rc.room_category  || 'standard',
            max_count:      rc.occupancy_type === 'triple' ? 3 : 2,
            price_per_night: rc.base_price    || 0,
            total_rooms:    h.total_rooms      || 1,
          });
        }
      }
    }
  });

  seedAll(hotels);
  console.log(`[Mock DB] Seeded ${hotels.length} hotels from hotels.json`);
}

// ─── Seed admin user ──────────────────────────────────────────────────────────

try {
  const bcrypt  = require('bcrypt');
  const hash    = bcrypt.hashSync('admin123', 10);
  db.prepare(`
    INSERT OR IGNORE INTO users (name, email, password, "isAdmin", "isManager")
    VALUES ('Admin', 'admin@unitedhotels.com', ?, 1, 1)
  `).run(hash);
} catch (_e) {
  // bcrypt unavailable — seed a placeholder; login won't work but other routes will
}

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

  // Alias COUNT(*) so controllers can do rows[0].count
  s = s.replace(/COUNT\(\*\)(?!\s+OVER)/gi, 'COUNT(*) AS count');

  // COALESCE with json cast arg — simplify to just first arg for SQLite
  // e.g. COALESCE(room_data.rooms, '[]'::json) → room_data.rooms
  s = s.replace(/COALESCE\s*\([^,]+,\s*'[^']*'::[a-zA-Z]+\)/gi, (m) => {
    const first = m.replace(/^COALESCE\s*\(/i, '').split(',')[0].trim();
    return first;
  });

  // Strip Postgres-specific casts
  s = s.replace(/::[a-zA-Z_]+(\([^)]*\))?/g, '');

  // NOW() → SQLite equivalent
  s = s.replace(/\bNOW\(\)/gi, "datetime('now')");

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
