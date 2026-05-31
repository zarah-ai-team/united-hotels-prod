/**
 * clearNonAdminUsers.js
 *
 * Deletes every user EXCEPT admin accounts (role = 'admin' OR isAdmin = true).
 * Used to clear test/vendor/QA accounts and leave only the admin login.
 *
 * FK note: hotels.manager_id and hotel_room_categories.vendor_id reference
 * users(id) ON DELETE SET NULL, so removing users nulls those references
 * rather than deleting hotels — hotels are preserved.
 *
 * SAFETY: dry-run by default — prints who would be kept/deleted and writes
 * nothing unless you pass --confirm. Runs in a transaction.
 *
 * Usage (from project root):
 *   node scripts/clearNonAdminUsers.js            # preview only
 *   node scripts/clearNonAdminUsers.js --confirm  # actually delete
 */

require('dotenv').config();
const pool = require('../db');

const CONFIRM = process.argv.includes('--confirm');
const KEEP_WHERE = `("isAdmin" IS TRUE OR role = 'admin')`;

async function main() {
  console.log(CONFIRM ? '— DELETING all non-admin users —\n' : '— DRY RUN (no writes; pass --confirm to delete) —\n');

  const keep = await pool.query(`SELECT id, name, email, role FROM users WHERE ${KEEP_WHERE} ORDER BY id`);
  const remove = await pool.query(`SELECT id, name, email, role FROM users WHERE NOT ${KEEP_WHERE} ORDER BY id`);

  console.log(`Keeping (${keep.rows.length}):`);
  keep.rows.forEach((u) => console.log(`   ✓ [${u.id}] ${u.name} · ${u.email} · role=${u.role}`));
  console.log(`\nDeleting (${remove.rows.length}):`);
  remove.rows.forEach((u) => console.log(`   ✗ [${u.id}] ${u.name} · ${u.email} · role=${u.role}`));

  if (keep.rows.length === 0) {
    throw new Error('Refusing to run: no admin account would remain. Aborting.');
  }
  if (!CONFIRM) {
    console.log('\nNothing deleted (dry run). Re-run with --confirm to apply.');
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const del = await client.query(`DELETE FROM users WHERE NOT ${KEEP_WHERE}`);
    await client.query('COMMIT');
    console.log(`\n✓ Deleted ${del.rowCount} user(s). ${keep.rows.length} admin account(s) kept.`);
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
