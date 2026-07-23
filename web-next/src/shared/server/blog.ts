/**
 * Server-only blog data access.
 *
 * Blog posts live at the site root (/<slug>) and are authored in the CMS. For
 * crawlers to get a UNIQUE title/description/canonical per post — instead of the
 * generic homepage fallback the catch-all otherwise emits — the server needs the
 * post's real fields in the initial HTML <head>. This module talks
 * server-to-server to the Express backend (the source of truth) with ISR
 * caching, and also feeds the sitemap with every published post URL.
 *
 * Every fetch FAILS SOFT (returns [] / null) so a backend hiccup or an
 * over-quota database can never 500 a page or drop the site from the index.
 */

const BACKEND_URL = (process.env.BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');

// Refresh post-derived metadata/sitemap at most hourly so new posts appear
// without a redeploy, while keeping render cheap under crawl load.
export const BLOG_REVALIDATE = 3600;

export interface BlogAuthor {
  name?: string;
  avatar?: string;
  title?: string;
}

export interface BlogPostSummary {
  id: number | string;
  slug: string;
  title: string;
  excerpt?: string;
  category?: string;
  coverImage?: string;
  author?: BlogAuthor;
  readTime?: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
}

export interface BlogPost extends BlogPostSummary {
  body?: unknown[];
}

/** All published posts (summaries). Fail-soft: returns [] on any failure. */
export async function fetchPublishedPosts(): Promise<BlogPostSummary[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/blog/public`, {
      next: { revalidate: BLOG_REVALIDATE },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const posts = Array.isArray(data?.posts) ? data.posts : [];
    return posts as BlogPostSummary[];
  } catch {
    return [];
  }
}

/**
 * One published post by slug, or null if it doesn't exist / the fetch fails.
 * Used by the catch-all's generateMetadata to give each post real SEO tags.
 */
export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  const clean = String(slug || '').trim();
  if (!clean) return null;
  try {
    const res = await fetch(`${BACKEND_URL}/api/blog/public/${encodeURIComponent(clean)}`, {
      next: { revalidate: BLOG_REVALIDATE },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data?.post as BlogPost) ?? null;
  } catch {
    return null;
  }
}
