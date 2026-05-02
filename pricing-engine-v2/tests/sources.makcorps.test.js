import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import nock from 'nock';

// Disable nock-blocked axios adapter caching, then import the adapter.
// MAKECORPS_API_KEY must be set BEFORE the module is imported, since the
// adapter reads it eagerly inside fetchPrices(). It's read every call via
// process.env so we can also flip it in individual tests if needed.
beforeAll(() => {
  process.env.MAKECORPS_API_KEY = 'test-key';
  process.env.MAKECORPS_API_BASE_URL = 'https://api.makcorps.com';
  // Disable axios http_proxy / https_proxy interfering with nock matching.
  delete process.env.HTTP_PROXY;
  delete process.env.HTTPS_PROXY;
});

const { fetchPrices } = await import('../src/sources/makcorps.js');
const { cache } = await import('../src/lib/cache.js');

const baseUrl = 'https://api.makcorps.com';

beforeEach(() => {
  cache.clear();
  nock.cleanAll();
});

afterEach(() => {
  // Sanity: every test should consume every interceptor it installed.
  nock.cleanAll();
});

describe('makcorps.fetchPrices', () => {
  it('skips cleanly when no API key is configured', async () => {
    const old = process.env.MAKECORPS_API_KEY;
    delete process.env.MAKECORPS_API_KEY;
    const r = await fetchPrices({ hotelName: 'X', checkIn: '2026-06-01', checkOut: '2026-06-02' });
    expect(r.skipped).toBe('no-api-key');
    expect(r.quotes).toEqual([]);
    process.env.MAKECORPS_API_KEY = old;
  });

  it('returns empty quotes when name resolves to no docId', async () => {
    nock(baseUrl).get('/mapping').query(true).reply(200, []);

    const r = await fetchPrices({
      hotelName: 'Nowhere Hotel',
      checkIn: '2026-06-01',
      checkOut: '2026-06-02',
    });

    expect(r.skipped).toBe('no-mapping');
    expect(r.quotes).toEqual([]);
  });

  it('flattens vendor1/price1 + rates[] response shapes into normalised quotes', async () => {
    nock(baseUrl)
      .get('/mapping')
      .query(true)
      .reply(200, [{ document_id: 'doc-123' }]);

    nock(baseUrl)
      .get('/hotel')
      .query(true)
      .reply(200, [
        { vendor1: 'Booking', price1: 150, tax1: 15, room1: 'Deluxe' },
        {
          vendor1: 'Expedia',
          rates: [
            { price: 160, room: 'Deluxe' },
            { price: 170, room: 'Suite' },
          ],
        },
      ]);

    const r = await fetchPrices({
      hotelName: 'Test Hotel',
      checkIn: '2026-06-01',
      checkOut: '2026-06-02',
    });

    expect(r.source).toBe('makcorps');
    expect(r.quotes.length).toBe(3);
    const providers = r.quotes.map((q) => q.provider).sort();
    expect(providers).toEqual(['Booking', 'Expedia', 'Expedia']);
    for (const q of r.quotes) {
      expect(q.currency).toBe('USD');
      expect(q.perNightUsd).toBeGreaterThan(0);
    }
  });

  it('returns empty quotes (not throw) on upstream 5xx', async () => {
    nock(baseUrl)
      .get('/mapping')
      .query(true)
      .reply(200, [{ document_id: 'doc-1' }]);
    nock(baseUrl).get('/hotel').query(true).reply(500, { error: 'oops' });

    const r = await fetchPrices({
      hotelName: 'Hotel',
      checkIn: '2026-06-01',
      checkOut: '2026-06-02',
    });

    expect(r.source).toBe('makcorps');
    expect(r.quotes).toEqual([]);
  });
});
