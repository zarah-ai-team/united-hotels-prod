import { ImageResponse } from 'next/og';
import { logoDataUrl, LOGO_W, LOGO_H, BRAND } from '@/shared/server/brandAssets';

// Default Open Graph image (1200×630) used across all routes for social/AI
// unfurls. Generated at build time, so no /og-default.jpg asset is required.
export const alt = 'Book United Hotels — hotels in Istanbul and across Turkey';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  // Full brand logo on a white plate so the blue mark keeps contrast over navy.
  const logoW = 340;
  const logoH = (LOGO_H / LOGO_W) * logoW;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: 80,
          background: `linear-gradient(135deg, ${BRAND.navyFrom} 0%, ${BRAND.navyTo} 100%)`,
          color: 'white',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: BRAND.white,
            borderRadius: 18,
            padding: '22px 30px',
            marginBottom: 32,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoDataUrl()} width={logoW} height={logoH} alt="United Hotels" />
        </div>
        <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.1 }}>
          Hotels in Istanbul &amp; across Turkey
        </div>
        <div style={{ fontSize: 30, marginTop: 20, color: BRAND.gold }}>
          Direct rates · Verified rooms · B2B &amp; B2C
        </div>
      </div>
    ),
    { ...size },
  );
}
