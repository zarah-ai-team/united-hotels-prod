// Server-side ImageKit URL resolver. Mirrors the frontend logic so the API
// is the single source of truth for hotel imagery — clients just consume
// hotel.image_url / hotel.images[] verbatim.

const ENDPOINT = String(process.env.IMAGEKIT_ENDPOINT || '').replace(/\/+$/, '');
const FOLDER = String(process.env.IMAGEKIT_FOLDER || '/hotels').replace(/\/+$/, '');
const DEFAULT_TR = 'tr=w-1200,h-900,q-78,fo-auto,c-maintain_ratio';

// Hotels we have confirmed to have folders on ImageKit, with the exact slug
// + picture count seeded into the CDN. Anything outside this map either has
// no folder yet (return null) or — if name-based slug derivation works — is
// allowed through with a default count of 3.
const HOTEL_IMAGE_CONFIG = {
  1: { slug: 'royan-hotel', pictures: 1 },
  2: { slug: 'amiral-palace', pictures: 3 },
  3: { slug: 'best-point-hotel', pictures: 1 },
  4: { slug: 'agan-hotel', pictures: 3 },
  5: { slug: 'sirkeci-golden-horn', pictures: 3 },
  6: { slug: 'erboy-hotel', pictures: 3 },
  7: { slug: 'sirkeci-park-hotel', pictures: 1 },
  8: { slug: 'triton-hotel', pictures: 3 },
  9: { slug: 'hotel-romantic', pictures: 3 },
  10: { slug: 'avicenna-hotel', pictures: 3 },
  11: { slug: 'sumengen-hotel', pictures: 3 },
  12: { slug: 'evsen-hotel', pictures: 3 },
  13: { slug: 'ramada-tryp-beyoglu', pictures: 3 },
  14: { slug: 'city-centre-beyoglu', pictures: 3 },
  15: { slug: 'trip-bosphorus-hotel', pictures: 3 },
  16: { slug: 'abel-hotel', pictures: 3 },
  17: { slug: 'tria-hotel', pictures: 3 },
  18: { slug: 'armada-hotel', pictures: 3 },
  19: { slug: 'wings-hotel-karakoy', pictures: 3 },
  20: { slug: 'wings-hotel-pera', pictures: 3 },
  21: { slug: 'wings-hotel-collection', pictures: 3 },
  22: { slug: 'root-hotel-karakoy', pictures: 3 },
  23: { slug: 'sub-hotel-karakoy', pictures: 3 },
  24: { slug: 'weingart-istanbul', pictures: 3 },
  25: { slug: 'weingart-suite', pictures: 3 },
  26: { slug: 'weingart-seaside', pictures: 3 },
  27: { slug: 'union-hotel', pictures: 3 },
  28: { slug: 'khai-hotel-karakoy', pictures: 3 },
  29: { slug: 'bankerhan-hotel', pictures: 3 },
  30: { slug: 'the-galata-istanbul-hotel', pictures: 3 },
  31: { slug: 'galatas-hotel', pictures: 3 },
  32: { slug: 'the-house-hotel', pictures: 3 },
  33: { slug: 'orientbank-hotel', pictures: 3 },
  34: { slug: 'orient-occident-hotel', pictures: 3 },
  35: { slug: 'nordstern-hotel-galata', pictures: 3 },
  36: { slug: 'the-haze-karakoy', pictures: 3 },
  37: { slug: 'anemon-galata-hotel', pictures: 3 },
  38: { slug: 'hotel-momento-golden-horn', pictures: 3 },
  39: { slug: 'walton-hotels-galata', pictures: 3 }
};

const MISSING_HOTEL_IDS = new Set([
  40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57
]);

const TURKISH_MAP = {
  'İ': 'I', 'ı': 'i',
  'Ş': 'S', 'ş': 's',
  'Ğ': 'G', 'ğ': 'g',
  'Ü': 'U', 'ü': 'u',
  'Ö': 'O', 'ö': 'o',
  'Ç': 'C', 'ç': 'c'
};

function hotelSlug(name) {
  if (!name) return '';
  const transliterated = String(name).replace(/[İıŞşĞğÜüÖöÇç]/g, (ch) => TURKISH_MAP[ch] || ch);
  return transliterated
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function hotelIdNum(hotel) {
  const raw = hotel && hotel.id;
  if (raw == null) return null;
  const n = typeof raw === 'number' ? raw : parseInt(String(raw), 10);
  return Number.isFinite(n) ? n : null;
}

function resolveSlug(hotel) {
  const id = hotelIdNum(hotel);
  if (id != null && HOTEL_IMAGE_CONFIG[id]) return HOTEL_IMAGE_CONFIG[id].slug;
  const name = hotel.name || hotel.hotel_name || '';
  return name ? hotelSlug(name) : null;
}

function pictureCountFor(hotel, fallback) {
  const id = hotelIdNum(hotel);
  if (id != null && HOTEL_IMAGE_CONFIG[id]) return HOTEL_IMAGE_CONFIG[id].pictures;
  return fallback;
}

function buildPictureUrl(slug, n) {
  if (/^https?:\/\//i.test(slug)) return slug;
  const folder = slug.startsWith('/') ? slug : `${FOLDER}/${slug}`;
  return `${ENDPOINT}${folder}/picture-${n}.png?${DEFAULT_TR}`;
}

function isImageKitConfigured() {
  return ENDPOINT.length > 0;
}

function resolveHotelImage(hotel) {
  if (!ENDPOINT) return null;
  const id = hotelIdNum(hotel);
  if (id != null && MISSING_HOTEL_IDS.has(id)) return null;
  const slug = resolveSlug(hotel);
  if (!slug) return null;
  return buildPictureUrl(slug, 1);
}

function resolveHotelGallery(hotel, count = 3) {
  if (!ENDPOINT) return [];
  const id = hotelIdNum(hotel);
  if (id != null && MISSING_HOTEL_IDS.has(id)) return [];
  const slug = resolveSlug(hotel);
  if (!slug) return [];
  const available = pictureCountFor(hotel, count);
  const total = Math.max(1, Math.min(count, available));
  const urls = [];
  for (let i = 0; i < total; i++) urls.push(buildPictureUrl(slug, i + 1));
  return urls;
}

module.exports = {
  isImageKitConfigured,
  resolveHotelImage,
  resolveHotelGallery,
  hotelSlug
};
