import { describe, it, expect } from 'vitest';
import { aggregate } from '../src/pipeline/aggregator.js';

const q = (provider, perNightUsd, room) => ({ provider, perNightUsd, room });

describe('aggregate()', () => {
  it('returns null anchor on empty input', () => {
    const r = aggregate([]);
    expect(r.anchorUsd).toBeNull();
    expect(r.sampleSize).toBe(0);
    expect(r.confidence).toBe(0);
  });

  it('drops non-numeric / non-positive prices', () => {
    const r = aggregate([
      q('booking', 100),
      q('expedia', NaN),
      q('agoda', 0),
      q('hotels.com', -50),
    ]);
    expect(r.sampleSize).toBe(1);
    expect(r.anchorUsd).toBe(100);
  });

  it('computes a weighted median across providers', () => {
    // Three quotes; booking + expedia (weight 1.0 each) anchor low,
    // 'other' (weight 0.7) is the high outlier. Weighted median should
    // sit on one of the two heavyweight quotes, NOT the outlier.
    const r = aggregate([q('booking', 100), q('expedia', 110), q('other', 200)]);
    expect(r.sampleSize).toBe(3);
    expect(r.anchorUsd).toBeLessThan(150);
    expect(r.anchorUsd).toBeGreaterThanOrEqual(100);
  });

  it('rejects IQR outliers when 4+ samples are present', () => {
    // Cluster around 100; a wild 1000 is >1.5 IQR away and should drop.
    const r = aggregate([
      q('booking', 95),
      q('expedia', 100),
      q('hotels.com', 105),
      q('agoda', 110),
      q('priceline', 1000), // outlier
    ]);
    expect(r.sampleSize).toBe(4);
    expect(r.usedProviders).not.toContain('priceline');
    expect(r.anchorUsd).toBeLessThan(120);
  });

  it('confidence rises with more samples and tighter spread', () => {
    const tight = aggregate([
      q('booking', 100),
      q('expedia', 102),
      q('hotels.com', 101),
      q('agoda', 103),
    ]);
    const loose = aggregate([q('booking', 80), q('expedia', 160)]);
    expect(tight.confidence).toBeGreaterThan(loose.confidence);
  });

  it('prefers room-category-matching quotes when ≥2 exist', () => {
    const r = aggregate(
      [
        q('booking', 200, 'Standard'),
        q('expedia', 210, 'Standard'),
        q('agoda', 500, 'Suite'),
        q('hotels.com', 480, 'Suite'),
      ],
      { preferRoomCategory: 'Standard' },
    );
    // The Standard pool has only 2 → IQR skipped, anchor is between 200 and 210.
    expect(r.sampleSize).toBe(2);
    expect(r.anchorUsd).toBeGreaterThanOrEqual(200);
    expect(r.anchorUsd).toBeLessThanOrEqual(210);
  });
});
