import type { Metadata } from 'next';
import ClientApp from './ClientApp';
import SeoContent from './SeoContent';
import { SITE, getRouteSeo, slugToPath, abs } from '@/shared/lib/seo';

interface PageProps {
  params: { slug?: string[] };
}

// Per-route metadata, rendered server-side into the initial HTML so crawlers
// and social/AI unfurlers get a unique title, description, canonical, hreflang,
// Open Graph and Twitter tags for every route — not the generic shell.
export function generateMetadata({ params }: PageProps): Metadata {
  const pathname = slugToPath(params.slug);
  const seo = getRouteSeo(pathname);
  const canonical = abs(seo.path);

  return {
    // `absolute` bypasses the layout title template — each route's title is
    // already authored with the right branding and kept under ~60 chars.
    title: { absolute: seo.title },
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical,
      languages: {
        'en': canonical,
        'tr': canonical,
        'x-default': canonical,
      },
    },
    robots: seo.noindex
      ? { index: false, follow: true }
      : { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    openGraph: {
      type: seo.ogType === 'product' ? 'website' : seo.ogType ?? 'website',
      url: canonical,
      siteName: SITE.name,
      title: seo.title,
      description: seo.description,
      locale: SITE.locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
    },
  };
}

// Optional catch-all: every path renders server SEO content first, then the
// client SPA takes over (routing lives entirely in <App />).
export default function CatchAllPage({ params }: PageProps) {
  const pathname = slugToPath(params.slug);
  return <ClientApp fallback={<SeoContent pathname={pathname} />} />;
}
