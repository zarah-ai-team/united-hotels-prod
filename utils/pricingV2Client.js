// pricingV2Client.js — thin fetch wrapper around the sibling
// pricing-engine-v2 microservice.
//
// Used inside controllers/hotels.js to swap the legacy in-process
// `computeRecommendedPrice` for the externally-anchored hybrid engine.
// On any failure (timeout, 5xx, schema mismatch, circuit-breaker open) the
// caller falls back to the legacy formula so the API never fails because
// of v2.
//
// Behaviour:
//   • Feature-flagged by PRICING_V2_ENABLED=true (default off).
//   • Per-call timeout via AbortController (default 3000ms).
//   • Process-level circuit breaker: 3 consecutive failures opens the
//     breaker for 60s, during which calls return null instantly.
//   • Returns the v2 response shape verbatim on success, or null on any
//     failure / when feature-disabled — caller decides what to do.

const DEFAULT_BASE_URL = 'http://localhost:5050';
// 5s — bigger than v2's per-source 5s+orchestrator overhead so cold-cache
// calls (DB probe + remote Neon round-trip) don't abort right at the wire.
// Hot-cache calls return in ~50ms; this only matters for first-touch hotels.
const DEFAULT_TIMEOUT_MS = 5000;
const FAILURE_THRESHOLD = 3;
const COOLDOWN_MS = 60_000;

let consecutiveFailures = 0;
let breakerOpenUntil = 0;

const baseUrl = () =>
  String(process.env.PRICING_V2_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
const timeoutMs = () => Number(process.env.PRICING_V2_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;
const isEnabled = () => String(process.env.PRICING_V2_ENABLED || '').toLowerCase() === 'true';
const breakerOpen = () => Date.now() < breakerOpenUntil;

const recordSuccess = () => {
  consecutiveFailures = 0;
};
const recordFailure = () => {
  consecutiveFailures += 1;
  if (consecutiveFailures >= FAILURE_THRESHOLD) {
    breakerOpenUntil = Date.now() + COOLDOWN_MS;
    consecutiveFailures = 0;
  }
};

/**
 * Fetch a recommended price from pricing-engine-v2.
 *
 * @param {{
 *   hotelId: number|string,
 *   roomCategory?: string|null,
 *   checkInDate?: string|null,   // yyyy-mm-dd; if missing/falsy, defaults applied server-side
 *   checkOutDate?: string|null,
 *   guests?: number,
 *   rooms?: number,
 *   currency?: string,
 * }} input
 * @returns {Promise<null | object>}  full v2 response or null on any failure / disabled
 */
async function getRecommendedPrice(input) {
  if (!isEnabled()) return null;
  if (breakerOpen()) return null;
  if (!input || input.hotelId == null) return null;
  // v2 requires both dates in yyyy-mm-dd; bail without calling if missing.
  if (!isIsoDate(input.checkInDate) || !isIsoDate(input.checkOutDate)) return null;

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs());

  try {
    const res = await fetch(`${baseUrl()}/v2/price`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hotelId: Number(input.hotelId),
        roomCategory: input.roomCategory || null,
        checkIn: input.checkInDate,
        checkOut: input.checkOutDate,
        guests: input.guests || 2,
        rooms: input.rooms || 1,
        currency: input.currency || 'USD',
        // Optional context — lets v2 work without sharing legacy's DB.
        ...(input.hotelName ? { hotelName: input.hotelName } : {}),
        ...(Number.isFinite(Number(input.basePrice)) && Number(input.basePrice) > 0
          ? { basePrice: Number(input.basePrice) }
          : {}),
        ...(Number.isFinite(Number(input.minPrice)) && Number(input.minPrice) > 0
          ? { minPrice: Number(input.minPrice) }
          : {}),
        ...(Number.isFinite(Number(input.maxPrice)) && Number(input.maxPrice) > 0
          ? { maxPrice: Number(input.maxPrice) }
          : {}),
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      recordFailure();
      return null;
    }
    const data = await res.json();
    if (!data || data.error || !Number.isFinite(Number(data.recommendedPriceUsd))) {
      // v2's own analytical fallback would still produce a number; a missing
      // one means the hotel wasn't found.
      recordFailure();
      return null;
    }
    recordSuccess();
    return data;
  } catch (_err) {
    recordFailure();
    return null;
  } finally {
    clearTimeout(t);
  }
}

/**
 * Batch variant — sends N items in one request and gets N results back,
 * with v2's internal concurrency cap of 8. Use this when pricing many
 * hotels at once (e.g. /api/hotels/recommended-prices) so we don't hammer
 * RapidAPI's free tier with 117 parallel requests on every page load.
 *
 * @param {Array} items — same shape as getRecommendedPrice's input
 * @returns {Promise<Array<object|null>>} — same length as items, null for any failure
 */
async function getRecommendedPricesBatch(items) {
  if (!isEnabled()) return new Array(items.length).fill(null);
  if (breakerOpen()) return new Array(items.length).fill(null);
  if (!Array.isArray(items) || items.length === 0) return [];

  // Filter to valid items but keep original indexes for the result mapping.
  const valid = [];
  items.forEach((it, idx) => {
    if (
      it &&
      it.hotelId != null &&
      isIsoDate(it.checkInDate) &&
      isIsoDate(it.checkOutDate)
    ) {
      valid.push({ idx, body: toBatchBody(it) });
    }
  });
  if (valid.length === 0) return new Array(items.length).fill(null);

  // The batch endpoint caps at 50 items per call — chunk if larger.
  const BATCH_MAX = 50;
  const out = new Array(items.length).fill(null);
  for (let off = 0; off < valid.length; off += BATCH_MAX) {
    const slice = valid.slice(off, off + BATCH_MAX);
    const ctrl = new AbortController();
    // Batch endpoint can take ~30s on first cold-cache page load (39 hotels
    // × 5s/Hotels.com call ÷ 16-concurrency ≈ 12-15s, plus orchestrator
    // overhead). Cached subsequent calls return in <500ms. Listing pages
    // already cache the WHOLE response for 5 minutes server-side.
    const t = setTimeout(() => ctrl.abort(), Math.max(timeoutMs(), 45000));
    try {
      const res = await fetch(`${baseUrl()}/v2/prices/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: slice.map((s) => s.body) }),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        recordFailure();
        continue;
      }
      const data = await res.json();
      const results = Array.isArray(data?.results) ? data.results : [];
      slice.forEach((s, i) => {
        const r = results[i];
        if (r && !r.error && Number.isFinite(Number(r.recommendedPriceUsd))) {
          out[s.idx] = r;
        }
      });
      recordSuccess();
    } catch (_err) {
      recordFailure();
    } finally {
      clearTimeout(t);
    }
  }
  return out;
}

function toBatchBody(input) {
  return {
    hotelId: Number(input.hotelId),
    roomCategory: input.roomCategory || null,
    checkIn: input.checkInDate,
    checkOut: input.checkOutDate,
    guests: input.guests || 2,
    rooms: input.rooms || 1,
    currency: input.currency || 'USD',
    ...(input.hotelName ? { hotelName: input.hotelName } : {}),
    ...(input.location ? { location: input.location } : {}),
    ...(input.district ? { district: input.district } : {}),
    ...(Number.isFinite(Number(input.basePrice)) && Number(input.basePrice) > 0
      ? { basePrice: Number(input.basePrice) }
      : {}),
    ...(Number.isFinite(Number(input.minPrice)) && Number(input.minPrice) > 0
      ? { minPrice: Number(input.minPrice) }
      : {}),
    ...(Number.isFinite(Number(input.maxPrice)) && Number(input.maxPrice) > 0
      ? { maxPrice: Number(input.maxPrice) }
      : {}),
  };
}

/**
 * Health probe for the admin /v2 status badge — does NOT count against the
 * circuit breaker. Returns the parsed health body or null.
 */
async function getHealth() {
  if (!isEnabled()) return null;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 1500);
  try {
    const res = await fetch(`${baseUrl()}/v2/health`, { signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function isIsoDate(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

module.exports = {
  getRecommendedPrice,
  getRecommendedPricesBatch,
  getHealth,
  // exposed for tests
  _internal: {
    resetBreaker: () => {
      consecutiveFailures = 0;
      breakerOpenUntil = 0;
    },
  },
};
