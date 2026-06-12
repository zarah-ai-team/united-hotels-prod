/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Self-contained production server in .next/standalone — lets us build on the
  // laptop and ship a minimal bundle to the (512MB) droplet without running
  // `next build` or `npm install` there. Run with `node server.js`.
  output: 'standalone',

  // Allow building to an alternate dir (e.g. for a verification build that must
  // not clobber a running `next dev`). Defaults to the standard .next.
  distDir: process.env.NEXT_BUILD_DIR || '.next',

  // Lift-and-shift migration: don't fail the production build on lint/type
  // errors while the port stabilises. Tighten these once the migration is done.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // MUI + emotion ship ESM that benefits from transpilation in the Next build.
  transpilePackages: ['@mui/material', '@mui/icons-material', '@mui/system'],

  images: {
    // Serve AVIF (then WebP) at device-appropriate widths via next/image. This
    // is the single biggest LCP/payload lever: the raw hero WebPs are 260–575KB
    // each; resized + AVIF they drop to ~30–70KB on a phone.
    formats: ['image/avif', 'image/webp'],
    // Cache optimized variants for a day so repeat crawls/visits don't re-encode.
    minimumCacheTTL: 86400,
    // Remote hotel imagery (ImageKit etc.) — allow https sources. Tighten to
    // specific hostnames once the live image domains are confirmed.
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },

  // No dev proxy: the BFF route handlers under app/api/* own /api/* and forward
  // to the upstreams (BACKEND_URL / PRICING_URL) server-side, in dev and prod
  // alike. See src/server/bff/backend.ts.

  // gzip/br compression for HTML/JS/CSS responses.
  compress: true,
  // Drop the X-Powered-By: Next.js header (minor fingerprinting reduction).
  poweredByHeader: false,

  // Security + caching headers. HSTS satisfies the Strict-Transport-Security
  // audit; the static-asset rules add long-lived immutable caching for images
  // and fonts so returning visitors don't re-download them.
  async headers() {
    // CSP delivered REPORT-ONLY for now: it logs violations to the browser
    // console but never blocks a resource, so it cannot break SSR, the booking
    // flow, ImageKit images, GA, or Resend. Origins below come from the Phase 0
    // audit. Flip to an enforced `Content-Security-Policy` only after the
    // console is clean across home → listing → hotel → booking.
    //
    // KNOWN LOOSE SPOTS to tighten before enforcing (tracked, intentional):
    //   - script-src 'unsafe-inline': Next's inline bootstrap + GA init + JSON-LD
    //     blobs. Replace with per-request nonces (needs a middleware) at enforce
    //     time. 'unsafe-eval' is deliberately ABSENT — it's only needed by the
    //     dev bundler (next dev); expect eval warnings in dev, none in prod.
    //   - style-src 'unsafe-inline': MUI/emotion inject runtime <style> + inline
    //     style= attributes (e.g. layout.tsx body). Hard to drop without nonces.
    const cspReportOnly = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      "form-action 'self'",
      "manifest-src 'self'",
      "worker-src 'self' blob:",
      // ImageKit hotel photos + next/image data/blob URIs + GA tracking pixels.
      // images.unsplash.com (blog imagery) + picsum.photos (hotel image fallback).
      "img-src 'self' data: blob: https://ik.imagekit.io https://images.unsplash.com https://picsum.photos https://www.google-analytics.com https://www.googletagmanager.com",
      // Self bundle + Next inline bootstrap/JSON-LD + GA loader.
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
      // MUI/emotion runtime styles + inline style attributes.
      "style-src 'self' 'unsafe-inline'",
      // Fonts are self-hosted via next/font — no external CDN.
      "font-src 'self' data:",
      // XHR/fetch: same-origin API (the BFF) + GA beacons.
      "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://region1.google-analytics.com",
      // OpenStreetMap embed on the support page.
      "frame-src 'self' https://www.openstreetmap.org",
    ].join('; ');
    const securityHeaders = [
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
      { key: 'Content-Security-Policy-Report-Only', value: cspReportOnly },
    ];
    const longCache = [
      { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
    ];
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/assets/:path*', headers: longCache },
      { source: '/figma-assets/:path*', headers: longCache },
    ];
  },
};

export default nextConfig;
