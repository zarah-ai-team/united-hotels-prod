import { useEffect } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Tiny client-side SEO library.
//
// Why this exists: this is a Vite SPA (no SSR). Googlebot does execute JS in
// 2026, but per-route head tags still need to actually exist in the DOM for
// the crawler and for social-card unfurlers (LinkedIn, Slack, WhatsApp). This
// hook mutates document.head on mount/update, then restores the previous
// values on unmount so navigating away doesn't leak stale tags.
//
// Pragmatic, not perfect: for first-paint share previews you still want
// prerendering or SSR. Wave 2.
// ─────────────────────────────────────────────────────────────────────────────

const SITE_NAME = 'Book United Hotels';
const SITE_URL =
  (typeof window !== 'undefined' && window.location && window.location.origin) ||
  'https://bookunitedhotels.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;

export interface SEOInput {
  title?: string;
  description?: string;
  /** Absolute or root-relative path. We'll absolutize against SITE_URL. */
  canonical?: string;
  ogImage?: string;
  /** 'website' | 'article' | 'product' ... */
  ogType?: string;
  /** robots tag: e.g. 'index,follow' (default) or 'noindex,nofollow' */
  robots?: string;
  /** Page-level JSON-LD blobs. Pass a single object or array. */
  jsonLd?: Record<string, any> | Record<string, any>[];
  /** BCP-47 language code for <html lang>. */
  lang?: string;
}

const absolutize = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/')) return `${SITE_URL}${url}`;
  return `${SITE_URL}/${url}`;
};

const upsertMeta = (selector: string, attrs: Record<string, string>): (() => void) => {
  const head = document.head;
  let el = head.querySelector<HTMLMetaElement>(selector);
  let created = false;
  const previous: Record<string, string | null> = {};
  if (!el) {
    el = document.createElement('meta');
    Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
    head.appendChild(el);
    created = true;
  } else {
    Object.entries(attrs).forEach(([k, v]) => {
      previous[k] = el!.getAttribute(k);
      el!.setAttribute(k, v);
    });
  }
  return () => {
    if (!el) return;
    if (created) {
      el.parentNode?.removeChild(el);
    } else {
      Object.entries(previous).forEach(([k, v]) => {
        if (v === null) el!.removeAttribute(k);
        else el!.setAttribute(k, v);
      });
    }
  };
};

const upsertLink = (rel: string, href: string): (() => void) => {
  const head = document.head;
  let el = head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  let created = false;
  let previousHref: string | null = null;
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    el.href = href;
    head.appendChild(el);
    created = true;
  } else {
    previousHref = el.getAttribute('href');
    el.setAttribute('href', href);
  }
  return () => {
    if (!el) return;
    if (created) {
      el.parentNode?.removeChild(el);
    } else if (previousHref !== null) {
      el.setAttribute('href', previousHref);
    }
  };
};

const upsertJsonLd = (data: Record<string, any>, id: string): (() => void) => {
  const head = document.head;
  const existing = document.getElementById(id) as HTMLScriptElement | null;
  if (existing) existing.parentNode?.removeChild(existing);
  const el = document.createElement('script');
  el.type = 'application/ld+json';
  el.id = id;
  el.text = JSON.stringify(data);
  head.appendChild(el);
  return () => {
    el.parentNode?.removeChild(el);
  };
};

/**
 * Apply per-route SEO head tags. Cleans up on unmount so navigating between
 * routes never leaves stale title/meta/canonical/JSON-LD behind.
 */
export function useSEO(input: SEOInput) {
  const {
    title,
    description,
    canonical,
    ogImage,
    ogType = 'website',
    robots,
    jsonLd,
    lang,
  } = input;

  useEffect(() => {
    const cleanups: Array<() => void> = [];

    // Title — restore the previous title on unmount.
    let prevTitle: string | null = null;
    if (title) {
      prevTitle = document.title;
      document.title = title;
      cleanups.push(() => {
        if (prevTitle !== null) document.title = prevTitle;
      });
    }

    if (description) {
      cleanups.push(upsertMeta('meta[name="description"]', { name: 'description', content: description }));
    }
    if (robots) {
      cleanups.push(upsertMeta('meta[name="robots"]', { name: 'robots', content: robots }));
    }

    const canonicalAbs = absolutize(canonical);
    if (canonicalAbs) {
      cleanups.push(upsertLink('canonical', canonicalAbs));
      cleanups.push(upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalAbs }));
    }

    cleanups.push(upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME }));
    cleanups.push(upsertMeta('meta[property="og:type"]', { property: 'og:type', content: ogType }));
    if (title) cleanups.push(upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title }));
    if (description) cleanups.push(upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description }));

    const ogImageAbs = absolutize(ogImage) || DEFAULT_OG_IMAGE;
    cleanups.push(upsertMeta('meta[property="og:image"]', { property: 'og:image', content: ogImageAbs }));

    cleanups.push(upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' }));
    if (title) cleanups.push(upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title }));
    if (description) cleanups.push(upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description }));
    cleanups.push(upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: ogImageAbs }));

    if (jsonLd) {
      const blobs = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      blobs.forEach((blob, i) => {
        cleanups.push(upsertJsonLd(blob, `seo-jsonld-${i}`));
      });
    }

    if (lang) {
      const prevLang = document.documentElement.lang;
      document.documentElement.lang = lang;
      cleanups.push(() => {
        document.documentElement.lang = prevLang;
      });
    }

    return () => {
      // Run cleanups in reverse so created→removed pairs unwind correctly.
      for (let i = cleanups.length - 1; i >= 0; i--) cleanups[i]();
    };
  }, [title, description, canonical, ogImage, ogType, robots, lang, JSON.stringify(jsonLd)]);
}

// ─────────────────────────────────────────────────────────────────────────────
// JSON-LD builders. Keep these dumb — pass real data, get a schema.org blob.
// ─────────────────────────────────────────────────────────────────────────────

export const siteUrl = SITE_URL;

// Pull social URLs from Vite env at build time. Identity / sameAs is how
// Google links the brand to its social profiles (Knowledge Panel).
const socialSameAs = (): string[] =>
  [
    (import.meta as any).env?.VITE_FACEBOOK_URL,
    (import.meta as any).env?.VITE_INSTAGRAM_URL,
    (import.meta as any).env?.VITE_X_URL,
    (import.meta as any).env?.VITE_YOUTUBE_URL,
    (import.meta as any).env?.VITE_LINKEDIN_URL,
  ].filter((v): v is string => typeof v === 'string' && v.length > 0);

export const organizationLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo-512.png`,
  sameAs: socialSameAs(),
});

// LocalBusiness — gives Google a clean signal for local pack / Maps. Use
// "TravelAgency" rather than "LocalBusiness" because that's the closer
// schema.org subtype for a hotel-booking platform.
export interface LocalBusinessLdInput {
  name?: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry: string;
  };
  telephone: string;
  email?: string;
  priceRange?: string;
  geo?: { latitude: number; longitude: number };
  openingHours?: string[];
}

export const localBusinessLd = (b: LocalBusinessLdInput) => ({
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  name: b.name || SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo-512.png`,
  image: `${SITE_URL}/og-default.jpg`,
  telephone: b.telephone,
  ...(b.email ? { email: b.email } : {}),
  ...(b.priceRange ? { priceRange: b.priceRange } : {}),
  address: { '@type': 'PostalAddress', ...b.address },
  ...(b.geo
    ? {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: b.geo.latitude,
          longitude: b.geo.longitude,
        },
      }
    : {}),
  ...(b.openingHours && b.openingHours.length
    ? { openingHoursSpecification: b.openingHours }
    : {}),
  sameAs: socialSameAs(),
});

export const websiteLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/listing?destination={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
});

export interface BreadcrumbItem {
  name: string;
  url?: string;
}

export const breadcrumbLd = (items: BreadcrumbItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    ...(it.url ? { item: absolutize(it.url) } : {}),
  })),
});

export interface HotelLdInput {
  name: string;
  description?: string;
  image?: string | string[];
  url?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  starRating?: number;
  priceFromUSD?: number;
  aggregateRating?: { ratingValue: number; reviewCount: number };
  amenities?: string[];
}

export const hotelLd = (h: HotelLdInput) => {
  const images = Array.isArray(h.image) ? h.image : h.image ? [h.image] : undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: h.name,
    ...(h.description ? { description: h.description } : {}),
    ...(images ? { image: images.map((i) => absolutize(i) || i) } : {}),
    ...(h.url ? { url: absolutize(h.url) } : {}),
    ...(h.address
      ? {
          address: {
            '@type': 'PostalAddress',
            ...h.address,
          },
        }
      : {}),
    ...(h.starRating
      ? {
          starRating: { '@type': 'Rating', ratingValue: h.starRating },
        }
      : {}),
    ...(h.priceFromUSD
      ? {
          priceRange: `From $${Math.round(h.priceFromUSD)} USD`,
        }
      : {}),
    ...(h.aggregateRating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: h.aggregateRating.ratingValue,
            reviewCount: h.aggregateRating.reviewCount,
          },
        }
      : {}),
    ...(h.amenities && h.amenities.length
      ? {
          amenityFeature: h.amenities.map((a) => ({
            '@type': 'LocationFeatureSpecification',
            name: a,
          })),
        }
      : {}),
  };
};

export const faqLd = (items: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((q) => ({
    '@type': 'Question',
    name: q.question,
    acceptedAnswer: { '@type': 'Answer', text: q.answer },
  })),
});
