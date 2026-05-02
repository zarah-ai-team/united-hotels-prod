// Clamp — bound the adjusted price by the vendor's price band so we never
// quote above the agreed ceiling or below the agreed floor.
//
// If the vendor hasn't set a band (most common case for a new property),
// fall back to ±15/45% of the seed base price. The asymmetric default is
// intentional: hotels typically allow more upward dynamic room than
// downward (operators don't like deeply discounted shoulders).

const DEFAULT_FLOOR_FACTOR = 0.85; // -15% under base
const DEFAULT_CEILING_FACTOR = 1.45; //  +45% over base

/**
 * @param {number} priceUsd
 * @param {{ basePriceUsd: number, minPriceUsd?: number|null, maxPriceUsd?: number|null }} band
 * @returns {{ priceUsd: number, floor: number, ceiling: number, hitFloor: boolean, hitCeiling: boolean }}
 */
export function applyClamp(priceUsd, band) {
  const base = Number(band?.basePriceUsd);
  if (!Number.isFinite(base) || base <= 0) {
    // No base means we have nothing to bound against. Return the input
    // unchanged with a synthetic "no clamp applied" signal.
    return {
      priceUsd: round2(priceUsd),
      floor: 0,
      ceiling: Infinity,
      hitFloor: false,
      hitCeiling: false,
    };
  }

  const min = sanitiseBound(band?.minPriceUsd, base * DEFAULT_FLOOR_FACTOR);
  const max = sanitiseBound(band?.maxPriceUsd, base * DEFAULT_CEILING_FACTOR);
  // Defensive: if the vendor inverted the band, swap so floor < ceiling.
  const floor = Math.min(min, max);
  const ceiling = Math.max(min, max);

  let bounded = Number(priceUsd);
  let hitFloor = false;
  let hitCeiling = false;

  if (!Number.isFinite(bounded) || bounded <= 0) bounded = base;
  if (bounded < floor) {
    bounded = floor;
    hitFloor = true;
  } else if (bounded > ceiling) {
    bounded = ceiling;
    hitCeiling = true;
  }

  return {
    priceUsd: round2(bounded),
    floor: round2(floor),
    ceiling: round2(ceiling),
    hitFloor,
    hitCeiling,
  };
}

function sanitiseBound(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function round2(n) {
  return Math.round(Number(n || 0) * 100) / 100;
}
