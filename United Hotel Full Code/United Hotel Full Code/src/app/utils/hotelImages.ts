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
  return readApiImage(hotel) || "";
}

// Kept for API compatibility; with no local pool the only source is the API.
export function pickLocalFallback(hotel: HotelImageInput): string {
  return readApiImage(hotel) || "";
}

// onError handler — the API URL failed to load (CDN miss, network blip).
// Hide the broken-image icon by replacing src with a 1×1 transparent pixel
// and dimming the element. Components decide visually how to handle the gap.
export function makeImageFallback(_hotel: HotelImageInput) {
  return (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    if (img.dataset.fallback === "applied") return;
    img.dataset.fallback = "applied";
    img.src = TRANSPARENT_PIXEL;
    img.style.background = "linear-gradient(135deg, #f1f5f9, #e2e8f0)";
  };
}

export function pickHotelGallery(hotel: HotelImageInput, count = 4): string[] {
  const gallery = readApiGallery(hotel);
  if (gallery.length === 0) return [];
  if (gallery.length >= count) return gallery.slice(0, count);
  // Repeat the available images to fill `count` slots — better than padding
  // with empties for carousel UIs that need a stable item count.
  const out: string[] = [];
  for (let i = 0; i < count; i++) out.push(gallery[i % gallery.length]);
  return out;
}
