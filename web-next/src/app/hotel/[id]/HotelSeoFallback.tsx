/**
 * Per-hotel crawlable content (the no-JS fallback shown in the initial HTML
 * before the SPA mounts). Unlike the old generic catch-all SeoContent — which
 * rendered the SAME copy for every /hotel/* URL — this carries the real hotel
 * name, location, description, amenities, rooms and address, plus Hotel +
 * BreadcrumbList JSON-LD. That is what lets each hotel rank for its own name.
 *
 * Pure server component.
 */

import type { PublicHotel, PublicHotelRoom } from '@/shared/api/services';
import {
  SITE,
  hotelLd,
  breadcrumbLd,
  organizationLd,
  type InternalLink,
} from '@/shared/lib/seo';
import {
  hotelName,
  hotelLocation,
  hotelAddress,
  hotelDescription,
  hotelStars,
  hotelAmenities,
  hotelImage,
  hotelHref,
  priceFrom,
} from '@/shared/server/hotels';

const CURRENCY_SYMBOL: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', TRY: '₺' };

function roomPriceLabel(room: PublicHotelRoom): string | null {
  const amount = Number(room.price_per_night ?? room.base_price ?? 0);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const code = (room.currency_code || 'USD').toUpperCase();
  const symbol = CURRENCY_SYMBOL[code] ?? `${code} `;
  return `${symbol}${Math.round(amount)}`;
}

export default function HotelSeoFallback({ hotel }: { hotel: PublicHotel }) {
  const name = hotelName(hotel);
  const location = hotelLocation(hotel);
  const address = hotelAddress(hotel);
  const description = hotelDescription(hotel);
  const amenities = hotelAmenities(hotel);
  const stars = hotelStars(hotel);
  const image = hotelImage(hotel);
  const href = hotelHref(hotel);
  const price = priceFrom(hotel);
  const rooms = Array.isArray(hotel.rooms) ? hotel.rooms : [];

  const crumbs: InternalLink[] = [
    { href: '/', label: 'Home' },
    { href: '/listing', label: 'Hotels in Turkey' },
    { href, label: name },
  ];

  const jsonLd: Record<string, unknown>[] = [
    organizationLd(),
    breadcrumbLd(crumbs),
    hotelLd({
      name,
      description: description || `${name} in ${location}.`,
      url: href,
      image,
      addressLocality: location,
      streetAddress: address || undefined,
      starRating: stars || undefined,
      amenities: amenities.slice(0, 12),
      priceFrom: price?.amount,
      priceCurrency: price?.currency,
    }),
  ];

  return (
    <main
      id="seo-content"
      style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px', lineHeight: 1.65, color: '#13233f' }}
    >
      {jsonLd.map((blob, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blob) }}
        />
      ))}

      <nav aria-label="Breadcrumb">
        <ol style={{ display: 'flex', flexWrap: 'wrap', gap: 8, listStyle: 'none', padding: 0, fontSize: 14 }}>
          {crumbs.map((c, i) => (
            <li key={c.href}>
              {i > 0 && <span aria-hidden="true">/ </span>}
              <a href={c.href}>{c.label}</a>
            </li>
          ))}
        </ol>
      </nav>

      <h1 style={{ fontSize: '2rem', margin: '12px 0 6px' }}>{name}</h1>
      <p style={{ margin: '0 0 4px', color: '#5b6473' }}>
        {location}
        {stars > 0 ? (
          <span style={{ color: '#f5a623', marginLeft: 8 }} aria-label={`${stars} star hotel`}>
            {'★'.repeat(stars)}
          </span>
        ) : null}
      </p>
      {price ? (
        <p style={{ margin: '0 0 12px', fontWeight: 600 }}>
          {price.label} <span style={{ fontWeight: 400, color: '#5b6473' }}>/ night</span>
        </p>
      ) : null}

      <img
        src={image}
        alt={`${name} — ${location}`}
        width={1100}
        height={500}
        loading="eager"
        style={{ width: '100%', height: 'auto', maxHeight: 460, objectFit: 'cover', borderRadius: 12, margin: '8px 0 16px' }}
      />

      {description ? (
        <section>
          <h2 style={{ fontSize: '1.5rem', marginTop: 24 }}>About {name}</h2>
          <p style={{ whiteSpace: 'pre-line' }}>{description}</p>
        </section>
      ) : null}

      {amenities.length ? (
        <section>
          <h2 style={{ fontSize: '1.5rem', marginTop: 24 }}>Amenities</h2>
          <ul>
            {amenities.map((a, i) => (
              <li key={`am-${i}`}>{a}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {rooms.length ? (
        <section>
          <h2 style={{ fontSize: '1.5rem', marginTop: 24 }}>Room types</h2>
          <ul>
            {rooms.map((room, i) => {
              const label = roomPriceLabel(room);
              return (
                <li key={`room-${room.id ?? i}`}>
                  {room.room_name || `Room ${i + 1}`}
                  {label ? <> — from {label} / night</> : null}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {address ? (
        <section>
          <h2 style={{ fontSize: '1.5rem', marginTop: 24 }}>Location</h2>
          <address style={{ fontStyle: 'normal' }}>{address}</address>
        </section>
      ) : null}

      <nav aria-label="Related pages">
        <h2 style={{ fontSize: '1.5rem', marginTop: 24 }}>Explore more</h2>
        <ul>
          <li><a href="/listing">Browse all hotels in Turkey</a></li>
          <li><a href="/destinations/istanbul">Hotels in Istanbul</a></li>
          <li><a href="/groups">Group &amp; corporate bookings</a></li>
          <li><a href="/support">Support &amp; contact</a></li>
        </ul>
      </nav>

      <footer style={{ marginTop: 28, fontSize: 14, color: '#445' }}>
        <strong>{SITE.name}</strong>
        <p style={{ marginTop: 4 }}>
          Verified hotels and direct rates across Istanbul and Turkey · Reservations{' '}
          <a href={`tel:${SITE.phone.replace(/[^\d+]/g, '')}`}>{SITE.phone}</a>
        </p>
      </footer>
    </main>
  );
}
