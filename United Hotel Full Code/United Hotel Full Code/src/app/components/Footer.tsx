import { Link } from "react-router";
import { Phone, Mail } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#3b3b3b] py-10 md:py-20">
      <div className="max-w-[1224px] mx-auto px-5 md:px-10">
        {/* 3-column grid: 1 col on mobile (left-aligned), 3 cols from md+. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 md:gap-12 mb-8 md:mb-16">
          {/* Company Info */}
          <div>
            <h3 className="font-['Poppins:Bold',sans-serif] text-[18px] md:text-[20px] text-white mb-3 md:mb-5">
              United Hotels
            </h3>
            <p className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[15px] text-white/70 leading-[22px] md:leading-[25px] mb-3 md:mb-5">
              {t("Turkey's hotel experts. Direct rates, transparent pricing, local support.")}
            </p>
            <p className="font-['Inter:SemiBold',sans-serif] text-[14px] md:text-[15px] text-white/90">
              {t("Stay Smart. Stay United.")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-['Poppins:SemiBold',sans-serif] text-[16px] md:text-[17px] text-white mb-3 md:mb-5">
              {t("Quick Links")}
            </h4>
            <ul className="space-y-2 md:space-y-3">
              <li>
                <Link to="/" className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[15px] text-white/70 hover:text-white transition-colors">
                  {t("Home")}
                </Link>
              </li>
              <li>
                <Link to="/listing" className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[15px] text-white/70 hover:text-white transition-colors">
                  {t("Hotels")}
                </Link>
              </li>
              <li>
                <Link to="/portal" className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[15px] text-white/70 hover:text-white transition-colors">
                  {t("My Bookings")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact — icons share a fixed-width column so the text aligns
              cleanly across rows on every viewport. */}
          <div>
            <h4 className="font-['Poppins:SemiBold',sans-serif] text-[16px] md:text-[17px] text-white mb-3 md:mb-5">
              {t("Contact Us")}
            </h4>
            <ul className="space-y-2.5 md:space-y-4">
              <li>
                <a href="tel:+905551234567" className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[15px] text-white/70 hover:text-white transition-colors inline-flex items-center gap-2.5">
                  <Phone className="w-4 h-4 shrink-0" strokeWidth={2} />
                  <span>+90 555 123 45 67</span>
                </a>
              </li>
              <li>
                <a href="mailto:hello@unitedhotels.com" className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[15px] text-white/70 hover:text-white transition-colors inline-flex items-center gap-2.5 break-all">
                  <Mail className="w-4 h-4 shrink-0" strokeWidth={2} />
                  <span>hello@unitedhotels.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar — stacks on mobile (centered) → row on md+ (split ends). */}
        <div className="pt-6 md:pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
            <p className="font-['Inter:Regular',sans-serif] text-[12.5px] md:text-[14px] text-white/60 text-center md:text-left order-2 md:order-1">
              © 2026 United Hotels. {t("All rights reserved.")}
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-5 gap-y-2 md:gap-x-6 order-1 md:order-2">
              <Link to="/support" className="font-['Inter:Regular',sans-serif] text-[12.5px] md:text-[14px] text-white/60 hover:text-white transition-colors">
                {t("Privacy Policy")}
              </Link>
              <Link to="/support" className="font-['Inter:Regular',sans-serif] text-[12.5px] md:text-[14px] text-white/60 hover:text-white transition-colors">
                {t("Terms of Service")}
              </Link>
              <Link to="/support" className="font-['Inter:Regular',sans-serif] text-[12.5px] md:text-[14px] text-white/60 hover:text-white transition-colors">
                {t("Support")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
