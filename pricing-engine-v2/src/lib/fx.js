// Static FX table for currency normalisation. The pricing engine works
// internally in USD so every external quote is converted on entry, then
// the final recommendation is converted back into the requested currency.
//
// Rates here are reference-only (refresh quarterly). For production a
// proper FX feed (open.er-api.com / fixer.io / your bank's API) would
// replace this — keeping it static for now keeps the engine deterministic
// and avoids another external dependency at request time.

const FX_TO_USD = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  TRY: 1 / 34,
  AED: 1 / 3.67,
  SAR: 1 / 3.75,
  RUB: 1 / 90,
  CNY: 1 / 7.2,
  JPY: 1 / 150,
  INR: 1 / 83,
};

/** Convert any supported currency value to USD. Unknown currency → returns null. */
export function toUsd(amount, currency) {
  const code = (currency || 'USD').toUpperCase();
  const rate = FX_TO_USD[code];
  if (rate === undefined) return null;
  const v = Number(amount);
  if (!Number.isFinite(v)) return null;
  return v * rate;
}

/** Convert a USD amount to any supported currency. Unknown currency → returns null. */
export function fromUsd(amountUsd, currency) {
  const code = (currency || 'USD').toUpperCase();
  const rate = FX_TO_USD[code];
  if (rate === undefined) return null;
  const v = Number(amountUsd);
  if (!Number.isFinite(v)) return null;
  return v / rate;
}

export const SUPPORTED_CURRENCIES = Object.keys(FX_TO_USD);
