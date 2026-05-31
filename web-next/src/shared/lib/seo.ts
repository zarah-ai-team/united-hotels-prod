/**
 * Central SEO configuration — the single source of truth for per-route
 * metadata and server-rendered crawlable content.
 *
 * Why this exists: the app is a client SPA, so the initial HTML a no-JS
 * crawler (and most AI / social unfurlers) receives must already carry the
 * title, description, canonical, hreflang, structured data, an <h1>, real
 * body copy, and internal links. `getRouteSeo()` resolves a pathname to that
 * content; `app/[[...slug]]/page.tsx` turns it into both `<head>` metadata
 * (generateMetadata) and a server-rendered `<main>` (SeoContent).
 *
 * Keep titles 50–60 chars and descriptions 110–155 chars (Google truncates
 * beyond that). Every route MUST have a unique title + description.
 */

export const SITE = {
  name: 'Book United Hotels',
  shortName: 'United Hotels',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://bookunitedhotels.com').replace(/\/+$/, ''),
  locale: 'en_US',
  // Contact / identity — surfaced in LocalBusiness + Organization schema and
  // the footer content block. Phone is intentionally a tel: digits string.
  phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+90 544 958 0798',
  // Address for LocalBusiness schema. Override via env in production.
  address: {
    streetAddress: process.env.NEXT_PUBLIC_ADDRESS_STREET || 'Cankurtaran, Sultanahmet',
    addressLocality: process.env.NEXT_PUBLIC_ADDRESS_CITY || 'Istanbul',
    addressRegion: process.env.NEXT_PUBLIC_ADDRESS_REGION || 'Istanbul',
    postalCode: process.env.NEXT_PUBLIC_ADDRESS_POSTAL || '34122',
    addressCountry: 'TR',
  },
};

export const socialSameAs = (): string[] =>
  [
    process.env.NEXT_PUBLIC_FACEBOOK_URL,
    process.env.NEXT_PUBLIC_INSTAGRAM_URL,
    process.env.NEXT_PUBLIC_X_URL,
    process.env.NEXT_PUBLIC_YOUTUBE_URL,
    process.env.NEXT_PUBLIC_LINKEDIN_URL,
  ].filter((v): v is string => typeof v === 'string' && v.length > 0);

export const abs = (path: string): string => {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE.url}${path.startsWith('/') ? '' : '/'}${path}`;
};

export interface ContentSection {
  h2: string;
  paragraphs: string[];
  /** Optional bullet list rendered under the section. */
  bullets?: string[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface InternalLink {
  href: string;
  label: string;
}

export interface RouteSeo {
  /** Canonical root-relative path for this route. */
  path: string;
  title: string;
  description: string;
  keywords: string[];
  /** Visible page heading (10–70 chars). */
  h1: string;
  /** Lead paragraphs under the H1. */
  intro: string[];
  sections: ContentSection[];
  faqs?: FaqItem[];
  /** Curated internal links rendered in the crawlable nav block. */
  related?: InternalLink[];
  ogType?: 'website' | 'article' | 'product';
  /** When true, emit noindex (app/transactional routes). */
  noindex?: boolean;
}

// Internal links shown on most indexable pages — passes link equity to the
// highest-value commercial routes and gives crawlers a real link graph.
const PRIMARY_LINKS: InternalLink[] = [
  { href: '/listing', label: 'Browse all hotels in Turkey' },
  { href: '/listing?destination=Istanbul', label: 'Hotels in Istanbul' },
  { href: '/listing?destination=Sultanahmet', label: 'Boutique hotels in Sultanahmet' },
  { href: '/listing?destination=Taksim', label: 'Hotels near Taksim Square' },
  { href: '/groups', label: 'Group & corporate bookings' },
  { href: '/blog', label: 'Turkey travel guides' },
  { href: '/support', label: 'Support & contact' },
];

const TRUST_SECTION: ContentSection = {
  h2: 'Why book direct with Book United Hotels',
  paragraphs: [
    `Book United Hotels is a Turkey-focused destination management company (DMC) and booking platform. We negotiate direct rates with hotels across Istanbul, Antalya, Cappadocia, Bodrum and the wider country, so both individual travellers and travel-trade partners get transparent pricing, verified rooms and real local support — not an anonymous global checkout.`,
    `Every property on the platform is vetted, every room is confirmed against live availability, and our reservations team is reachable by phone and WhatsApp in your timezone. Free cancellation is available on most rooms, payment is secured, and group and corporate allotments are handled by dedicated specialists.`,
  ],
  bullets: [
    'Direct, verified hotel rates — no opaque resort fees',
    'Local Istanbul-based reservations team, 7 days a week',
    'Secure payment and free cancellation on most rooms',
    'B2B wholesale rates, allotments and DMC services for agencies',
  ],
};

const HOME: RouteSeo = {
  path: '/',
  title: 'Book United Hotels | Hotels in Istanbul & Turkey — B2B & B2C',
  description:
    'Book verified hotels across Istanbul and Turkey at direct rates. Bosphorus-view suites, boutique Sultanahmet stays, plus B2B wholesale rates for travel agents.',
  keywords: [
    'hotels in Istanbul', 'hotels in Turkey', 'Istanbul hotel deals',
    'Bosphorus view hotels', 'boutique hotels Sultanahmet', 'B2B hotel wholesaler Turkey',
    'travel agent portal Turkey', 'DMC Istanbul', 'group hotel bookings Turkey',
  ],
  h1: 'Hotels in Istanbul & across Turkey at direct rates',
  intro: [
    `Discover and book the best hotels in Istanbul and across Turkey with Book United Hotels — your specialist partner for the Turkish market. From Bosphorus-view suites in Beşiktaş and boutique stays in Sultanahmet to all-inclusive resorts in Antalya and cave hotels in Cappadocia, we offer verified rooms at transparent, direct rates.`,
    `We serve two audiences under one roof: individual travellers (B2C) booking holidays and city breaks, and travel agencies, corporates and tour operators (B2B) who need wholesale rates, real-time availability, group allotments and full DMC support.`,
  ],
  sections: [
    {
      h2: 'Where to stay in Istanbul — by neighbourhood',
      paragraphs: [
        `Istanbul rewards travellers who choose the right neighbourhood. Stay in Sultanahmet (Fatih) to wake up beside the Blue Mosque and Hagia Sophia; pick Beyoğlu and Taksim for nightlife, dining and the İstiklal Avenue energy; choose Beşiktaş or Ortaköy for Bosphorus views and waterfront dining; or cross to Kadıköy on the Asian side for a local, café-led pace.`,
        `Not sure where to base yourself? Our neighbourhood guides compare Sultanahmet vs. Beyoğlu, explain transport links, and recommend the right area for first-timers, families, couples and business travellers.`,
      ],
      bullets: [
        'Sultanahmet & Fatih — historic peninsula, walk to the major sights',
        'Beyoğlu & Taksim — dining, nightlife and central transport',
        'Beşiktaş & Ortaköy — Bosphorus views and waterfront hotels',
        'Kadıköy — local, relaxed stays on the Asian side',
        'Hotels near Istanbul Airport (IST) — early flights and layovers',
      ],
    },
    {
      h2: 'Hotels across Turkey — beyond Istanbul',
      paragraphs: [
        `Book United Hotels is expanding nationwide. Plan all-inclusive luxury resorts in Antalya, hot-air-balloon cave hotels in Cappadocia, private villas and marina stays in Bodrum, and cultural-tour hotels near Ephesus and İzmir on the Aegean coast — all bookable with the same direct rates and local support.`,
      ],
    },
    {
      h2: 'For travel agents and corporates (B2B)',
      paragraphs: [
        `Travel agencies, DMCs, MICE planners and corporate travel managers can access exclusive B2B wholesale rates, group booking discounts and corporate allotments across Turkey. Get real-time availability, dedicated account support and tailored rates for meetings, incentives, conferences and events.`,
      ],
      bullets: [
        'Istanbul hotel wholesale rates and regional allotments',
        'Group booking discounts for tours and events',
        'Corporate hotel rates and MICE venues',
        'Dedicated DMC support for agencies and operators',
      ],
    },
    TRUST_SECTION,
  ],
  faqs: [
    {
      question: 'How do I book a hotel in Istanbul with Book United Hotels?',
      answer:
        'Search your destination and dates, compare verified rooms and direct rates, then book securely online. Most rooms offer free cancellation, and our Istanbul-based team is available by phone and WhatsApp to help.',
    },
    {
      question: 'Which is the best area to stay in Istanbul?',
      answer:
        'Sultanahmet suits first-timers who want to walk to the historic sights; Beyoğlu and Taksim are best for dining and nightlife; Beşiktaş and Ortaköy offer Bosphorus views; Kadıköy gives a relaxed, local feel on the Asian side.',
    },
    {
      question: 'Do you offer B2B / wholesale rates for travel agents?',
      answer:
        'Yes. Travel agencies, corporates and tour operators can access wholesale rates, group allotments and DMC services across Turkey. Contact our trade team or register through the agent portal to get started.',
    },
    {
      question: 'What is the cancellation policy?',
      answer:
        'Most rooms include free cancellation up to 48 hours before arrival. The exact policy is shown on each room before you book; cancellations within 48 hours may be charged the first night.',
    },
  ],
  related: PRIMARY_LINKS,
  ogType: 'website',
};

const LISTING: RouteSeo = {
  path: '/listing',
  title: 'Hotels in Istanbul & Turkey | Compare Verified Rooms & Rates',
  description:
    'Compare verified hotels across Istanbul and Turkey with transparent direct rates, real availability and free cancellation on most rooms. Best price for B2C & B2B.',
  keywords: [
    'hotels in Istanbul', 'Istanbul hotel booking', 'compare hotels Turkey',
    'cheap hotels Taksim', 'luxury hotels Istanbul', 'hotels near Istanbul airport',
  ],
  h1: 'Find and compare hotels in Istanbul and across Turkey',
  intro: [
    `Browse verified hotels across Istanbul and Turkey, compare transparent direct rates, and book securely with free cancellation on most rooms. Filter by neighbourhood, price, star rating and amenities to find the right stay — whether that's a Bosphorus-view suite, a boutique Sultanahmet hotel, or an affordable base near Taksim Square.`,
  ],
  sections: [
    {
      h2: 'Popular Istanbul searches',
      paragraphs: [
        `Travellers frequently look for hotels with a Bosphorus view, boutique stays in Sultanahmet, family suites in Beşiktaş, affordable hotels near Taksim, and convenient hotels close to Istanbul Airport (IST). Use the filters to narrow results by exactly what matters to your trip.`,
      ],
      bullets: [
        'Hotels with Bosphorus view',
        'Boutique hotels in Sultanahmet',
        'Affordable hotels near Taksim Square',
        'Family-friendly hotels in Beşiktaş',
        'Hotels near Istanbul Airport (IST)',
      ],
    },
    TRUST_SECTION,
  ],
  related: PRIMARY_LINKS,
  ogType: 'website',
};

const GROUPS: RouteSeo = {
  path: '/groups',
  title: 'Group & Corporate Hotel Bookings in Turkey | B2B Rates',
  description:
    'Request group and corporate hotel rates across Istanbul and Turkey. Allotments, MICE venues and wholesale pricing for travel agents, tour operators and companies.',
  keywords: [
    'group hotel bookings Turkey', 'corporate hotel rates Istanbul',
    'MICE hotels Istanbul', 'hotel allotments Turkey', 'B2B travel portal Turkey',
  ],
  h1: 'Group, corporate and B2B hotel bookings across Turkey',
  intro: [
    `Planning a group tour, corporate stay, conference or incentive trip in Turkey? Book United Hotels arranges group hotel bookings, corporate allotments and MICE venues across Istanbul, Antalya, Cappadocia and beyond — with wholesale rates and dedicated DMC support for travel agencies, tour operators and companies.`,
  ],
  sections: [
    {
      h2: 'What we arrange for groups and corporates',
      paragraphs: [
        `From a 10-room tour block in Sultanahmet to a full-property buyout for an event, our trade team handles availability, contracting and logistics. We support meetings, incentives, conferences and exhibitions (MICE), corporate travel programmes, and large leisure groups.`,
      ],
      bullets: [
        'Group booking discounts and room blocks',
        'Corporate rates and managed allotments',
        'MICE venues and meeting-room hotels',
        'Dedicated account manager and 24/7 support',
      ],
    },
  ],
  faqs: [
    {
      question: 'How do I request a group hotel quote in Turkey?',
      answer:
        'Submit your dates, destination, room count and requirements through the group request form. Our trade team replies with tailored wholesale rates and availability, usually within one business day.',
    },
    {
      question: 'Do you offer corporate allotments and MICE venues?',
      answer:
        'Yes. We contract corporate allotments and source MICE venues across Istanbul and Turkey, with dedicated account management for ongoing corporate travel programmes.',
    },
  ],
  related: PRIMARY_LINKS,
  ogType: 'website',
};

const BLOG: RouteSeo = {
  path: '/blog',
  title: 'Turkey Travel Guides & Istanbul Tips | Book United Hotels',
  description:
    'Expert Turkey travel guides: where to stay in Istanbul, best neighbourhoods, when to visit Cappadocia, family resorts in Antalya and practical trip-planning advice.',
  keywords: [
    'Turkey travel guide', 'where to stay in Istanbul', 'best time to visit Cappadocia',
    'Istanbul neighbourhoods', 'Turkey itinerary',
  ],
  h1: 'Turkey travel guides and Istanbul stay advice',
  intro: [
    `Plan a better trip with our Turkey travel guides. Learn where to stay in Istanbul, compare neighbourhoods like Sultanahmet and Beyoğlu, find the best time to visit Cappadocia, and discover family resorts in Antalya — written by a team that books these hotels every day.`,
  ],
  sections: [
    {
      h2: 'Popular guides',
      paragraphs: [`Browse our most-read guides for first-time and returning visitors to Turkey.`],
      bullets: [
        'Where to stay in Istanbul for first-timers',
        'Best areas to stay in Istanbul for families',
        'Istanbul vs. Antalya: which to choose',
        'Best time to visit Cappadocia',
        'A 7-day Turkey itinerary',
      ],
    },
  ],
  related: PRIMARY_LINKS,
  ogType: 'website',
};

const SUPPORT: RouteSeo = {
  path: '/support',
  title: 'Support & Contact | Book United Hotels — Turkey & Istanbul',
  description:
    'Contact the Book United Hotels team for help with bookings, cancellations and group enquiries across Istanbul and Turkey. Phone and WhatsApp support, 7 days a week.',
  keywords: ['Book United Hotels support', 'contact hotel booking Turkey', 'hotel booking help Istanbul'],
  h1: 'Support and contact',
  intro: [
    `Need help with a booking, cancellation or group enquiry? Our Istanbul-based reservations team is available by phone and WhatsApp, seven days a week. Find answers to common questions below or get in touch and we'll respond quickly.`,
  ],
  sections: [
    {
      h2: 'How we can help',
      paragraphs: [`We assist with new bookings, changes and cancellations, special requests, invoices for corporate and B2B clients, and group enquiries across Turkey.`],
    },
  ],
  faqs: [
    {
      question: 'How can I contact Book United Hotels?',
      answer: `You can reach our team by phone and WhatsApp on ${SITE.phone}, or through the contact form on this page. We respond seven days a week.`,
    },
    {
      question: 'How do cancellations work?',
      answer:
        'Most rooms offer free cancellation up to 48 hours before arrival. The exact terms are shown on each room before booking and on your confirmation.',
    },
  ],
  related: PRIMARY_LINKS,
  ogType: 'website',
};

const PRIVACY: RouteSeo = {
  path: '/privacy',
  title: 'Privacy Policy | Book United Hotels',
  description:
    'How Book United Hotels collects, uses and protects your personal data when you browse and book hotels across Istanbul and Turkey.',
  keywords: ['privacy policy', 'data protection Book United Hotels'],
  h1: 'Privacy policy',
  intro: [`This policy explains how Book United Hotels collects, uses and protects your personal information when you use our website and booking services.`],
  sections: [{ h2: 'Your data and your rights', paragraphs: [`We process the minimum data needed to confirm and support your bookings, and we never sell your personal information. Read the full policy below.`] }],
  related: PRIMARY_LINKS,
};

const TERMS: RouteSeo = {
  path: '/terms',
  title: 'Terms of Service | Book United Hotels',
  description:
    'The terms governing your use of Book United Hotels and our hotel booking services across Istanbul and Turkey, including payments and cancellations.',
  keywords: ['terms of service', 'booking terms Book United Hotels'],
  h1: 'Terms of service',
  intro: [`These terms govern your use of the Book United Hotels website and booking services, including payments, cancellations and your responsibilities as a guest or trade partner.`],
  sections: [{ h2: 'Using our services', paragraphs: [`By booking with Book United Hotels you agree to these terms. Read the full terms below before completing a reservation.`] }],
  related: PRIMARY_LINKS,
};

const HOTEL_DETAIL: RouteSeo = {
  path: '/hotel',
  title: 'Hotel details, rooms & rates | Book United Hotels Turkey',
  description:
    'View rooms, photos, amenities and verified direct rates for this hotel in Turkey. Check live availability and book securely with free cancellation on most rooms.',
  keywords: ['hotel rooms', 'hotel rates Turkey', 'book hotel Istanbul'],
  h1: 'Hotel rooms, rates and availability',
  intro: [
    `View rooms, photos, amenities and verified direct rates for this property, check live availability for your dates, and book securely. Most rooms include free cancellation, and our local team is on hand to help with special requests.`,
  ],
  sections: [TRUST_SECTION],
  related: PRIMARY_LINKS,
  ogType: 'product',
};

const AUTH: RouteSeo = {
  path: '/auth',
  title: 'Sign in or register | Book United Hotels',
  description:
    'Sign in or create a Book United Hotels account to manage bookings, save favourites and access member rates across Istanbul and Turkey.',
  keywords: ['Book United Hotels login', 'register hotel account'],
  h1: 'Sign in or create your account',
  intro: [`Sign in to manage your bookings and access member rates, or create a free account in seconds.`],
  sections: [],
  related: PRIMARY_LINKS,
  noindex: true,
};

// Transactional / private routes — indexable=false, minimal content.
const noindexRoute = (path: string, h1: string): RouteSeo => ({
  path,
  title: `${h1} | Book United Hotels`,
  description: `${h1} on Book United Hotels.`,
  keywords: [],
  h1,
  intro: [],
  sections: [],
  noindex: true,
});

// Static route table, keyed by first path segment (or '/' for home).
const ROUTES: Record<string, RouteSeo> = {
  '': HOME,
  listing: LISTING,
  groups: GROUPS,
  blog: BLOG,
  support: SUPPORT,
  privacy: PRIVACY,
  terms: TERMS,
  hotel: HOTEL_DETAIL,
  auth: AUTH,
  booking: noindexRoute('/booking', 'Complete your booking'),
  portal: noindexRoute('/portal', 'Guest portal'),
  admin: noindexRoute('/admin', 'Admin'),
  vendor: noindexRoute('/vendor', 'Vendor portal'),
};

/** Resolve a pathname (e.g. "/hotel/217") to its SEO content. */
export function getRouteSeo(pathname: string): RouteSeo {
  const clean = (pathname || '/').split('?')[0].replace(/\/+$/, '') || '/';
  const segments = clean.split('/').filter(Boolean);
  const head = segments[0] ?? '';
  const route = ROUTES[head];
  if (!route) {
    // Unknown path → home content is the safest indexable default, but mark the
    // canonical to the actual path so we don't claim it's the homepage.
    return { ...HOME, path: clean };
  }
  // For dynamic detail routes, canonical should reflect the actual path.
  if (head === 'hotel' || head === 'blog') {
    return { ...route, path: clean };
  }
  return route;
}

/** Build a slug array (from the optional catch-all) into a pathname. */
export function slugToPath(slug?: string[]): string {
  if (!slug || slug.length === 0) return '/';
  return '/' + slug.join('/');
}

// ─────────────────────────────────────────────────────────────────────────────
// Server-safe JSON-LD builders (schema.org). These run on the server so the
// structured data ships in the initial HTML — exactly what crawlers and rich
// results need.
// ─────────────────────────────────────────────────────────────────────────────

export const organizationLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE.url}/#organization`,
  name: SITE.name,
  url: SITE.url,
  logo: `${SITE.url}/logo-512.png`,
  telephone: SITE.phone,
  sameAs: socialSameAs(),
});

export const websiteLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE.url}/#website`,
  name: SITE.name,
  url: SITE.url,
  publisher: { '@id': `${SITE.url}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE.url}/listing?destination={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
});

// TravelAgency is the closest schema.org subtype for a hotel-booking DMC; it
// doubles as the LocalBusiness / Identity signal the audit asks for.
export const travelAgencyLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  '@id': `${SITE.url}/#business`,
  name: SITE.name,
  url: SITE.url,
  logo: `${SITE.url}/logo-512.png`,
  image: `${SITE.url}/og-default.jpg`,
  telephone: SITE.phone,
  priceRange: '$$',
  address: { '@type': 'PostalAddress', ...SITE.address },
  areaServed: ['Istanbul', 'Antalya', 'Cappadocia', 'Bodrum', 'Turkey'],
  sameAs: socialSameAs(),
});

export const breadcrumbLd = (items: InternalLink[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.label,
    item: abs(it.href),
  })),
});

export const faqLd = (items: FaqItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((q) => ({
    '@type': 'Question',
    name: q.question,
    acceptedAnswer: { '@type': 'Answer', text: q.answer },
  })),
});
