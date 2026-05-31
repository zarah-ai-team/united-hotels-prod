import Script from 'next/script';

/**
 * Analytics loader — renders Google Analytics 4 only when
 * NEXT_PUBLIC_GA_ID is set, so dev and unconfigured environments stay clean.
 * Uses next/script with afterInteractive so it never blocks first paint.
 *
 * To enable: set NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX in the environment.
 */
export default function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}', { anonymize_ip: true });`}
      </Script>
    </>
  );
}
