'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, type ReactNode } from 'react';

// <App /> uses react-router's createBrowserRouter, which needs `window`. Load it
// client-only so Next never attempts to render it on the server (ssr:false is
// only allowed inside a Client Component, hence this wrapper).
const App = dynamic(() => import('@/spa/App'), {
  ssr: false,
  loading: () => null,
});

/**
 * Renders the server SEO content (`fallback`) in the initial HTML, then swaps
 * to the interactive SPA once mounted on the client. Crawlers (no JS) keep the
 * fully-rendered content; users get the app. Gating the swap behind a mount
 * effect avoids a hydration mismatch (server and first client render match).
 */
export default function ClientApp({ fallback }: { fallback: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <>{fallback}</>;
  return <App />;
}
