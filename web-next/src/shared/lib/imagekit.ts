// ImageKit resolver.
//
// All hotel photography lives at:
//   {ENDPOINT}{FOLDER}/{slug}/picture-{N}.png
// where `slug` is a kebab-case ASCII slug of the hotel name (Turkish chars
// transliterated). Most hotels carry picture-1..3.
//
// Because every hotel follows this convention, no static name→file map is
// needed — we generate the URL from `hotel.name` on the fly. If a hotel folder
// doesn't exist on ImageKit, the <img onError> fallback (see hotelImages.ts)
// swaps in a local pool image so the user never sees a broken-image icon.

// Default to the production United Hotels ImageKit account so the gallery
// works out-of-the-box without a frontend `.env`. Override via VITE_IMAGEKIT_*
// when targeting a different bucket.
const ENDPOINT = (process.env.NEXT_PUBLIC_IMAGEKIT_ENDPOINT || "https://ik.imagekit.io/UnitedHotels").replace(/\/+$/, "");
const FOLDER = (process.env.NEXT_PUBLIC_IMAGEKIT_FOLDER || "/hotels").replace(/\/+$/, "");

// Per-hotel ImageKit configuration: which folder slug exists and how many
// picture-N.png files it contains. Built by probing the CDN once (see
// scripts at the repo root). Hotels NOT in this map either have no folder on
// ImageKit yet (handled below) or get an auto-derived slug as a last resort.
interface HotelImageConfig { slug: string; pictures: number }
export const HOTEL_IMAGE_CONFIG: Record<number, HotelImageConfig> = {
  1: { slug: "royan-hotel", pictures: 1 },
  2: { slug: "amiral-palace", pictures: 3 },
  3: { slug: "best-point-hotel", pictures: 1 },
  4: { slug: "agan-hotel", pictures: 3 },
  5: { slug: "sirkeci-golden-horn", pictures: 3 },
  6: { slug: "erboy-hotel", pictures: 3 },
  7: { slug: "sirkeci-park-hotel", pictures: 1 },
  8: { slug: "triton-hotel", pictures: 3 },
  9: { slug: "hotel-romantic", pictures: 3 },
  10: { slug: "avicenna-hotel", pictures: 3 },
  11: { slug: "sumengen-hotel", pictures: 3 },
  12: { slug: "evsen-hotel", pictures: 3 },
  13: { slug: "ramada-tryp-beyoglu", pictures: 3 },
  14: { slug: "city-centre-beyoglu", pictures: 3 },
  15: { slug: "trip-bosphorus-hotel", pictures: 3 },
  16: { slug: "abel-hotel", pictures: 3 },
  17: { slug: "tria-hotel", pictures: 3 },
  18: { slug: "armada-hotel", pictures: 3 },
  19: { slug: "wings-hotel-karakoy", pictures: 3 },
  20: { slug: "wings-hotel-pera", pictures: 3 },
  21: { slug: "wings-hotel-collection", pictures: 3 },
  22: { slug: "root-hotel-karakoy", pictures: 3 },
  23: { slug: "sub-hotel-karakoy", pictures: 3 },
  24: { slug: "weingart-istanbul", pictures: 3 },
  25: { slug: "weingart-suite", pictures: 3 },
  26: { slug: "weingart-seaside", pictures: 3 },
  27: { slug: "union-hotel", pictures: 3 },
  28: { slug: "khai-hotel-karakoy", pictures: 3 },
  29: { slug: "bankerhan-hotel", pictures: 3 },
  30: { slug: "the-galata-istanbul-hotel", pictures: 3 },
  31: { slug: "galatas-hotel", pictures: 3 },
  32: { slug: "the-house-hotel", pictures: 3 },
  33: { slug: "orientbank-hotel", pictures: 3 },
  34: { slug: "orient-occident-hotel", pictures: 3 },
  35: { slug: "nordstern-hotel-galata", pictures: 3 },
  36: { slug: "the-haze-karakoy", pictures: 3 },
  37: { slug: "anemon-galata-hotel", pictures: 3 },
  38: { slug: "hotel-momento-golden-horn", pictures: 3 },
  39: { slug: "walton-hotels-galata", pictures: 3 },
};

// Hotel ids confirmed to have NO folder on ImageKit yet — skip the CDN
// entirely for these so they go straight to the bundled local fallback
// without a 404 round-trip and the brief broken-image flash that follows.
const MISSING_HOTEL_IDS = new Set<number>([
  40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57,
]);

// Manual override (rarely needed). Keys are hotel id (string), hotel name, or
// auto-slug; values are a folder slug or a fully-qualified URL.
export const HOTEL_IMAGE_MAP: Record<string, string | string[]> = {};

// ImageKit transformation chain — moderate quality + auto-format keeps cards
// crisp without shipping huge originals.
const DEFAULT_TR = "tr=w-1200,h-900,q-78,fo-auto,c-maintain_ratio";

// Turkish letters → closest ASCII equivalent. JS `toLowerCase()` already
// handles ÜÖÇŞ, but İ→i̇ (combining dot) and Ğ→ğ trip up the slug regex.
const TURKISH_MAP: Record<string, string> = {
  "İ": "I", "ı": "i",
  "Ş": "S", "ş": "s",
  "Ğ": "G", "ğ": "g",
  "Ü": "U", "ü": "u",
  "Ö": "O", "ö": "o",
  "Ç": "C", "ç": "c",
};

export function hotelSlug(name: string): string {
  if (!name) return "";
  // Transliterate Turkish chars first so they survive lowercase + slugify.
  const transliterated = name.replace(/[İıŞşĞğÜüÖöÇç]/g, (ch) => TURKISH_MAP[ch] ?? ch);
  return transliterated
    .toLowerCase()
    // Strip any combining marks that snuck through (e.g. from NFD-decomposed input)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    // Collapse all non-alphanumeric runs into single dashes
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface HotelKeyInput {
  id?: number | string | null;
  name?: string | null;
  hotel_name?: string | null;
}

function hotelIdNum(hotel: HotelKeyInput): number | null {
  const raw = hotel.id;
  if (raw == null) return null;
  const n = typeof raw === "number" ? raw : parseInt(String(raw), 10);
  return Number.isFinite(n) ? n : null;
}

function resolveSlug(hotel: HotelKeyInput): string | null {
  // Explicit override wins
  const overrideKeys = [
    hotel.id != null ? String(hotel.id) : "",
    hotel.name ?? "",
    hotel.hotel_name ?? "",
  ].filter(Boolean) as string[];
  for (const key of overrideKeys) {
    const ov = HOTEL_IMAGE_MAP[key];
    if (typeof ov === "string" && ov.length > 0) return ov;
  }
  // Verified per-id config (probed once against ImageKit)
  const id = hotelIdNum(hotel);
  if (id != null && HOTEL_IMAGE_CONFIG[id]) return HOTEL_IMAGE_CONFIG[id].slug;
  // Auto-derive from name as last resort
  const name = hotel.name || hotel.hotel_name || "";
  return name ? hotelSlug(name) : null;
}

function pictureCountFor(hotel: HotelKeyInput, fallback: number): number {
  const id = hotelIdNum(hotel);
  if (id != null && HOTEL_IMAGE_CONFIG[id]) return HOTEL_IMAGE_CONFIG[id].pictures;
  return fallback;
}

function buildPictureUrl(slug: string, n: number): string {
  // If the override accidentally provided a fully-qualified URL, just return it.
  if (/^https?:\/\//i.test(slug)) return slug;
  const folder = slug.startsWith("/") ? slug : `${FOLDER}/${slug}`;
  return `${ENDPOINT}${folder}/picture-${n}.png?${DEFAULT_TR}`;
}

export function isImageKitConfigured(): boolean {
  return ENDPOINT.length > 0;
}

export function resolveHotelImage(hotel: HotelKeyInput): string | null {
  if (!ENDPOINT) return null;
  const id = hotelIdNum(hotel);
  if (id != null && MISSING_HOTEL_IDS.has(id)) return null;
  const slug = resolveSlug(hotel);
  if (!slug) return null;
  return buildPictureUrl(slug, 1);
}

export function resolveHotelGallery(hotel: HotelKeyInput, count = 3): string[] {
  if (!ENDPOINT) return [];
  const id = hotelIdNum(hotel);
  if (id != null && MISSING_HOTEL_IDS.has(id)) return [];
  const slug = resolveSlug(hotel);
  if (!slug) return [];
  // Only request pictures we know exist for this hotel; default to `count`.
  const available = pictureCountFor(hotel, count);
  const total = Math.max(1, Math.min(count, available));
  return Array.from({ length: total }, (_, i) => buildPictureUrl(slug, i + 1));
}

// Build N picture URLs purely from the hotel name (kebab-case slug). Used by
// the detail page where we always want exactly `count` images derived from
// `{slug}/picture-{N}.png`, regardless of the per-id override map. Missing
// pictures fall back via the <img onError> handler.
export function hotelGalleryByName(name: string, count = 3): string[] {
  if (!ENDPOINT || !name) return [];
  const slug = hotelSlug(name);
  if (!slug) return [];
  const total = Math.max(1, count);
  return Array.from({ length: total }, (_, i) => buildPictureUrl(slug, i + 1));
}
