import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import ClientApp from './ClientApp';
import SeoContent from './SeoContent';
import BlogArticleServer from '@/features/blog/components/BlogArticleServer';
import { SITE, getRouteSeo, slugToPath, abs, isKnownRouteHead } from '@/shared/lib/seo';
import { getBlogPost, fetchRelatedPosts, type BlogPostResult } from '@/shared/server/blog';

interface PageProps {
  params: { slug?: string[] };
}

// A single-segment path that matches no real app route is a candidate blog
// permalink (posts live at /<slug>). We only hit the backend for those, so home
// and every known route keep their static, synchronous handling.
function candidateBlogSlug(slug?: string[]): string | null {
  if (!slug || slug.length !== 1) return null;
  const seg = slug[0];
  if (!seg || isKnownRouteHead(seg)) return null;
  return seg;
}

// Fetch the post ONCE per request. React's cache() memoises the call, so
// generateMetadata and the page render share a single backend round-trip
// (no metadata→render fetch waterfall).
const loadPost = cache((slug: string): Promise<BlogPostResult> => getBlogPost(slug));

// Metadata for a blog permalink — real per-post title/description/canonical/OG
// so posts stop inheriting the generic homepage tags. Null when the slug isn't a
// published post (caller then uses the default route SEO).
async function blogMetadata(slug: string): Promise<Metadata | null> {
  const r = await loadPost(slug);
  if (r.status !== 'ok') return null;
  const post = r.post;
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

// Per-route metadata, rendered server-side into the initial HTML so crawlers and
// social/AI unfurlers get a unique title, description, canonical, Open Graph and
// Twitter tags for every route — not the generic shell.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const maybeSlug = candidateBlogSlug(params.slug);
  if (maybeSlug) {
    const meta = await blogMetadata(maybeSlug);
    if (meta) return meta;
  }

  const pathname = slugToPath(params.slug);
  const seo = getRouteSeo(pathname);
  const canonical = abs(seo.path);

  return {
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

// Optional catch-all. Blog permalinks (/<slug>) are FULLY SERVER-RENDERED — the
// article HTML ships in the initial response with no client fetch, so crawlers
// index real content (no Soft 404). Every other path renders the server SEO
// shell, then the client SPA takes over.
export default async function CatchAllPage({ params }: PageProps) {
  const slug = candidateBlogSlug(params.slug);
  if (slug) {
    const r = await loadPost(slug);
    if (r.status === 'ok') {
      const related = await fetchRelatedPosts(slug, 3);
      return <BlogArticleServer post={r.post} related={related} />;
    }
    // Genuine "no such post" → a real 404 (not a soft one). A transient backend
    // error falls through to the SPA shell, which retries client-side — so an
    // outage never hard-404s a post that actually exists.
    if (r.status === 'notfound') notFound();
  }

  const pathname = slugToPath(params.slug);
  return <ClientApp fallback={<SeoContent pathname={pathname} />} />;
}
