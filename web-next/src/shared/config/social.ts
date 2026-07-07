// Single source of truth for the brand's social profiles.
//
// URLs are baked in as defaults (they're PUBLIC — they render in the footer and
// in the SEO sameAs schema), with a per-platform env override
// (NEXT_PUBLIC_<PLATFORM>_URL). Baking them in means they ship on every build
// without env plumbing; the env var still wins if you set it. An empty string
// (default or env) hides that platform everywhere — footer icon AND SEO sameAs.
//
// Consumed by: shared/components/Footer.tsx (icon row),
// shared/lib/seo.ts + shared/hooks/useSEO.ts (Organization/LocalBusiness sameAs).

export type SocialKey = 'facebook' | 'instagram' | 'x' | 'youtube' | 'linkedin' | 'reddit';

// Render order for the footer row.
export const SOCIAL_ORDER: SocialKey[] = ['facebook', 'instagram', 'x', 'youtube', 'linkedin', 'reddit'];

const DEFAULTS: Record<SocialKey, string> = {
  facebook: 'https://www.facebook.com/profile.php?id=61591308317768',
  instagram: 'https://www.instagram.com/unitedhotels_turkey',
  x: '',
  youtube: '',
  linkedin: '',
  reddit: 'https://www.reddit.com/user/United-Hotels/',
};

const ENV: Record<SocialKey, string | undefined> = {
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL,
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
  x: process.env.NEXT_PUBLIC_X_URL,
  youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL,
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL,
  reddit: process.env.NEXT_PUBLIC_REDDIT_URL,
};

// Resolved URL for a platform — env overrides the baked default. '' = hidden.
// (`??` keeps an explicit empty-string env value, so env can also DISABLE a default.)
export const socialUrl = (k: SocialKey): string => (ENV[k] ?? DEFAULTS[k] ?? '').trim();

// Platforms that actually have a URL, in render order.
export const activeSocials = (): { key: SocialKey; url: string }[] =>
  SOCIAL_ORDER.map((key) => ({ key, url: socialUrl(key) })).filter((s) => s.url.length > 0);

// URLs for schema.org sameAs (brand identity for Google Knowledge Panel).
export const socialSameAs = (): string[] => activeSocials().map((s) => s.url);
