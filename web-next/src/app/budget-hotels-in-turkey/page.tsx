import type { Metadata } from 'next';
import LandingPage from '@/features/marketing/LandingPage';
import { getLanding } from '@/shared/lib/landing';
import { SITE, abs } from '@/shared/lib/seo';

const SLUG = 'budget-hotels-in-turkey';

export function generateMetadata(): Metadata {
  const lp = getLanding(SLUG)!;
  const canonical = abs(`/${SLUG}`);
  return {
    title: { absolute: lp.title },
    description: lp.description,
    keywords: lp.keywords,
    alternates: {
      canonical,
      languages: { en: canonical, tr: canonical, 'x-default': canonical },
    },
    robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    openGraph: {
      type: 'website',
      url: canonical,
      siteName: SITE.name,
      title: lp.title,
      description: lp.description,
      locale: SITE.locale,
    },
    twitter: { card: 'summary_large_image', title: lp.title, description: lp.description },
  };
}

export default function Page() {
  return <LandingPage slug={SLUG} />;
}
