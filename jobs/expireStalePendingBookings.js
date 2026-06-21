// jobs/expireStalePendingBookings.js
//
// A card booking holds the room as 'pending' while the guest is on İş Bankası's
// hosted page. If they never complete payment, that hold would block the room
// forever. This sweeper cancels pending card bookings whose payment was started
// more than PENDING_BOOKING_TTL_MINUTES ago and frees the inventory — using the
// same cancel path as a manual cancellation, so availability is restored
// correctly and idempotently.
//
// Scheduled from server.js on an interval; also safe to run manually.

const pool = require('../db');
const { cancelBookingCore } = require('../controllers/bookings');

const ttlMinutes = () => Math.max(1, Number(process.env.PENDING_BOOKING_TTL_MINUTES || 30));

const expireStalePendingBookings = async () => {
  const ttl = ttlMinutes();

  let stale;
  try {
    stale = await pool.query(
      `SELECT p.transaction_id, p.booking_id
         FROM payments p
         JOIN bookings b ON b.id = p.booking_id
        WHERE p.payment_mode = 'isbank'
          AND p.status = 'initiated'
          AND p.created_at < NOW() - ($1 * INTERVAL '1 minute')
          AND COALESCE(LOWER(b.status), '') = 'pending'`,
      [ttl]
    );
  } catch (err) {
    // e.g. payments/bookings table not migrated yet — nothing to do.
    console.warn('[cleanup] stale-booking query skipped:', err.message);
    return { scanned: 0, expired: 0 };
  }

  let expired = 0;
  for (const row of stale.rows) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await cancelBookingCore(client, row.booking_id); // roomId derived from the booking
      await client.query(
        `UPDATE payments SET status = 'expired', updated_at = NOW() WHERE transaction_id = $1`,
        [row.transaction_id]
      );
      await client.query('COMMIT');
      expired += 1;
      console.log(`[cleanup] expired stale pending booking ${row.booking_id} (oid ${row.transaction_id})`);
    } catch (err) {
      try { await client.query('ROLLBACK'); } catch (_e) { /* ignore */ }
      console.error(`[cleanup] failed to expire booking ${row.booking_id}:`, err.message);
    } finally {
      client.release();
    }
  }

  if (stale.rows.length) {
    console.log(`[cleanup] swept ${stale.rows.length} stale pending booking(s), expired ${expired}`);
  }
  return { scanned: stale.rows.length, expired };
};

module.exports = { expireStalePendingBookings };
