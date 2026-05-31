/**
 * Keyword-targeted marketing landing pages.
 *
 * These are FULLY server-rendered Next routes (e.g. app/budget-hotels-in-turkey/
 * page.tsx) — not the client SPA. That matters for ranking: the entire page
 * (title, H1, 600+ words, FAQ, schema, internal links) is in the HTML a crawler
 * receives, with no JS required. Each page funnels users into the booking app
 * via CTAs to /listing.
 *
 * To target a new query ("cheap hotels in Istanbul", "luxury hotels Antalya"…):
 * add an entry here and a 3-line app/<slug>/page.tsx that renders <LandingPage>.
 */

import type { FaqItem, InternalLink } from './seo';

export interface LandingSection {
  h2: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LandingPageConfig {
  slug: string; // path-relative, no leading slash, e.g. 'budget-hotels-in-turkey'
  title: string; // 50–60 chars
  description: string; // 110–155 chars
  keywords: string[];
  h1: string; // 10–70 chars
  intro: string[];
  sections: LandingSection[];
  faqs: FaqItem[];
  /** Primary CTAs into the booking app. */
  ctas: InternalLink[];
  related: InternalLink[];
}

const BUDGET_HOTELS_TURKEY: LandingPageConfig = {
  slug: 'budget-hotels-in-turkey',
  title: 'Budget Hotels in Turkey | Cheap Verified Stays & Direct Rates',
  description:
    'Find budget hotels in Turkey at direct rates — cheap, verified stays in Istanbul, Antalya, Cappadocia and Bodrum with free cancellation on most rooms. Book now.',
  keywords: [
    'budget hotels in Turkey', 'cheap hotels in Turkey', 'affordable hotels Turkey',
    'budget hotels Istanbul', 'cheap hotels Istanbul', 'affordable hotels near Taksim',
    'budget hotels Antalya', 'cheap stays Cappadocia', 'low cost hotels Turkey',
  ],
  h1: 'Budget hotels in Turkey — cheap, verified stays at direct rates',
  intro: [
    `Looking for budget hotels in Turkey? Book United Hotels lists affordable, verified stays across Istanbul, Antalya, Cappadocia, Bodrum and beyond — at transparent direct rates, with free cancellation on most rooms. We negotiate prices directly with hotels, so you get genuine value without hidden fees, and a local team you can actually reach.`,
    `Whether you want a cheap hotel near Taksim Square, an affordable boutique room in Sultanahmet, or a low-cost base for a Cappadocia balloon trip, you can compare real availability and book securely in a few clicks.`,
  ],
  sections: [
    {
      h2: 'Cheap hotels in Istanbul by area',
      paragraphs: [
        `Istanbul has excellent budget options if you pick the right neighbourhood. Stay near Taksim and Beyoğlu for affordable rooms close to nightlife and transport; choose Fatih and Sultanahmet for cheap stays within walking distance of the historic sights; or look at Kadıköy on the Asian side for great-value local hotels away from the tourist mark-up.`,
      ],
      bullets: [
        'Affordable hotels near Taksim Square',
        'Cheap boutique stays in Sultanahmet & Fatih',
        'Budget-friendly hotels in Kadıköy (Asian side)',
        'Low-cost hotels near Istanbul Airport (IST) for early flights',
      ],
    },
    {
      h2: 'Budget stays across Turkey',
      paragraphs: [
        `Beyond Istanbul, Turkey rewards value-seekers. Find affordable beach hotels in Antalya, low-cost cave hotels in Cappadocia, and budget marina-area stays in Bodrum. Travelling off-peak (spring and autumn) unlocks the best rates, and many properties include breakfast and free cancellation.`,
      ],
      bullets: [
        'Affordable all-inclusive options in Antalya',
        'Cheap cave hotels in Cappadocia',
        'Budget stays in Bodrum & the Aegean coast',
        'Value city hotels in İzmir near Ephesus',
      ],
    },
    {
      h2: 'How to get the best budget hotel price',
      paragraphs: [
        `Booking direct with a Turkey specialist often beats the large OTAs on total price because there are no opaque service fees. To keep costs down: travel mid-week and off-season, book early for major events, choose rooms with free cancellation so you can rebook if the price drops, and contact our team for group or longer-stay discounts.`,
      ],
      bullets: [
        'Direct rates — no hidden booking or resort fees',
        'Free cancellation on most rooms',
        'Mid-week and off-season pricing tips',
        'Group and long-stay discounts on request',
      ],
    },
  ],
  faqs: [
    {
      question: 'How much does a budget hotel in Turkey cost?',
      answer:
        'Budget hotels in Turkey typically start from around $30–$60 USD per night depending on the city, season and room type. Istanbul and Antalya have the widest choice; off-season rates are noticeably lower. Live prices are shown before you book.',
    },
    {
      question: 'Which is the cheapest area to stay in Istanbul?',
      answer:
        'For low cost with good transport links, look around Taksim/Beyoğlu and the Fatih district; Kadıköy on the Asian side also offers great value. Prices near the main Sultanahmet sights vary, so compare a few options.',
    },
    {
      question: 'Are budget hotels on Book United Hotels verified?',
      answer:
        'Yes. Every property is vetted and every room is confirmed against live availability, so a low price never means an unverified or fake listing. Most rooms also include free cancellation.',
    },
    {
      question: 'When is the cheapest time to visit Turkey?',
      answer:
        'Spring (April–May) and autumn (September–November) usually offer the best balance of low prices and good weather. Winter is cheapest in coastal resorts, while Istanbul stays popular year-round.',
    },
  ],
  ctas: [
    { href: '/listing?destination=Turkey', label: 'Search budget hotels in Turkey' },
    { href: '/listing?destination=Istanbul', label: 'See cheap hotels in Istanbul' },
  ],
  related: [
    { href: '/listing?destination=Istanbul', label: 'Hotels in Istanbul' },
    { href: '/listing?destination=Antalya', label: 'Hotels in Antalya' },
    { href: '/listing?destination=Cappadocia', label: 'Cappadocia cave hotels' },
    { href: '/groups', label: 'Group & corporate rates' },
    { href: '/blog', label: 'Turkey travel guides' },
  ],
};

export const LANDING_PAGES: Record<string, LandingPageConfig> = {
  [BUDGET_HOTELS_TURKEY.slug]: BUDGET_HOTELS_TURKEY,
};

export const getLanding = (slug: string): LandingPageConfig | undefined =>
  LANDING_PAGES[slug];

export const allLandingSlugs = (): string[] => Object.keys(LANDING_PAGES);
