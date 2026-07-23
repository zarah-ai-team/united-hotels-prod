import { ImageResponse } from 'next/og';
import { logoDataUrl, LOGO_W, LOGO_H, MONOGRAM, BRAND } from '@/shared/server/brandAssets';

// Favicon (/icon) — the United Hotels U/H monogram cropped from the brand logo.
// The full wordmark is illegible at 32px, so we show just the monogram on white.
// Generated at build time; Next wires <link rel="icon"> automatically.
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  // Scale the logo so the monogram fills ~28px of the 32px tile, then offset it
  // so the monogram sits centred (overflow on the tile clips the wordmark away).
  const target = 28;
  const scale = target / MONOGRAM.h;
  const imgW = LOGO_W * scale;
  const imgH = LOGO_H * scale;
  const left = (size.width - MONOGRAM.w * scale) / 2 - MONOGRAM.x * scale;
  const top = (size.height - MONOGRAM.h * scale) / 2 - MONOGRAM.y * scale;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          background: BRAND.white,
          borderRadius: 6,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoDataUrl()}
          width={imgW}
          height={imgH}
          alt="United Hotels"
          style={{ position: 'absolute', left, top }}
        />
      </div>
    ),
    { ...size },
  );
}
