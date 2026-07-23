import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
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
  LogOut,
  MessageCircle,
  Briefcase,
} from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useTheme } from "@/shared/context/ThemeContext";
import { useAuth } from "@/shared/context/AuthContext";

function pickDisplayName(user: { name?: string | null; email?: string | null } | null): string {
  if (!user) return "";
  const n = (user.name || "").trim();
  if (n) return n.split(/\s+/)[0];
  const e = (user.email || "").trim();
  if (e) return e.split("@")[0];
  return "Account";
}

function pickInitial(user: { name?: string | null; email?: string | null } | null): string {
  const src = (user?.name || user?.email || "?").trim();
  return (src[0] || "?").toUpperCase();
}

// Nav links mix routes (route: true â†’ renders as <Link>) and same-page anchors
// (route: false â†’ renders as <a href> for browser-native scroll). Active-state
// highlighting only applies to anchor items on the home route.
type NavLink = { id: string; label: string; href: string; route?: boolean };

const NAV_LINKS: NavLink[] = [
  { id: "home", label: "Home", href: "/", route: true },
  { id: "for-travelers", label: "For Travelers", href: "/#for-travelers" },
  { id: "for-groups", label: "For Groups", href: "/groups", route: true },
  { id: "why-choose-united-hotels", label: "Why Us", href: "/#why-choose-united-hotels" },
  { id: "standards", label: "Standards", href: "/#standards" },
];

// WhatsApp support number — falls back to a safe default if the env var is not
// set. Number is digits-only for the wa.me link.
const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "905449580798")
  .toString()
  .replace(/[^\d]/g, "");
const WHATSAPP_HREF = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi United Hotels! I'd like to get in touch."
)}`;

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
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const displayName = pickDisplayName(user);
  const initial = pickInitial(user);
  const isAdmin = Boolean(user?.isAdmin);
  const isVendor = Boolean(user?.role === "vendor" || user?.isManager);
  const handleSignOut = () => {
    logout();
    setIsLoginOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  const isHomeRoute = location.pathname === "/";
  // Hero is now a flat white card (no more dark cinematic backdrop), so the
  // nav always uses its solid surface state — never the transparent overlay.
  useScrolled(80); // kept for future use; result intentionally ignored
  const showFrosted = true;
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
            {/* Logo — full brand lockup (mark + wordmark). Solid nav in both
                themes keeps the blue logo legible; slight brightness lift in
                dark mode. */}
            <Link to="/" className="flex items-center hover:opacity-90 transition-opacity" aria-label="United Hotels — home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/united-hotels-logo.png"
                alt="United Hotels - bookunitedhotels.com"
                width={851}
                height={392}
                className="uh-logo-mark h-8 md:h-9 w-auto"
              />
            </Link>

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-0.5 xl:gap-1">
              {NAV_LINKS.map((link) => {
                // Anchor items use IntersectionObserver-driven active state when
                // we're on the home route; route items use the URL path instead.
                const routeActive =
                  link.route && link.href !== "/"
                    ? location.pathname === link.href || location.pathname.startsWith(link.href + "/")
                    : false;
                const isActive = link.route ? routeActive : activeId === link.id;
                const className = `uh-link ${isActive ? "is-active" : ""}`;
                return link.route ? (
                  <Link key={link.id} to={link.href} className={className}>
                    {t(link.label)}
                  </Link>
                ) : (
                  <a key={link.id} href={link.href} className={className}>
                    {t(link.label)}
                  </a>
                );
              })}

              {/* WhatsApp Contact Us — sits to the right of the Standards nav link */}
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 inline-flex items-center gap-2 h-9 px-3 rounded-full bg-[#25D366] hover:bg-[#1da851] text-white font-['Inter:SemiBold',sans-serif] text-[13px] transition-colors shadow-[0_2px_8px_rgba(37,211,102,0.30)]"
                aria-label="Contact us on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" strokeWidth={2.4} />
                <span className="hidden xl:inline">{t("Contact us")}</span>
                <span className="xl:hidden">WhatsApp</span>
              </a>
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
                            {isActive && <Check className="w-4 h-4 text-[#2F80ED] shrink-0" />}
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
                  aria-label={isAuthenticated ? `Signed in as ${displayName}` : "Account"}
                >
                  {isAuthenticated ? (
                    <>
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-['Inter:Bold',sans-serif] text-white"
                        style={{ background: 'linear-gradient(135deg, #2F80ED, #5DA0F8)' }}
                        aria-hidden
                      >
                        {initial}
                      </span>
                      <span className="max-w-[120px] truncate">{displayName}</span>
                      <span
                        className="ml-1 hidden xl:inline rounded-full px-1.5 py-[1px] text-[10px] font-['Inter:SemiBold',sans-serif] tracking-wide uppercase"
                        style={{
                          color: '#0f9d58',
                          background: 'rgba(16,185,129,0.12)',
                          boxShadow: 'inset 0 0 0 1px rgba(16,185,129,0.30)',
                        }}
                      >
                        {t("Signed in")}
                      </span>
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4" strokeWidth={2} />
                      <span>{t("Account")}</span>
                    </>
                  )}
                  <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${isLoginOpen ? "rotate-180" : ""}`} />
                </button>
                {isLoginOpen && (
                  <div className="uh-dropdown" role="menu">
                    {isAuthenticated && (
                      <div className="px-3 py-2 border-b border-current/10 mb-1">
                        <div className="text-[11px] uppercase tracking-[0.14em] opacity-60 font-['Inter:Medium',sans-serif]">
                          {t("Signed in as")}
                        </div>
                        <div className="font-['Inter:SemiBold',sans-serif] text-[14px] truncate">
                          {user?.name || displayName}
                        </div>
                        {user?.email && (
                          <div className="text-[12px] opacity-70 truncate">{user.email}</div>
                        )}
                      </div>
                    )}
                    <Link
                      to={isAuthenticated ? "/portal" : "/auth"}
                      role="menuitem"
                      className="uh-dropdown-item !justify-start gap-3"
                      onClick={() => setIsLoginOpen(false)}
                    >
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, rgba(47, 128, 237,0.15), rgba(93, 160, 248,0.25))',
                          boxShadow: 'inset 0 0 0 1px rgba(47, 128, 237,0.30)',
                        }}
                        aria-hidden
                      >
                        <UserCircle2 className="w-4 h-4 text-[#1E5FBC]" strokeWidth={2} />
                      </span>
                      <span className="flex flex-col items-start min-w-0">
                        <span className="font-['Inter:SemiBold',sans-serif]">
                          {t(isAuthenticated ? "Guest Portal" : "Guest Login")}
                        </span>
                        <span className="item-sub">
                          {t(isAuthenticated ? "Manage bookings" : "Sign in to your account")}
                        </span>
                      </span>
                    </Link>
                    {(!isAuthenticated || isAdmin) && (
                      <Link
                        to={isAdmin ? "/admin" : "/admin/login"}
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
                          <span className="font-['Inter:SemiBold',sans-serif]">{t(isAdmin ? "Admin Dashboard" : "Admin Login")}</span>
                          <span className="item-sub">{t("Staff access")}</span>
                        </span>
                      </Link>
                    )}
                    {(!isAuthenticated || isVendor) && (
                      <Link
                        to={isVendor ? "/vendor" : "/vendor/login"}
                        role="menuitem"
                        className="uh-dropdown-item !justify-start gap-3"
                        onClick={() => setIsLoginOpen(false)}
                      >
                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-full shrink-0"
                          style={{
                            background: 'linear-gradient(135deg, rgba(20,184,166,0.15), rgba(94,234,212,0.30))',
                            boxShadow: 'inset 0 0 0 1px rgba(20,184,166,0.30)',
                          }}
                          aria-hidden
                        >
                          <Briefcase className="w-4 h-4 text-[#0F766E]" strokeWidth={2} />
                        </span>
                        <span className="flex flex-col items-start min-w-0">
                          <span className="font-['Inter:SemiBold',sans-serif]">{t(isVendor ? "Vendor Portal" : "Vendor Login")}</span>
                          <span className="item-sub">{t("Property partners")}</span>
                        </span>
                      </Link>
                    )}
                    {isAuthenticated && (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleSignOut}
                        className="uh-dropdown-item !justify-start gap-3 w-full text-left"
                      >
                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-full shrink-0"
                          style={{
                            background: 'rgba(239,68,68,0.10)',
                            boxShadow: 'inset 0 0 0 1px rgba(239,68,68,0.30)',
                          }}
                          aria-hidden
                        >
                          <LogOut className="w-4 h-4 text-[#ef4444]" strokeWidth={2} />
                        </span>
                        <span className="flex flex-col items-start min-w-0">
                          <span className="font-['Inter:SemiBold',sans-serif]">{t("Sign out")}</span>
                          <span className="item-sub">{t("End this session")}</span>
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Primary CTA */}
              <Link to="/listing" className="uh-cta ml-1">
                <Search className="w-4 h-4" strokeWidth={2.4} />
                {t("Book Now")}
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
              {NAV_LINKS.map((link) => {
                const routeActive =
                  link.route && link.href !== "/"
                    ? location.pathname === link.href || location.pathname.startsWith(link.href + "/")
                    : false;
                const isActive = link.route ? routeActive : activeId === link.id;
                const className = `uh-drawer-link ${isActive ? "is-active" : ""}`;
                return link.route ? (
                  <Link
                    key={link.id}
                    to={link.href}
                    className={className}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t(link.label)}
                  </Link>
                ) : (
                  <a
                    key={link.id}
                    href={link.href}
                    className={className}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t(link.label)}
                  </a>
                );
              })}

              <div className="px-3 pt-6 pb-2 text-[11px] tracking-[0.16em] uppercase opacity-50 font-['Inter:Medium',sans-serif]">
                {t("Account")}
              </div>
              {isAuthenticated && (
                <div className="mx-3 mb-2 flex items-center gap-3 rounded-xl border border-current/10 px-3 py-3">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-['Inter:Bold',sans-serif] text-white shrink-0"
                    style={{ background: 'linear-gradient(135deg, #2F80ED, #5DA0F8)' }}
                    aria-hidden
                  >
                    {initial}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-['Inter:SemiBold',sans-serif] text-[14px] truncate">
                      {user?.name || displayName}
                    </div>
                    {user?.email && (
                      <div className="text-[12px] opacity-70 truncate">{user.email}</div>
                    )}
                  </div>
                  <span
                    className="rounded-full px-2 py-[2px] text-[10px] font-['Inter:SemiBold',sans-serif] tracking-wide uppercase"
                    style={{
                      color: '#0f9d58',
                      background: 'rgba(16,185,129,0.12)',
                      boxShadow: 'inset 0 0 0 1px rgba(16,185,129,0.30)',
                    }}
                  >
                    {t("Signed in")}
                  </span>
                </div>
              )}
              <Link
                to={isAuthenticated ? "/portal" : "/auth"}
                className="uh-drawer-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-3">
                  <User className="w-4 h-4 opacity-70" />
                  {t(isAuthenticated ? "Guest Portal" : "Guest Login")}
                </span>
              </Link>
              {(!isAuthenticated || isAdmin) && (
                <Link
                  to={isAdmin ? "/admin" : "/admin/login"}
                  className="uh-drawer-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 opacity-70" />
                    {t(isAdmin ? "Admin Dashboard" : "Admin Login")}
                  </span>
                </Link>
              )}
              {(!isAuthenticated || isVendor) && (
                <Link
                  to={isVendor ? "/vendor" : "/vendor/login"}
                  className="uh-drawer-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 opacity-70" />
                    {t(isVendor ? "Vendor Portal" : "Vendor Login")}
                  </span>
                </Link>
              )}
              {isAuthenticated && (
                <button
                  type="button"
                  className="uh-drawer-link w-full text-left"
                  onClick={handleSignOut}
                >
                  <span className="flex items-center gap-3 text-[#ef4444]">
                    <LogOut className="w-4 h-4" />
                    {t("Sign out")}
                  </span>
                </button>
              )}

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
                            ? "border-[#2F80ED] text-[#2F80ED] bg-[#2F80ED]/8"
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

            <div className="p-4 border-t border-current/5 flex flex-col gap-2">
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-[#25D366] hover:bg-[#1da851] text-white font-['Inter:SemiBold',sans-serif] text-[14px] transition-colors"
              >
                <MessageCircle className="w-4 h-4" strokeWidth={2.4} />
                {t("Contact us on WhatsApp")}
              </a>
              <Link
                to="/listing"
                className="uh-cta w-full justify-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Search className="w-4 h-4" strokeWidth={2.4} />
                {t("Book Now")}
              </Link>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
