// bookingRepo — derive an occupancy ratio from the live bookings table.
//
// `occupancyRatio` ∈ [0, 1] is the fraction of hotel capacity that overlaps
// the requested date range. Schema variants seen in the wild:
//
//   • Mayank seed (live Neon): bookings(roomid, fromdate, todate, status)
//     — no direct hotelid; we have to join through rooms.hotel_id.
//   • Legacy SQLite mock     : bookings(hotelid, fromdate, todate, status)
//   • Other Postgres seeds   : bookings(check_in_date, check_out_date, …)
//
// We probe the bookings + rooms column sets once and build a query that
// matches whichever variant is live. If anything is missing, return the
// 0.65 default — better than 500-ing the whole pipeline.

import { query } from '../lib/db.js';
import { log } from '../lib/log.js';

let _bookingCols = null;
let _roomCols = null;

async function columnsFor(table) {
  const { rows } = await query(
    `SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1`,
    [table],
  );
  return new Set(rows.map((r) => r.column_name));
}

async function bookingCols() {
  if (!_bookingCols) _bookingCols = await columnsFor('bookings').catch(() => null);
  return _bookingCols;
}
async function roomCols() {
  if (!_roomCols) _roomCols = await columnsFor('rooms').catch(() => null);
  return _roomCols;
}

/**
 * @param {number|string} hotelId
 * @param {{ checkIn: string, checkOut: string }} range
 * @returns {Promise<number>}  occupancy in [0, 1]
 */
export async function occupancyRatioForHotel(hotelId, range) {
  if (hotelId == null) return 0.65;
  const checkIn = range?.checkIn;
  const checkOut = range?.checkOut;
  if (!checkIn || !checkOut) return 0.65;

  try {
    const bCols = await bookingCols();
    const rCols = await roomCols();
    if (!bCols || !rCols) return 0.65;

    // Capacity: sum of total_rooms when the column exists, else hotels.totalRooms.
    let capacity = 0;
    if (rCols.has('total_rooms')) {
      const cap = await query(
        `SELECT COALESCE(SUM(total_rooms)::int, 0) AS capacity FROM rooms WHERE hotel_id = $1`,
        [hotelId],
      );
      capacity = Number(cap.rows[0]?.capacity) || 0;
    }
    if (capacity <= 0) {
      // Fallback: try hotels.totalRooms or hotels.total_rooms.
      const cap = await query(
        `SELECT COALESCE("totalRooms", total_rooms, 0) AS capacity FROM hotels WHERE id = $1`,
        [hotelId],
      ).catch(() => null);
      capacity = Number(cap?.rows[0]?.capacity) || 0;
    }
    if (capacity <= 0) return 0.65;

    // Pick the right date columns + hotel-id linkage.
    const fromCol = bCols.has('fromdate') ? 'fromdate' : bCols.has('check_in_date') ? 'check_in_date' : null;
    const toCol = bCols.has('todate') ? 'todate' : bCols.has('check_out_date') ? 'check_out_date' : null;
    if (!fromCol || !toCol) return 0.65;

    // The Mayank seed has `bookings.roomid` as varchar holding the integer
    // room id as text — cast both sides to text so the join works regardless
    // of the underlying column type.
    const hotelLinkSql = bCols.has('hotelid')
      ? `b.hotelid::text = $1::text`
      : `b.roomid::text IN (SELECT id::text FROM rooms WHERE hotel_id = $1)`;
    const statusGuard = bCols.has('status')
      ? `AND COALESCE(b.status, 'booked') NOT IN ('cancelled', 'refunded')`
      : '';

    const booked = await query(
      `SELECT COUNT(*)::int AS booked
         FROM bookings b
        WHERE ${hotelLinkSql}
          AND b.${fromCol} < $2
          AND b.${toCol}   > $3
          ${statusGuard}`,
      [hotelId, checkOut, checkIn],
    );
    const n = Number(booked.rows[0]?.booked) || 0;
    return clamp01(n / capacity);
  } catch (err) {
    log.debug({ err: err.message, hotelId }, 'occupancyRatioForHotel failed');
    return 0.65;
  }
}

function clamp01(n) {
  if (!Number.isFinite(n)) return 0.65;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}
