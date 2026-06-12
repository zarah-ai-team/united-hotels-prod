/**
 * Crawlable /listing content. The old catch-all rendered marketing copy with
 * NO hotel links — so the 39 detail pages were orphaned and undiscoverable.
 * This renders real hotel cards as <a href="/hotel/{id}"> in the initial HTML,
 * creating the internal link path Google follows to reach every hotel, plus an
 * ItemList + Breadcrumb + FAQ JSON-LD.
 *
 * Pure server component.
 */

import type { PublicHotel } from '@/shared/api/services';
import HotelCards from '@/shared/server/HotelCards';
import { hotelHref, hotelName } from '@/shared/server/hotels';
import {
  SITE,
  getRouteSeo,
  breadcrumbLd,
  faqLd,
  organizationLd,
  websiteLd,
  itemListLd,
  type InternalLink,
} from '@/shared/lib/seo';

export default function ListingSeoFallback({ hotels }: { hotels: PublicHotel[] }) {
  const seo = getRouteSeo('/listing');

  const crumbs: InternalLink[] = [
    { href: '/', label: 'Home' },
    { href: '/listing', label: seo.h1 },
  ];

  const jsonLd: Record<string, unknown>[] = [
    organizationLd(),
    websiteLd(),
    breadcrumbLd(crumbs),
  ];
  if (hotels.length) {
    jsonLd.push(itemListLd(hotels.map((h) => ({ url: hotelHref(h), name: hotelName(h) }))));
  }
  if (seo.faqs?.length) jsonLd.push(faqLd(seo.faqs));

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

      <h1 style={{ fontSize: '2rem', margin: '12px 0 16px' }}>{seo.h1}</h1>
      {seo.intro.map((p, i) => (
        <p key={`intro-${i}`}>{p}</p>
      ))}

      <section>
        <h2 style={{ fontSize: '1.5rem', marginTop: 24 }}>
          {hotels.length ? `${hotels.length} hotels in Turkey` : 'Hotels in Turkey'}
        </h2>
        {hotels.length ? (
          <HotelCards hotels={hotels} />
        ) : (
          <p>Live availability loads in a moment — or contact our team for help finding a hotel.</p>
        )}
      </section>

      {/* Destination links — give crawlers (and users) a path into each
          neighbourhood landing page. */}
      <nav aria-label="Destinations">
        <h2 style={{ fontSize: '1.5rem', marginTop: 24 }}>Browse by destination</h2>
        <ul>
          <li><a href="/destinations/istanbul">Hotels in Istanbul</a></li>
          <li><a href="/destinations/sultanahmet">Hotels in Sultanahmet</a></li>
          <li><a href="/destinations/sirkeci">Hotels in Sirkeci</a></li>
          <li><a href="/destinations/beyoglu">Hotels in Beyoğlu</a></li>
          <li><a href="/destinations/taksim">Hotels near Taksim Square</a></li>
          <li><a href="/destinations/galata">Hotels in Galata &amp; Karaköy</a></li>
        </ul>
      </nav>

      {seo.sections.map((s, i) => (
        <section key={`sec-${i}`}>
          <h2 style={{ fontSize: '1.5rem', marginTop: 24 }}>{s.h2}</h2>
          {s.paragraphs.map((p, j) => (
            <p key={`sec-${i}-p-${j}`}>{p}</p>
          ))}
          {s.bullets?.length ? (
            <ul>
              {s.bullets.map((b, j) => (
                <li key={`sec-${i}-b-${j}`}>{b}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}

      {seo.faqs?.length ? (
        <section>
          <h2 style={{ fontSize: '1.5rem', marginTop: 24 }}>Frequently asked questions</h2>
          {seo.faqs.map((f, i) => (
            <div key={`faq-${i}`} style={{ marginBottom: 12 }}>
              <h3 style={{ fontSize: '1.1rem', margin: '8px 0 4px' }}>{f.question}</h3>
              <p style={{ margin: 0 }}>{f.answer}</p>
            </div>
          ))}
        </section>
      ) : null}

      <footer style={{ marginTop: 28, fontSize: 14, color: '#445' }}>
        <strong>{SITE.name}</strong>
        <p style={{ marginTop: 4 }}>
          Verified hotels and direct rates across Istanbul, Antalya, Cappadocia, Bodrum and Turkey ·{' '}
          <a href={`tel:${SITE.phone.replace(/[^\d+]/g, '')}`}>{SITE.phone}</a>
        </p>
      </footer>
    </main>
  );
}
