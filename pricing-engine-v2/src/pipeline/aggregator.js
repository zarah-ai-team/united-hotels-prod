// Aggregator — turn a bag of OTA quotes into a single anchor price + a
// confidence score the orchestrator uses to decide whether to commit to
// the hybrid path or fall back to analytical.
//
// Steps:
//   1. Discard quotes with non-finite or non-positive prices.
//   2. Optionally prefer quotes that match the requested room category.
//   3. Drop outliers using Tukey's fences (anything > 1.5 IQR from the
//      median is treated as a data error / promo room / different bed type).
//   4. Compute a weighted median across remaining quotes — Booking and
//      Expedia get full weight, Hotels.com a hair less, anything else half.
//   5. Score confidence = sample-size factor × tightness factor.

const PROVIDER_WEIGHTS = {
  booking: 1.0,
  'booking.com': 1.0,
  expedia: 1.0,
  'hotels.com': 0.9,
  hotels: 0.9,
  agoda: 0.85,
  trip: 0.8,
  tripadvisor: 0.8,
  priceline: 0.8,
};

const DEFAULT_WEIGHT = 0.7;

/**
 * @param {Array<{ provider, perNightUsd, room? }>} quotes
 * @param {{ preferRoomCategory?: string }} opts
 * @returns {{
 *   anchorUsd: number | null,
 *   sampleSize: number,
 *   spread: number,
 *   confidence: number,
 *   usedProviders: string[]
 * }}
 */
export function aggregate(quotes, opts = {}) {
  const valid = (Array.isArray(quotes) ? quotes : [])
    .filter((q) => q && Number.isFinite(Number(q.perNightUsd)) && Number(q.perNightUsd) > 0)
    .map((q) => ({
      provider: String(q.provider || '').toLowerCase().trim(),
      perNightUsd: Number(q.perNightUsd),
      room: q.room || null,
    }));

  // Prefer same-room-category quotes when at least 2 of them exist.
  let pool = valid;
  if (opts.preferRoomCategory) {
    const target = String(opts.preferRoomCategory).toLowerCase();
    const matched = valid.filter((q) =>
      String(q.room || '').toLowerCase().includes(target),
    );
    if (matched.length >= 2) pool = matched;
  }

  if (pool.length === 0) {
    return { anchorUsd: null, sampleSize: 0, spread: 0, confidence: 0, usedProviders: [] };
  }

  // IQR outlier rejection (skip if too few points to compute IQR meaningfully).
  let trimmed = pool;
  if (pool.length >= 4) {
    const sorted = [...pool].map((q) => q.perNightUsd).sort((a, b) => a - b);
    const q1 = quantile(sorted, 0.25);
    const q3 = quantile(sorted, 0.75);
    const iqr = q3 - q1;
    const low = q1 - 1.5 * iqr;
    const high = q3 + 1.5 * iqr;
    trimmed = pool.filter((q) => q.perNightUsd >= low && q.perNightUsd <= high);
    // If trimming removed everything (rare degenerate case), fall back to pool.
    if (trimmed.length === 0) trimmed = pool;
  }

  const weighted = trimmed.map((q) => ({
    value: q.perNightUsd,
    weight: PROVIDER_WEIGHTS[q.provider] ?? DEFAULT_WEIGHT,
    provider: q.provider,
  }));

  const anchorUsd = weightedMedian(weighted);
  const valuesOnly = trimmed.map((q) => q.perNightUsd).sort((a, b) => a - b);
  const lo = valuesOnly[0];
  const hi = valuesOnly[valuesOnly.length - 1];
  const spread = anchorUsd > 0 ? (hi - lo) / anchorUsd : 0;

  // Confidence: fuller sample + tighter spread → higher score.
  const sampleFactor = Math.min(1, trimmed.length / 4);
  const tightnessFactor = Math.max(0, 1 - spread);
  const confidence = round3(sampleFactor * tightnessFactor);

  return {
    anchorUsd: round2(anchorUsd),
    sampleSize: trimmed.length,
    spread: round3(spread),
    confidence,
    usedProviders: [...new Set(trimmed.map((q) => q.provider))].filter(Boolean),
  };
}

// ─── helpers ────────────────────────────────────────────────────────────────

function quantile(sortedAsc, p) {
  if (sortedAsc.length === 0) return 0;
  const idx = (sortedAsc.length - 1) * p;
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sortedAsc[lower];
  const frac = idx - lower;
  return sortedAsc[lower] * (1 - frac) + sortedAsc[upper] * frac;
}

/**
 * Weighted median: sort by value, accumulate weights, pick the value
 * where cumulative weight crosses half of the total. Returns the average
 * of two values if cumulative weight hits exactly half.
 */
function weightedMedian(items) {
  if (items.length === 0) return 0;
  if (items.length === 1) return items[0].value;
  const sorted = [...items].sort((a, b) => a.value - b.value);
  const total = sorted.reduce((s, it) => s + it.weight, 0);
  const target = total / 2;
  let cumulative = 0;
  for (let i = 0; i < sorted.length; i++) {
    cumulative += sorted[i].weight;
    if (cumulative > target) return sorted[i].value;
    if (cumulative === target) {
      const next = sorted[i + 1];
      return next ? (sorted[i].value + next.value) / 2 : sorted[i].value;
    }
  }
  return sorted[sorted.length - 1].value;
}

function round2(n) {
  return Math.round(Number(n || 0) * 100) / 100;
}
function round3(n) {
  return Math.round(Number(n || 0) * 1000) / 1000;
}
