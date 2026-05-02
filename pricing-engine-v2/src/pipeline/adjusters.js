// Adjusters — multiplicative factors layered over the anchor price.
//
// In the legacy engine these were stacked over the seeded base price,
// which is why prices drifted from real OTA data. Here we stack the same
// signal set over the *external* anchor (median across OTAs), so the
// final number is a calibrated tweak of the market median rather than an
// imagined adjustment of an unanchored base.
//
// Signal set mirrors the live engine's so behaviour is comparable in the
// bench harness, but every coefficient is slightly tighter — when the
// anchor is already correct, large multipliers would push away from the
// real market.

/**
 * @typedef {Object} AdjusterCtx
 * @property {number} occupancyRatio   0..1 — fraction of rooms that are booked for the date range
 * @property {number} leadTimeDays     days between today and check-in (negative = past)
 * @property {number} weekendNights    Friday + Saturday nights inside the stay
 * @property {number} totalNights      total nights of the stay (≥ 1)
 * @property {number} monthOfStay      0..11 — JS Date.getMonth() of the median stay night
 * @property {number} [vendorMarginPct] default 0.04 — slice the operator keeps below market
 */

/**
 * @param {number} anchorUsd
 * @param {AdjusterCtx} ctx
 * @returns {{ adjustedUsd: number, factors: Record<string, number> }}
 */
export function apply(anchorUsd, ctx) {
  const base = Number(anchorUsd);
  if (!Number.isFinite(base) || base <= 0) {
    return { adjustedUsd: 0, factors: {} };
  }

  const occupancy = clamp(num(ctx?.occupancyRatio, 0.5), 0, 1);
  const leadTime = num(ctx?.leadTimeDays, 30);
  const totalNights = Math.max(1, num(ctx?.totalNights, 1));
  const weekendNights = clamp(num(ctx?.weekendNights, 0), 0, totalNights);
  const month = clamp(Math.trunc(num(ctx?.monthOfStay, new Date().getMonth())), 0, 11);
  const vendorMarginPct = clamp(num(ctx?.vendorMarginPct, 0.04), 0, 0.25);

  // 1. Demand — busier hotels priced higher. 0.97 .. 1.15.
  const demand = round3(0.97 + occupancy * 0.18);

  // 2. Lead time — last-minute up, far-future down.
  let leadTimeMul = 1;
  if (leadTime <= 2) leadTimeMul = 1.06;
  else if (leadTime <= 7) leadTimeMul = 1.03;
  else if (leadTime >= 60) leadTimeMul = 0.94;
  else if (leadTime >= 30) leadTimeMul = 0.97;
  leadTimeMul = round3(leadTimeMul);

  // 3. Weekend lift, scaled by what fraction of the stay is Fri/Sat.
  const weekendMul = round3(1 + (weekendNights / totalNights) * 0.05);

  // 4. Seasonality — peak (Jun–Aug + Dec) up, shoulder (Jan–Mar + Oct–Nov) down.
  // Months are 0-indexed: 5=Jun, 6=Jul, 7=Aug, 11=Dec, 0=Jan, 1=Feb, 2=Mar, 9=Oct, 10=Nov.
  let seasonMul = 1;
  if ([5, 6, 7, 11].includes(month)) seasonMul = 1.04;
  else if ([0, 1, 2, 9, 10].includes(month)) seasonMul = 0.98;
  seasonMul = round3(seasonMul);

  // 5. Length-of-stay discount — guests stay longer, give a small break.
  let lengthMul = 1;
  if (totalNights >= 7) lengthMul = 0.96;
  else if (totalNights >= 4) lengthMul = 0.98;
  lengthMul = round3(lengthMul);

  // 6. Operator margin — applied last, after all market adjustments.
  const vendorMul = round3(1 - vendorMarginPct);

  const adjustedUsd =
    base * demand * leadTimeMul * weekendMul * seasonMul * lengthMul * vendorMul;

  return {
    adjustedUsd: round2(adjustedUsd),
    factors: {
      demand,
      leadTime: leadTimeMul,
      weekend: weekendMul,
      season: seasonMul,
      lengthMul,
      vendorMargin: vendorMul,
    },
  };
}

// ─── helpers ────────────────────────────────────────────────────────────────

function num(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function clamp(n, lo, hi) {
  if (n < lo) return lo;
  if (n > hi) return hi;
  return n;
}
function round2(n) {
  return Math.round(Number(n || 0) * 100) / 100;
}
function round3(n) {
  return Math.round(Number(n || 0) * 1000) / 1000;
}
