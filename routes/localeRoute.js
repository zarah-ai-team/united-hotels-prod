// Locale auto-detect endpoint.
//
// Returns the suggested language + currency for the calling visitor based on:
//   1. an explicit `?country=XX` override
//   2. CDN edge headers (cf-ipcountry, x-vercel-ip-country, …)
//   3. server-side IP geolocation (cached 24h in geoip.js)
//   4. Accept-Language tag
//
// The frontend calls this once on first visit (when no region is saved in
// localStorage) and uses the response to seed the LanguageContext. Doing
// this server-side avoids the cross-origin failures that plague the
// browser-side ipapi.co / ipwho.is calls (ad blockers, CORS, rate limits).

const express = require('express');
const { detectCountry, extractIp, headerCountry } = require('../utils/geoip');

const router = express.Router();

// ISO 3166-1 alpha-2 → suggested locale info.
// Kept in sync with the FE REGIONS map. Anything not listed falls through
// to the default (en-US / USD) on the FE side.
const COUNTRY_MAP = {
  US: { region: 'en-US', language: 'en', currency: 'USD' },
  CA: { region: 'en-US', language: 'en', currency: 'USD' },
  GB: { region: 'en-GB', language: 'en', currency: 'GBP' },
  IE: { region: 'en-GB', language: 'en', currency: 'GBP' },
  AU: { region: 'en-GB', language: 'en', currency: 'GBP' },
  NZ: { region: 'en-GB', language: 'en', currency: 'GBP' },
  TR: { region: 'tr-TR', language: 'tr', currency: 'TRY' },
  DE: { region: 'de-DE', language: 'de', currency: 'EUR' },
  AT: { region: 'de-DE', language: 'de', currency: 'EUR' },
  CH: { region: 'de-DE', language: 'de', currency: 'EUR' },
  LI: { region: 'de-DE', language: 'de', currency: 'EUR' },
  FR: { region: 'fr-FR', language: 'fr', currency: 'EUR' },
  BE: { region: 'fr-FR', language: 'fr', currency: 'EUR' },
  LU: { region: 'fr-FR', language: 'fr', currency: 'EUR' },
  MC: { region: 'fr-FR', language: 'fr', currency: 'EUR' },
  ES: { region: 'es-ES', language: 'es', currency: 'EUR' },
  MX: { region: 'es-ES', language: 'es', currency: 'EUR' },
  AR: { region: 'es-ES', language: 'es', currency: 'EUR' },
  CL: { region: 'es-ES', language: 'es', currency: 'EUR' },
  CO: { region: 'es-ES', language: 'es', currency: 'EUR' },
  PE: { region: 'es-ES', language: 'es', currency: 'EUR' },
  IT: { region: 'it-IT', language: 'it', currency: 'EUR' },
  SM: { region: 'it-IT', language: 'it', currency: 'EUR' },
  VA: { region: 'it-IT', language: 'it', currency: 'EUR' },
  AE: { region: 'ar-AE', language: 'ar', currency: 'AED' },
  BH: { region: 'ar-AE', language: 'ar', currency: 'AED' },
  KW: { region: 'ar-AE', language: 'ar', currency: 'AED' },
  OM: { region: 'ar-AE', language: 'ar', currency: 'AED' },
  QA: { region: 'ar-AE', language: 'ar', currency: 'AED' },
  JO: { region: 'ar-AE', language: 'ar', currency: 'AED' },
  LB: { region: 'ar-AE', language: 'ar', currency: 'AED' },
  EG: { region: 'ar-AE', language: 'ar', currency: 'AED' },
  SA: { region: 'ar-SA', language: 'ar', currency: 'SAR' },
  RU: { region: 'ru-RU', language: 'ru', currency: 'RUB' },
  BY: { region: 'ru-RU', language: 'ru', currency: 'RUB' },
  KZ: { region: 'ru-RU', language: 'ru', currency: 'RUB' },
  KG: { region: 'ru-RU', language: 'ru', currency: 'RUB' },
  UA: { region: 'ru-RU', language: 'ru', currency: 'RUB' },
  CN: { region: 'zh-CN', language: 'zh', currency: 'CNY' },
  HK: { region: 'zh-CN', language: 'zh', currency: 'CNY' },
  TW: { region: 'zh-CN', language: 'zh', currency: 'CNY' },
  SG: { region: 'zh-CN', language: 'zh', currency: 'CNY' },
  JP: { region: 'ja-JP', language: 'ja', currency: 'JPY' },
};

const DEFAULT_SUGGESTION = { region: 'en-US', language: 'en', currency: 'USD' };

router.get('/detect', async (req, res) => {
  const ip = extractIp(req) || null;
  const fromHeader = headerCountry(req);

  let country = null;
  let source = null;

  try {
    country = await detectCountry(req);
    if (country) {
      source = fromHeader === country ? 'cdn-header' : 'ip-lookup';
      // Accept-Language fallback can also produce a country — distinguish.
      if (!fromHeader) {
        const acceptHeader = String((req.headers && req.headers['accept-language']) || '');
        if (acceptHeader.toUpperCase().includes(`-${country}`)) {
          source = 'accept-language';
        }
      }
    }
  } catch (err) {
    // Never let detection errors break the response — better to fall back
    // to the default than to 500.
    console.warn('[locale] detection failed:', err?.message || err);
  }

  const suggestion = (country && COUNTRY_MAP[country]) || DEFAULT_SUGGESTION;

  // Cache the response per-IP for 1 hour at the edge — country doesn't
  // change for the same visitor mid-session.
  res.set('Cache-Control', 'private, max-age=3600');
  res.json({
    country: country || null,
    region: suggestion.region,
    language: suggestion.language,
    currency: suggestion.currency,
    source: source || 'fallback',
    matched: Boolean(country && COUNTRY_MAP[country]),
  });
});

module.exports = router;
