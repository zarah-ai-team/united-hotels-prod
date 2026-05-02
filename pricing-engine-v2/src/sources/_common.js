// Shared helpers for the RapidAPI source-adapter family. Each provider has
// its own host + endpoint shapes but the surrounding plumbing (rate-limit
// cooldown, fuzzy name match, USD normalisation, response logging) is
// identical — so it lives here.

import { log } from '../lib/log.js';
import { toUsd } from '../lib/fx.js';

const RATE_LIMIT_COOLDOWN_MS = 5 * 60 * 1000;

/**
 * Build a per-provider mutable cooldown handle. Returned object exposes
 * isCoolingDown() / trigger() so each provider keeps its own cooldown
 * state, independent of the others.
 */
export function makeCooldown(label) {
  let until = 0;
  return {
    isCoolingDown: () => Date.now() < until,
    trigger: () => {
      until = Date.now() + RATE_LIMIT_COOLDOWN_MS;
      log.warn({ provider: label }, 'rapidapi rate-limit cooldown engaged');
    },
  };
}

/**
 * RapidAPI providers signal rate-limit two ways: HTTP 429, or HTTP 200
 * with body `{message: "exceeded the MONTHLY quota..."}` / similar. We
 * accept any provider whose body contains common quota-exhaustion phrases.
 */
export function isRateLimited(res) {
  if (!res) return false;
  if (res.status === 429) return true;
  const body = res.data;
  if (body && typeof body.message === 'string') {
    return /exceeded.*quota|rate.?limit|monthly quota|upgrade your plan|too many requests/i.test(
      body.message,
    );
  }
  return false;
}

/**
 * Normalised Levenshtein-based similarity in [0, 1]. Cheap enough to run on
 * every candidate row — provider responses are typically <50 hotels.
 */
export function similarity(a, b) {
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

/**
 * Standard headers for any RapidAPI host. The master key is per-account, the
 * host header is per-API-subscription.
 */
export function rapidHeaders(host) {
  return {
    'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
    'x-rapidapi-host': host,
  };
}

/**
 * Convert a candidate price + currency into USD using the static FX table,
 * round to 2 decimals, return null if invalid. Used by every provider when
 * pulling the price field out of a hotel row.
 */
export function priceToUsd(value, currency) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  const usd = toUsd(n, (currency || 'USD').toUpperCase());
  if (!usd || usd <= 0) return null;
  return Number(usd.toFixed(2));
}

/**
 * Walk an object via dot-path, returning the leaf value or undefined.
 * Used to defensively pluck price fields like
 * `property.priceBreakdown.grossPrice.value` even if intermediate nodes
 * are missing.
 */
export function pluck(obj, path) {
  return path.split('.').reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);
}

/**
 * Try a list of candidate paths for a price field; return the first that
 * yields a finite positive number. Each provider's response shape is
 * different, so we list every known shape and try them in order.
 */
export function pickFirstPositiveNumber(obj, paths) {
  for (const p of paths) {
    const v = pluck(obj, p);
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}
