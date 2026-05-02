// compute() — the orchestrator that ties every pipeline stage together.
//
// Flow:
//   1. validate input (caller does this; we only sanity-check here)
//   2. resolve hotel + room category from Postgres → base/min/max + currency
//   3. fetch external anchors in parallel (MakCorps + RapidAPI), 2.5s timeout each
//   4. aggregate quotes → anchor + confidence
//   5. branch: hybrid path if ≥2 quotes, otherwise analytical fallback
//   6. read live occupancy from bookings table
//   7. apply adjusters + clamp + currency-convert
//   8. return final shape with full breakdown so the caller can audit

import { aggregate } from './aggregator.js';
import { apply as applyAdjusters } from './adjusters.js';
import { applyClamp } from './clamp.js';
import { fetchPrices as fetchMakcorps } from '../sources/makcorps.js';
import { fetchPrices as fetchRapidApi } from '../sources/rapidapi-hotels.js';
import { fetchPrices as fetchHotelscom } from '../sources/rapidapi-hotelscom.js';
import { findHotelById, findRoomCategory } from '../repos/hotelRepo.js';
import { occupancyRatioForHotel } from '../repos/bookingRepo.js';
import { toUsd, fromUsd } from '../lib/fx.js';
import { log } from '../lib/log.js';

// Hotels.com Provider's /v3/hotels/search regularly takes 5–8s on the free
// tier; RapidAPI booking-com15 ~5s; MakCorps ~3s. 14s gives every source
// enough room to land a real response without holding pages indefinitely.
// Cached calls return in <100ms regardless.
const SOURCE_TIMEOUT_MS = 14000;

/**
 * @param {{
 *   hotelId: number,
 *   roomCategory?: string,
 *   checkIn: string,    // ISO yyyy-mm-dd
 *   checkOut: string,   // ISO yyyy-mm-dd
 *   guests?: number,
 *   rooms?: number,
 *   currency?: string,  // response currency
 * }} input
 */
export async function compute(input) {
  const start = Date.now();

  const guests = input.guests || 2;
  const rooms = input.rooms || 1;
  const responseCurrency = (input.currency || 'USD').toUpperCase();

  // ── 1. Resolve hotel + room category (read-only) ──────────────────────
  // Performance: when the caller supplies basePrice (legacy app integration
  // path), skip all DB lookups entirely. Each lookup is a Neon round-trip;
  // doing 3 of them × 117 parallel calls overwhelms the pg.Pool. Letting
  // the caller pass its known basePrice avoids that round-trip cascade.
  const callerProvided = Number.isFinite(Number(input.basePrice)) && Number(input.basePrice) > 0;

  let hotel = null;
  let room = null;
  if (!callerProvided) {
    hotel = await safeFindHotel(input.hotelId);
    if (!hotel && !input.hotelName) {
      return errorResult(`Hotel ${input.hotelId} not found`, start);
    }
    if (!hotel && input.hotelName) {
      hotel = { id: input.hotelId, hotelName: input.hotelName, district: null, location: null, basePrice: null, currency: 'USD' };
    }
    room = await safeFindRoomCategory(input.hotelId, input.roomCategory);
  } else {
    // Synthesise minimal hotel/room records from caller input — keeps the
    // rest of the pipeline shape-compatible without any DB calls.
    hotel = {
      id: input.hotelId,
      hotelName: input.hotelName || `Hotel #${input.hotelId}`,
      district: null,
      location: null,
      basePrice: null,
      currency: 'USD',
    };
    room = { roomCategory: input.roomCategory || null, basePrice: null, minPrice: null, maxPrice: null, currency: 'USD' };
  }

  // Caller-supplied values win over DB rows so the engine works against
  // any backing store, not just the v2 service's own Postgres view.
  const basePrice = callerProvided ? Number(input.basePrice) : pickBasePrice(room, hotel);
  const minPrice =
    Number.isFinite(Number(input.minPrice)) && Number(input.minPrice) > 0
      ? Number(input.minPrice)
      : num(room?.minPrice);
  const maxPrice =
    Number.isFinite(Number(input.maxPrice)) && Number(input.maxPrice) > 0
      ? Number(input.maxPrice)
      : num(room?.maxPrice);
  const baseCurrency = (room?.currency || hotel?.currency || 'USD').toUpperCase();
  const basePriceUsd = toUsd(basePrice, baseCurrency) ?? basePrice;

  // ── 2. Fetch external anchors in parallel ────────────────────────────
  const externalQuery = {
    hotelId: input.hotelId,
    hotelName: input.hotelName || hotel?.hotelName,
    // Caller-supplied location/district win over the DB row so legacy callers
    // can drive city-level region caching even when the v2 DB has no record.
    district: input.district || hotel?.district,
    location: input.location || hotel?.location,
    roomCategory: input.roomCategory || room?.roomCategory || null,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    guests,
    rooms,
  };

  const [makcorpsRes, rapidApiRes, hotelscomRes] = await Promise.allSettled([
    withTimeout(fetchMakcorps(externalQuery), SOURCE_TIMEOUT_MS, 'makcorps'),
    withTimeout(fetchRapidApi(externalQuery), SOURCE_TIMEOUT_MS, 'rapidapi'),
    withTimeout(fetchHotelscom(externalQuery), SOURCE_TIMEOUT_MS, 'hotelscom'),
  ]);

  const externalQuotes = [];
  const sourceLatencies = {};
  const sourceStatus = {};

  for (const [name, settled] of [
    ['makcorps', makcorpsRes],
    ['rapidapi', rapidApiRes],
    ['hotelscom', hotelscomRes],
  ]) {
    if (settled.status === 'fulfilled' && settled.value) {
      const v = settled.value;
      externalQuotes.push(...(v.quotes || []));
      sourceLatencies[name] = v.latencyMs ?? 0;
      // Distinguish "got data" vs "skipped on purpose" (no key, rate-limit,
      // no mapping). Both are non-failures but the operator may want to act
      // on the reason — e.g. surface a "MakCorps quota exhausted" banner.
      sourceStatus[name] = v.skipped ? `skipped:${v.skipped}` : 'ok';
    } else {
      sourceLatencies[name] = SOURCE_TIMEOUT_MS;
      sourceStatus[name] = 'failed';
      log.debug({ name, reason: settled.reason?.message }, 'source unavailable');
    }
  }

  // ── 3. Aggregate quotes into a single anchor ─────────────────────────
  const aggregated = aggregate(externalQuotes, {
    preferRoomCategory: input.roomCategory || room?.roomCategory,
  });

  // ── 4. Hybrid vs analytical branch ───────────────────────────────────
  const useHybrid = aggregated.sampleSize >= 2 && Number.isFinite(aggregated.anchorUsd);
  const anchorUsd = useHybrid ? aggregated.anchorUsd : basePriceUsd;
  const source = useHybrid ? 'hybrid' : 'analytical';

  // ── 5. Live occupancy signal ─────────────────────────────────────────
  // Skip the DB lookup when the caller bypassed our DB lookup — same
  // performance reasoning as step 1. 0.65 is a reasonable default when
  // we can't measure live occupancy.
  const occupancyRatio = callerProvided
    ? 0.65
    : await safeOccupancy(input.hotelId, input.checkIn, input.checkOut);

  // ── 6. Adjusters ─────────────────────────────────────────────────────
  const stayCtx = stayContext(input.checkIn, input.checkOut);
  const adjusted = applyAdjusters(anchorUsd, {
    occupancyRatio,
    leadTimeDays: stayCtx.leadTimeDays,
    weekendNights: stayCtx.weekendNights,
    totalNights: stayCtx.totalNights,
    monthOfStay: stayCtx.monthOfStay,
    vendorMarginPct: 0.04,
  });

  // ── 7. Clamp to vendor band ──────────────────────────────────────────
  const clamped = applyClamp(adjusted.adjustedUsd, {
    basePriceUsd,
    minPriceUsd: minPrice ? toUsd(minPrice, baseCurrency) : null,
    maxPriceUsd: maxPrice ? toUsd(maxPrice, baseCurrency) : null,
  });

  // ── 8. Currency convert + assemble response ──────────────────────────
  const recommendedPrice = fromUsd(clamped.priceUsd, responseCurrency) ?? clamped.priceUsd;

  return {
    hotelId: input.hotelId,
    hotelName: input.hotelName || hotel?.hotelName,
    roomCategory: input.roomCategory || room?.roomCategory || null,
    basePrice: round2(basePrice),
    basePriceUsd: round2(basePriceUsd),
    recommendedPriceUsd: round2(clamped.priceUsd),
    recommendedPrice: round2(recommendedPrice),
    currency: responseCurrency,
    confidence: aggregated.confidence,
    source,
    anchors: externalQuotes.map((q) => ({
      provider: q.provider,
      perNightUsd: round2(q.perNightUsd),
      room: q.room || null,
    })),
    aggregateMeta: {
      sampleSize: aggregated.sampleSize,
      spread: aggregated.spread,
      usedProviders: aggregated.usedProviders,
    },
    factors: adjusted.factors,
    bounds: { floor: clamped.floor, ceiling: clamped.ceiling },
    clamped: { hitFloor: clamped.hitFloor, hitCeiling: clamped.hitCeiling },
    sources: { latencies: sourceLatencies, status: sourceStatus },
    stay: stayCtx,
    latencyMs: Date.now() - start,
  };
}

// ─── helpers ────────────────────────────────────────────────────────────────

function pickBasePrice(room, hotel) {
  const r = num(room?.basePrice);
  if (r) return r;
  const h = num(hotel?.basePrice);
  if (h) return h;
  // No data at all — fall back to a conservative default so adjusters
  // still have something to work with rather than producing NaN.
  return 100;
}

function stayContext(checkIn, checkOut) {
  const now = new Date();
  const ci = parseDate(checkIn) || now;
  const co = parseDate(checkOut) || new Date(ci.getTime() + 86400_000);
  const totalNights = Math.max(1, Math.round((co - ci) / 86400_000));

  let weekendNights = 0;
  for (let n = 0; n < totalNights; n++) {
    const d = new Date(ci.getTime() + n * 86400_000);
    const dow = d.getDay(); // 0 = Sun
    if (dow === 5 || dow === 6) weekendNights += 1;
  }
  const leadTimeDays = Math.round((ci - now) / 86400_000);
  const median = new Date(ci.getTime() + Math.floor(totalNights / 2) * 86400_000);

  return {
    checkIn: ci.toISOString().slice(0, 10),
    checkOut: co.toISOString().slice(0, 10),
    totalNights,
    weekendNights,
    leadTimeDays,
    monthOfStay: median.getMonth(),
  };
}

function parseDate(s) {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function safeFindHotel(id) {
  try {
    return await findHotelById(id);
  } catch (err) {
    log.warn({ err: err.message, id }, 'hotel lookup failed — using minimal stub');
    return { id, hotelName: `Hotel #${id}`, district: null, location: null, basePrice: null, currency: 'USD' };
  }
}

async function safeFindRoomCategory(hotelId, category) {
  try {
    return await findRoomCategory(hotelId, category);
  } catch (err) {
    log.debug({ err: err.message }, 'room lookup failed');
    return null;
  }
}

async function safeOccupancy(hotelId, checkIn, checkOut) {
  try {
    const ratio = await occupancyRatioForHotel(hotelId, { checkIn, checkOut });
    if (Number.isFinite(ratio)) return ratio;
  } catch (err) {
    log.debug({ err: err.message }, 'occupancy lookup failed — using default 0.65');
  }
  return 0.65;
}

function withTimeout(promise, ms, name) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${name} timeout ${ms}ms`)), ms),
    ),
  ]);
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function round2(n) {
  return Math.round(Number(n || 0) * 100) / 100;
}

function errorResult(msg, start) {
  return {
    error: msg,
    recommendedPriceUsd: null,
    recommendedPrice: null,
    source: 'error',
    latencyMs: Date.now() - start,
  };
}
