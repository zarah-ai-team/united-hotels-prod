import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DestinationContent from './DestinationContent';
import { SITE, abs } from '@/shared/lib/seo';
import {
  getDestination,
  allDestinationSlugs,
  hotelsForDestination,
} from '@/shared/lib/destinations';
import { fetchPublicHotels, HOTELS_REVALIDATE } from '@/shared/server/hotels';

interface PageProps {
  params: { slug: string };
}

// Destinations are a fixed, curated set — prerender them all and 404 anything
// else (dynamicParams=false). Hourly ISR refreshes the hotel grid.
export const revalidate = HOTELS_REVALIDATE;
export const dynamicParams = false;

export function generateStaticParams(): Array<{ slug: string }> {
  return allDestinationSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const dest = getDestination(params.slug);
  if (!dest) return {};
  const canonical = abs(`/destinations/${dest.slug}`);
  return {
    title: { absolute: dest.title },
    description: dest.description,
    alternates: { canonical },
    robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    openGraph: {
      type: 'website',
      url: canonical,
      siteName: SITE.name,
      title: dest.title,
      description: dest.description,
      locale: SITE.locale,
    },
    twitter: { card: 'summary_large_image', title: dest.title, description: dest.description },
  };
}

export default async function DestinationPage({ params }: PageProps) {
  const dest = getDestination(params.slug);
  if (!dest) notFound();

  const allHotels = await fetchPublicHotels();
  const hotels = hotelsForDestination(dest, allHotels);

  return <DestinationContent dest={dest} hotels={hotels} />;
}
