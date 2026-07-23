/**
 * Server-rendered destination landing page. Fully crawlable (no JS), with its
 * own <h1>, copy, a real hotel grid linking to each /hotel/{id}, and a CTA into
 * the live booking app at /listing?destination=<label>. Mirrors the existing
 * marketing LandingPage chrome. Pure server component.
 */

import type { PublicHotel } from '@/shared/api/services';
import type { Destination } from '@/shared/lib/destinations';
import HotelCards from '@/shared/server/HotelCards';
import { hotelHref, hotelName } from '@/shared/server/hotels';
import {
  SITE,
  breadcrumbLd,
  organizationLd,
  websiteLd,
  itemListLd,
  type InternalLink,
} from '@/shared/lib/seo';
import { allDestinations } from '@/shared/lib/destinations';

export default function DestinationContent({
  dest,
  hotels,
}: {
  dest: Destination;
  hotels: PublicHotel[];
}) {
  const path = `/destinations/${dest.slug}`;
  const searchHref = `/listing?destination=${encodeURIComponent(dest.label)}`;

  const crumbs: InternalLink[] = [
    { href: '/', label: 'Home' },
    { href: '/listing', label: 'Hotels in Turkey' },
    { href: path, label: dest.label },
  ];

  const jsonLd: Record<string, unknown>[] = [
    organizationLd(),
    websiteLd(),
    breadcrumbLd(crumbs),
  ];
  if (hotels.length) {
    jsonLd.push(itemListLd(hotels.map((h) => ({ url: hotelHref(h), name: hotelName(h) }))));
  }

  // Sibling destinations for cross-linking (exclude the current one).
  const others = allDestinations().filter((d) => d.slug !== dest.slug);

  return (
    <div style={{ color: '#13233f' }}>
      {jsonLd.map((blob, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blob) }}
        />
      ))}

      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid #e6e9ef',
        }}
      >
        <a href="/" style={{ textDecoration: 'none', color: '#13233f' }}>
          <strong style={{ fontSize: 18 }}>United Hotels</strong>
        </a>
        <a
          href={searchHref}
          style={{ background: '#2F80ED', color: '#fff', padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}
        >
          Search hotels
        </a>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px', lineHeight: 1.65 }}>
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

        <h1 style={{ fontSize: '2.1rem', margin: '12px 0 16px' }}>{dest.h1}</h1>
        {dest.intro.map((p, i) => (
          <p key={`intro-${i}`}>{p}</p>
        ))}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, margin: '20px 0' }}>
          <a
            href={searchHref}
            style={{ background: '#2F80ED', color: '#fff', padding: '12px 20px', borderRadius: 10, textDecoration: 'none', fontWeight: 600 }}
          >
            Search {dest.label} hotels &amp; dates
          </a>
        </div>

        <section>
          <h2 style={{ fontSize: '1.5rem', marginTop: 24 }}>
            {hotels.length ? `${hotels.length} hotels in ${dest.label}` : `Hotels in ${dest.label}`}
          </h2>
          {hotels.length ? (
            <HotelCards hotels={hotels} />
          ) : (
            <p>
              Live availability loads in the <a href={searchHref}>hotel search</a> — or contact our team for help.
            </p>
          )}
        </section>

        <nav aria-label="Other destinations">
          <h2 style={{ fontSize: '1.5rem', marginTop: 24 }}>Other destinations</h2>
          <ul>
            {others.map((d) => (
              <li key={d.slug}>
                <a href={`/destinations/${d.slug}`}>{d.h1}</a>
              </li>
            ))}
            <li><a href="/budget-hotels-in-turkey">Budget hotels in Turkey</a></li>
            <li><a href="/listing">Browse all hotels in Turkey</a></li>
          </ul>
        </nav>
      </main>

      <footer style={{ borderTop: '1px solid #e6e9ef', padding: '24px 20px', fontSize: 14, color: '#445' }}>
        <strong>{SITE.name}</strong>
        <address style={{ fontStyle: 'normal', marginTop: 4 }}>
          {SITE.address.streetAddress}, {SITE.address.addressLocality}, Türkiye ·{' '}
          <a href={`tel:${SITE.phone.replace(/[^\d+]/g, '')}`}>{SITE.phone}</a>
        </address>
        <p style={{ marginTop: 8 }}>
          <a href="/">Home</a> · <a href="/listing">All hotels</a> · <a href="/groups">Groups &amp; B2B</a> ·{' '}
          <a href="/support">Support</a>
        </p>
      </footer>
    </div>
  );
}
