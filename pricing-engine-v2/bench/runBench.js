// runBench.js — head-to-head accuracy harness.
//
// For every fixture row:
//   1. POST  /v2/price       (this service)        → v2RecUsd
//   2. POST  legacy endpoint /api/hotels/recommended-prices → v1RecUsd
//   3. capture median of v2's `anchors` array as the OTA-median ground truth
//
// Then we compute:
//   - v1Mape, v2Mape vs OTA median
//   - withinTenPct: abs(v2RecUsd - otaMedian) / otaMedian <= 0.10
//
// Writes one CSV row per case to bench/results.csv. Exits 0 even on
// per-case failures — the harness is meant to surface bad cases, not abort.

import 'dotenv/config';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_PATH = resolve(__dirname, 'fixtures.json');
const RESULTS_PATH = resolve(__dirname, 'results.csv');

const V2_BASE = process.env.V2_BASE || 'http://localhost:5050';
const LEGACY_BASE = process.env.LEGACY_API_BASE || 'http://localhost:5000';

async function main() {
  const fixtures = JSON.parse(await readFile(FIXTURES_PATH, 'utf8'));
  const cases = expand(fixtures);
  console.log(`bench: ${cases.length} cases against ${V2_BASE} (vs legacy ${LEGACY_BASE})`);

  const rows = [];
  let i = 0;
  for (const c of cases) {
    i++;
    process.stdout.write(`  [${i}/${cases.length}] hotel ${c.hotelId} ${c.checkIn} ${c.category}… `);
    try {
      const [v2, v1] = await Promise.all([fetchV2(c), fetchV1(c)]);
      const otaMedian = medianAnchor(v2);
      const row = buildRow(c, v1, v2, otaMedian);
      rows.push(row);
      console.log(`v1=${row.v1RecUsd ?? '–'} v2=${row.v2RecUsd ?? '–'} ota=${row.otaMedianUsd ?? '–'}`);
    } catch (err) {
      console.log(`FAIL ${err.message}`);
      rows.push(emptyRow(c, err.message));
    }
  }

  mkdirSync(dirname(RESULTS_PATH), { recursive: true });
  writeFileSync(RESULTS_PATH, toCsv(rows));
  console.log(`\nbench: wrote ${rows.length} rows → ${RESULTS_PATH}`);
  console.log(summarise(rows));
}

// ─── expansion ──────────────────────────────────────────────────────────────

function expand(f) {
  const out = [];
  const nights = f.stayNights || 2;
  for (const hotelId of f.hotelIds) {
    for (const checkIn of f.checkIns) {
      for (const category of f.categories) {
        out.push({
          hotelId,
          checkIn,
          checkOut: addDays(checkIn, nights),
          category,
          guests: f.guests || 2,
          rooms: f.rooms || 1,
          currency: f.currency || 'USD',
        });
      }
    }
  }
  return out;
}

function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// ─── HTTP ───────────────────────────────────────────────────────────────────

async function fetchV2(c) {
  const res = await fetch(`${V2_BASE}/v2/price`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      hotelId: c.hotelId,
      roomCategory: c.category,
      checkIn: c.checkIn,
      checkOut: c.checkOut,
      guests: c.guests,
      rooms: c.rooms,
      currency: c.currency,
    }),
  });
  if (!res.ok) throw new Error(`v2 ${res.status}`);
  return res.json();
}

async function fetchV1(c) {
  // Best-effort: legacy endpoint shape may evolve. We accept failure here
  // and just leave v1 columns blank.
  try {
    const url =
      `${LEGACY_BASE}/api/hotels/recommended-prices?hotelId=${c.hotelId}` +
      `&checkInDate=${c.checkIn}&checkOutDate=${c.checkOut}` +
      `&category=${encodeURIComponent(c.category)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ─── analysis ───────────────────────────────────────────────────────────────

function medianAnchor(v2) {
  const arr = (v2?.anchors || []).map((a) => Number(a.perNightUsd)).filter((n) => Number.isFinite(n) && n > 0);
  if (arr.length === 0) return null;
  arr.sort((a, b) => a - b);
  const mid = arr.length >> 1;
  return arr.length % 2 === 0 ? (arr[mid - 1] + arr[mid]) / 2 : arr[mid];
}

function buildRow(c, v1, v2, otaMedian) {
  const baseUsd = Number(v2?.basePriceUsd) || null;
  const v2Rec = Number(v2?.recommendedPriceUsd) || null;
  const v1Rec = pickV1Rec(v1, c.category);
  return {
    hotelId: c.hotelId,
    date: c.checkIn,
    category: c.category,
    baseUsd,
    otaMedianUsd: otaMedian,
    v1RecUsd: v1Rec,
    v2RecUsd: v2Rec,
    v1Mape: mape(v1Rec, otaMedian),
    v2Mape: mape(v2Rec, otaMedian),
    withinTenPct: withinPct(v2Rec, otaMedian, 0.1),
  };
}

function pickV1Rec(v1, category) {
  if (!v1) return null;
  // Legacy returns either a single object or an array of category breakdowns.
  if (Array.isArray(v1?.recommendations)) {
    const found = v1.recommendations.find(
      (r) => (r.roomCategory || '').toLowerCase() === category.toLowerCase(),
    );
    return Number(found?.recommendedPrice) || null;
  }
  return Number(v1?.recommendedPrice) || null;
}

function mape(predicted, actual) {
  if (!Number.isFinite(predicted) || !Number.isFinite(actual) || actual <= 0) return null;
  return Number(Math.abs(predicted - actual) / actual);
}

function withinPct(predicted, actual, pct) {
  if (!Number.isFinite(predicted) || !Number.isFinite(actual) || actual <= 0) return false;
  return Math.abs(predicted - actual) / actual <= pct;
}

function emptyRow(c, err) {
  return {
    hotelId: c.hotelId,
    date: c.checkIn,
    category: c.category,
    baseUsd: null,
    otaMedianUsd: null,
    v1RecUsd: null,
    v2RecUsd: null,
    v1Mape: null,
    v2Mape: null,
    withinTenPct: false,
    error: err,
  };
}

// ─── output ─────────────────────────────────────────────────────────────────

const HEADER = ['hotelId', 'date', 'category', 'baseUsd', 'otaMedianUsd', 'v1RecUsd', 'v2RecUsd', 'v1Mape', 'v2Mape', 'withinTenPct'];

function toCsv(rows) {
  const lines = [HEADER.join(',')];
  for (const r of rows) {
    lines.push(HEADER.map((h) => formatCell(r[h])).join(','));
  }
  return lines.join('\n') + '\n';
}

function formatCell(v) {
  if (v == null) return '';
  if (typeof v === 'number') return Number.isFinite(v) ? v.toFixed(4).replace(/\.?0+$/, '') : '';
  return String(v).replace(/[,\r\n]/g, ' ');
}

function summarise(rows) {
  const v2 = rows.map((r) => r.v2Mape).filter((n) => Number.isFinite(n));
  const v1 = rows.map((r) => r.v1Mape).filter((n) => Number.isFinite(n));
  const within = rows.filter((r) => r.withinTenPct).length;
  return [
    `  rows total       : ${rows.length}`,
    `  rows with v2Mape : ${v2.length}`,
    `  v1 MAPE (mean)   : ${v1.length ? (mean(v1) * 100).toFixed(2) + '%' : '–'}`,
    `  v2 MAPE (mean)   : ${v2.length ? (mean(v2) * 100).toFixed(2) + '%' : '–'}`,
    `  within ±10%      : ${within} / ${rows.length} (${((within / rows.length) * 100).toFixed(1)}%)`,
  ].join('\n');
}

function mean(xs) {
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

main().catch((err) => {
  console.error('bench fatal:', err);
  process.exit(1);
});
