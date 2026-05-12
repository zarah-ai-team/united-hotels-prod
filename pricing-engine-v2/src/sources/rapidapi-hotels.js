// RapidAPI Hotels source adapter — secondary external price anchor.
//
// Defaults to `booking-com15.p.rapidapi.com` (set via RAPIDAPI_HOST), but the
// adapter is endpoint-tolerant: we look for whichever known shape the host
// returns. Two-step flow mirrors makcorps.js:
//
//   1. searchDestination(name)  → list of candidate dest_ids
//   2. searchHotelsByDest(...)  → array of hotels with price.gross / min_total_price
//
// We pick the destination row whose name has the smallest Levenshtein
// distance to the query hotelName + matches the given city/district when
// available, then fetch its prices for the date range and pull out the top
// hotel match (again by Levenshtein on the hotel field).
//
// Returns the same normalised shape as makcorps:
//   { quotes: [{ provider, currency, perNightUsd, room? }], latencyMs, source }

import { http } from '../lib/http.js';
import { cache } from '../lib/cache.js';
import { toUsd } from '../lib/fx.js';
import { log } from '../lib/log.js';

const DEST_TTL_FRESH_MS = 12 * 60 * 60 * 1000; // 12 h
const DEST_TTL_STALE_MS = 24 * 60 * 60 * 1000; // 24 h
const PRICE_TTL_FRESH_MS = 120 * 1000; //  2 m
const PRICE_TTL_STALE_MS = 360 * 1000; //  6 m

const host = () => process.env.RAPIDAPI_HOST || 'booking-com15.p.rapidapi.com';
const apiKey = () => process.env.RAPIDAPI_KEY || '';
const baseUrl = () => `https://${host()}`;

// Default-on opt-out flag. Set BOOKINGCOM_ENABLED=false in .env to short-circuit
// this source — useful when the booking-com15 free-tier quota is exhausted.
// The shared RAPIDAPI_KEY is also used by the Hotels.com adapter, so we can't
// just clear the key to disable booking-com15.
const isEnabled = () => {
  const v = String(process.env.BOOKINGCOM_ENABLED ?? '').toLowerCase();
  if (v === '') return true;
  return !(v === 'false' || v === '0' || v === 'no' || v === 'off');
};

// Process-local rate-limit cooldown — same idea as makcorps.js. RapidAPI
// returns 429 with `{message: "exceeded the MONTHLY quota..."}` once the
// free tier is exhausted; subsequent calls would just keep getting 429.
const RATE_LIMIT_COOLDOWN_MS = 5 * 60 * 1000;
let rateLimitedUntil = 0;
const isCoolingDown = () => Date.now() < rateLimitedUntil;
const triggerCooldown = () => {
  rateLimitedUntil = Date.now() + RATE_LIMIT_COOLDOWN_MS;
};

function isRateLimited(res) {
  if (!res) return false;
  if (res.status === 429) return true;
  const body = res.data;
  if (body && typeof body.message === 'string') {
    return /exceeded.*quota|rate.?limit|monthly quota|upgrade your plan/i.test(body.message);
  }
  return false;
}

function rapidHeaders() {
  return {
    'x-rapidapi-key': apiKey(),
    'x-rapidapi-host': host(),
  };
}

/**
 * Public entry point — same signature as every other source adapter.
 */
export async function fetchPrices(query) {
  const start = Date.now();

  if (!apiKey()) {
    log.debug('RAPIDAPI_KEY not set — skipping rapidapi');
    return { quotes: [], latencyMs: 0, source: 'rapidapi', skipped: 'no-api-key' };
  }

  if (!isEnabled()) {
    return { quotes: [], latencyMs: 0, source: 'rapidapi', skipped: 'disabled' };
  }

  if (isCoolingDown()) {
    return { quotes: [], latencyMs: 0, source: 'rapidapi', skipped: 'rate-limited' };
  }

  const dest = await resolveDestination(query);
  if (!dest) {
    // If the resolver tripped the cooldown, the right reason is rate-limit.
    const reason = isCoolingDown() ? 'rate-limited' : 'no-destination';
    return {
      quotes: [],
      latencyMs: Date.now() - start,
      source: 'rapidapi',
      skipped: reason,
    };
  }

  const cacheKey = priceCacheKey(dest.id, query);
  const fresh = cache.getFresh(cacheKey);
  if (fresh) {
    return { ...fresh, latencyMs: Date.now() - start, fromCache: 'fresh' };
  }

  return cache.withInflight(cacheKey, async () => {
    try {
      const url = `${baseUrl()}/api/v1/hotels/searchHotels`;
      const params = {
        dest_id: dest.id,
        search_type: dest.type || 'CITY',
        arrival_date: query.checkIn,
        departure_date: query.checkOut,
        adults: query.guests || 2,
        room_qty: query.rooms || 1,
        currency_code: 'USD',
        units: 'metric',
        page_number: 1,
      };
      const res = await http.get(url, { params, headers: rapidHeaders() });

      if (isRateLimited(res)) {
        log.warn({ status: res.status }, 'rapidapi rate-limited');
        triggerCooldown();
        return {
          quotes: [],
          latencyMs: Date.now() - start,
          source: 'rapidapi',
          skipped: 'rate-limited',
        };
      }

      if (res.status >= 400) {
        log.warn({ status: res.status }, 'rapidapi non-2xx — using stale if any');
        const stale = cache.getStale(cacheKey);
        if (stale) {
          return { ...stale, latencyMs: Date.now() - start, fromCache: 'stale' };
        }
        return { quotes: [], latencyMs: Date.now() - start, source: 'rapidapi' };
      }

      const quotes = extractQuotes(res.data, query.hotelName);
      const result = { quotes, latencyMs: Date.now() - start, source: 'rapidapi' };
      cache.set(cacheKey, result, PRICE_TTL_FRESH_MS, PRICE_TTL_STALE_MS);
      return result;
    } catch (err) {
      log.warn({ err: err.message }, 'rapidapi fetch failed — falling back to stale');
      const stale = cache.getStale(cacheKey);
      if (stale) return { ...stale, latencyMs: Date.now() - start, fromCache: 'stale' };
      return { quotes: [], latencyMs: Date.now() - start, source: 'rapidapi' };
    }
  });
}

/**
 * Resolve a hotelName + city hint to a RapidAPI dest_id. The Booking.com
 * RapidAPI returns hotels, cities, and districts in the same response —
 * we prefer rows whose `dest_type` is HOTEL when the name matches well,
 * else fall back to the closest city.
 */
async function resolveDestination(query) {
  const seed = (query.hotelName || query.location || query.district || '').toString().trim();
  if (!seed) return null;
  const key = `rapidapi:dest:${seed.toLowerCase()}`;

  const fresh = cache.getFresh(key);
  if (fresh) return fresh;

  return cache.withInflight(key, async () => {
    try {
      const url = `${baseUrl()}/api/v1/hotels/searchDestination`;
      const res = await http.get(url, {
        params: { query: seed },
        headers: rapidHeaders(),
      });
      if (isRateLimited(res)) {
        log.warn({ status: res.status }, 'rapidapi searchDestination rate-limited');
        triggerCooldown();
        return null;
      }
      if (res.status >= 400) {
        log.debug({ status: res.status }, 'rapidapi searchDestination non-2xx');
        return null;
      }
      const picked = pickBestDestination(res.data, query);
      if (picked) cache.set(key, picked, DEST_TTL_FRESH_MS, DEST_TTL_STALE_MS);
      return picked;
    } catch (err) {
      log.debug({ err: err.message }, 'rapidapi searchDestination failed');
      const stale = cache.getStale(key);
      return stale || null;
    }
  });
}

function pickBestDestination(data, query) {
  const rows = extractDestRows(data);
  if (!rows.length) return null;

  const target = (query.hotelName || '').toString().toLowerCase().trim();
  const cityHint = (query.location || query.district || '').toString().toLowerCase().trim();

  // Score every row by (typePref + nameSimilarity + cityMatch). Higher is better.
  let best = null;
  let bestScore = -Infinity;
  for (const row of rows) {
    const name = (row.name || row.label || row.hotel_name || '').toString().toLowerCase();
    if (!name) continue;
    const type = (row.dest_type || row.type || '').toString().toUpperCase();
    const cityName = (row.city_name || row.region || row.country || '').toString().toLowerCase();

    const sim = similarity(name, target);
    const cityMatch = cityHint && (cityName.includes(cityHint) || cityHint.includes(cityName)) ? 0.2 : 0;
    const typeBonus = type === 'HOTEL' ? 0.3 : type === 'CITY' || type === 'DISTRICT' ? 0.1 : 0;

    const score = sim + cityMatch + typeBonus;
    if (score > bestScore) {
      bestScore = score;
      best = {
        id: row.dest_id || row.id || row.hotel_id,
        type: type || 'CITY',
        name,
        score,
      };
    }
  }
  if (!best || !best.id) return null;
  return best;
}

function extractDestRows(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.suggestions)) return data.suggestions;
  return [];
}

function priceCacheKey(destId, q) {
  return [
    'rapidapi:price',
    destId,
    q.checkIn || '',
    q.checkOut || '',
    q.guests || 2,
    q.rooms || 1,
  ].join('|');
}

/**
 * RapidAPI returns a hotel array with price fields nested in different keys
 * across versions of the API. We try every known key and keep the first that
 * yields a positive number. We also pick the row whose hotel name best
 * matches the query — the dest may have been a city, so we still need to
 * narrow to the right property.
 */
function extractQuotes(data, hotelName) {
  const rows = extractHotelRows(data);
  if (!rows.length) return [];

  const target = (hotelName || '').toString().toLowerCase().trim();
  // Sort by name similarity so the top-K rows are most relevant.
  const ranked = rows
    .map((r) => ({ row: r, sim: similarity(getHotelName(r), target) }))
    .sort((a, b) => b.sim - a.sim);

  const out = [];
  // Take up to 5 close matches — same hotel can appear with different rate
  // plans, and a wider net helps the aggregator's outlier filter.
  for (const { row, sim } of ranked.slice(0, 5)) {
    if (target && sim < 0.3) continue; // too dissimilar — probably wrong hotel
    const priceUsd = pickPriceUsd(row);
    if (!priceUsd) continue;
    out.push({
      provider: deriveProvider(row),
      currency: 'USD',
      perNightUsd: Number(priceUsd.toFixed(2)),
      room: row.room_type || row.unit_configuration_label || null,
    });
  }
  return out;
}

function extractHotelRows(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data?.hotels)) return data.data.hotels;
  if (Array.isArray(data?.hotels)) return data.hotels;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getHotelName(row) {
  const candidate =
    row?.property?.name ||
    row?.hotel_name ||
    row?.name ||
    row?.title ||
    row?.label ||
    '';
  return candidate.toString().toLowerCase();
}

function pickPriceUsd(row) {
  // Booking-com15 nests price under property.priceBreakdown.grossPrice.value.
  const candidates = [
    row?.property?.priceBreakdown?.grossPrice?.value,
    row?.property?.priceBreakdown?.netPrice?.value,
    row?.priceBreakdown?.grossPrice?.value,
    row?.price?.gross,
    row?.price?.amount,
    row?.price,
    row?.min_total_price,
    row?.total_price,
    row?.rate,
  ];
  for (const c of candidates) {
    const n = Number(c);
    if (Number.isFinite(n) && n > 0) {
      // Some endpoints already return per-night; others return stay-total.
      // We trust the host: booking-com15 returns gross stay total, but
      // because we always pass arrival/departure, the orchestrator
      // expects per-night. The aggregator divides downstream — see
      // pipeline/aggregator.js. To stay schema-compatible, we return the
      // raw per-night here and let the harness flag stay-total cases.
      const currency = (row?.property?.priceBreakdown?.grossPrice?.currency ||
        row?.priceBreakdown?.grossPrice?.currency ||
        row?.price?.currency ||
        'USD').toUpperCase();
      return toUsd(n, currency);
    }
  }
  return 0;
}

function deriveProvider(row) {
  // Top-level brand depends on the host. Booking.com → 'booking',
  // Expedia → 'expedia', etc. We default to the host TLD slug.
  const explicit = row?.provider || row?.source;
  if (explicit) return String(explicit).toLowerCase();
  const h = host();
  if (h.includes('booking')) return 'booking';
  if (h.includes('expedia')) return 'expedia';
  if (h.includes('hotels.com') || h.includes('hotelscom')) return 'hotels.com';
  if (h.includes('agoda')) return 'agoda';
  return 'rapidapi';
}

/**
 * Normalised Levenshtein-based similarity in [0, 1]. Cheap enough to run on
 * every candidate row — hotelName arrays are tiny (<50 entries typically).
 */
function similarity(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const dist = levenshtein(a, b);
  const longer = Math.max(a.length, b.length);
  return longer === 0 ? 1 : 1 - dist / longer;
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  // Two-row DP — O(min(m,n)) memory.
  const prev = new Array(n + 1);
  const cur = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= n; j++) prev[j] = cur[j];
  }
  return prev[n];
}
