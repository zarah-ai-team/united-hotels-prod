import type { MetadataRoute } from 'next';
import { SITE } from '@/shared/lib/seo';

// Served at /robots.txt by Next. Allows crawling of public pages, blocks
// transactional / private areas, and declares the sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/vendor', '/vendor/', '/auth', '/booking/', '/portal', '/api/'],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
