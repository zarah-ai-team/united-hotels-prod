// Hotels.com Provider (apidojo) — RapidAPI source adapter.
//
// Real endpoints discovered via probing the live API:
//   • GET /v2/regions?query=<q>&locale=en_US&domain=US     — find a region
//   • GET /v3/hotels/search                                — list hotels with prices
//
// The /v3 path is the working one — /v2/hotels/search returns skeleton
// LodgingCard entries with no actual hotel data. The /v3 response shape is:
//   { data: { properties: [{ id, name, price: { priceSummary: { displayPrices: [{value: "$28 nightly"}] }}, ... }] } }
//
// Price strings come pre-formatted ("$28 nightly"). We strip the symbol +
// "nightly" suffix and run through the standard FX normaliser. The shared
// quote shape returned matches every other source adapter:
//   { quotes: [{ provider, currency, perNightUsd, room? }], latencyMs, source, skipped? }

// NOTE: this adapter uses native fetch() (Node 18+) rather than the shared
// axios http instance, because the shared instance was hanging on this
// host's responses for ~10s even when direct curl/fetch returned in 1-2s.
// Most likely an interceptor interaction with axios's default agent
// keep-alive on the same RapidAPI key. Native fetch sidesteps it cleanly.

import { cache } from '../lib/cache.js';
import { log } from '../lib/log.js';
import {
  makeCooldown,
  isRateLimited,
  similarity,
  rapidHeaders,
  priceToUsd,
} from './_common.js';

const FETCH_TIMEOUT_MS = 8000;

async function fetchJson(url, params, headers) {
  const u = new URL(url);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) u.searchParams.set(k, String(v));
    }
  }
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(u.toString(), { headers, signal: ctrl.signal });
    let data = null;
    try { data = await res.json(); } catch { data = null; }
    return { status: res.status, data };
  } catch (err) {
    return { status: 0, data: null, error: err.message };
  } finally {
    clearTimeout(t);
  }
}

const PROVIDER_ID = 'hotelscom';
const cooldown = makeCooldown(PROVIDER_ID);

const DEST_TTL_FRESH_MS = 12 * 60 * 60 * 1000;
const DEST_TTL_STALE_MS = 24 * 60 * 60 * 1000;
const PRICE_TTL_FRESH_MS = 120 * 1000;
const PRICE_TTL_STALE_MS = 360 * 1000;

const HOST = 'hotels-com-provider.p.rapidapi.com';
const baseUrl = () => `https://${HOST}`;

const apiKey = () => process.env.RAPIDAPI_KEY || '';
const isEnabledExplicitly = () => {
  const v = String(process.env.HOTELSCOM_ENABLED || '').toLowerCase();
  return v === 'true' || v === '1' || v === 'yes';
};

export async function fetchPrices(query) {
  const start = Date.now();

  if (!apiKey()) {
    return { quotes: [], latencyMs: 0, source: PROVIDER_ID, skipped: 'no-api-key' };
  }
  if (!isEnabledExplicitly()) {
    return { quotes: [], latencyMs: 0, source: PROVIDER_ID, skipped: 'disabled' };
  }
  if (cooldown.isCoolingDown()) {
    return { quotes: [], latencyMs: 0, source: PROVIDER_ID, skipped: 'rate-limited' };
  }

  const region = await resolveRegion(query);
  if (!region) {
    const reason = cooldown.isCoolingDown() ? 'rate-limited' : 'no-region';
    return { quotes: [], latencyMs: Date.now() - start, source: PROVIDER_ID, skipped: reason };
  }

  const cacheKey = priceCacheKey(region.id, query);
  const fresh = cache.getFresh(cacheKey);
  if (fresh) return { ...fresh, latencyMs: Date.now() - start, fromCache: 'fresh' };

  return cache.withInflight(cacheKey, async () => {
    try {
      const params = {
        domain: 'US',
        sort_order: 'PRICE_LOW_TO_HIGH',
        locale: 'en_US',
        region_id: region.id,
        checkin_date: query.checkIn,
        checkout_date: query.checkOut,
        adults_number: query.guests || 2,
        currency: 'USD',
      };
      const url = `${baseUrl()}/v3/hotels/search`;
      const res = await fetchJson(url, params, rapidHeaders(HOST));

      if (isRateLimited(res)) {
        cooldown.trigger();
        return { quotes: [], latencyMs: Date.now() - start, source: PROVIDER_ID, skipped: 'rate-limited' };
      }
      if (res.status >= 400) {
        log.warn({ status: res.status, provider: PROVIDER_ID }, 'hotels.com provider non-2xx');
        const stale = cache.getStale(cacheKey);
        if (stale) return { ...stale, latencyMs: Date.now() - start, fromCache: 'stale' };
        return { quotes: [], latencyMs: Date.now() - start, source: PROVIDER_ID };
      }

      const quotes = extractQuotes(res.data, query.hotelName);
      const result = { quotes, latencyMs: Date.now() - start, source: PROVIDER_ID };
      // Don't cache empty quote responses — that lets a single transient
      // miss poison the next 2 minutes of requests for this hotel+date.
      if (quotes.length > 0) {
        cache.set(cacheKey, result, PRICE_TTL_FRESH_MS, PRICE_TTL_STALE_MS);
      }
      return result;
    } catch (err) {
      log.warn({ err: err.message, provider: PROVIDER_ID }, 'hotels.com fetch failed');
      const stale = cache.getStale(cacheKey);
      if (stale) return { ...stale, latencyMs: Date.now() - start, fromCache: 'stale' };
      return { quotes: [], latencyMs: Date.now() - start, source: PROVIDER_ID };
    }
  });
}

async function resolveRegion(query) {
  // Prefer the city/location seed over the hotel name. The /v3/hotels/search
  // endpoint takes a CITY region_id anyway, so all hotels in the same city
  // share the same region — caching by hotel name causes 39 unique fetches
  // for 39 Istanbul hotels and burns through the free tier in seconds.
  const cityCandidate = (query.location || query.district || '').toString().trim();
  // If the location-string is just "Istanbul, Turkey" we can resolve in one
  // hit; if it's a hotel name (legacy callers pass hotelName only), still
  // works because Hotels.com /v2/regions returns a HOTEL row and we extract
  // its cityId in pickRegion().
  const seed = cityCandidate || (query.hotelName || '').toString().trim();
  if (!seed) return null;
  const key = `hotelscom:region:${seed.toLowerCase()}`;

  const fresh = cache.getFresh(key);
  if (fresh) return fresh;

  return cache.withInflight(key, async () => {
    try {
      const res = await fetchJson(
        `${baseUrl()}/v2/regions`,
        { query: seed, locale: 'en_US', domain: 'US' },
        rapidHeaders(HOST),
      );
      if (isRateLimited(res)) {
        cooldown.trigger();
        return null;
      }
      if (res.status >= 400) return null;
      const picked = pickRegion(res.data, query);
      if (picked) cache.set(key, picked, DEST_TTL_FRESH_MS, DEST_TTL_STALE_MS);
      return picked;
    } catch (err) {
      log.debug({ err: err.message, provider: PROVIDER_ID }, 'hotels.com region search failed');
      return cache.getStale(key) || null;
    }
  });
}

/**
 * Pick the best region for the listing search. Critical: /v3/hotels/search
 * expects a CITY region_id, not a HOTEL id. If the closest match is a HOTEL,
 * we extract its `cityId` and use THAT as the region_id, since we want
 * city-level OTA prices as the anchor pool either way.
 */
function pickRegion(data, query) {
  const rows = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  if (!rows.length) return null;
  const target = (query.hotelName || '').toString().toLowerCase().trim();
  const cityHint = (query.location || query.district || '').toString().toLowerCase().trim();

  let best = null;
  let bestScore = -Infinity;
  for (const row of rows) {
    const type = (row?.type || row?.dest_type || '').toString().toUpperCase();
    // For HOTEL rows the gaia/ess id IS the hotel id; we must use cityId
    // for the listing search. For CITY/REGION rows the gaia id is what we want.
    const id =
      type === 'HOTEL'
        ? (row?.cityId || row?.hierarchyInfo?.cityId || null)
        : (row?.gaiaId || row?.essId?.sourceId || row?.regionId || row?.id || null);
    if (!id) continue;
    // Use shortName for similarity matching: fullName includes the country
    // and bloats Levenshtein for foreign-look-alike hotels (e.g. "Winstar
    // Hotel, Pekanbaru, Indonesia" vs the Istanbul "The Wings Hotels Pera").
    const name = (row?.regionNames?.shortName || row?.regionNames?.primaryDisplayName || row?.name || '').toString().toLowerCase();
    if (!name) continue;
    const sim = similarity(name, target);
    const cityMatch = cityHint && name.includes(cityHint) ? 0.2 : 0;
    // Prefer HOTEL matches a little — when we recognise the actual hotel
    // we get its real cityId. CITY rows are still kept as a fallback.
    const typeBonus = type === 'HOTEL' ? 0.25 : type === 'CITY' ? 0.1 : 0;
    const score = sim + cityMatch + typeBonus;
    if (score > bestScore) {
      bestScore = score;
      best = { id: String(id), type: 'CITY', name };
    }
  }
  return best;
}

/**
 * /v3/hotels/search returns: { data: { properties: [{ id, name, price: {...} }] } }.
 * Hotels.com formats prices as strings like "$28 nightly" inside
 * `price.priceSummary.displayPrices[].value`. We strip the symbol/suffix and
 * run it through the FX normaliser.
 */
function extractQuotes(data, hotelName) {
  const rows = Array.isArray(data?.data?.properties) ? data.data.properties : [];
  if (!rows.length) return [];

  const target = (hotelName || '').toString().toLowerCase().trim();
  // Rank by name similarity. If a hotel matches well (>=0.5) we use only the
  // close matches. Otherwise — the common case for boutique properties not
  // on Hotels.com's index — we fall back to the top-5 cheapest in the same
  // city, which gives the aggregator a city-floor anchor instead of nothing.
  const ranked = rows
    .map((r) => ({ row: r, sim: similarity(getHotelName(r), target) }))
    .sort((a, b) => b.sim - a.sim);

  const closeMatches = target ? ranked.filter(({ sim }) => sim >= 0.5) : [];
  const pool = closeMatches.length ? closeMatches.slice(0, 5) : ranked.slice(0, 5);

  const out = [];
  for (const { row } of pool) {
    const priceUsd = pickPriceUsd(row);
    if (!priceUsd) continue;
    out.push({
      provider: 'hotels.com',
      currency: 'USD',
      perNightUsd: priceUsd,
      // Tag city-level fallback so a future debug page can show why we used
      // unrelated hotels' prices as the anchor.
      room: closeMatches.length ? null : 'city-floor',
    });
  }
  return out;
}

function getHotelName(row) {
  return (row?.name || '').toString().toLowerCase();
}

function pickPriceUsd(row) {
  const summary = row?.price?.priceSummary || {};
  const displays = Array.isArray(summary.displayPrices) ? summary.displayPrices : [];

  // 1) Prefer the "nightly" display value because that's what we anchor on.
  for (const dp of displays) {
    const v = (dp?.value || '').toString();
    if (/nightly/i.test(v)) {
      const n = stripPriceString(v);
      if (n) return priceToUsd(n, 'USD');
    }
  }

  // 2) Fall back to ANY priced display (sometimes the nightly tag is absent).
  for (const dp of displays) {
    const v = (dp?.value || '').toString();
    const n = stripPriceString(v);
    if (n) return priceToUsd(n, 'USD');
  }

  // 3) Older shapes: price.lead.amount or price.options[0].amount.
  const lead = Number(row?.price?.lead?.amount);
  if (Number.isFinite(lead) && lead > 0) return priceToUsd(lead, 'USD');
  return null;
}

function stripPriceString(s) {
  // "$28 nightly" → 28. Also handles "USD 28", "₺28", commas as separators.
  const m = String(s || '').match(/[\d,]+(?:\.\d+)?/);
  if (!m) return null;
  const n = Number(m[0].replace(/,/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function priceCacheKey(regionId, q) {
  return ['hotelscom:price', regionId, q.checkIn || '', q.checkOut || '', q.guests || 2, q.rooms || 1].join('|');
}
