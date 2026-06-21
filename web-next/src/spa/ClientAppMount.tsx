'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, type ReactNode } from 'react';
import SeoFallbackShell from '@/spa/SeoFallbackShell';

// The SPA (<App />) uses react-router's createBrowserRouter, which needs
// `window`, so it must load client-only (ssr:false is only allowed inside a
// Client Component — hence this wrapper).
const App = dynamic(() => import('@/spa/App'), { ssr: false, loading: () => null });

/**
 * Renders server-rendered SEO content (`fallback`) in the initial HTML, then
 * swaps to the interactive SPA once mounted on the client. Crawlers (no JS)
 * keep the fully-rendered content; users get the app. Gating the swap behind a
 * mount effect keeps the server and first client render identical, avoiding a
 * hydration mismatch.
 *
 * Shared by the data-driven SEO routes (app/hotel/[id], app/listing) so each
 * can supply its own data-specific fallback while reusing one SPA mount.
 */
export default function ClientAppMount({ fallback }: { fallback: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <SeoFallbackShell fallback={fallback} />;
  return <App />;
}
