/**
 * initBlog.js — apply the blog CMS schema and (idempotently) seed the sample
 * articles that used to be hard-coded in the frontend, so /blog stays populated
 * the moment the DB takes over.
 *
 * Usage:  node scripts/initBlog.js
 *
 * Safe to re-run: schema is CREATE ... IF NOT EXISTS, seed uses
 * ON CONFLICT (slug) DO NOTHING (never overwrites edits made in the editor).
 */
require('dotenv').config();
const pool = require('../db');
const fs = require('fs');
const path = require('path');

// The six articles that previously lived as a static array in BlogPage.tsx.
// The first carries a full block body (from the old BlogArticlePage); the rest
// get a short intro body so cards open onto real content.
const SEED_POSTS = [
  {
    slug: 'where-to-stay-istanbul-guide',
    title: 'Where to Stay in Turkey: Complete Neighborhood Guide',
    excerpt: 'Discover the best areas to stay in Turkey based on your travel style, from historic Sultanahmet to vibrant Beyoğlu.',
    category: 'Travel Tips',
    cover_image: 'https://images.unsplash.com/photo-1719147145383-9cbd4b382525?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    author_name: 'United Hotels Travel Desk',
    author_title: 'Local Experts',
    read_time: '8 min read',
    body: [
      { type: 'paragraph', text: "Choosing where to stay in Turkey can make or break your trip. This ancient city straddles two continents and is divided into distinct neighborhoods, each with its own character, atmosphere, and advantages." },
      { type: 'heading', level: 2, text: 'Sultanahmet & Fatih: Historic Heart' },
      { type: 'paragraph', text: 'Sultanahmet is Turkey’s Old City, home to iconic sites like the Blue Mosque, Hagia Sophia, and Topkapi Palace. This area puts you at the center of Byzantine and Ottoman history.' },
      { type: 'quote', label: 'Local Tip', text: 'While Sultanahmet is convenient for sightseeing, it can feel touristy. For a more authentic experience, explore nearby Fatih where locals live and shop.' },
      { type: 'list', items: ['Walking distance to major attractions', 'Good public transport connections', 'Wide range of hotel options and budgets', 'Easy airport access via tramway'] },
      { type: 'heading', level: 2, text: 'Taksim & Beyoğlu: Modern Turkey' },
      { type: 'paragraph', text: 'Taksim Square and the surrounding Beyoğlu district represent modern Turkey, known for Istiklal Street — a bustling pedestrian avenue lined with shops, cafes, restaurants, and historic buildings.' },
      { type: 'heading', level: 2, text: 'Our Recommendations' },
      { type: 'paragraph', text: 'For first-time visitors on a short trip, stay in Sultanahmet to maximize sightseeing. If returning or staying longer, consider Beyoğlu for a vibrant local experience, or Kadıköy for authentic neighborhood life.' },
    ],
  },
  {
    slug: 'cheapest-neighborhoods-istanbul',
    title: 'Cheapest Neighborhoods in Turkey for Budget Travelers',
    excerpt: 'Save money without sacrificing quality. Our guide to Turkey’s most affordable yet authentic neighborhoods.',
    category: 'Budget Travel',
    cover_image: 'https://images.unsplash.com/photo-1668858865404-1d38f27d4217?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    author_name: 'United Hotels Travel Desk',
    author_title: 'Local Experts',
    read_time: '6 min read',
    body: [
      { type: 'paragraph', text: 'You do not need a big budget to enjoy Turkey. These neighborhoods offer great value on accommodation while keeping you close to the action.' },
    ],
  },
  {
    slug: 'best-time-visit-istanbul',
    title: 'Best Time to Visit Turkey: Month-by-Month Guide',
    excerpt: 'Plan your Turkey trip with our comprehensive weather, events, and pricing guide throughout the year.',
    category: 'Travel Tips',
    cover_image: 'https://images.unsplash.com/photo-1651468326487-212eda71a61b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    author_name: 'United Hotels Travel Desk',
    author_title: 'Local Experts',
    read_time: '10 min read',
    body: [
      { type: 'paragraph', text: 'Turkey is a year-round destination, but the experience shifts with the seasons. Here is what to expect month by month so you can pick the perfect window.' },
    ],
  },
  {
    slug: 'grand-bazaar-shopping-guide',
    title: 'Exploring Turkey’s Grand Bazaar: Insider Shopping Guide',
    excerpt: 'Navigate one of the world’s oldest markets like a local with our expert tips and hidden gem recommendations.',
    category: 'Culture',
    cover_image: 'https://images.unsplash.com/photo-1589900586776-53db57559c73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    author_name: 'United Hotels Travel Desk',
    author_title: 'Local Experts',
    read_time: '7 min read',
    body: [
      { type: 'paragraph', text: 'With over 4,000 shops, the Grand Bazaar can overwhelm first-timers. These tips help you shop smart, bargain well, and find the real treasures.' },
    ],
  },
  {
    slug: 'turkish-breakfast-guide',
    title: 'Turkish Breakfast Guide: Best Places for Kahvaltı in Turkey',
    excerpt: 'Experience authentic Turkish breakfast culture at the best local spots across Turkey.',
    category: 'Food & Dining',
    cover_image: 'https://images.unsplash.com/photo-1772550863378-dfa7bf415278?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    author_name: 'United Hotels Travel Desk',
    author_title: 'Local Experts',
    read_time: '5 min read',
    body: [
      { type: 'paragraph', text: 'A Turkish breakfast (kahvaltı) is a feast of cheeses, olives, eggs, jams, and endless tea. Here is where to find the best spreads.' },
    ],
  },
  {
    slug: 'galata-karakoy-guide',
    title: 'Galata & Karaköy: Turkey’s Hippest Neighborhood Guide',
    excerpt: 'Discover trendy cafes, art galleries, and historic landmarks in Turkey’s most creative district.',
    category: 'Neighborhoods',
    cover_image: 'https://images.unsplash.com/photo-1696711068208-f8c902832e65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    author_name: 'United Hotels Travel Desk',
    author_title: 'Local Experts',
    read_time: '9 min read',
    body: [
      { type: 'paragraph', text: 'Galata and Karaköy blend cobbled history with a buzzing modern creative scene. Here is how to make the most of the district.' },
    ],
  },
];

async function run() {
  try {
    const schemaPath = path.join(__dirname, '..', 'db', 'blog_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('→ Applying blog schema...');
    // The file is one BEGIN/COMMIT block — run it as a single statement so the
    // transaction boundaries are preserved.
    await pool.query(schema);
    console.log('✓ blog_posts table ready');

    console.log('→ Seeding sample posts (skips any that already exist)...');
    let inserted = 0;
    for (const p of SEED_POSTS) {
      const result = await pool.query(
        `INSERT INTO blog_posts
           (slug, title, excerpt, category, cover_image, author_name, author_title,
            read_time, body, status, published_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'published', now())
         ON CONFLICT (slug) DO NOTHING
         RETURNING id`,
        [
          p.slug, p.title, p.excerpt, p.category, p.cover_image,
          p.author_name, p.author_title, p.read_time, JSON.stringify(p.body),
        ],
      );
      if (result.rowCount > 0) inserted += 1;
    }
    console.log(`✓ Seed complete — ${inserted} new post(s), ${SEED_POSTS.length - inserted} already present`);

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('✗ initBlog failed:', error.message);
    await pool.end();
    process.exit(1);
  }
}

run();
