import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import svgPaths from "../../imports/svg-nkrjt6kvoj";
import {
  ChevronDown,
  Globe,
  User,
  Menu,
  X,
  Check,
  Sun,
  Moon,
  Search,
  UserCircle2,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

const NAV_LINKS = [
  { id: "home", label: "Home", href: "/#home" },
  { id: "why-choose-united-hotels", label: "Why Choose United Hotels", href: "/#why-choose-united-hotels" },
  { id: "featured-hotels", label: "Featured Hotels", href: "/#featured-hotels" },
  { id: "quality", label: "Quality", href: "/#quality" },
  { id: "faqs", label: "FAQ", href: "/#faqs" },
];

function useScrolled(threshold = 80) {
  const [scrolled, setScrolled] = useState(() => typeof window !== "undefined" && window.scrollY > threshold);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function useActiveSection(ids: string[], enabled: boolean) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled) {
      setActive(null);
      return;
    }
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids, enabled]);
  return active;
}

function useClickOutside<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);
  return ref;
}

export function Navigation() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { region, regions, setRegion, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isHomeRoute = location.pathname === "/";
  const scrolled = useScrolled(80);
  const showFrosted = scrolled || !isHomeRoute;
  const activeId = useActiveSection(NAV_LINKS.map((l) => l.id), isHomeRoute);

  const languageRef = useClickOutside<HTMLDivElement>(() => setIsLanguageOpen(false));
  const loginRef = useClickOutside<HTMLDivElement>(() => setIsLoginOpen(false));

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isMobileMenuOpen]);

  // Close drawer on route change
  useEffect(() => { setIsMobileMenuOpen(false); }, [location.pathname]);

  // ESC closes drawer
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsMobileMenuOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav className={`uh-nav ${showFrosted ? "is-scrolled" : ""}`}>
        <div className="max-w-[1840px] mx-auto px-4 md:px-10">
          <div className="flex items-center justify-between h-16 md:h-[68px]">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <div className="h-[22px] w-[24px] md:h-[26px] md:w-[28px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 26">
                  <mask fill="white" id="path-1-inside-1_20_512">
                    <path d={svgPaths.p32095b00} />
                  </mask>
                  <path d={svgPaths.p32095b00} fill="#1ABC9C" mask="url(#path-1-inside-1_20_512)" stroke="#1ABC9C" strokeWidth="0.4" />
                </svg>
              </div>
              <span className="uh-logo-mark font-['Poppins:SemiBold',sans-serif] text-[16px] md:text-[18px] tracking-[-0.01em]">
                United Hotels
              </span>
            </Link>

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  className={`uh-link ${activeId === link.id ? "is-active" : ""}`}
                >
                  {t(link.label)}
                </a>
              ))}
            </div>

            {/* Desktop right cluster */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Theme toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={theme === "dark"}
                onClick={toggleTheme}
                className="theme-pill"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                title={theme === "dark" ? "Light mode" : "Dark mode"}
              >
                <Sun className="theme-pill-track-icon sun w-3.5 h-3.5" strokeWidth={2.5} />
                <Moon className="theme-pill-track-icon moon w-3.5 h-3.5" strokeWidth={2.5} />
                <span className="theme-pill-thumb">
                  {theme === "dark" ? <Moon className="w-3.5 h-3.5" strokeWidth={2.5} /> : <Sun className="w-3.5 h-3.5" strokeWidth={2.5} />}
                </span>
              </button>

              {/* Region / language / currency */}
              <div className="relative" ref={languageRef}>
                <button
                  onClick={() => { setIsLanguageOpen((v) => !v); setIsLoginOpen(false); }}
                  className="uh-icon-btn"
                  aria-expanded={isLanguageOpen}
                  aria-haspopup="menu"
                  aria-label="Change region, language and currency"
                >
                  <Globe className="w-4 h-4" strokeWidth={2} />
                  <span className="hidden xl:inline">{region.flag}</span>
                  <span>{region.language.toUpperCase()} · {region.currency}</span>
                  <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${isLanguageOpen ? "rotate-180" : ""}`} />
                </button>
                {isLanguageOpen && (
                  <div className="uh-dropdown uh-region-dropdown" role="menu">
                    <div className="uh-region-heading">{t("Choose your region")}</div>
                    <div className="uh-region-list">
                      {regions.map((r) => {
                        const isActive = region.code === r.code;
                        return (
                          <button
                            key={r.code}
                            role="menuitem"
                            onClick={() => { setRegion(r.code); setIsLanguageOpen(false); }}
                            className={`uh-region-item ${isActive ? "is-active" : ""}`}
                          >
                            <span className="uh-region-flag" aria-hidden>{r.flag}</span>
                            <span className="uh-region-text">
                              <span className="uh-region-label">{r.label}</span>
                              <span className="uh-region-sub">{r.languageLabel} · {r.currency}</span>
                            </span>
                            {isActive && <Check className="w-4 h-4 text-[#1abc9c] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Account */}
              <div className="relative" ref={loginRef}>
                <button
                  onClick={() => { setIsLoginOpen((v) => !v); setIsLanguageOpen(false); }}
                  className="uh-icon-btn"
                  aria-expanded={isLoginOpen}
                  aria-haspopup="menu"
                >
                  <User className="w-4 h-4" strokeWidth={2} />
                  <span>{t("Account")}</span>
                  <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${isLoginOpen ? "rotate-180" : ""}`} />
                </button>
                {isLoginOpen && (
                  <div className="uh-dropdown" role="menu">
                    <Link
                      to="/portal"
                      role="menuitem"
                      className="uh-dropdown-item !justify-start gap-3"
                      onClick={() => setIsLoginOpen(false)}
                    >
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, rgba(26,188,156,0.15), rgba(45,212,191,0.25))',
                          boxShadow: 'inset 0 0 0 1px rgba(26,188,156,0.30)',
                        }}
                        aria-hidden
                      >
                        <UserCircle2 className="w-4 h-4 text-[#0f9b86]" strokeWidth={2} />
                      </span>
                      <span className="flex flex-col items-start min-w-0">
                        <span className="font-['Inter:SemiBold',sans-serif]">{t("Guest Portal")}</span>
                        <span className="item-sub">{t("Manage bookings")}</span>
                      </span>
                    </Link>
                    <Link
                      to="/admin/login"
                      role="menuitem"
                      className="uh-dropdown-item !justify-start gap-3"
                      onClick={() => setIsLoginOpen(false)}
                    >
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.25))',
                          boxShadow: 'inset 0 0 0 1px rgba(99,102,241,0.30)',
                        }}
                        aria-hidden
                      >
                        <ShieldCheck className="w-4 h-4 text-[#6366f1]" strokeWidth={2} />
                      </span>
                      <span className="flex flex-col items-start min-w-0">
                        <span className="font-['Inter:SemiBold',sans-serif]">{t("Admin Login")}</span>
                        <span className="item-sub">{t("Staff access")}</span>
                      </span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Primary CTA */}
              <Link to="/listing" className="uh-cta ml-1">
                <Search className="w-4 h-4" strokeWidth={2.4} />
                {t("Book stay")}
              </Link>
            </div>

            {/* Mobile right cluster */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                type="button"
                role="switch"
                aria-checked={theme === "dark"}
                onClick={toggleTheme}
                className="theme-pill"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                <Sun className="theme-pill-track-icon sun w-3.5 h-3.5" strokeWidth={2.5} />
                <Moon className="theme-pill-track-icon moon w-3.5 h-3.5" strokeWidth={2.5} />
                <span className="theme-pill-thumb">
                  {theme === "dark" ? <Moon className="w-3.5 h-3.5" strokeWidth={2.5} /> : <Sun className="w-3.5 h-3.5" strokeWidth={2.5} />}
                </span>
              </button>
              <button
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                className="uh-icon-btn"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {isMobileMenuOpen && (
        <>
          <div className="uh-drawer-backdrop lg:hidden" onClick={() => setIsMobileMenuOpen(false)} aria-hidden />
          <aside className="uh-drawer lg:hidden" role="dialog" aria-modal="true" aria-label="Main menu">
            <div className="flex items-center justify-between px-5 h-16 border-b border-current/5">
              <span className="font-['Poppins:SemiBold',sans-serif] text-[15px] tracking-[0.06em] uppercase opacity-70">
                {t("Menu")}
              </span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="uh-icon-btn" aria-label="Close menu">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  className={`uh-drawer-link ${activeId === link.id ? "is-active" : ""}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t(link.label)}
                </a>
              ))}

              <div className="px-3 pt-6 pb-2 text-[11px] tracking-[0.16em] uppercase opacity-50 font-['Inter:Medium',sans-serif]">
                {t("Account")}
              </div>
              <Link to="/portal" className="uh-drawer-link" onClick={() => setIsMobileMenuOpen(false)}>
                <span className="flex items-center gap-3">
                  <User className="w-4 h-4 opacity-70" />
                  {t("Guest Portal")}
                </span>
              </Link>
              <Link to="/admin/login" className="uh-drawer-link" onClick={() => setIsMobileMenuOpen(false)}>
                <span className="flex items-center gap-3">
                  <User className="w-4 h-4 opacity-70" />
                  {t("Admin Login")}
                </span>
              </Link>

              <div className="px-3 pt-6 pb-2 text-[11px] tracking-[0.16em] uppercase opacity-50 font-['Inter:Medium',sans-serif]">
                {t("Region")}
              </div>
              <div className="px-3">
                <div className="grid grid-cols-1 gap-1.5">
                  {regions.map((r) => {
                    const isActive = region.code === r.code;
                    return (
                      <button
                        key={r.code}
                        onClick={() => setRegion(r.code)}
                        className={`flex items-center gap-3 h-12 px-3 rounded-xl text-[13px] font-['Inter:Medium',sans-serif] border transition-colors text-left ${
                          isActive
                            ? "border-[#1abc9c] text-[#1abc9c] bg-[#1abc9c]/8"
                            : "border-current/10 opacity-80 hover:opacity-100"
                        }`}
                      >
                        <span className="text-[18px] leading-none" aria-hidden>{r.flag}</span>
                        <span className="flex-1 flex flex-col leading-tight">
                          <span>{r.label}</span>
                          <span className="text-[11px] opacity-60">{r.languageLabel} · {r.currency}</span>
                        </span>
                        {isActive && <Check className="w-4 h-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-current/5">
              <Link
                to="/listing"
                className="uh-cta w-full justify-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Search className="w-4 h-4" strokeWidth={2.4} />
                {t("Book stay")}
              </Link>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
