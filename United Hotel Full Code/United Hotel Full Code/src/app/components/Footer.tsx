import { Link } from "react-router";
import { Phone, Mail } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#3b3b3b] py-12 md:py-20">
      <div className="max-w-[1224px] mx-auto px-4 md:px-10">
        {/* Mobile: 1 col, Tablet: 2 cols, Desktop: 4 cols */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 mb-12 md:mb-16">
          {/* Company Info */}
          <div>
            <h3 className="font-['Poppins:Bold',sans-serif] text-[18px] md:text-[20px] text-white mb-4 md:mb-5">
              United Hotels
            </h3>
            <p className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[15px] text-white/70 leading-[24px] md:leading-[25px] mb-4 md:mb-5">
              {t("Turkey's hotel experts. Direct rates, transparent pricing, local support.")}
            </p>
            <p className="font-['Inter:SemiBold',sans-serif] text-[14px] md:text-[15px] text-white/90">
              {t("Stay Smart. Stay United.")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-['Poppins:SemiBold',sans-serif] text-[16px] md:text-[17px] text-white mb-4 md:mb-5">
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
                  {t("Find Hotels")}
                </Link>
              </li>
              <li>
                <Link to="/portal" className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[15px] text-white/70 hover:text-white transition-colors">
                  {t("My Bookings")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-['Poppins:SemiBold',sans-serif] text-[16px] md:text-[17px] text-white mb-4 md:mb-5">
              {t("Contact Us")}
            </h4>
            <ul className="space-y-3 md:space-y-4">
              <li>
                <a href="tel:+905551234567" className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[15px] text-white/70 hover:text-white transition-colors flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  +90 555 123 45 67
                </a>
              </li>
              <li>
                <a href="mailto:hello@unitedhotels.com" className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[15px] text-white/70 hover:text-white transition-colors flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  hello@unitedhotels.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-['Inter:Regular',sans-serif] text-[13px] md:text-[14px] text-white/60 text-center md:text-left">
              © 2026 United Hotels. {t("All rights reserved.")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              <Link to="/support" className="font-['Inter:Regular',sans-serif] text-[13px] md:text-[14px] text-white/60 hover:text-white transition-colors">
                {t("Privacy Policy")}
              </Link>
              <Link to="/support" className="font-['Inter:Regular',sans-serif] text-[13px] md:text-[14px] text-white/60 hover:text-white transition-colors">
                {t("Terms of Service")}
              </Link>
              <Link to="/support" className="font-['Inter:Regular',sans-serif] text-[13px] md:text-[14px] text-white/60 hover:text-white transition-colors">
                {t("Support")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}