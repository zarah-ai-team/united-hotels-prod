import type { Metadata } from 'next';
import { SITE } from '@/shared/lib/seo';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

// Custom server-rendered 404. The SPA renders its own branded NotFound for
// client navigation; this is the backstop that returns a helpful, indexable-safe
// page (with working links) instead of a bare default error screen.
export default function NotFound() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '64px 20px', textAlign: 'center', lineHeight: 1.6 }}>
      <h1 style={{ fontSize: '2rem' }}>Page not found</h1>
      <p>
        Sorry — we couldn&apos;t find that page. It may have moved or no longer exists. Here are some
        helpful places to continue on {SITE.name}:
      </p>
      <ul style={{ listStyle: 'none', padding: 0, display: 'inline-block', textAlign: 'left' }}>
        <li><a href="/">Home</a></li>
        <li><a href="/listing">Browse hotels in Istanbul &amp; Turkey</a></li>
        <li><a href="/groups">Group &amp; corporate bookings</a></li>
        <li><a href="/blog">Turkey travel guides</a></li>
        <li><a href="/support">Support &amp; contact</a></li>
      </ul>
    </main>
  );
}
