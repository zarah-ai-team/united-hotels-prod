import type { Metadata } from 'next';
import ClientApp from './ClientApp';
import SeoContent from './SeoContent';
import { SITE, getRouteSeo, slugToPath, abs, isKnownRouteHead } from '@/shared/lib/seo';
import { fetchPostBySlug } from '@/shared/server/blog';

interface PageProps {
  params: { slug?: string[] };
}

// A single-segment path that matches no real app route is a candidate blog
// permalink (posts live at /<slug>). We only hit the backend for those, so home
// and every known route keep their static, synchronous metadata.
function candidateBlogSlug(slug?: string[]): string | null {
  if (!slug || slug.length !== 1) return null;
  const seg = slug[0];
  if (!seg || isKnownRouteHead(seg)) return null;
  return seg;
}

// Metadata for a blog permalink — real per-post title/description/canonical so
// posts stop inheriting the generic homepage tags. Falls back to null when the
// slug isn't a published post (the caller then uses the default route SEO).
async function blogMetadata(slug: string): Promise<Metadata | null> {
  const post = await fetchPostBySlug(slug);
  if (!post) return null;
  const canonical = abs(`/${post.slug}`);
  const title = `${post.title} | Book United Hotels`;
  const description =
    post.excerpt || `${post.title} — a Turkey travel guide from Book United Hotels.`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    openGraph: {
      type: 'article',
      url: canonical,
      siteName: SITE.name,
      title,
      description,
      locale: SITE.locale,
      ...(post.coverImage ? { images: [{ url: abs(post.coverImage) }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(post.coverImage ? { images: [abs(post.coverImage)] } : {}),
    },
  };
}

// Per-route metadata, rendered server-side into the initial HTML so crawlers
// and social/AI unfurlers get a unique title, description, canonical, Open
// Graph and Twitter tags for every route — not the generic shell.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Blog permalinks (/<slug>) get real per-post metadata when the post exists.
  const maybeSlug = candidateBlogSlug(params.slug);
  if (maybeSlug) {
    const meta = await blogMetadata(maybeSlug);
    if (meta) return meta;
  }

  const pathname = slugToPath(params.slug);
  const seo = getRouteSeo(pathname);
  const canonical = abs(seo.path);

  return {
    // `absolute` bypasses the layout title template — each route's title is
    // already authored with the right branding and kept under ~60 chars.
    title: { absolute: seo.title },
    description: seo.description,
    keywords: seo.keywords,
    alternates: { canonical },
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
