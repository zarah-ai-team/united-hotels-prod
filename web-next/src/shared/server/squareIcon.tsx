import { ImageResponse } from 'next/og';
import { logoDataUrl, LOGO_W, LOGO_H, BRAND } from '@/shared/server/brandAssets';

/**
 * Build a square PNG app icon of the given size with the full United Hotels
 * logo centred on white (contain). Used by the PWA manifest icon routes
 * (/icon-192.png, /icon-512.png, /icon-maskable-512.png).
 *
 * `maskable` shrinks the logo into the ~80% safe zone so Android's maskable
 * crop (which can clip up to 10% on each edge) never cuts into the mark.
 */
export function buildSquareIcon(px: number, opts: { maskable?: boolean } = {}): ImageResponse {
  const usable = px * (opts.maskable ? 0.62 : 0.8);
  const scale = usable / LOGO_W;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: BRAND.white,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoDataUrl()} width={LOGO_W * scale} height={LOGO_H * scale} alt="United Hotels" />
      </div>
    ),
    { width: px, height: px },
  );
}
