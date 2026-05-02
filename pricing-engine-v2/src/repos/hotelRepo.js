// hotelRepo — read-only access to hotels + rooms / hotel_room_categories.
//
// The merged app's database has both shapes (legacy SQLite + production
// Postgres). We try the columns most likely to exist in each row, falling
// back gracefully when a column is missing — the engine should still run
// against a dev DB seeded with only `hotel_name + base_price`.

import { query } from '../lib/db.js';
import { log } from '../lib/log.js';

/**
 * @param {number|string} id
 * @returns {Promise<{
 *   id: number,
 *   hotelName: string,
 *   district: string|null,
 *   location: string|null,
 *   basePrice: number|null,
 *   currency: string,
 * } | null>}
 */
export async function findHotelById(id) {
  if (id == null) return null;
  // The live Neon schema only has `name`; the legacy SQLite mock (and the
  // older Postgres canonical) had `hotel_name`. Probe the column set once
  // per process so the right SELECT is built.
  const cols = await hotelColumns();
  if (!cols) return null;
  const nameCol = cols.has('name') ? 'name' : cols.has('hotel_name') ? 'hotel_name' : null;
  if (!nameCol) {
    log.warn('hotels table has neither name nor hotel_name column');
    return null;
  }
  const locExpr =
    [cols.has('location') && 'location', cols.has('location_raw') && 'location_raw']
      .filter(Boolean)
      .join(', ') || 'NULL AS location';

  try {
    const { rows } = await query(
      `SELECT id,
              ${nameCol} AS hotel_name,
              ${cols.has('district') ? 'district' : 'NULL AS district'},
              ${locExpr}
         FROM hotels
        WHERE id = $1
        LIMIT 1`,
      [id],
    );
    const row = rows[0];
    if (!row) return null;
    return {
      id: Number(row.id),
      hotelName: row.hotel_name || `Hotel #${id}`,
      district: row.district || null,
      location: row.location || row.location_raw || null,
      basePrice: null, // hotels-level base price is rare; rooms own it.
      currency: 'USD',
    };
  } catch (err) {
    log.debug({ err: err.message, id }, 'hotelRepo.findHotelById failed');
    return null;
  }
}

// Lazy column-set probe so the repo adapts to whichever schema variant
// (legacy hotel_name + location_raw vs Mayank's name + location) is live.
let _hotelCols = null;
async function hotelColumns() {
  if (_hotelCols) return _hotelCols;
  try {
    const { rows } = await query(
      `SELECT column_name
         FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'hotels'`,
    );
    _hotelCols = new Set(rows.map((r) => r.column_name));
    return _hotelCols;
  } catch (err) {
    log.debug({ err: err.message }, 'hotelColumns probe failed');
    return null;
  }
}

/**
 * Resolve the closest room row for a given hotel + (optional) category.
 * Tries `hotel_room_categories` (Postgres canonical) first, then falls back
 * to the legacy `rooms` table (SQLite mock + Mayank seed).
 *
 * @param {number|string} hotelId
 * @param {string|null|undefined} category
 * @returns {Promise<{
 *   roomCategory: string|null,
 *   basePrice: number|null,
 *   minPrice: number|null,
 *   maxPrice: number|null,
 *   currency: string,
 * } | null>}
 */
export async function findRoomCategory(hotelId, category) {
  if (hotelId == null) return null;
  const cat = category ? String(category).toLowerCase().trim() : null;

  // 1. hotel_room_categories — newer normalised table.
  try {
    const { rows } = await query(
      `SELECT room_category,
              room_name,
              base_price,
              currency_code
         FROM hotel_room_categories
        WHERE hotel_id = $1
        ORDER BY base_price ASC NULLS LAST`,
      [hotelId],
    );
    if (rows.length) {
      const matched = cat
        ? rows.find(
            (r) =>
              (r.room_category || '').toLowerCase() === cat ||
              (r.room_name || '').toLowerCase().includes(cat),
          )
        : null;
      const pick = matched || rows[0];
      return {
        roomCategory: pick.room_category || pick.room_name || null,
        basePrice: numOrNull(pick.base_price),
        minPrice: null,
        maxPrice: null,
        currency: (pick.currency_code || 'USD').toUpperCase(),
      };
    }
  } catch (err) {
    log.debug({ err: err.message, hotelId }, 'hotel_room_categories miss');
  }

  // 2. rooms table — Mayank seed + SQLite mock + production rooms.
  try {
    const { rows } = await query(
      `SELECT category,
              name,
              price_per_night,
              min_price,
              max_price,
              currency_code
         FROM rooms
        WHERE hotel_id = $1
        ORDER BY price_per_night ASC NULLS LAST`,
      [hotelId],
    );
    if (rows.length) {
      const matched = cat
        ? rows.find(
            (r) =>
              (r.category || '').toLowerCase() === cat ||
              (r.name || '').toLowerCase().includes(cat),
          )
        : null;
      const pick = matched || rows[0];
      return {
        roomCategory: pick.category || pick.name || null,
        basePrice: numOrNull(pick.price_per_night),
        minPrice: numOrNull(pick.min_price),
        maxPrice: numOrNull(pick.max_price),
        currency: (pick.currency_code || 'USD').toUpperCase(),
      };
    }
  } catch (err) {
    log.debug({ err: err.message, hotelId }, 'rooms table miss');
  }

  return null;
}

function numOrNull(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}
