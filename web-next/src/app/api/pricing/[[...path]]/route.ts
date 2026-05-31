import type { NextRequest } from 'next/server';
import { proxyPricing } from '@/server/bff/backend';

// BFF route handler — forwards every method to the upstream via the shared
// server-side proxy. Optional catch-all so both the bare path and any nested
// resource path are handled by this one section module.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const handler = (req: NextRequest) => proxyPricing(req);

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as HEAD,
  handler as OPTIONS,
};
