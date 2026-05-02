import { describe, it, expect } from 'vitest';
import { apply } from '../src/pipeline/adjusters.js';

const ctx = (over = {}) => ({
  occupancyRatio: 0.5,
  leadTimeDays: 30,
  weekendNights: 0,
  totalNights: 1,
  monthOfStay: 4, // May (neither peak nor shoulder)
  vendorMarginPct: 0,
  ...over,
});

describe('apply()', () => {
  it('returns 0 when anchor is invalid', () => {
    expect(apply(NaN, ctx()).adjustedUsd).toBe(0);
    expect(apply(0, ctx()).adjustedUsd).toBe(0);
    expect(apply(-10, ctx()).adjustedUsd).toBe(0);
  });

  it('demand factor scales linearly with occupancy', () => {
    const empty = apply(100, ctx({ occupancyRatio: 0 })).factors.demand;
    const full = apply(100, ctx({ occupancyRatio: 1 })).factors.demand;
    expect(empty).toBeCloseTo(0.97, 3);
    expect(full).toBeCloseTo(1.15, 3);
  });

  it('lead-time bumps up for last-minute, down for far-future', () => {
    const lastMinute = apply(100, ctx({ leadTimeDays: 1 })).factors.leadTime;
    const farFuture = apply(100, ctx({ leadTimeDays: 90 })).factors.leadTime;
    expect(lastMinute).toBeGreaterThan(1);
    expect(farFuture).toBeLessThan(1);
  });

  it('weekend factor is proportional to Fri/Sat fraction', () => {
    const noWeekend = apply(100, ctx({ totalNights: 3, weekendNights: 0 })).factors.weekend;
    const allWeekend = apply(100, ctx({ totalNights: 2, weekendNights: 2 })).factors.weekend;
    expect(noWeekend).toBe(1);
    expect(allWeekend).toBeCloseTo(1.05, 3);
  });

  it('seasonality lifts in peak (Jul) and discounts in shoulder (Feb)', () => {
    const peak = apply(100, ctx({ monthOfStay: 6 })).factors.season; // Jul
    const shoulder = apply(100, ctx({ monthOfStay: 1 })).factors.season; // Feb
    const flat = apply(100, ctx({ monthOfStay: 4 })).factors.season; // May
    expect(peak).toBeGreaterThan(flat);
    expect(shoulder).toBeLessThan(flat);
  });

  it('length-of-stay discount kicks in at 4 and again at 7 nights', () => {
    expect(apply(100, ctx({ totalNights: 3 })).factors.lengthMul).toBe(1);
    expect(apply(100, ctx({ totalNights: 4 })).factors.lengthMul).toBeLessThan(1);
    expect(apply(100, ctx({ totalNights: 7 })).factors.lengthMul).toBeLessThan(
      apply(100, ctx({ totalNights: 4 })).factors.lengthMul,
    );
  });

  it('vendor margin is subtracted last', () => {
    const noMargin = apply(100, ctx({ vendorMarginPct: 0 })).adjustedUsd;
    const fivePct = apply(100, ctx({ vendorMarginPct: 0.05 })).adjustedUsd;
    expect(fivePct).toBeLessThan(noMargin);
    expect(fivePct / noMargin).toBeCloseTo(0.95, 2);
  });
});
