/**
 * Server-only brand asset loader for the generated icon / OG routes.
 *
 * The favicon, apple-icon, PWA icons and Open Graph image are all produced at
 * build time via `next/og` (Satori), which renders an <img> from a data URL.
 * We read the brand logo PNG from /public once and memoise it as a base64 data
 * URL so every generator can embed the real mark without a network fetch.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Master transparent logo (851×392) — the full "UNITED HOTELS / STAY UNITED"
// wordmark with the U/H monogram. Brand blue on transparent.
const LOGO_PATH = join(process.cwd(), 'public', 'united-hotels-logo.png');

// Intrinsic pixel dimensions of the logo above (kept in sync with the file).
export const LOGO_W = 851;
export const LOGO_H = 392;

// Bounding box of just the U/H monogram inside the logo (measured from the
// artwork), used to crop a legible square favicon. Horizontally centred.
export const MONOGRAM = { x: 355, y: 28, w: 141, h: 162 };

let cached: string | null = null;

/** The brand logo as a `data:image/png;base64,…` URL (memoised). */
export function logoDataUrl(): string {
  if (cached) return cached;
  const buf = readFileSync(LOGO_PATH);
  cached = `data:image/png;base64,${buf.toString('base64')}`;
  return cached;
}

// Brand palette used by the generated icon / OG backgrounds.
export const BRAND = {
  blue: '#2F80ED',
  navyFrom: '#0B1F3B',
  navyTo: '#16385f',
  gold: '#E9C46A',
  white: '#ffffff',
};
