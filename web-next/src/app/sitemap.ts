import type { MetadataRoute } from 'next';
import { SITE } from '@/shared/lib/seo';
import { allLandingSlugs } from '@/shared/lib/landing';

// Regenerate at most hourly so new/updated hotels appear without a redeploy.
export const revalidate = 3600;

const BACKEND_URL = (process.env.BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');

interface HotelRow {
  id: number | string;
  updatedAt?: string;
  updated_at?: string;
  createdAt?: string;
}

// Pull active hotels for per-property detail URLs. Fails soft — an incomplete
// sitemap is far better than a 500 that drops the site from the index.
async function fetchHotelEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/hotels/public`, {
      next: { revalidate },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const hotels: HotelRow[] = Array.isArray(data) ? data : data.hotels ?? [];
    return hotels.slice(0, 5000).map((h) => {
      const last = h.updatedAt || h.updated_at || h.createdAt;
      return {
        url: `${SITE.url}/hotel/${h.id}`,
        lastModified: last ? new Date(last) : undefined,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      };
    });
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE.url}/listing`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE.url}/groups`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE.url}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE.url}/support`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE.url}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE.url}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Keyword-targeted marketing landing pages (e.g. /budget-hotels-in-turkey).
  const landingRoutes: MetadataRoute.Sitemap = allLandingSlugs().map((slug) => ({
    url: `${SITE.url}/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  const hotels = await fetchHotelEntries();
  return [...staticRoutes, ...landingRoutes, ...hotels];
}
