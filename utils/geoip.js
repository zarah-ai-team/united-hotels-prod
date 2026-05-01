/**
 * Country resolver for incoming requests.
 *
 *   Priority:
 *     1. explicit `country` field on the request body  ("US", "IN", …)
 *     2. edge-provided header from Cloudflare / Vercel  (cf-ipcountry, …)
 *     3. IP geolocation against ipapi.co               (cached 24h)
 *     4. Accept-Language locale tag                    ("en-US" → "US")
 *     5. null  → caller can store as 'Unknown'
 *
 * The IP lookup is cached in-process and given a hard 2s timeout so a slow
 * upstream never blocks a booking write — if everything fails we still
 * return null and the booking proceeds.
 */

const axios = require('axios');

const TTL_MS = 24 * 60 * 60 * 1000; // 24h
const LOOKUP_TIMEOUT_MS = parseInt(process.env.GEOIP_TIMEOUT_MS || '2000', 10);
const ipCache = new Map(); // ip → { country, expiresAt }

const isPrivateIp = (ip) => {
  if (!ip) return true;
  const stripped = ip.replace(/^::ffff:/, ''); // IPv4-mapped IPv6
  if (stripped === '127.0.0.1' || stripped === '::1' || stripped === 'localhost') return true;
  if (/^10\./.test(stripped)) return true;
  if (/^192\.168\./.test(stripped)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(stripped)) return true;
  if (/^169\.254\./.test(stripped)) return true; // link-local
  if (stripped.startsWith('fc') || stripped.startsWith('fd')) return true; // ULA
  return false;
};

const extractIp = (req) => {
  const xff = req.headers && req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length > 0) {
    const first = xff.split(',')[0].trim();
    if (first) return first;
  }
  return (
    (req.headers && req.headers['x-real-ip']) ||
    req.ip ||
    (req.socket && req.socket.remoteAddress) ||
    (req.connection && req.connection.remoteAddress) ||
    null
  );
};

// Cloudflare / Vercel / generic CDN headers — synchronous, no network call.
const headerCountry = (req) => {
  if (!req.headers) return null;
  const candidates = [
    req.headers['cf-ipcountry'],
    req.headers['x-vercel-ip-country'],
    req.headers['x-country-code'],
    req.headers['x-appengine-country'],
    req.headers['fastly-geo-country'],
  ].filter(Boolean);
  for (const c of candidates) {
    const v = String(c).trim().toUpperCase();
    if (/^[A-Z]{2}$/.test(v) && v !== 'XX' && v !== 'T1') return v;
  }
  return null;
};

const acceptLanguageCountry = (req) => {
  const accept = String((req.headers && req.headers['accept-language']) || '');
  const m = accept.match(/-([A-Z]{2})/i);
  return m ? m[1].toUpperCase() : null;
};

async function lookupIpCountry(ip) {
  if (!ip || isPrivateIp(ip)) return null;
  const cached = ipCache.get(ip);
  if (cached && cached.expiresAt > Date.now()) return cached.country;

  try {
    const res = await axios.get(`https://ipapi.co/${encodeURIComponent(ip)}/country/`, {
      timeout: LOOKUP_TIMEOUT_MS,
      headers: { 'User-Agent': 'UnitedHotels/1.0', 'Accept': 'text/plain' },
      validateStatus: (s) => s >= 200 && s < 500,
    });
    const country = String(res.data || '').trim().toUpperCase();
    if (/^[A-Z]{2}$/.test(country)) {
      ipCache.set(ip, { country, expiresAt: Date.now() + TTL_MS });
      // Bound the cache to avoid unbounded growth.
      if (ipCache.size > 5000) ipCache.delete(ipCache.keys().next().value);
      return country;
    }
  } catch {
    // Network/timeout — silent fallback to next strategy.
  }
  return null;
}

/**
 * Top-level resolver. Reads the priority chain above and returns either a
 * 2-letter ISO country code or null.
 */
async function detectCountry(req, options = {}) {
  // 1. Explicit field on the body (frontend already maps the user's region).
  const explicit = req.body && (req.body.country || req.body.countryCode || req.body.country_code);
  if (typeof explicit === 'string') {
    const v = explicit.trim().toUpperCase();
    if (/^[A-Z]{2}$/.test(v)) return v;
  }

  // 2. Edge header (Cloudflare / Vercel / Fastly).
  const fromHeader = headerCountry(req);
  if (fromHeader) return fromHeader;

  // 3. IP geolocation. Skipped when the caller doesn't want a network round-trip.
  if (options.skipIpLookup !== true) {
    const ip = extractIp(req);
    const fromIp = await lookupIpCountry(ip);
    if (fromIp) return fromIp;
  }

  // 4. Browser locale.
  const fromLocale = acceptLanguageCountry(req);
  if (fromLocale) return fromLocale;

  return null;
}

module.exports = {
  detectCountry,
  extractIp,
  headerCountry,
  acceptLanguageCountry,
  lookupIpCountry,
  isPrivateIp,
};
