import { Link } from "react-router";
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, Linkedin } from "lucide-react";
import type { ReactNode } from "react";
import { useLanguage } from "@/shared/context/LanguageContext";

// Email obfuscation. We never emit the literal address into the rendered
// HTML — instead we store base64 + reassemble on click. Plain mailto: links
// get harvested by spam crawlers; this stops the simple ones cold.
const SUPPORT_EMAIL_USER = "hello";
const SUPPORT_EMAIL_DOMAIN = "bookunitedhotels.com";
const handleObfuscatedMail = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  window.location.href = `mailto:${SUPPORT_EMAIL_USER}@${SUPPORT_EMAIL_DOMAIN}`;
};

// Social links are env-driven so we can add accounts as they get created
// without redeploying code. Empty values are hidden — never render a dead
// social icon.
type SocialKey = "facebook" | "instagram" | "x" | "youtube" | "linkedin";
const SOCIAL_ENV: Record<SocialKey, string | undefined> = {
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL as string | undefined,
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL as string | undefined,
  x: process.env.NEXT_PUBLIC_X_URL as string | undefined,
  youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL as string | undefined,
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL as string | undefined,
};
const SOCIAL_META: Record<SocialKey, { label: string; Icon: typeof Facebook | (() => ReactNode) }> = {
  facebook: { label: "Facebook", Icon: Facebook },
  instagram: { label: "Instagram", Icon: Instagram },
  x: { label: "X (Twitter)", Icon: () => <XIcon /> },
  youtube: { label: "YouTube", Icon: Youtube },
  linkedin: { label: "LinkedIn", Icon: Linkedin },
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

export function Footer() {
  const { t } = useLanguage();
  const socialEntries = (Object.keys(SOCIAL_META) as SocialKey[])
    .map((k) => ({ key: k, url: SOCIAL_ENV[k], ...SOCIAL_META[k] }))
    .filter((s) => s.url && s.url.length > 0) as Array<{ key: SocialKey; url: string; label: string; Icon: any }>;

  return (
    <footer className="bg-[#3b3b3b] py-10 md:py-20" aria-label="Site footer">
      <div className="max-w-[1224px] mx-auto px-5 md:px-10">
        {/* 3-column grid: 1 col on mobile (centered), 3 cols from md+ (left-aligned). */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 md:gap-12 mb-8 md:mb-16 text-center md:text-left">
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
