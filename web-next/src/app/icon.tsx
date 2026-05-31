import { ImageResponse } from 'next/og';
import svgPaths from '@/shared/imports/svg-nkrjt6kvoj';

// Favicon (/icon) — the United Hotels logo mark from the navbar, brand blue on
// white. Generated at build time, no binary asset needed. Next wires the
// <link rel="icon"> automatically.
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
          borderRadius: 6,
        }}
      >
        <svg width="22" height="20" viewBox="0 0 28 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d={svgPaths.p32095b00} fill="#2F80ED" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
