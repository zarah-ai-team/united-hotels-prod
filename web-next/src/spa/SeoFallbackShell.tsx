import type { ReactNode } from 'react';

/**
 * Wraps the server-rendered SEO fallback during the brief window before the
 * client SPA chunk loads.
 *
 * The problem it solves: rendering the raw crawlable content directly meant
 * users saw a flash of unstyled SEO text on every load. Here the content is
 * kept in the DOM (so search engines and AI crawlers still index it) but
 * visually hidden, and a lightweight loader is shown to users instead.
 *
 * SEO is preserved two ways:
 *  - The content + its JSON-LD stay in the initial HTML / DOM (Google renders
 *    JS and indexes visually-hidden text).
 *  - A <noscript> override un-hides the content (and hides the spinner) for
 *    no-JS crawlers and users, who get the fully readable fallback.
 *
 * Pure render (no hooks) so it renders identically on the server and the first
 * client render — no hydration mismatch.
 */
export default function SeoFallbackShell({ fallback }: { fallback: ReactNode }) {
  return (
    <>
      <style>{`
        .uh-seo-fallback{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0;}
        #uh-spa-loader{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f5f7fa;}
        #uh-spa-loader .uh-spin{width:38px;height:38px;border-radius:50%;border:3px solid rgba(47,128,237,0.18);border-top-color:#2F80ED;animation:uh-spin .7s linear infinite;}
        @keyframes uh-spin{to{transform:rotate(360deg)}}
      `}</style>
      <noscript>
        <style>{`.uh-seo-fallback{position:static;width:auto;height:auto;margin:0;clip:auto;clip-path:none;overflow:visible;white-space:normal;}#uh-spa-loader{display:none;}`}</style>
      </noscript>

      <div className="uh-seo-fallback">{fallback}</div>
      <div id="uh-spa-loader"><div className="uh-spin" role="status" aria-label="Loading" /></div>
    </>
  );
}
