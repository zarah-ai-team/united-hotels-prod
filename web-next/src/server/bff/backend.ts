/**
 * BFF — server-side upstream forwarder.
 *
 * This is the ONLY place the frontend talks to the real backends. The browser
 * calls Next route handlers under /api/*; those handlers delegate here, and we
 * forward server-to-server to:
 *
 *   Express backend   (BACKEND_URL, default http://localhost:5000) — keeps the
 *                     full /api/* path, since Express mounts its routers at
 *                     /api/<resource>.
 *   Pricing engine    (PRICING_URL, default http://localhost:5050) — reached via
 *                     /api/pricing/* on our side; the /api/pricing prefix is
 *                     stripped before forwarding (the engine serves /v2/*).
 *
 * Auth, cookies, and content headers are passed through untouched, so the
 * existing Bearer-token flow keeps working without client changes.
 */

import type { NextRequest } from 'next/server';

const BACKEND_URL = (process.env.BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');
const PRICING_URL = (process.env.PRICING_URL || 'http://localhost:5050').replace(/\/+$/, '');

// Headers that must not be copied verbatim across a proxy hop.
const HOP_BY_HOP = new Set([
  'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
  'te', 'trailer', 'transfer-encoding', 'upgrade', 'host', 'content-length',
  'accept-encoding', // let fetch negotiate; avoids forwarding a gzip body undecoded
]);

// Security/transport headers the upstream Express backend also sets. These are
// browser-facing concerns owned by the Next layer (next.config.mjs headers()),
// so we must NOT re-emit the upstream's copy onto /api/* responses — doing so
// produced DUPLICATE Strict-Transport-Security / X-Content-Type-Options entries
// (Express max-age=31536000 alongside Next's max-age=63072000), which ZAP
// flagged as non-compliant. Stripping them here makes Next the single source.
const STRIP_UPSTREAM_SECURITY_HEADERS = new Set([
  'strict-transport-security',
  'x-content-type-options',
  'x-frame-options',
  'referrer-policy',
  'permissions-policy',
  'content-security-policy',
  'content-security-policy-report-only',
  'x-dns-prefetch-control',
  'x-xss-protection',
  'x-powered-by',
]);

// User-specific / booking / payment / admin data must never be stored by the
// browser or a shared cache (ZAP: "Re-examine Cache-control" / "Retrieved from
// Cache"). We force Cache-Control: no-store on these prefixes at the single BFF
// chokepoint. Public catalog data (/api/hotels/public, /api/pricing, /api/geo,
// /api/locale, /api/translate) is intentionally left untouched.
const NO_STORE_PREFIXES = [
  '/api/payments',
  '/api/bookings',
  '/api/users',
  '/api/admin',
  '/api/vendor',
  '/api/support',
  '/api/group-requests',
];

function isSensitivePath(pathname: string): boolean {
  return NO_STORE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

async function forward(targetBase: string, targetPath: string, req: NextRequest): Promise<Response> {
  const { search, pathname } = new URL(req.url);
  const target = `${targetBase}${targetPath}${search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) headers.set(key, value);
  });

  const init: RequestInit = { method: req.method, headers, redirect: 'manual' };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const body = await req.arrayBuffer();
    if (body.byteLength > 0) init.body = body;
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, init);
  } catch (err) {
    return Response.json(
      {
        success: false,
        error: 'Upstream unavailable',
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }

  const resHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP.has(lower) || STRIP_UPSTREAM_SECURITY_HEADERS.has(lower)) return;
    resHeaders.set(key, value);
  });

  // Override any upstream caching for sensitive resources — the browser-facing
  // policy is owned here, not by Express.
  if (isSensitivePath(pathname)) {
    resHeaders.set('Cache-Control', 'no-store');
  }

  const buf = await upstream.arrayBuffer();
  return new Response(buf, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: resHeaders,
  });
}

/** Forward an /api/* request to the Express backend, preserving the path. */
export function proxyBackend(req: NextRequest): Promise<Response> {
  const { pathname } = new URL(req.url);
  return forward(BACKEND_URL, pathname, req);
}

/** Forward an /api/pricing/* request to the pricing engine, dropping the prefix. */
export function proxyPricing(req: NextRequest): Promise<Response> {
  const { pathname } = new URL(req.url);
  const path = pathname.replace(/^\/api\/pricing/, '') || '/';
  return forward(PRICING_URL, path, req);
}
