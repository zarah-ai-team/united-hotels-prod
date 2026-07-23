import { buildSquareIcon } from '@/shared/server/squareIcon';

// PWA manifest icon (192×192). Served at /icon-192.png to match site.webmanifest.
export const dynamic = 'force-static';

export function GET() {
  return buildSquareIcon(192);
}
