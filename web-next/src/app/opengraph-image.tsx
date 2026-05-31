import { ImageResponse } from 'next/og';
import svgPaths from '@/shared/imports/svg-nkrjt6kvoj';

// Default Open Graph image (1200×630) used across all routes for social/AI
// unfurls. Generated at build time, so no /og-default.jpg asset is required.
export const alt = 'Book United Hotels — hotels in Istanbul and across Turkey';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
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
          background: 'linear-gradient(135deg, #0B1F3B 0%, #16385f 100%)',
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div
            style={{
              width: 72,
              height: 72,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ffffff',
              borderRadius: 14,
            }}
          >
            <svg width="46" height="43" viewBox="0 0 28 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d={svgPaths.p32095b00} fill="#2F80ED" />
            </svg>
          </div>
          <div style={{ fontSize: 34, fontWeight: 700 }}>Book United Hotels</div>
        </div>
        <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.1 }}>
          Hotels in Istanbul &amp; across Turkey
        </div>
        <div style={{ fontSize: 30, marginTop: 20, color: '#E9C46A' }}>
          Direct rates · Verified rooms · B2B &amp; B2C
        </div>
      </div>
    ),
    { ...size },
  );
}
