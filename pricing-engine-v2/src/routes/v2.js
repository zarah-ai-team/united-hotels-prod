// /v2 router — the public surface of the pricing engine.
//
// Endpoints:
//   POST /v2/price          single quote
//   POST /v2/prices/batch   array of quotes (concurrency cap 8)
//   GET  /v2/health         liveness + cache stats + source reachability
//   GET  /v2/bench          last bench run summary if results.csv exists

import { Router } from 'express';
import { z } from 'zod';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { compute } from '../pipeline/compute.js';
import { cache } from '../lib/cache.js';
import { log } from '../lib/log.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BENCH_RESULTS_PATH = resolve(__dirname, '../../bench/results.csv');

const startedAt = Date.now();

// ─── input schema ───────────────────────────────────────────────────────────
const priceInput = z.object({
  hotelId: z.union([z.number(), z.string()]).transform((v) => Number(v)),
  roomCategory: z.string().optional().nullable(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'checkIn must be yyyy-mm-dd'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'checkOut must be yyyy-mm-dd'),
  guests: z.number().int().min(1).max(20).optional(),
  rooms: z.number().int().min(1).max(10).optional(),
  currency: z.string().length(3).optional(),
  // Optional caller-supplied context — lets the legacy app pass its own
  // basePrice + name when the v2 service doesn't share its DB. v2 still
  // resolves the hotel for occupancy / band, but if any of these fields is
  // present they win over the DB row.
  hotelName: z.string().optional().nullable(),
  // City + district hints — when present, source adapters key their region
  // cache by city (one cache hit covers all hotels in that city) instead
  // of by individual hotel name. Critical for free-tier rate-limit budgets.
  location: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  basePrice: z.number().positive().optional().nullable(),
  minPrice: z.number().positive().optional().nullable(),
  maxPrice: z.number().positive().optional().nullable(),
});

const batchInput = z.object({
  items: z.array(priceInput).min(1).max(50),
});

const router = Router();

// ─── POST /v2/price ─────────────────────────────────────────────────────────
router.post('/price', async (req, res) => {
  const parsed = priceInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid input', issues: parsed.error.issues });
  }
  try {
    const result = await compute(parsed.data);
    res.json(result);
  } catch (err) {
    log.error({ err: err.message, stack: err.stack }, '/v2/price failed');
    res.status(500).json({ error: 'compute failed', detail: err.message });
  }
});

// ─── POST /v2/prices/batch ──────────────────────────────────────────────────
router.post('/prices/batch', async (req, res) => {
  const parsed = batchInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid input', issues: parsed.error.issues });
  }
  try {
    // 16 concurrent: enough to keep Hotels.com Provider's free tier
    // saturated (their per-second cap doesn't seem to fire until ~25
    // concurrent), without overwhelming the legacy app's request budget.
    const results = await runWithConcurrency(parsed.data.items, 16, (item) =>
      compute(item).catch((err) => ({
        error: err.message,
        hotelId: item.hotelId,
        recommendedPrice: null,
      })),
    );
    res.json({ results });
  } catch (err) {
    log.error({ err: err.message }, '/v2/prices/batch failed');
    res.status(500).json({ error: 'batch failed', detail: err.message });
  }
});

// ─── GET /v2/health ─────────────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptimeMs: Date.now() - startedAt,
    cacheSize: cache.size(),
    sources: {
      makcorps: process.env.MAKECORPS_API_KEY ? 'up' : 'no-key',
      rapidapi: process.env.RAPIDAPI_KEY ? 'up' : 'no-key',
    },
    db: process.env.DATABASE_URL ? 'configured' : 'missing',
  });
});

// ─── GET /v2/bench ──────────────────────────────────────────────────────────
router.get('/bench', (_req, res) => {
  if (!existsSync(BENCH_RESULTS_PATH)) {
    return res.status(404).json({ error: 'no bench results yet — run `npm run bench`' });
  }
  try {
    const csv = readFileSync(BENCH_RESULTS_PATH, 'utf8');
    res.json(summariseCsv(csv));
  } catch (err) {
    res.status(500).json({ error: 'cannot read bench/results.csv', detail: err.message });
  }
});

// ─── helpers ────────────────────────────────────────────────────────────────

async function runWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const idx = cursor++;
      results[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return results;
}

/**
 * Compact summary for /v2/bench — counts and means, not the full table.
 * Avoids shipping 100 rows over JSON when the caller just wants headlines.
 */
function summariseCsv(csv) {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length <= 1) return { rows: 0, summary: 'empty' };
  const header = lines[0].split(',');
  const rows = lines.slice(1).map((l) => {
    const cells = l.split(',');
    const o = {};
    header.forEach((h, i) => (o[h] = cells[i]));
    return o;
  });

  const v1Mapes = rows.map((r) => Number(r.v1Mape)).filter((n) => Number.isFinite(n));
  const v2Mapes = rows.map((r) => Number(r.v2Mape)).filter((n) => Number.isFinite(n));
  const within = rows.filter((r) => String(r.withinTenPct).toLowerCase() === 'true').length;

  return {
    rows: rows.length,
    v1MapeMean: round3(mean(v1Mapes)),
    v2MapeMean: round3(mean(v2Mapes)),
    withinTenPct: within,
    withinTenPctRate: round3(within / rows.length),
  };
}

function mean(xs) {
  return xs.length === 0 ? 0 : xs.reduce((s, x) => s + x, 0) / xs.length;
}
function round3(n) {
  return Math.round(Number(n || 0) * 1000) / 1000;
}

export default router;
