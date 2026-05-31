import { ImageResponse } from 'next/og';
import svgPaths from '@/shared/imports/svg-nkrjt6kvoj';

// /apple-icon (180×180) for iOS home-screen / Safari — United Hotels logo mark.
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
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
        }}
      >
        <svg width="120" height="111" viewBox="0 0 28 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d={svgPaths.p32095b00} fill="#2F80ED" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
