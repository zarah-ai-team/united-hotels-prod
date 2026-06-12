import type { Metadata } from 'next';
import ClientAppMount from '@/spa/ClientAppMount';
import HotelSeoFallback from './HotelSeoFallback';
import { SITE, abs, getRouteSeo } from '@/shared/lib/seo';
import {
  fetchHotelById,
  fetchPublicHotels,
  hotelName,
  hotelLocation,
  hotelDescription,
  hotelImage,
  hotelId,
  HOTELS_REVALIDATE,
} from '@/shared/server/hotels';

interface PageProps {
  params: { id: string };
}

// Hourly ISR: admin edits / new hotels appear without a redeploy. dynamicParams
// lets ids missing from the build-time prerender render on first request.
export const revalidate = HOTELS_REVALIDATE;
export const dynamicParams = true;

// Pre-render every active hotel as static HTML at build. Fail-soft: if the
// backend is unreachable at build time, we ship zero prerendered ids and every
// page renders on-demand (then caches) instead — never a build failure.
export async function generateStaticParams(): Promise<Array<{ id: string }>> {
  const hotels = await fetchPublicHotels();
  return hotels.map((h) => ({ id: hotelId(h) }));
}

// Clamp a description to a clean ~155-char meta length on a word boundary.
function clampDescription(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' ')).trim()}…`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const canonical = abs(`/hotel/${params.id}`);
  const hotel = await fetchHotelById(params.id);

  // Backend down or hotel missing → fall back to the generic (but indexable)
  // hotel-detail copy, with the canonical still pointing at this URL.
  if (!hotel) {
    const seo = getRouteSeo(`/hotel/${params.id}`);
    return {
      title: { absolute: seo.title },
      description: seo.description,
      alternates: { canonical },
      robots: { index: true, follow: true },
    };
  }

  const name = hotelName(hotel);
  const location = hotelLocation(hotel);
  const desc = hotelDescription(hotel);
  const image = hotelImage(hotel);
  const title = `${name} — ${location} | ${SITE.shortName}`;
  const description = desc
    ? clampDescription(desc)
    : `Book ${name} in ${location} at direct rates with ${SITE.name}. View rooms, amenities and verified availability with free cancellation on most rooms.`;

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical,
      languages: { en: canonical, tr: canonical, 'x-default': canonical },
    },
    robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    openGraph: {
      type: 'website',
      url: canonical,
      siteName: SITE.name,
      title,
      description,
      locale: SITE.locale,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function HotelPage({ params }: PageProps) {
  const hotel = await fetchHotelById(params.id);

  // Render the SPA either way. When the hotel resolved, the crawlable fallback
  // carries its real data; when it didn't (upstream down), the SPA still mounts
  // and fetches client-side, so users are never blocked.
  return (
    <ClientAppMount
      fallback={
        hotel ? (
          <HotelSeoFallback hotel={hotel} />
        ) : (
          <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>
            <h1>Loading hotel…</h1>
            <p>
              <a href="/listing">Browse all hotels in Turkey</a>
            </p>
          </main>
        )
      }
    />
  );
}
