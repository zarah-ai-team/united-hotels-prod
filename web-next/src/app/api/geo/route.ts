import type { NextRequest } from 'next/server';

// BFF geo lookup. The browser used to call ipapi.co / ipwho.is directly, which
// triggered cross-origin (CORS) errors in the console. Instead, the Next server
// reads the real client IP (X-Forwarded-For from nginx) and queries the geo
// service server-side, returning a simple { country_code }. Same-origin for the
// browser → no CORS.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// IPv4/IPv6 ranges we can't geolocate (loopback / private / link-local).
const PRIVATE_IP = /^(::1|::ffff:127\.|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|fc|fd|fe80:)/i;

function clientIp(req: NextRequest): string | null {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return req.headers.get('x-real-ip');
}

async function lookup(ip: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      headers: { 'User-Agent': 'BookUnitedHotels/1.0 (+https://bookunitedhotels.com)' },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    const code = data.country_code ?? data.country;
    return typeof code === 'string' && code.length >= 2 ? code.slice(0, 2).toUpperCase() : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(req: NextRequest) {
  const ip = clientIp(req);
  // Can't geolocate a missing or private/loopback IP (e.g. localhost dev).
  if (!ip || PRIVATE_IP.test(ip)) {
    return Response.json({ country_code: null });
  }
  return Response.json({ country_code: await lookup(ip) });
}
