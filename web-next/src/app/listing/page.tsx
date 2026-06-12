import type { Metadata } from 'next';
import ClientAppMount from '@/spa/ClientAppMount';
import ListingSeoFallback from './ListingSeoFallback';
import { SITE, abs, getRouteSeo } from '@/shared/lib/seo';
import { fetchPublicHotels, HOTELS_REVALIDATE } from '@/shared/server/hotels';

// Hourly ISR so the crawlable hotel grid reflects new/edited hotels without a
// redeploy. The interactive SPA still fetches live data + prices on the client.
export const revalidate = HOTELS_REVALIDATE;

export function generateMetadata(): Metadata {
  const seo = getRouteSeo('/listing');
  const canonical = abs(seo.path);
  return {
    title: { absolute: seo.title },
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical,
      languages: { en: canonical, tr: canonical, 'x-default': canonical },
    },
    robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    openGraph: {
      type: 'website',
      url: canonical,
      siteName: SITE.name,
      title: seo.title,
      description: seo.description,
      locale: SITE.locale,
    },
    twitter: { card: 'summary_large_image', title: seo.title, description: seo.description },
  };
}

export default async function ListingPage() {
  const hotels = await fetchPublicHotels();
  // Seed the client SPA with the hotels we already fetched server-side, so
  // /listing paints real hotel cards on first render instead of flashing a
  // full-page skeleton when the SPA takes over. Prices are still (re)fetched on
  // the client and revealed per-card with a loader. replace() neutralises any
  // literal "</script>" inside the serialized data.
  const seedJson = JSON.stringify(hotels).replace(/</g, '\\u003c');
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `window.__UH_LISTING_HOTELS__=${seedJson};` }} />
      <ClientAppMount fallback={<ListingSeoFallback hotels={hotels} />} />
    </>
  );
}
