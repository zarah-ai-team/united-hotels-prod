import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import nock from 'nock';

beforeAll(() => {
  process.env.RAPIDAPI_KEY = 'test-key';
  process.env.RAPIDAPI_HOST = 'booking-com15.p.rapidapi.com';
  delete process.env.HTTP_PROXY;
  delete process.env.HTTPS_PROXY;
});

const { fetchPrices } = await import('../src/sources/rapidapi-hotels.js');
const { cache } = await import('../src/lib/cache.js');

const baseUrl = 'https://booking-com15.p.rapidapi.com';

beforeEach(() => {
  cache.clear();
  nock.cleanAll();
});

afterEach(() => {
  nock.cleanAll();
});

describe('rapidapi.fetchPrices', () => {
  it('skips cleanly when no API key is configured', async () => {
    const old = process.env.RAPIDAPI_KEY;
    delete process.env.RAPIDAPI_KEY;
    const r = await fetchPrices({ hotelName: 'X', checkIn: '2026-06-01', checkOut: '2026-06-02' });
    expect(r.skipped).toBe('no-api-key');
    process.env.RAPIDAPI_KEY = old;
  });

  it('returns empty when destination search yields nothing', async () => {
    nock(baseUrl).get('/api/v1/hotels/searchDestination').query(true).reply(200, { data: [] });
    const r = await fetchPrices({
      hotelName: 'Nowhere',
      checkIn: '2026-06-01',
      checkOut: '2026-06-02',
    });
    expect(r.skipped).toBe('no-destination');
  });

  it('extracts price from booking-com15 priceBreakdown shape', async () => {
    nock(baseUrl)
      .get('/api/v1/hotels/searchDestination')
      .query(true)
      .reply(200, {
        data: [
          {
            dest_id: '900040000',
            dest_type: 'CITY',
            name: 'Istanbul',
            city_name: 'Istanbul',
          },
        ],
      });

    nock(baseUrl)
      .get('/api/v1/hotels/searchHotels')
      .query(true)
      .reply(200, {
        data: {
          hotels: [
            {
              property: {
                name: 'Test Hotel Istanbul',
                priceBreakdown: { grossPrice: { value: 175.5, currency: 'USD' } },
              },
            },
            {
              property: {
                name: 'Wholly Different Place',
                priceBreakdown: { grossPrice: { value: 999, currency: 'USD' } },
              },
            },
          ],
        },
      });

    const r = await fetchPrices({
      hotelName: 'Test Hotel Istanbul',
      location: 'Istanbul',
      checkIn: '2026-06-01',
      checkOut: '2026-06-02',
    });

    expect(r.source).toBe('rapidapi');
    expect(r.quotes.length).toBeGreaterThanOrEqual(1);
    expect(r.quotes[0].provider).toBe('booking');
    expect(r.quotes[0].perNightUsd).toBe(175.5);
    expect(r.quotes[0].currency).toBe('USD');
  });

  it('returns empty (not throw) on upstream 5xx', async () => {
    nock(baseUrl)
      .get('/api/v1/hotels/searchDestination')
      .query(true)
      .reply(200, { data: [{ dest_id: '1', dest_type: 'CITY', name: 'Foo' }] });
    nock(baseUrl).get('/api/v1/hotels/searchHotels').query(true).reply(503, 'unavailable');

    const r = await fetchPrices({
      hotelName: 'Foo',
      checkIn: '2026-06-01',
      checkOut: '2026-06-02',
    });
    expect(r.source).toBe('rapidapi');
    expect(r.quotes).toEqual([]);
  });
});
