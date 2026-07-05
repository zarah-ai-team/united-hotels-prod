// Hotel image accessors.
//
// The backend is now the single source of truth for hotel imagery — every
// /api/hotels/public response carries `image_url` (cover) and `images[]`
// (gallery), generated server-side from the ImageKit CDN. The frontend just
// reads those fields verbatim. No bundled placeholder pool, no client-side
// slug derivation.
//
// If a hotel has no images on the CDN yet, the backend simply returns
// `image_url: null` and `images: []`. The component handles the empty state
// (skeleton / blank cell) — better than shipping a misleading stock photo.

import type React from "react";

interface HotelImageInput {
  id?: number | string | null;
  name?: string | null;
  hotel_name?: string | null;
  image_url?: string | null;
  imageUrl?: string | null;
  cover_image?: string | null;
  coverImage?: string | null;
  images?: unknown;
  rooms?: unknown;
}

const TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

// Picsum fallback — deterministic per-hotel real photo so the UI never
// shows a gray placeholder, even when the backend omits image_url.
const PICSUM_BASE = "https://picsum.photos/seed";
const PICSUM_W = 1200;
const PICSUM_H = 900;

function picsumSeed(hotel: HotelImageInput, index = 1): string {
  const idRaw = hotel?.id;
  if (idRaw != null && idRaw !== "") return `hotel-${idRaw}-${index}`;
  const name = hotel?.name || hotel?.hotel_name || "";
  const slug = String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug ? `${slug}-${index}` : `hotel-${index}`;
}

export function picsumImage(hotel: HotelImageInput, index = 1): string {
  return `${PICSUM_BASE}/${encodeURIComponent(picsumSeed(hotel, index))}/${PICSUM_W}/${PICSUM_H}`;
}

// Pull an image URL from any of the field aliases the API is known to use.
function readApiImage(hotel: HotelImageInput): string | null {
  const direct =
    hotel.image_url ||
    hotel.imageUrl ||
    hotel.cover_image ||
    hotel.coverImage;
  if (typeof direct === "string" && direct.length > 0) return direct;

  const list = hotel.images;
  if (Array.isArray(list)) {
    const first = list.find((u) => typeof u === "string" && u.length > 0);
    if (typeof first === "string") return first;
  }

  const rooms = hotel.rooms;
  if (Array.isArray(rooms)) {
    for (const room of rooms) {
      const imgs = (room as { images?: unknown })?.images;
      if (Array.isArray(imgs)) {
        const found = imgs.find((u) => typeof u === "string" && u.length > 0);
        if (typeof found === "string") return found;
      }
    }
  }

  return null;
}

function readApiGallery(hotel: HotelImageInput): string[] {
  const list = hotel.images;
  if (Array.isArray(list)) {
    const cleaned = list.filter((u): u is string => typeof u === "string" && u.length > 0);
    if (cleaned.length > 0) return cleaned;
  }

  const rooms = hotel.rooms;
  if (Array.isArray(rooms)) {
    const collected: string[] = [];
    for (const room of rooms) {
      const imgs = (room as { images?: unknown })?.images;
      if (Array.isArray(imgs)) {
        for (const u of imgs) {
          if (typeof u === "string" && u.length > 0) collected.push(u);
        }
      }
    }
    if (collected.length > 0) return collected;
  }

  const single = readApiImage(hotel);
  return single ? [single] : [];
}

// Empty pool — preserved as an export so existing imports compile while we
// migrate fully to backend-driven imagery. Length 0, so any modulo arithmetic
// at call sites short-circuits.
export const HOTEL_IMAGE_POOL: string[] = [];

export function pickHotelImage(hotel: HotelImageInput): string {
  return readApiImage(hotel) || picsumImage(hotel, 1);
}

// ── Responsive images ────────────────────────────────────────────────────────
// The backend serves one 1200×900 ImageKit render per hotel. On a card that is
// only ~300–400px wide (and much smaller on mobile) that's ~4× more pixels than
// needed. ImageKit resizes on the fly via the `tr=w-…` query param, so we build
// a srcset of smaller widths and let the browser pick — big LCP / bytes win,
// and clears the audit's "serve properly sized images" flag. Non-ImageKit URLs
// (e.g. the Picsum fallback) return undefined and just use the plain `src`.
const IK_SRCSET_WIDTHS = [320, 480, 640, 900, 1200];

function imagekitAtWidth(url: string, w: number): string {
  const h = Math.round((w * 3) / 4); // preserve the 4:3 crop the cards use
  const tr = `tr=w-${w},h-${h},q-70,fo-auto,c-maintain_ratio`;
  if (/[?&]tr=/.test(url)) return url.replace(/tr=[^&]*/, tr);
  return url + (url.includes("?") ? "&" : "?") + tr;
}

export function hotelImageSrcSet(url: string | null | undefined): string | undefined {
  if (!url || !url.includes("ik.imagekit.io")) return undefined;
  return IK_SRCSET_WIDTHS.map((w) => `${imagekitAtWidth(url, w)} ${w}w`).join(", ");
}

// Kept for API compatibility; with no local pool the only source is the API.
export function pickLocalFallback(hotel: HotelImageInput): string {
  return readApiImage(hotel) || picsumImage(hotel, 1);
}

// onError handler — when the backend image fails (CDN miss, 4xx, network),
// swap to the deterministic Picsum URL for this hotel so the user always
// sees a real photo instead of a broken-image icon. Falls back to a soft
// transparent + gradient if even Picsum can't load.
export function makeImageFallback(hotel: HotelImageInput) {
  return (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    const stage = img.dataset.fallback || "";
    if (stage === "final") return;
    if (stage === "" || stage === "primary") {
      img.dataset.fallback = "picsum";
      img.src = picsumImage(hotel, 1);
      return;
    }
    img.dataset.fallback = "final";
    img.src = TRANSPARENT_PIXEL;
    img.style.background = "linear-gradient(135deg, #f1f5f9, #e2e8f0)";
  };
}

export function pickHotelGallery(hotel: HotelImageInput, count = 4): string[] {
  const gallery = readApiGallery(hotel);
  if (gallery.length >= count) return gallery.slice(0, count);
  const out = [...gallery];
  for (let i = out.length; i < count; i++) {
    out.push(picsumImage(hotel, i + 1));
  }
  return out;
}
