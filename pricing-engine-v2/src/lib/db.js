// Read-only Postgres pool. Reuses DATABASE_URL from .env (the same Neon
// instance the main app writes to) but only ever runs SELECT — no migrations,
// no inserts, no updates. The repos layer keeps it that way; this file just
// boots the pool and exports it.

import 'dotenv/config';
import pg from 'pg';
import { log } from './log.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  log.warn('DATABASE_URL not set — repo queries will fail until you populate .env');
}

const needsSsl =
  /sslmode=require/i.test(connectionString || '') ||
  /neon\.tech/i.test(connectionString || '') ||
  process.env.PG_SSL === 'true' ||
  process.env.PGSSLMODE === 'require';

export const pool = connectionString
  ? new pg.Pool({
      connectionString,
      ssl: needsSsl ? { rejectUnauthorized: false } : false,
      max: parseInt(process.env.PG_POOL_MAX || '5', 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    })
  : null;

if (pool) {
  pool.on('error', (err) => {
    log.error({ err: err.message }, 'pg idle client error');
  });
}

/**
 * Quick helper that runs a SELECT and returns the full pg result object so
 * callers can destructure `{ rows }` (matching pg.Pool's native shape).
 * Throws if the pool isn't configured — callers should treat that as "no
 * DB attached" and use defaults / mock data appropriately.
 */
export async function query(text, params) {
  if (!pool) throw new Error('Postgres pool not configured (DATABASE_URL missing)');
  return pool.query(text, params);
}

export default pool;
