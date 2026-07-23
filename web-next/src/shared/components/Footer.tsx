import { Link } from "react-router";
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, Linkedin } from "lucide-react";
import type { ReactNode } from "react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { activeSocials, type SocialKey } from "@/shared/config/social";

// Email obfuscation. We never emit the literal address into the rendered
// HTML — instead we store base64 + reassemble on click. Plain mailto: links
// get harvested by spam crawlers; this stops the simple ones cold.
const SUPPORT_EMAIL_USER = "info";
const SUPPORT_EMAIL_DOMAIN = "united-tourism.com";
const handleObfuscatedMail = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  window.location.href = `mailto:${SUPPORT_EMAIL_USER}@${SUPPORT_EMAIL_DOMAIN}`;
};

// Icon + label per platform. URLs + which platforms are active come from
// shared/config/social.ts (single source of truth). Only platforms with a URL
// render — never a dead social icon.
const SOCIAL_META: Record<SocialKey, { label: string; Icon: typeof Facebook | (() => ReactNode) }> = {
  facebook: { label: "Facebook", Icon: Facebook },
  instagram: { label: "Instagram", Icon: Instagram },
  x: { label: "X (Twitter)", Icon: () => <XIcon /> },
  youtube: { label: "YouTube", Icon: Youtube },
  linkedin: { label: "LinkedIn", Icon: Linkedin },
  reddit: { label: "Reddit", Icon: () => <RedditIcon /> },
};

// X (Twitter) doesn't ship in lucide-react. Inline a minimal mark so we don't
// pull a whole icon library for one glyph.
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// Reddit isn't in lucide-react either — inline the Reddit alien mark.
function RedditIcon() {
  return (
    <svg viewBox="0 0 512 512" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path d="M440.3 203.5c-15 0-28.2 6.2-37.9 15.9-35.7-24.7-83.8-40.6-137.1-42.3l23.2-109.5 76.1 16.9c0 18.6 15.1 33.7 33.7 33.7 18.6 0 33.7-15.3 33.7-33.9s-15.1-33.9-33.7-33.9c-13.2 0-24.6 7.9-30 19.1L294 62.5c-2.3-.5-4.6.2-6.2 1.7-1.7 1.5-2.4 3.8-1.9 6l-25.9 121.7c-54.5 1.3-103.4 17.7-139.6 42.7-9.7-9.5-23-15.4-37.7-15.4-52.6 0-69.8 70.7-21.7 94.7-1.7 7.5-2.6 15.3-2.6 23.3 0 79.2 89.5 143.4 199.7 143.4s199.7-64.2 199.7-143.4c0-8-.9-15.9-2.7-23.5 47.3-24.2 30-94.5-22.4-94.5zM129.4 308.9c0-18.6 15.1-33.7 33.7-33.7 18.4 0 33.5 14.9 33.7 33.3-.2 18.4-15.3 33.5-33.7 33.5-18.6.2-33.7-14.9-33.7-33.1zm203.1 87c-30.8 30.9-116.4 30.9-147.2 0-3.4-3.4-3.4-8.8 0-12.2 3.4-3.4 8.8-3.4 12.2 0 23.7 24.1 100.4 24.5 124.5 0 3.4-3.4 8.8-3.4 12.2 0 3.6 3.4 3.6 8.8.3 12.2zm-3.4-53.5c-18.6 0-33.7-15.1-33.7-33.5.2-18.4 15.3-33.3 33.7-33.3 18.6 0 33.7 15.1 33.7 33.7-.1 18-15.2 33.1-33.7 33.1z" />
    </svg>
  );
}

// Business NAP — kept inline for the LocalBusiness schema to reference the
// same source. Replace with your real address when the office is finalised.
const BUSINESS_NAP = {
  streetAddress: "Beyoğlu, İstiklal Caddesi No: 123",
  city: "Istanbul",
  postalCode: "34433",
  country: "Türkiye",
  phoneDisplay: "+90 544 958 07 98",
  phoneTel: "+905449580798",
};

// React-router preserves scroll position across navigations. Footer links live
// at the very bottom of the page, so without this the user lands at the bottom
// of the destination. Reset to the top on every footer navigation. Matches the
// `window.scrollTo` pattern used elsewhere in the app.
const scrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior: "auto" });

// Server-rendered SEO landing routes (Next pages, NOT react-router routes —
// must be plain <a> so the browser does a full navigation). Linking them from
// every page gives crawlers a sitewide path to the indexable destination and
// keyword landing pages, which otherwise only exist in the sitemap.
const DESTINATION_LINKS: { href: string; label: string }[] = [
  { href: "/destinations/istanbul", label: "Hotels in Istanbul" },
  { href: "/destinations/sultanahmet", label: "Sultanahmet hotels" },
  { href: "/destinations/taksim", label: "Hotels near Taksim" },
  { href: "/destinations/beyoglu", label: "Beyoğlu hotels" },
  { href: "/destinations/galata", label: "Galata & Karaköy hotels" },
  { href: "/destinations/sirkeci", label: "Sirkeci hotels" },
  { href: "/budget-hotels-in-turkey", label: "Budget hotels in Turkey" },
];

export function Footer() {
  const { t } = useLanguage();
  const socialEntries = activeSocials().map((s) => ({ ...s, ...SOCIAL_META[s.key] }));

  return (
    <footer className="bg-[#3b3b3b] py-10 md:py-20" aria-label="Site footer">
      <div className="max-w-[1224px] mx-auto px-5 md:px-10">
        {/* 4-column grid: 1 col on mobile (centered), 4 cols from md+ (left-aligned). */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-7 md:gap-12 mb-8 md:mb-16 text-center md:text-left">
          {/* Company Info */}
          <div>
            <h3 className="font-['Poppins:Bold',sans-serif] text-[18px] md:text-[20px] text-white mb-3 md:mb-5">
              United Hotels
            </h3>
            <p className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[15px] text-white/70 leading-[22px] md:leading-[25px] mb-3 md:mb-5">
              {t("Turkey's hotel experts. Direct rates, transparent pricing, local support.")}
            </p>
            <p className="font-['Inter:SemiBold',sans-serif] text-[14px] md:text-[15px] text-white/90 mb-4 md:mb-5">
              {t("Stay Smart. Stay United.")}
            </p>

            {/* Social row — only renders icons for accounts you've actually
                configured via VITE_*_URL env vars. */}
            {socialEntries.length > 0 && (
              <div className="flex items-center justify-center md:justify-start gap-2">
                {socialEntries.map(({ key, url, label, Icon }) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer me"
                    aria-label={label}
                    className="w-9 h-9 rounded-lg border border-white/15 text-white/70 hover:text-white hover:border-white/40 hover:bg-white/5 flex items-center justify-center transition-colors"
                  >
                    {typeof Icon === "function" && Icon.length === 0 ? <Icon /> : <Icon className="w-4 h-4" strokeWidth={2} />}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-['Poppins:SemiBold',sans-serif] text-[16px] md:text-[17px] text-white mb-3 md:mb-5">
              {t("Quick Links")}
            </h4>
            <ul className="space-y-2 md:space-y-3">
              <li>
                <Link to="/" onClick={scrollToTop} className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[15px] text-white/70 hover:text-white transition-colors">
                  {t("Home")}
                </Link>
              </li>
              <li>
                <Link to="/listing" onClick={scrollToTop} className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[15px] text-white/70 hover:text-white transition-colors">
                  {t("Hotels")}
                </Link>
              </li>
              <li>
                <Link to="/groups" onClick={scrollToTop} className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[15px] text-white/70 hover:text-white transition-colors">
                  {t("Groups")}
                </Link>
              </li>
              <li>
                <Link to="/portal" onClick={scrollToTop} className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[15px] text-white/70 hover:text-white transition-colors">
                  {t("My Bookings")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Destinations — sitewide links to the server-rendered SEO landing
              pages. Plain <a> (full navigation) — these live outside the SPA
              router. */}
          <div>
            <h4 className="font-['Poppins:SemiBold',sans-serif] text-[16px] md:text-[17px] text-white mb-3 md:mb-5">
              {t("Destinations")}
            </h4>
            <ul className="space-y-2 md:space-y-3">
              {DESTINATION_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <a href={href} className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[15px] text-white/70 hover:text-white transition-colors">
                    {t(label)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact — icons share a fixed-width column so the text aligns
              cleanly across rows on every viewport. Includes the full NAP
              (Name / Address / Phone) so Local SEO crawlers can extract it. */}
          <div>
            <h4 className="font-['Poppins:SemiBold',sans-serif] text-[16px] md:text-[17px] text-white mb-3 md:mb-5">
              {t("Contact Us")}
            </h4>
            <address className="not-italic">
              <ul className="space-y-2.5 md:space-y-4">
                <li className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[15px] text-white/70 inline-flex items-start gap-2.5 justify-center md:justify-start">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={2} />
                  <span>
                    {BUSINESS_NAP.streetAddress}<br />
                    {BUSINESS_NAP.postalCode} {BUSINESS_NAP.city}, {BUSINESS_NAP.country}
                  </span>
                </li>
                <li>
                  <a
                    href={`tel:${BUSINESS_NAP.phoneTel}`}
                    className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[15px] text-white/70 hover:text-white transition-colors inline-flex items-center gap-2.5"
                  >
                    <Phone className="w-4 h-4 shrink-0" strokeWidth={2} />
                    <span>{BUSINESS_NAP.phoneDisplay}</span>
                  </a>
                </li>
                <li>
                  {/* href is still rebuilt on click (keeps the raw mailto out
                      of the static HTML), but the address shows normally with
                      a real "@" so it reads as a proper email. */}
                  <a
                    href="#contact"
                    onClick={handleObfuscatedMail}
                    className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[15px] text-white/70 hover:text-white transition-colors inline-flex items-center gap-2.5 break-all"
                  >
                    <Mail className="w-4 h-4 shrink-0" strokeWidth={2} />
                    <span>
                      {SUPPORT_EMAIL_USER}@{SUPPORT_EMAIL_DOMAIN}
                    </span>
                  </a>
                </li>
              </ul>
            </address>
          </div>
        </div>

        {/* Bottom Bar — stacks on mobile (centered) → row on md+ (split ends). */}
        <div className="pt-6 md:pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
            <p className="font-['Inter:Regular',sans-serif] text-[12.5px] md:text-[14px] text-white/60 text-center md:text-left order-2 md:order-1">
              © 2026 United Hotels. {t("All rights reserved.")}
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-5 gap-y-2 md:gap-x-6 order-1 md:order-2">
              <Link to="/privacy" onClick={scrollToTop} className="font-['Inter:Regular',sans-serif] text-[12.5px] md:text-[14px] text-white/60 hover:text-white transition-colors">
                {t("Privacy Policy")}
              </Link>
              <Link to="/terms" onClick={scrollToTop} className="font-['Inter:Regular',sans-serif] text-[12.5px] md:text-[14px] text-white/60 hover:text-white transition-colors">
                {t("Terms of Service")}
              </Link>
              <Link to="/support" onClick={scrollToTop} className="font-['Inter:Regular',sans-serif] text-[12.5px] md:text-[14px] text-white/60 hover:text-white transition-colors">
                {t("Support")}
              </Link>
            </div>
          </div>

          <div className="mt-8 md:mt-10 flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-2.5">
              <img
                src="/zarah-ai-logo.svg"
                alt="Zarah AI"
                width={512}
                height={345}
                className="h-10 md:h-12 w-auto object-contain"
              />
              <p
                className="text-white/70 text-[12px] md:text-sm tracking-wide"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Powered by Zarah AI
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
