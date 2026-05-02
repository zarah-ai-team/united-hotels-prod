import { describe, it, expect } from 'vitest';
import { applyClamp } from '../src/pipeline/clamp.js';

describe('applyClamp()', () => {
  it('passes through when no base price is given', () => {
    const r = applyClamp(123.45, {});
    expect(r.priceUsd).toBe(123.45);
    expect(r.hitFloor).toBe(false);
    expect(r.hitCeiling).toBe(false);
  });

  it('uses the default ±15/45% band when vendor band missing', () => {
    const base = 100;
    const low = applyClamp(50, { basePriceUsd: base });
    const high = applyClamp(200, { basePriceUsd: base });
    expect(low.floor).toBe(85);
    expect(low.ceiling).toBe(145);
    expect(low.hitFloor).toBe(true);
    expect(high.hitCeiling).toBe(true);
  });

  it('respects vendor min and max when supplied', () => {
    const r = applyClamp(140, { basePriceUsd: 100, minPriceUsd: 90, maxPriceUsd: 130 });
    expect(r.priceUsd).toBe(130);
    expect(r.hitCeiling).toBe(true);
    expect(r.floor).toBe(90);
  });

  it('swaps inverted band so floor < ceiling', () => {
    const r = applyClamp(100, { basePriceUsd: 100, minPriceUsd: 200, maxPriceUsd: 50 });
    expect(r.floor).toBe(50);
    expect(r.ceiling).toBe(200);
    expect(r.hitFloor).toBe(false);
    expect(r.hitCeiling).toBe(false);
  });

  it('falls back to base when input is non-finite', () => {
    const r = applyClamp(NaN, { basePriceUsd: 100 });
    expect(r.priceUsd).toBe(100);
  });
});
