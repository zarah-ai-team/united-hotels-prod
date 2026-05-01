/**
 * db.js — PostgreSQL connection pool (Neon).
 *
 * Reads DATABASE_URL from .env. Neon requires SSL; we enable it
 * automatically for any sslmode=require URL or remote host.
 */

require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is not set. Add it to your .env (Neon connection string).'
  );
}

const needsSsl = /sslmode=require/i.test(connectionString)
  || /neon\.tech/i.test(connectionString)
  || process.env.PGSSLMODE === 'require';

const pool = new Pool({
  connectionString,
  ssl: needsSsl ? { rejectUnauthorized: false } : false,
  max: parseInt(process.env.PG_POOL_MAX || '10', 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

pool.on('error', (err) => {
  console.error('[pg] idle client error:', err.message);
});

module.exports = pool;
