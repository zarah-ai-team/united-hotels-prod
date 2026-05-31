import {
  SITE,
  getRouteSeo,
  breadcrumbLd,
  faqLd,
  organizationLd,
  travelAgencyLd,
  websiteLd,
  type InternalLink,
} from '@/shared/lib/seo';

/**
 * Server-rendered, crawlable page content. This is the initial HTML a no-JS
 * crawler / AI unfurler receives for every route: a real <h1>, headings, body
 * copy, internal links, an image with alt text, and JSON-LD. The client SPA
 * replaces it once hydrated (see ClientApp), so users get the full app while
 * search engines get indexable content.
 *
 * Pure server component — no client hooks, no interactivity.
 */
export default function SeoContent({ pathname }: { pathname: string }) {
  const seo = getRouteSeo(pathname);
  const isHome = seo.path === '/';

  const crumbs: InternalLink[] = isHome
    ? [{ href: '/', label: 'Home' }]
    : [{ href: '/', label: 'Home' }, { href: seo.path, label: seo.h1 }];

  const jsonLd: Record<string, unknown>[] = [organizationLd(), websiteLd()];
  if (isHome || seo.path === '/support') jsonLd.push(travelAgencyLd());
  if (!isHome) jsonLd.push(breadcrumbLd(crumbs));
  if (seo.faqs?.length) jsonLd.push(faqLd(seo.faqs));

  return (
    <main
      id="seo-content"
      aria-hidden="false"
      style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px', lineHeight: 1.65 }}
    >
      {/* JSON-LD structured data */}
      {jsonLd.map((blob, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blob) }}
        />
      ))}

      {/* Breadcrumb trail (crawlable internal links) */}
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

      {/* Brand image with descriptive alt (gives crawlers an image + og context) */}
      <img
        src="/assets/hero-figma-7.webp"
        alt="Aerial view of Istanbul and the Golden Horn — hotels bookable with Book United Hotels"
        width={1100}
        height={500}
        loading="lazy"
        style={{ width: '100%', height: 'auto', borderRadius: 12, margin: '16px 0' }}
      />

      {seo.sections.map((s, i) => (
        <section key={`sec-${i}`}>
          <h2 style={{ fontSize: '1.5rem', marginTop: 28 }}>{s.h2}</h2>
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
          <h2 style={{ fontSize: '1.5rem', marginTop: 28 }}>Frequently asked questions</h2>
          {seo.faqs.map((f, i) => (
            <div key={`faq-${i}`} style={{ marginBottom: 12 }}>
              <h3 style={{ fontSize: '1.1rem', margin: '8px 0 4px' }}>{f.question}</h3>
              <p style={{ margin: 0 }}>{f.answer}</p>
            </div>
          ))}
        </section>
      ) : null}

      {seo.related?.length ? (
        <nav aria-label="Related pages">
          <h2 style={{ fontSize: '1.5rem', marginTop: 28 }}>Explore Book United Hotels</h2>
          <ul>
            {seo.related.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {/* Business identity / contact — local SEO signal in crawlable text */}
      <footer style={{ marginTop: 32, fontSize: 14, color: '#444' }}>
        <h2 style={{ fontSize: '1.25rem' }}>{SITE.name}</h2>
        <address style={{ fontStyle: 'normal' }}>
          {SITE.address.streetAddress}, {SITE.address.addressLocality}, {SITE.address.addressRegion}{' '}
          {SITE.address.postalCode}, Türkiye
          <br />
          Reservations &amp; trade enquiries: <a href={`tel:${SITE.phone.replace(/[^\d+]/g, '')}`}>{SITE.phone}</a>
        </address>
        <p>Verified hotels and direct rates across Istanbul, Antalya, Cappadocia, Bodrum and Turkey — for individual travellers and travel-trade partners.</p>
      </footer>
    </main>
  );
}
