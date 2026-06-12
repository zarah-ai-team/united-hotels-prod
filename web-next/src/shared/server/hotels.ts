/**
 * Server-only hotel data access.
 *
 * The new crawlable routes (app/hotel/[id], app/listing, app/destinations/[slug])
 * and the sitemap all need REAL hotel data in the initial HTML — not the client
 * SPA's runtime fetch. This module talks server-to-server to the Express backend
 * (the single source of truth, keyed by numeric hotel id) with ISR caching, and
 * exposes small pure helpers that normalise the backend's mixed snake_case /
 * camelCase shape into display values.
 *
 * Every fetch FAILS SOFT (returns [] / null) so a backend hiccup or an
 * unreachable upstream at build time can never 500 a page or drop the whole
 * site from the index. Combined with `dynamicParams = true` + `revalidate` on
 * the routes, pages that miss the build-time prerender simply render on first
 * request and cache.
 */

import type { PublicHotel, PublicHotelRoom } from '@/shared/api/services';
import { extractAmenityNames, capitalizeAmenity } from '@/shared/lib/amenities';
import { pickHotelImage } from '@/shared/lib/hotelImages';

// Same upstream the BFF proxy and sitemap use. Express mounts its routers under
// /api/<resource>, so we keep the /api prefix here.
const BACKEND_URL = (process.env.BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');

// Regenerate hotel-derived pages at most hourly so admin edits / new hotels
// appear without a redeploy, while keeping render cheap under crawl load.
export const HOTELS_REVALIDATE = 3600;

const FETCH_BATCH = 100;
const MAX_HOTELS = 2000;

interface PublicHotelsResponse {
  hotels?: PublicHotel[];
  count?: number;
}

/** Fetch one batch of active public hotels. Returns null on any failure. */
async function fetchBatch(limit: number, offset: number): Promise<PublicHotelsResponse | null> {
  const qs = new URLSearchParams({
    status: 'active',
    limit: String(limit),
    offset: String(offset),
    includeRecommendedPrices: 'true',
    refreshPrices: 'false',
  });
  try {
    const res = await fetch(`${BACKEND_URL}/api/hotels/public?${qs.toString()}`, {
      next: { revalidate: HOTELS_REVALIDATE },
    });
    if (!res.ok) return null;
    return (await res.json()) as PublicHotelsResponse;
  } catch {
    return null;
  }
}

/**
 * All active hotels, paginated out of the backend. Fail-soft: returns whatever
 * was collected before an error (possibly []), never throws.
 */
export async function fetchPublicHotels(): Promise<PublicHotel[]> {
  const first = await fetchBatch(FETCH_BATCH, 0);
  if (!first || !Array.isArray(first.hotels)) return [];

  const all: PublicHotel[] = [...first.hotels];
  const total = Math.min(MAX_HOTELS, Number(first.count) || all.length);

  for (let offset = all.length; offset < total; offset += FETCH_BATCH) {
    const next = await fetchBatch(FETCH_BATCH, offset);
    if (!next || !Array.isArray(next.hotels) || next.hotels.length === 0) break;
    all.push(...next.hotels);
  }
  return all;
}

/** Single hotel by id. Fail-soft: returns null when missing or upstream down. */
export async function fetchHotelById(id: string): Promise<PublicHotel | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/hotels/public/${encodeURIComponent(id)}`, {
      next: { revalidate: HOTELS_REVALIDATE },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { hotel?: PublicHotel };
    return data.hotel ?? null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Pure display helpers — normalise the backend's mixed-case shape.
// ─────────────────────────────────────────────────────────────────────────────

export const hotelId = (h: PublicHotel): string => String(h.id);

export const hotelName = (h: PublicHotel): string =>
  (h.hotel_name || h.name || 'Hotel').toString();

export const hotelLocation = (h: PublicHotel): string =>
  (h.location || h.location_raw || h.district || 'Turkey').toString();

export const hotelAddress = (h: PublicHotel): string =>
  (h.address || h.location_raw || h.location || '').toString();

export const hotelDescription = (h: PublicHotel): string =>
  (h.hotel_description || h.description || '').toString();

export function hotelStars(h: PublicHotel): number {
  const raw = Number(h.starRating ?? h.star_rating ?? h.rating ?? 0);
  return Number.isFinite(raw) && raw > 0 ? Math.min(5, Math.round(raw)) : 0;
}

export function hotelAmenities(h: PublicHotel): string[] {
  return extractAmenityNames(h.amenities).map(capitalizeAmenity);
}

export const hotelImage = (h: PublicHotel): string => pickHotelImage(h);

const CURRENCY_SYMBOL: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', TRY: '₺' };

export interface PriceFrom {
  amount: number;
  currency: string;
  /** Pre-formatted "From $75" style string. */
  label: string;
}

function roomBasePrice(room: PublicHotelRoom): number {
  return Number(room.price_per_night ?? room.base_price ?? 0);
}

/**
 * Cheapest bookable nightly rate for a hotel. Prefers the pricing engine's
 * recommended price (what the UI actually shows), falling back to raw room
 * prices. Returns null when no positive price exists.
 */
export function priceFrom(h: PublicHotel): PriceFrom | null {
  const recommended = Array.isArray(h.recommendedPrices) ? h.recommendedPrices : [];
  const recPrices = recommended
    .map((r) => Number(r.recommendedPrice || 0))
    .filter((n) => Number.isFinite(n) && n > 0);

  const rooms = Array.isArray(h.rooms) ? h.rooms : [];
  const roomPrices = rooms.map(roomBasePrice).filter((n) => Number.isFinite(n) && n > 0);

  const candidates = [...recPrices, ...roomPrices];
  if (candidates.length === 0) return null;

  const amount = Math.min(...candidates);
  // Currency: recommended prices are USD in this app; raw rooms carry their own
  // code. Use the first room's currency when we fell back to a room price.
  const currency = recPrices.length > 0 ? 'USD' : (rooms[0]?.currency_code || 'USD').toUpperCase();
  const symbol = CURRENCY_SYMBOL[currency] ?? `${currency} `;
  return { amount, currency, label: `From ${symbol}${Math.round(amount)}` };
}

/** Root-relative detail URL for a hotel — matches the SPA's react-router path. */
export const hotelHref = (h: PublicHotel): string => `/hotel/${hotelId(h)}`;
