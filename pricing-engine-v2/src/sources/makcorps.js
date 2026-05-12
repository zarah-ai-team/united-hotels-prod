// MakCorps source adapter — name → docId resolver, then by-id fetch.
//
// Semantics ported from UnitedHotels-Merged/pricingEngine.js (which is dead
// code in the live app, but its retry / cache / response-parsing logic is
// solid). The shape exposed here matches every other source adapter:
//
//   fetchPrices({ hotelName, checkIn, checkOut, guests, rooms, currency })
//     → { quotes: [{ provider, currency, perNightUsd, room? }], latencyMs, source }
//
// MakCorps responses bundle prices for a single hotel across ~10 OTAs. We
// flatten that bundle into an array of provider quotes, normalise to USD,
// and let the aggregator do outlier rejection. We never call MakCorps's
// own "median" field — we want the raw quotes for IQR filtering.

import { http } from '../lib/http.js';
import { cache } from '../lib/cache.js';
import { toUsd } from '../lib/fx.js';
import { log } from '../lib/log.js';

const RESOLVER_TTL_FRESH_MS = 12 * 60 * 60 * 1000; // 12 h — hotel ids are stable
const RESOLVER_TTL_STALE_MS = 24 * 60 * 60 * 1000; // 24 h
const PRICE_TTL_FRESH_MS = 60 * 1000; //  1 m
const PRICE_TTL_STALE_MS = 180 * 1000; //  3 m

// When MakCorps's free-tier quota is exhausted, every call returns 429 (or
// 200 with success:false). Rather than burn time + quota by retrying every
// request, we hold a process-local cooldown — subsequent calls short-circuit
// for the next 5 minutes so the orchestrator falls through fast and the
// response correctly reports `skipped: 'rate-limited'`.
const RATE_LIMIT_COOLDOWN_MS = 5 * 60 * 1000;
let rateLimitedUntil = 0;
const isCoolingDown = () => Date.now() < rateLimitedUntil;
const triggerCooldown = () => {
  rateLimitedUntil = Date.now() + RATE_LIMIT_COOLDOWN_MS;
};

const baseUrl = () =>
  (process.env.MAKECORPS_API_BASE_URL || 'https://api.makcorps.com').replace(/\/+$/, '');
const apiKey = () => process.env.MAKECORPS_API_KEY || '';

// Default-on opt-out flag. Set MAKECORPS_ENABLED=false in .env to short-circuit
// this source — useful when the free-tier quota is exhausted and every call
// would otherwise burn ~500ms on a 429 before the cooldown kicks in.
const isEnabled = () => {
  const v = String(process.env.MAKECORPS_ENABLED ?? '').toLowerCase();
  if (v === '') return true;
  return !(v === 'false' || v === '0' || v === 'no' || v === 'off');
};

/**
 * Public entry point — caller is the orchestrator.
 */
export async function fetchPrices(query) {
  const start = Date.now();

  if (!apiKey()) {
    log.debug('MAKECORPS_API_KEY not set — skipping makcorps');
    return { quotes: [], latencyMs: 0, source: 'makcorps', skipped: 'no-api-key' };
  }

  if (!isEnabled()) {
    return { quotes: [], latencyMs: 0, source: 'makcorps', skipped: 'disabled' };
  }

  if (isCoolingDown()) {
    return {
      quotes: [],
      latencyMs: 0,
      source: 'makcorps',
      skipped: 'rate-limited',
    };
  }

  const docId = await resolveHotelDocumentId(query.hotelName);
  if (!docId) {
    // If the resolver tripped the cooldown, surface that reason.
    const reason = isCoolingDown() ? 'rate-limited' : 'no-mapping';
    return { quotes: [], latencyMs: Date.now() - start, source: 'makcorps', skipped: reason };
  }

  const cacheKey = priceCacheKey(docId, query);
  const fresh = cache.getFresh(cacheKey);
  if (fresh) {
    return { ...fresh, latencyMs: Date.now() - start, fromCache: 'fresh' };
  }

  return cache.withInflight(cacheKey, async () => {
    try {
      const params = priceParams(docId, query);
      const url = `${baseUrl()}/hotel`;
      const res = await http.get(url, { params });

      // Rate-limit / quota-exhausted detection. MakCorps signals this two
      // different ways: HTTP 429, or HTTP 200 with body `{success:false,
      // message:"Limit reached..."}`. We treat both the same.
      if (isRateLimited(res)) {
        log.warn({ status: res.status }, 'makcorps rate-limited');
        triggerCooldown();
        return {
          quotes: [],
          latencyMs: Date.now() - start,
          source: 'makcorps',
          skipped: 'rate-limited',
        };
      }

      if (res.status >= 400) {
        log.warn({ status: res.status }, 'makcorps non-2xx — using stale if any');
        const stale = cache.getStale(cacheKey);
        if (stale) {
          return { ...stale, latencyMs: Date.now() - start, fromCache: 'stale' };
        }
        return { quotes: [], latencyMs: Date.now() - start, source: 'makcorps' };
      }

      const quotes = extractQuotes(res.data);
      const result = { quotes, latencyMs: Date.now() - start, source: 'makcorps' };
      cache.set(cacheKey, result, PRICE_TTL_FRESH_MS, PRICE_TTL_STALE_MS);
      return result;
    } catch (err) {
      log.warn({ err: err.message }, 'makcorps fetch failed — falling back to stale');
      const stale = cache.getStale(cacheKey);
      if (stale) return { ...stale, latencyMs: Date.now() - start, fromCache: 'stale' };
      return { quotes: [], latencyMs: Date.now() - start, source: 'makcorps' };
    }
  });
}

/**
 * Two-step resolve: name → city/hotel mapping → document_id.
 * Cached aggressively because the result is stable for hours.
 */
async function resolveHotelDocumentId(hotelName) {
  if (!hotelName) return null;
  const key = `makcorps:mapping:${String(hotelName).toLowerCase().trim()}`;
  const fresh = cache.getFresh(key);
  if (fresh) return fresh;

  return cache.withInflight(key, async () => {
    try {
      const res = await http.get(`${baseUrl()}/mapping`, {
        params: { name: hotelName, api_key: apiKey() },
      });
      if (isRateLimited(res)) {
        log.warn({ status: res.status }, 'makcorps mapping rate-limited');
        triggerCooldown();
        return null;
      }
      if (res.status >= 400) {
        log.debug({ status: res.status }, 'makcorps mapping non-2xx');
        return null;
      }
      const docId = pickFirstDocId(res.data);
      if (docId) cache.set(key, docId, RESOLVER_TTL_FRESH_MS, RESOLVER_TTL_STALE_MS);
      return docId;
    } catch (err) {
      log.debug({ err: err.message }, 'makcorps mapping failed');
      const stale = cache.getStale(key);
      return stale || null;
    }
  });
}

function priceCacheKey(docId, q) {
  return [
    'makcorps:price',
    docId,
    q.checkIn || '',
    q.checkOut || '',
    q.guests || 2,
    q.rooms || 1,
  ].join('|');
}

function priceParams(docId, q) {
  // Param names match MakCorps's hotel-by-id endpoint contract.
  return {
    hotelid: docId,
    checkin: q.checkIn,
    checkout: q.checkOut,
    adults: q.guests || 2,
    rooms: q.rooms || 1,
    currency: 'USD',
    api_key: apiKey(),
  };
}

/**
 * MakCorps responds with an array of vendor blocks; each block has a few
 * different rate plans. We flatten everything to a normalised quote shape.
 */
function extractQuotes(data) {
  if (!data) return [];
  // Normalise — MakCorps occasionally wraps the array under .comparison.
  const blocks = Array.isArray(data)
    ? data
    : Array.isArray(data?.comparison)
    ? data.comparison
    : Array.isArray(data?.prices)
    ? data.prices
    : [];

  const out = [];
  for (const block of blocks) {
    const provider = (block?.vendor1 || block?.vendor || block?.source || '').toString().trim();
    if (!provider) continue;
    const candidates = [];

    // Pattern A: { vendor1, price1, tax1 }
    if (block.price1 != null) {
      candidates.push({ price: block.price1, tax: block.tax1, room: block.room1 });
    }
    if (block.price2 != null) {
      candidates.push({ price: block.price2, tax: block.tax2, room: block.room2 });
    }
    if (block.price3 != null) {
      candidates.push({ price: block.price3, tax: block.tax3, room: block.room3 });
    }
    // Pattern B: { rates: [{ price, tax, room }] }
    if (Array.isArray(block.rates)) {
      for (const r of block.rates) {
        candidates.push({ price: r.price ?? r.rate ?? r.amount, tax: r.tax, room: r.room });
      }
    }
    // Pattern C: { price, currency, room }
    if (block.price != null && candidates.length === 0) {
      candidates.push({ price: block.price, tax: block.tax, room: block.room });
    }

    const currency = (block.currency || 'USD').toUpperCase();
    for (const c of candidates) {
      const usd = toUsd(c.price, currency);
      if (usd && usd > 0) {
        out.push({
          provider,
          currency: 'USD',
          perNightUsd: Number(usd.toFixed(2)),
          room: c.room || null,
        });
      }
    }
  }
  return out;
}

/**
 * MakCorps signals quota exhaustion two ways:
 *   • HTTP 429
 *   • HTTP 200 with body `{ success: false, message: "Limit reached..." }`
 * Either way the upstream is unusable; we want to fall back fast without
 * polluting the cache.
 */
function isRateLimited(res) {
  if (!res) return false;
  if (res.status === 429) return true;
  const body = res.data;
  if (body && body.success === false && typeof body.message === 'string') {
    return /limit\s+reached|quota|upgrade your plan/i.test(body.message);
  }
  return false;
}

function pickFirstDocId(data) {
  if (!data) return null;
  // MakCorps mapping responses come as either a flat array or { results: [...] }
  const arr = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
  for (const row of arr) {
    const id = row?.document_id || row?.id || row?.hotel_id;
    if (id) return String(id);
  }
  return null;
}
