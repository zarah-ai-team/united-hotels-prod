/**
 * seedUsers.js — create the core staff accounts on a fresh database.
 *
 * Usage:  node scripts/seedUsers.js
 * Idempotent: re-running updates the password/role of an existing email (so it
 * also works as a password reset). Passwords are bcrypt-hashed (cost 10), the
 * same as the app's register flow.
 *
 * NOTE: /blog-admin is gated by admin role, so the "marketing" account is given
 * admin access (there is no blog-only role yet). Change these passwords after
 * first login.
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../db');

const USERS = [
  { name: 'Admin User',          email: 'admin@admin.com',            password: 'Admin@2026',        role: 'admin', isAdmin: true, isManager: false },
  { name: 'Marketing User',      email: 'marketing@unitedhotels.com', password: 'Marketing@2026',    role: 'admin', isAdmin: true, isManager: false },
  { name: 'United Hotels Admin', email: 'admin@unitedhotels.com',     password: 'UnitedHotels@2026', role: 'admin', isAdmin: true, isManager: false },
];

async function run() {
  const client = await pool.connect();
  try {
    for (const u of USERS) {
      const hash = await bcrypt.hash(u.password, 10);
      const existing = await client.query('SELECT id FROM users WHERE lower(email) = lower($1) LIMIT 1', [u.email]);
      if (existing.rowCount > 0) {
        await client.query(
          `UPDATE users
              SET name = $1, password = $2, role = $3, "isAdmin" = $4, "isManager" = $5, "updatedAt" = NOW()
            WHERE lower(email) = lower($6)`,
          [u.name, hash, u.role, u.isAdmin, u.isManager, u.email],
        );
        console.log(`↻ updated  ${u.email}  (${u.role})`);
      } else {
        await client.query(
          `INSERT INTO users (name, email, password, role, "isAdmin", "isManager", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
          [u.name, u.email, hash, u.role, u.isAdmin, u.isManager],
        );
        console.log(`✓ created  ${u.email}  (${u.role})`);
      }
    }
  } finally {
    client.release();
    await pool.end();
  }

  console.log('\n─── Staff accounts (change passwords after first login) ───');
  USERS.forEach((u) => console.log(`  ${u.email.padEnd(32)} ${u.password}`));
  process.exit(0);
}

run().catch((e) => { console.error('✗ seedUsers failed:', e.message); process.exit(1); });
