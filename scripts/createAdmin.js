/**
 * Create (or upgrade) an admin user.
 *
 * Default credentials:
 *   email    = admin@admin.com
 *   password = admin
 *
 * Override:
 *   ADMIN_EMAIL=foo@bar.com ADMIN_PASSWORD=secret node scripts/createAdmin.js
 *
 * Idempotent — running it again resets the password to the configured value
 * and ensures the role is 'admin'. Also clears any legacy bare-username
 * "admin" row that the form's email validator can't accept.
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../db');

const EMAIL = (process.env.ADMIN_EMAIL || 'admin@admin.com').trim();
const PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
const NAME = process.env.ADMIN_NAME || 'Admin';

async function main() {
  const client = await pool.connect();
  try {
    // Make sure required columns exist (matches scripts/seedNeon.js migration).
    await client.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user',
        ADD COLUMN IF NOT EXISTS phonenumber text,
        ADD COLUMN IF NOT EXISTS "isAdmin"   boolean NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "isManager" boolean NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "createdAt" timestamptz NOT NULL DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS "updatedAt" timestamptz NOT NULL DEFAULT NOW();
    `);

    const hashed = await bcrypt.hash(PASSWORD, 10);

    // Clean up the old bare-username "admin" row (no @, can't pass HTML5 email
    // validation on the login form).
    const cleanup = await client.query(`DELETE FROM users WHERE email = 'admin' AND email <> $1`, [EMAIL]);
    if (cleanup.rowCount > 0) {
      console.log(`✗ Removed legacy bare-username "admin" row`);
    }

    const existing = await client.query('SELECT id FROM users WHERE email = $1', [EMAIL]);

    if (existing.rowCount > 0) {
      const id = existing.rows[0].id;
      await client.query(
        `UPDATE users
            SET name = $1,
                password = $2,
                role = 'admin',
                "isAdmin" = true,
                "isManager" = false,
                "updatedAt" = NOW()
          WHERE id = $3`,
        [NAME, hashed, id],
      );
      console.log(`↻ Updated admin user (id=${id}) email="${EMAIL}"`);
    } else {
      const inserted = await client.query(
        `INSERT INTO users (name, email, password, role, "isAdmin", "isManager", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, 'admin', true, false, NOW(), NOW())
         RETURNING id`,
        [NAME, EMAIL, hashed],
      );
      console.log(`✓ Created admin user (id=${inserted.rows[0].id}) email="${EMAIL}"`);
    }

    console.log(`\nLogin at /admin/login with:\n  email:    ${EMAIL}\n  password: ${PASSWORD}`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
