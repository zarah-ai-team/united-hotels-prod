/**
 * Server-rendered hotel cards — the crawlable internal-link graph.
 *
 * Each card is a plain <a href="/hotel/{id}"> in the initial HTML, so Google can
 * discover every hotel by crawling the listing and destination pages (this is
 * the single change that turns 39 orphaned detail pages into a connected,
 * indexable inventory). Pure server component, inline-styled so it renders
 * correctly as the no-JS fallback before the SPA's CSS-in-JS mounts.
 */

import type { PublicHotel } from '@/shared/api/services';
import {
  hotelHref,
  hotelName,
  hotelLocation,
  hotelImage,
  hotelStars,
  priceFrom,
} from '@/shared/server/hotels';

export default function HotelCards({ hotels }: { hotels: PublicHotel[] }) {
  if (!hotels.length) return null;

  return (
    <ul
      style={{
        listStyle: 'none',
        padding: 0,
        margin: '16px 0',
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
      }}
    >
      {hotels.map((h) => {
        const href = hotelHref(h);
        const name = hotelName(h);
        const price = priceFrom(h);
        const stars = hotelStars(h);
        return (
          <li key={href}>
            <a
              href={href}
              style={{
                display: 'block',
                textDecoration: 'none',
                color: '#13233f',
                border: '1px solid #e6e9ef',
                borderRadius: 12,
                overflow: 'hidden',
                background: '#fff',
              }}
            >
              <img
                src={hotelImage(h)}
                alt={`${name} — ${hotelLocation(h)}`}
                width={400}
                height={260}
                loading="lazy"
                style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
              />
              <div style={{ padding: '12px 14px' }}>
                <strong style={{ fontSize: 16, display: 'block', lineHeight: 1.3 }}>{name}</strong>
                <span style={{ fontSize: 13, color: '#5b6473' }}>{hotelLocation(h)}</span>
                {stars > 0 ? (
                  <span
                    aria-label={`${stars} star hotel`}
                    style={{ display: 'block', color: '#f5a623', fontSize: 13, marginTop: 4 }}
                  >
                    {'★'.repeat(stars)}
                    <span style={{ color: '#c9cdd6' }}>{'★'.repeat(5 - stars)}</span>
                  </span>
                ) : null}
                {price ? (
                  <span style={{ display: 'block', marginTop: 6, fontWeight: 600, fontSize: 14 }}>
                    {price.label} <span style={{ fontWeight: 400, color: '#5b6473' }}>/ night</span>
                  </span>
                ) : null}
              </div>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
