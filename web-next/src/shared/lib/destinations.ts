/**
 * Destination landing pages (app/destinations/[slug]).
 *
 * The SPA only exposes `/listing?destination=X` as a client-side filter, which
 * canonicalises back to /listing — so destination intent ("hotels in
 * Sultanahmet") had no indexable URL to rank. These give each destination a
 * real, server-rendered route with its own <h1>, copy, hotel grid and
 * self-referencing canonical, then funnel users into the booking app via
 * /listing?destination=<label>.
 *
 * A hotel belongs to a destination when any `match` term appears in its
 * name/location/district/address (case-insensitive). `match: []` means
 * "every hotel" — used for the city-level Istanbul page.
 */

import type { PublicHotel } from '@/shared/api/services';
import { hotelName, hotelLocation, hotelAddress } from '@/shared/server/hotels';

export interface Destination {
  /** Path-relative slug, no leading slash (e.g. 'sultanahmet'). */
  slug: string;
  /** Display name + the value passed to /listing?destination=. */
  label: string;
  /** Lowercase substrings matched against hotel text. [] = match all hotels. */
  match: string[];
  title: string; // 50–60 chars
  description: string; // 110–155 chars
  h1: string;
  intro: string[];
}

const DESTINATIONS: Destination[] = [
  {
    slug: 'istanbul',
    label: 'Istanbul',
    match: [],
    title: 'Hotels in Istanbul | Verified Stays at Direct Rates',
    description:
      'Compare verified hotels in Istanbul at transparent direct rates — boutique Sultanahmet stays, Bosphorus views and Taksim-area hotels, with free cancellation.',
    h1: 'Hotels in Istanbul',
    intro: [
      `Find and book hotels in Istanbul at direct rates with United Hotels. From the historic peninsula of Sultanahmet and Sirkeci to the nightlife of Beyoğlu and Taksim and the galleries of Galata and Karaköy, every property is verified and every room confirmed against live availability.`,
      `Browse the hotels below, then open the live search to filter by dates, price and neighbourhood.`,
    ],
  },
  {
    slug: 'sultanahmet',
    label: 'Sultanahmet',
    match: ['sultanahmet', 'cankurtaran'],
    title: 'Hotels in Sultanahmet, Istanbul | Boutique Stays',
    description:
      'Boutique hotels in Sultanahmet, Istanbul — walk to the Blue Mosque and Hagia Sophia. Verified rooms at direct rates with free cancellation on most stays.',
    h1: 'Hotels in Sultanahmet, Istanbul',
    intro: [
      `Stay in Sultanahmet to wake up steps from the Blue Mosque, Hagia Sophia, Topkapı Palace and the Grand Bazaar. These boutique hotels in the historic Cankurtaran and Sultanahmet quarter put Istanbul's great monuments on your doorstep.`,
    ],
  },
  {
    slug: 'sirkeci',
    label: 'Sirkeci',
    match: ['sirkeci', 'hocapaşa', 'hoca paşa', 'eminönü', 'eminonu'],
    title: 'Hotels in Sirkeci, Istanbul | Near the Old City',
    description:
      'Hotels in Sirkeci, Istanbul — by the Spice Bazaar, Sirkeci Station and the tram. Verified direct rates and free cancellation on most rooms. Book with United Hotels.',
    h1: 'Hotels in Sirkeci, Istanbul',
    intro: [
      `Sirkeci sits on the Golden Horn side of the old city, a short walk from the Spice Bazaar, Eminönü waterfront, Gülhane tram and the Marmaray. These hotels are an excellent, well-connected base for exploring historic Istanbul.`,
    ],
  },
  {
    slug: 'beyoglu',
    label: 'Beyoğlu',
    match: ['beyoğlu', 'beyoglu'],
    title: 'Hotels in Beyoğlu, Istanbul | Taksim & İstiklal',
    description:
      'Hotels in Beyoğlu, Istanbul — near Taksim Square and İstiklal Avenue, the heart of dining and nightlife. Verified direct rates with free cancellation on most rooms.',
    h1: 'Hotels in Beyoğlu, Istanbul',
    intro: [
      `Beyoğlu is Istanbul's most energetic district — İstiklal Avenue, Taksim Square, rooftop bars and the city's best dining. These hotels keep you in the middle of it, with easy metro and tram links to the rest of the city.`,
    ],
  },
  {
    slug: 'taksim',
    label: 'Taksim',
    match: ['taksim', 'beyoğlu', 'beyoglu', 'cihangir'],
    title: 'Hotels near Taksim Square, Istanbul',
    description:
      'Hotels near Taksim Square, Istanbul — central, well-connected and close to İstiklal Avenue. Verified rooms at direct rates with free cancellation on most stays.',
    h1: 'Hotels near Taksim Square, Istanbul',
    intro: [
      `Taksim is the transport and nightlife hub of central Istanbul, at the top of İstiklal Avenue with metro and funicular links across the city. These hotels offer affordable, central stays close to the action.`,
    ],
  },
  {
    slug: 'galata',
    label: 'Galata',
    match: ['galata', 'karaköy', 'karakoy', 'pera', 'beyoğlu', 'beyoglu'],
    title: 'Hotels in Galata & Karaköy, Istanbul',
    description:
      'Boutique hotels in Galata and Karaköy, Istanbul — by the Galata Tower, galleries and waterfront. Verified direct rates with free cancellation on most rooms.',
    h1: 'Hotels in Galata & Karaköy, Istanbul',
    intro: [
      `Galata and neighbouring Karaköy are Istanbul's creative quarter — the Galata Tower, design hotels, galleries, third-wave coffee and a Bosphorus-front setting a short walk over the bridge from the old city.`,
    ],
  },
];

const BY_SLUG: Record<string, Destination> = Object.fromEntries(
  DESTINATIONS.map((d) => [d.slug, d]),
);

export const getDestination = (slug: string): Destination | undefined => BY_SLUG[slug];

export const allDestinations = (): Destination[] => DESTINATIONS;

export const allDestinationSlugs = (): string[] => DESTINATIONS.map((d) => d.slug);

/** Searchable text for a hotel, lowercased once. */
function hotelHaystack(h: PublicHotel): string {
  return `${hotelName(h)} ${hotelLocation(h)} ${h.district ?? ''} ${hotelAddress(h)}`.toLowerCase();
}

/** Hotels belonging to a destination (all hotels when `match` is empty). */
export function hotelsForDestination(dest: Destination, hotels: PublicHotel[]): PublicHotel[] {
  if (dest.match.length === 0) return hotels;
  return hotels.filter((h) => {
    const hay = hotelHaystack(h);
    return dest.match.some((term) => hay.includes(term));
  });
}
