import type { NextRequest } from 'next/server';
import { proxyBackend } from '@/server/bff/backend';

// BFF route handler for the blog CMS — forwards every method to the Express
// backend (/api/blog/*). Public reads and admin writes share this one proxy;
// the backend enforces auth on the /admin sub-paths.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const handler = (req: NextRequest) => proxyBackend(req);

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as HEAD,
  handler as OPTIONS,
};
