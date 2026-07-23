import { buildSquareIcon } from '@/shared/server/squareIcon';

// PWA maskable icon (512×512). Logo sits inside the safe zone so Android's
// adaptive-icon crop never clips the mark. Served at /icon-maskable-512.png.
export const dynamic = 'force-static';

export function GET() {
  return buildSquareIcon(512, { maskable: true });
}
