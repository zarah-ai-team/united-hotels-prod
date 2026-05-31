/**
 * clearMockBookings.js
 *
 * Removes booking (and their associated payment) rows from the database.
 * Intended to wipe the test/mock bookings created during development so the
 * site starts from a clean slate.
 *
 * SAFETY: dry-run by default. It prints exactly what it WOULD delete and makes
 * no changes unless you pass --confirm. Deletes payments first, then bookings,
 * inside a single transaction so a failure rolls back cleanly.
 *
 * Usage (from project root, where .env with DATABASE_URL lives):
 *   node scripts/clearMockBookings.js            # preview only (no writes)
 *   node scripts/clearMockBookings.js --confirm  # actually delete
 */

require('dotenv').config();
const pool = require('../db');

const CONFIRM = process.argv.includes('--confirm');

async function main() {
  console.log(CONFIRM ? '— DELETING mock booking data —\n' : '— DRY RUN (no writes; pass --confirm to delete) —\n');

  const bookings = await pool.query('SELECT id, status, guest_email, "transactionId" FROM bookings ORDER BY id');
  const payments = await pool.query('SELECT id, booking_id, amount, status FROM payments ORDER BY id')
    .catch(() => ({ rows: [] }));

  console.log(`Bookings to remove (${bookings.rows.length}):`);
  bookings.rows.forEach((b) =>
    console.log(`   - [${b.id}] ${b.status} · ${b.guest_email || 'no-email'} · ${b.transactionId || ''}`)
  );
  console.log(`\nPayments to remove (${payments.rows.length}):`);
  payments.rows.forEach((p) =>
    console.log(`   - [${p.id}] booking=${p.booking_id} · ${p.amount} · ${p.status}`)
  );

  if (!CONFIRM) {
    console.log('\nNothing deleted (dry run). Re-run with --confirm to apply.');
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const delPayments = await client.query('DELETE FROM payments');
    const delBookings = await client.query('DELETE FROM bookings');
    await client.query('COMMIT');
    console.log(`\n✓ Deleted ${delPayments.rowCount} payment(s) and ${delBookings.rowCount} booking(s).`);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

main()
  .then(async () => { await pool.end(); process.exit(0); })
  .catch(async (err) => { console.error('\n✗ Failed:', err.message); await pool.end(); process.exit(1); });
