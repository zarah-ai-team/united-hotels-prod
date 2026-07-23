import { buildSquareIcon } from '@/shared/server/squareIcon';

// PWA manifest icon (512×512). Served at /icon-512.png to match site.webmanifest.
export const dynamic = 'force-static';

export function GET() {
  return buildSquareIcon(512);
}
