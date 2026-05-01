import { Link } from "react-router";
import { Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#3b3b3b] py-20">
      <div className="max-w-[1224px] mx-auto px-10">
        <div className="grid grid-cols-4 gap-12 mb-16">
          {/* Company Info */}
          <div>
            <h3 className="font-['Poppins:Bold',sans-serif] text-[20px] text-white mb-5">
              United Hotels
            </h3>
            <p className="font-['Inter:Regular',sans-serif] text-[15px] text-white/70 leading-[25px] mb-5">
              Turkey's hotel experts. Direct rates, transparent pricing, local support.
            </p>
            <p className="font-['Inter:SemiBold',sans-serif] text-[15px] text-white/90">
              Stay Smart. Stay United.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-['Poppins:SemiBold',sans-serif] text-[17px] text-white mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="font-['Inter:Regular',sans-serif] text-[15px] text-white/70 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/listing" className="font-['Inter:Regular',sans-serif] text-[15px] text-white/70 hover:text-white transition-colors">
                  Find Hotels
                </Link>
              </li>
              <li>
                <Link to="/portal" className="font-['Inter:Regular',sans-serif] text-[15px] text-white/70 hover:text-white transition-colors">
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>

          {/* Neighborhoods */}
          <div>
            <h4 className="font-['Poppins:SemiBold',sans-serif] text-[17px] text-white mb-5">
              Neighborhoods
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/listing" className="font-['Inter:Regular',sans-serif] text-[15px] text-white/70 hover:text-white transition-colors">
                  Sultanahmet & Fatih
                </Link>
              </li>
              <li>
                <Link to="/listing" className="font-['Inter:Regular',sans-serif] text-[15px] text-white/70 hover:text-white transition-colors">
                  Taksim & Beyoğlu
                </Link>
              </li>
              <li>
                <Link to="/listing" className="font-['Inter:Regular',sans-serif] text-[15px] text-white/70 hover:text-white transition-colors">
                  Kadıköy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-['Poppins:SemiBold',sans-serif] text-[17px] text-white mb-5">
              Contact
            </h4>
            <ul className="space-y-4">
              <li>
                <div className="flex items-start gap-3">
                  <Phone className="w-4.5 h-4.5 text-[#1abc9c] mt-0.5" />
                  <div>
                    <p className="font-['Inter:Regular',sans-serif] text-[13px] text-white/60 mb-1">
                      WhatsApp
                    </p>
                    <p className="font-['Inter:Regular',sans-serif] text-[15px] text-white/90">
                      +90 555 123 4567
                    </p>
                  </div>
                </div>
              </li>
              <li>
                <div className="flex items-start gap-3">
                  <Mail className="w-4.5 h-4.5 text-[#1abc9c] mt-0.5" />
                  <div>
                    <p className="font-['Inter:Regular',sans-serif] text-[13px] text-white/60 mb-1">
                      Email
                    </p>
                    <p className="font-['Inter:Regular',sans-serif] text-[15px] text-white/90">
                      hello@unitedhotels.com
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex items-center justify-between">
          <p className="font-['Inter:Regular',sans-serif] text-[14px] text-white/60">
            © 2025 United Hotels. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            <a href="#" className="font-['Inter:Regular',sans-serif] text-[14px] text-white/60 hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="font-['Inter:Regular',sans-serif] text-[14px] text-white/60 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="font-['Inter:Regular',sans-serif] text-[14px] text-white/60 hover:text-white transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}