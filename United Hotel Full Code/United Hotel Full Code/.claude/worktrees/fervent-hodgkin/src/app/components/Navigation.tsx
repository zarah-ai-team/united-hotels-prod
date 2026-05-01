import { Link, useLocation } from "react-router";
import svgPaths from "../../imports/svg-nkrjt6kvoj";
import { Globe } from "lucide-react";

export function Navigation() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const navItems = [
    { label: "Home", href: "#home" },
    { label: "Why Choose Us", href: "#why-choose-us" },
    { label: "Best Value Picks", href: "#best-value-picks" },
    { label: "Quality Promise", href: "#quality-promise" },
    { label: "FAQs", href: "#faqs" },
    { label: "CTA", href: "#cta" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (isHomePage) {
      e.preventDefault();
      const targetId = href.replace("#", "");
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-[1840px] mx-auto px-10">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="h-[26px] w-[28px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 26">
                <mask fill="white" id="path-1-inside-1_20_512">
                  <path d={svgPaths.p32095b00} />
                </mask>
                <path d={svgPaths.p32095b00} fill="#1ABC9C" mask="url(#path-1-inside-1_20_512)" stroke="#1ABC9C" strokeWidth="0.4" />
              </svg>
            </div>
            <span className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-[#1abc9c]">
              United Hotels
            </span>
          </Link>

          {/* Main Navigation */}
          <div className="flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={isHomePage ? item.href : `/${item.href}`}
                onClick={(e) => handleNavClick(e, item.href)}
                className="text-[#3b3b3b] hover:text-[#1abc9c] transition-colors font-['Inter:Medium',sans-serif] text-[15px] min-h-[44px] flex items-center"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            <button
              className="flex items-center gap-2 text-[#3b3b3b] hover:text-[#1abc9c] transition-colors min-h-[44px] min-w-[44px] justify-center"
              aria-label="Change currency"
            >
              <Globe className="w-4 h-4" />
              <span className="text-[14px]">USD</span>
            </button>
            <button
              className="flex items-center gap-2 text-[#3b3b3b] hover:text-[#1abc9c] transition-colors min-h-[44px] min-w-[44px] justify-center"
              aria-label="Change language"
            >
              <span className="text-[14px]">EN</span>
            </button>
            <Link to="/listing" className="bg-[#1abc9c] text-white px-6 py-2.5 rounded-lg hover:bg-[#16a085] transition-all hover:shadow-lg font-['Inter:SemiBold',sans-serif] text-[14px] min-h-[44px] flex items-center">
              Find Hotels
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
