/**
 * Server-only blog data access.
 *
 * Blog posts live at the site root (/<slug>) and are authored in the CMS. The
 * article route ([[...slug]]) renders the FULL post HTML on the server — title,
 * cover, byline, body blocks and JSON-LD — so crawlers and no-JS clients get the
 * complete article in the initial response, with zero client-side fetching.
 * This module is the single server-to-server data path to the Express backend
 * (the source of truth), with ISR caching and hard request timeouts so a slow or
 * degraded upstream can never hang a render.
 *
 * Fetches FAIL SOFT and DISTINGUISH a genuine 404 ("no such post") from a
 * transient error ("backend slow / DB down"): the page hard-404s the former and
 * keeps serving/retrying the latter, so an outage never turns a real article
 * into a permanent 404.
 */

import type { BlogBlock } from '@/shared/api/services';

const BACKEND_URL = (process.env.BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');

// Refresh post-derived HTML/metadata/sitemap at most hourly so new posts appear
// without a redeploy, while keeping render cheap under crawl load.
export const BLOG_REVALIDATE = 3600;

// Hard ceiling on any single upstream call. A crawler render must never block on
// a wedged backend — better a fast fail-soft than a hung (and abandoned) render.
const FETCH_TIMEOUT_MS = 4000;

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
  body?: BlogBlock[];
}

/** ok = have the post; notfound = backend said 404; error = transient failure. */
export type BlogPostResult =
  | { status: 'ok'; post: BlogPost }
  | { status: 'notfound' }
  | { status: 'error' };

// Timeout-guarded fetch. Returns the Response, or null on network error/timeout.
async function timedFetch(url: string): Promise<Response | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: ctrl.signal, next: { revalidate: BLOG_REVALIDATE } });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** All published posts (summaries). Fail-soft: returns [] on any failure. */
export async function fetchPublishedPosts(): Promise<BlogPostSummary[]> {
  const res = await timedFetch(`${BACKEND_URL}/api/blog/public`);
  if (!res || !res.ok) return [];
  try {
    const data = await res.json();
    return Array.isArray(data?.posts) ? (data.posts as BlogPostSummary[]) : [];
  } catch {
    return [];
  }
}

/**
 * One published post by slug, as a discriminated result so callers can tell a
 * real "not found" from a transient outage.
 */
export async function getBlogPost(slug: string): Promise<BlogPostResult> {
  const clean = String(slug || '').trim();
  if (!clean) return { status: 'notfound' };
  const res = await timedFetch(`${BACKEND_URL}/api/blog/public/${encodeURIComponent(clean)}`);
  if (!res) return { status: 'error' };
  if (res.status === 404) return { status: 'notfound' };
  if (!res.ok) return { status: 'error' };
  try {
    const data = await res.json();
    const post = data?.post as BlogPost | undefined;
    return post ? { status: 'ok', post } : { status: 'notfound' };
  } catch {
    return { status: 'error' };
  }
}

/**
 * One published post by slug, or null. Thin wrapper over getBlogPost for callers
 * (e.g. generateMetadata) that don't need to distinguish 404 from error.
 */
export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  const r = await getBlogPost(slug);
  return r.status === 'ok' ? r.post : null;
}

/** Up to `limit` other published posts, for the "Related articles" rail. */
export async function fetchRelatedPosts(excludeSlug: string, limit = 3): Promise<BlogPostSummary[]> {
  const posts = await fetchPublishedPosts();
  return posts.filter((p) => p.slug !== excludeSlug).slice(0, limit);
}
