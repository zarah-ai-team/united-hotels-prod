import Image from 'next/image';
import {
  SITE,
  abs,
  breadcrumbLd,
  faqLd,
  organizationLd,
  websiteLd,
} from '@/shared/lib/seo';
import { getLanding } from '@/shared/lib/landing';

/**
 * Server-rendered marketing landing page. Fully crawlable (no JS needed) and
 * funnels visitors into the booking app via CTAs. Pure server component.
 */
export default function LandingPage({ slug }: { slug: string }) {
  const lp = getLanding(slug);
  if (!lp) return null;

  const path = `/${lp.slug}`;
  const jsonLd: Record<string, unknown>[] = [
    organizationLd(),
    websiteLd(),
    breadcrumbLd([
      { href: '/', label: 'Home' },
      { href: path, label: lp.h1 },
    ]),
    faqLd(lp.faqs),
  ];

  return (
    <div style={{ color: '#13233f' }}>
      {jsonLd.map((blob, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blob) }}
        />
      ))}

      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid #e6e9ef',
        }}
      >
        <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/united-hotels-logo.png" alt="United Hotels - bookunitedhotels.com" width={851} height={392} style={{ height: 34, width: 'auto' }} />
        </a>
        <a
          href="/listing"
          style={{ background: '#2F80ED', color: '#fff', padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}
        >
          Search hotels
        </a>
      </header>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px', lineHeight: 1.65 }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: 14 }}>
          <a href="/">Home</a> <span aria-hidden="true">/</span> {lp.h1}
        </nav>

        <h1 style={{ fontSize: '2.1rem', margin: '12px 0 16px' }}>{lp.h1}</h1>
        {lp.intro.map((p, i) => (
          <p key={`intro-${i}`}>{p}</p>
        ))}

        {/* Primary CTAs into the booking app */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, margin: '20px 0' }}>
          {lp.ctas.map((c) => (
            <a
              key={c.href}
              href={c.href}
              style={{ background: '#2F80ED', color: '#fff', padding: '12px 20px', borderRadius: 10, textDecoration: 'none', fontWeight: 600 }}
            >
              {c.label}
            </a>
          ))}
        </div>

        <Image
          src="/assets/hero-figma-7.webp"
          alt="Budget hotels across Istanbul and Turkey — bookable at direct rates with United Hotels"
          width={1000}
          height={460}
          sizes="(max-width: 1000px) 100vw, 1000px"
          style={{ width: '100%', height: 'auto', borderRadius: 12, margin: '8px 0 16px' }}
        />

        {lp.sections.map((s, i) => (
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

        <section>
          <h2 style={{ fontSize: '1.5rem', marginTop: 28 }}>Frequently asked questions</h2>
          {lp.faqs.map((f, i) => (
            <div key={`faq-${i}`} style={{ marginBottom: 12 }}>
              <h3 style={{ fontSize: '1.1rem', margin: '8px 0 4px' }}>{f.question}</h3>
              <p style={{ margin: 0 }}>{f.answer}</p>
            </div>
          ))}
        </section>

        <nav aria-label="Related pages">
          <h2 style={{ fontSize: '1.5rem', marginTop: 28 }}>Explore more</h2>
          <ul>
            {lp.related.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
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
          <a href={abs('/')}>Home</a> · <a href="/listing">All hotels</a> · <a href="/groups">Groups &amp; B2B</a> ·{' '}
          <a href="/support">Support</a>
        </p>
      </footer>
    </div>
  );
}
