/**
 * Diagnostic: list admin-eligible users and verify the password hash for the
 * default admin account. Helps debug "login keeps failing" cases.
 *
 *   node scripts/checkAdmin.js
 *   ADMIN_EMAIL=admin@admin.com ADMIN_PASSWORD=admin node scripts/checkAdmin.js
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../db');

const EMAIL = (process.env.ADMIN_EMAIL || 'admin@admin.com').trim();
const PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

async function main() {
  const all = await pool.query(
    `SELECT id, name, email, role, "isAdmin", "isManager" FROM users
     WHERE role = 'admin' OR "isAdmin" = true
     ORDER BY id`
  );
  console.log(`Found ${all.rowCount} admin-eligible users:`);
  for (const r of all.rows) {
    console.log(`  · id=${r.id}  email="${r.email}"  role=${r.role}  isAdmin=${r.isAdmin}`);
  }

  const target = await pool.query(
    'SELECT id, email, password, role, "isAdmin" FROM users WHERE email = $1',
    [EMAIL]
  );
  if (target.rowCount === 0) {
    console.log(`\nNo user with email="${EMAIL}".`);
  } else {
    const user = target.rows[0];
    const ok = await bcrypt.compare(PASSWORD, user.password);
    console.log(`\nFor email="${EMAIL}" / password="${PASSWORD}":`);
    console.log(`  · bcrypt.compare: ${ok}`);
    console.log(`  · role: ${user.role}`);
    console.log(`  · isAdmin: ${user.isAdmin}`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
