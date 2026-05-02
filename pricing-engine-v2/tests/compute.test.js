import { describe, it, expect, vi, beforeEach } from 'vitest';

// All external dependencies are mocked so compute() runs in isolation.
vi.mock('../src/sources/makcorps.js', () => ({
  fetchPrices: vi.fn(),
}));
vi.mock('../src/sources/rapidapi-hotels.js', () => ({
  fetchPrices: vi.fn(),
}));
vi.mock('../src/repos/hotelRepo.js', () => ({
  findHotelById: vi.fn(),
  findRoomCategory: vi.fn(),
}));
vi.mock('../src/repos/bookingRepo.js', () => ({
  occupancyRatioForHotel: vi.fn(),
}));

import { compute } from '../src/pipeline/compute.js';
import { fetchPrices as mockMakcorps } from '../src/sources/makcorps.js';
import { fetchPrices as mockRapid } from '../src/sources/rapidapi-hotels.js';
import { findHotelById, findRoomCategory } from '../src/repos/hotelRepo.js';
import { occupancyRatioForHotel } from '../src/repos/bookingRepo.js';

beforeEach(() => {
  vi.clearAllMocks();

  findHotelById.mockResolvedValue({
    id: 1,
    hotelName: 'Test Hotel',
    district: 'Sultanahmet',
    location: 'Istanbul',
    basePrice: null,
    currency: 'USD',
  });
  findRoomCategory.mockResolvedValue({
    roomCategory: 'Deluxe',
    basePrice: 120,
    minPrice: 90,
    maxPrice: 200,
    currency: 'USD',
  });
  occupancyRatioForHotel.mockResolvedValue(0.6);
});

describe('compute() — hybrid path', () => {
  it('uses external median when ≥2 quotes are available', async () => {
    mockMakcorps.mockResolvedValue({
      quotes: [
        { provider: 'booking', perNightUsd: 150 },
        { provider: 'expedia', perNightUsd: 160 },
      ],
      latencyMs: 200,
      source: 'makcorps',
    });
    mockRapid.mockResolvedValue({
      quotes: [{ provider: 'hotels.com', perNightUsd: 155 }],
      latencyMs: 180,
      source: 'rapidapi',
    });

    const r = await compute({
      hotelId: 1,
      roomCategory: 'Deluxe',
      checkIn: '2026-06-15',
      checkOut: '2026-06-18',
      guests: 2,
      rooms: 1,
      currency: 'USD',
    });

    expect(r.source).toBe('hybrid');
    expect(r.anchors.length).toBe(3);
    expect(r.recommendedPriceUsd).toBeGreaterThan(0);
    expect(r.confidence).toBeGreaterThan(0);
    expect(r.aggregateMeta.sampleSize).toBe(3);
  });

  it('falls back to analytical when external sources return nothing', async () => {
    mockMakcorps.mockResolvedValue({ quotes: [], latencyMs: 100, source: 'makcorps' });
    mockRapid.mockResolvedValue({ quotes: [], latencyMs: 100, source: 'rapidapi' });

    const r = await compute({
      hotelId: 1,
      roomCategory: 'Deluxe',
      checkIn: '2026-06-15',
      checkOut: '2026-06-18',
    });

    expect(r.source).toBe('analytical');
    expect(r.anchors).toEqual([]);
    expect(r.recommendedPriceUsd).toBeGreaterThan(0);
  });

  it('falls back gracefully when only 1 quote is available', async () => {
    mockMakcorps.mockResolvedValue({
      quotes: [{ provider: 'booking', perNightUsd: 200 }],
      latencyMs: 100,
      source: 'makcorps',
    });
    mockRapid.mockResolvedValue({ quotes: [], latencyMs: 100, source: 'rapidapi' });

    const r = await compute({
      hotelId: 1,
      checkIn: '2026-06-15',
      checkOut: '2026-06-18',
    });

    // 1 sample is below the hybrid threshold of 2 → analytical.
    expect(r.source).toBe('analytical');
    expect(r.anchors.length).toBe(1); // anchors are still surfaced for transparency
  });

  it('clamps to vendor max when adjusted anchor exceeds ceiling', async () => {
    mockMakcorps.mockResolvedValue({
      quotes: [
        { provider: 'booking', perNightUsd: 500 },
        { provider: 'expedia', perNightUsd: 520 },
      ],
      latencyMs: 100,
      source: 'makcorps',
    });
    mockRapid.mockResolvedValue({ quotes: [], latencyMs: 100, source: 'rapidapi' });

    const r = await compute({
      hotelId: 1,
      checkIn: '2026-06-15',
      checkOut: '2026-06-18',
    });

    // Vendor maxPrice=200 → recommended capped at the ceiling.
    expect(r.recommendedPriceUsd).toBeLessThanOrEqual(200);
    expect(r.clamped.hitCeiling).toBe(true);
  });

  it('returns an error result when the hotel cannot be resolved', async () => {
    findHotelById.mockResolvedValueOnce(null);
    const r = await compute({
      hotelId: 999,
      checkIn: '2026-06-15',
      checkOut: '2026-06-18',
    });
    expect(r.source).toBe('error');
    expect(r.recommendedPriceUsd).toBeNull();
  });

  it('records source latencies and ok/failed status', async () => {
    mockMakcorps.mockResolvedValue({ quotes: [], latencyMs: 250, source: 'makcorps' });
    mockRapid.mockRejectedValue(new Error('timeout'));

    const r = await compute({
      hotelId: 1,
      checkIn: '2026-06-15',
      checkOut: '2026-06-18',
    });

    expect(r.sources.status.makcorps).toBe('ok');
    expect(r.sources.status.rapidapi).toBe('failed');
  });
});
