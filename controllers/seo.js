const pool = require('../db');

// ─────────────────────────────────────────────────────────────────────────────
// /sitemap.xml  +  /robots.txt
//
// Serves a Google-friendly sitemap that combines:
//   - hard-coded static pages (home, listing, groups, blog, support)
//   - dynamic hotel detail pages from the DB
//
// SITE_BASE_URL controls the absolute URL emitted in <loc>. Set this in your
// production .env so the sitemap doesn't end up referencing localhost.
// ─────────────────────────────────────────────────────────────────────────────

const siteBase = () => {
  const raw = process.env.SITE_BASE_URL || process.env.FRONTEND_URL || 'https://bookunitedhotels.com';
  return raw.replace(/\/+$/, '');
};

const xmlEscape = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

// Hard-coded marketing/product routes. Per-page priorities tilt Google toward
// the highest-value commercial pages (home + listing) without aggressively
// underweighting support content.
const STATIC_URLS = [
  { path: '/',         changefreq: 'daily',   priority: '1.0' },
  { path: '/listing',  changefreq: 'daily',   priority: '0.9' },
  { path: '/groups',   changefreq: 'weekly',  priority: '0.8' },
  { path: '/blog',     changefreq: 'weekly',  priority: '0.6' },
  { path: '/support',  changefreq: 'monthly', priority: '0.5' },
];

const buildUrlEntry = ({ loc, lastmod, changefreq, priority }) =>
  `  <url>\n` +
  `    <loc>${xmlEscape(loc)}</loc>` +
  (lastmod ? `\n    <lastmod>${xmlEscape(lastmod)}</lastmod>` : '') +
  (changefreq ? `\n    <changefreq>${changefreq}</changefreq>` : '') +
  (priority ? `\n    <priority>${priority}</priority>` : '') +
  `\n  </url>`;

const fetchHotelEntries = async () => {
  try {
    const result = await pool.query(
      `SELECT id, COALESCE(updated_at, created_at) AS lastmod
         FROM hotels
        WHERE status = 'active'
        ORDER BY id ASC
        LIMIT 5000`,
    );
    return result.rows.map((row) => ({
      loc: `${siteBase()}/hotel/${row.id}`,
      lastmod: row.lastmod ? new Date(row.lastmod).toISOString() : null,
      changefreq: 'weekly',
      priority: '0.8',
    }));
  } catch (err) {
    // Sitemap should still serve even if the DB query fails — better an
    // incomplete sitemap than a 500 that drops Book United from Google's index.
    console.warn('[sitemap] hotel fetch failed:', err.message);
    return [];
  }
};

const fetchBlogEntries = async () => {
  try {
    const result = await pool.query(
      `SELECT slug, COALESCE(published_at, updated_at, created_at) AS lastmod
         FROM blog_posts
        WHERE status = 'published'
        ORDER BY COALESCE(published_at, created_at) DESC
        LIMIT 2000`,
    );
    return result.rows.map((row) => ({
      // Posts publish at the site root (no /blog/ prefix).
      loc: `${siteBase()}/${row.slug}`,
      lastmod: row.lastmod ? new Date(row.lastmod).toISOString() : null,
      changefreq: 'monthly',
      priority: '0.6',
    }));
  } catch (err) {
    // A missing blog_posts table (migration not yet applied) or any query
    // error must not take down the sitemap — degrade to no blog entries.
    console.warn('[sitemap] blog fetch failed:', err.message);
    return [];
  }
};

const sitemapXml = async (req, res) => {
  const base = siteBase();
  const staticEntries = STATIC_URLS.map((s) => ({
    loc: `${base}${s.path}`,
    changefreq: s.changefreq,
    priority: s.priority,
  }));
  const [hotelEntries, blogEntries] = await Promise.all([
    fetchHotelEntries(),
    fetchBlogEntries(),
  ]);
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    [...staticEntries, ...hotelEntries, ...blogEntries].map(buildUrlEntry).join('\n') +
    `\n</urlset>\n`;
  res.set('Content-Type', 'application/xml; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(xml);
};

const robotsTxt = (req, res) => {
  const base = siteBase();
  const body =
    `User-agent: *\n` +
    `Allow: /\n` +
    `Disallow: /admin\n` +
    `Disallow: /admin/\n` +
    `Disallow: /blog-admin\n` +
    `Disallow: /vendor\n` +
    `Disallow: /vendor/\n` +
    `Disallow: /auth\n` +
    `Disallow: /booking/\n` +
    `\n` +
    `Sitemap: ${base}/sitemap.xml\n`;
  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(body);
};

// ads.txt — IAB spec wants Content-Type: text/plain. Empty file is valid
// and signals to crawlers that we explicitly publish no ad-tech sellers.
// Populate this when an ad-tech relationship exists (e.g. Google AdSense:
// "google.com, pub-XXXXXXXXXX, DIRECT, f08c47fec0942fa0").
const adsTxt = (req, res) => {
  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=86400');
  // Comment so the file isn't empty (some validators flag a 0-byte response).
  res.send('# Book United Hotels — no authorized digital sellers at this time.\n');
};

module.exports = { sitemapXml, robotsTxt, adsTxt };
