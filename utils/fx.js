// utils/fx.js — currency conversion to the POS settlement currency (TRY).
//
// The site prices rooms in USD (and possibly EUR/GBP), but the İş Bankası POS
// settles in TRY, so card charges must be converted at charge time.
//
// Rate resolution (per currency):
//   1. Manual override from env FX_RATES, e.g. "USD:34.5,EUR:37.2" (TRY per 1
//      unit). Lets the operator pin an exact rate / add a markup, and is the
//      guaranteed fallback when the live feed is unreachable.
//   2. Live mid-market rate from open.er-api.com (no key), cached in-memory for
//      FX_TTL_MS (default 6h) so we hit the network at most a few times a day.
//
// convertToTRY throws if it cannot determine a rate — callers (initiate) turn
// that into a clear 503 rather than charging a wrong amount.

const axios = require('axios');

let cache = { rates: null, at: 0 };

const ttlMs = () => Number(process.env.FX_TTL_MS || 6 * 60 * 60 * 1000);

// Parse FX_RATES="USD:34.5,EUR:37.2" → { USD: 34.5, EUR: 37.2 } (TRY per unit).
const manualRates = () => {
  const out = {};
  (process.env.FX_RATES || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((pair) => {
      const [code, rate] = pair.split(':');
      const n = Number(rate);
      if (code && n > 0) out[code.trim().toUpperCase()] = n;
    });
  return out;
};

// Map of { CURRENCY: TRY-per-unit }. Manual overrides always win over live.
const ratesToTRY = async () => {
  const manual = manualRates();

  if (cache.rates && Date.now() - cache.at < ttlMs()) {
    return { ...cache.rates, ...manual };
  }

  try {
    const { data } = await axios.get('https://open.er-api.com/v6/latest/TRY', { timeout: 8000 });
    const out = {};
    // data.rates[USD] = USD per 1 TRY; we want TRY per 1 USD = 1 / that.
    if (data && data.rates) {
      for (const [code, perTry] of Object.entries(data.rates)) {
        const v = Number(perTry);
        if (v > 0) out[code.toUpperCase()] = 1 / v;
      }
    }
    if (Object.keys(out).length) cache = { rates: out, at: Date.now() };
    return { ...out, ...manual };
  } catch (err) {
    if (cache.rates) return { ...cache.rates, ...manual };
    if (Object.keys(manual).length) return manual;
    throw new Error(`FX rate unavailable (${err.message}) and no FX_RATES fallback configured`);
  }
};

// Convert `amount` from `fromCurrency` into TRY, rounded to 2 dp.
const convertToTRY = async (amount, fromCurrency) => {
  const from = String(fromCurrency || 'TRY').toUpperCase();
  const value = Number(amount);
  if (!Number.isFinite(value)) throw new Error('amount must be a number');
  if (from === 'TRY') return Math.round(value * 100) / 100;

  const rates = await ratesToTRY();
  const rate = rates[from];
  if (!rate || rate <= 0) throw new Error(`No FX rate available for ${from} -> TRY`);
  return Math.round(value * rate * 100) / 100;
};

module.exports = { convertToTRY, ratesToTRY };
