import { type CSSProperties, type ReactNode, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { ValuePropositionSection } from "../components/ValuePropositionSection";
import { FeaturedHotelsSection } from "../components/FeaturedHotelsSection";
import { QualityAssuranceSection } from "../components/QualityAssuranceSection";
import { VerifiedCollectionSection } from "../components/VerifiedCollectionSection";
import { SegmentationSection } from "../components/SegmentationSection";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { useScrollProgress } from "../hooks/useScrollProgress";
import { useLanguage } from "../context/LanguageContext";
import { useBooking } from "../context/BookingContext";
import heroFigma1 from "../../assets/hero-figma-1.webp";
import heroFigma2 from "../../assets/hero-figma-2.webp";
import heroFigma3 from "../../assets/hero-figma-3.webp";
import heroFigma4 from "../../assets/hero-figma-4.webp";
import heroFigma5 from "../../assets/hero-figma-5.webp";
import heroFigma6 from "../../assets/hero-figma-6.webp";
import heroFigma7 from "../../assets/hero-figma-7.webp";
import {
  MapPin,
  Calendar,
  Users,
  Search,
  Check,
  ChevronDown,
} from "lucide-react";

type RevealVariant = "up" | "left" | "right" | "pop";

interface RevealSectionProps {
  children: ReactNode;
  delay?: number;
  variant?: RevealVariant;
  className?: string;
}

function RevealSection({ children, delay = 0, variant = "up", className = "" }: RevealSectionProps) {
  const revealRef = useScrollReveal<HTMLDivElement>();
  const variantClass =
    variant === "left" ? "reveal-left"
    : variant === "right" ? "reveal-right"
    : variant === "pop" ? "reveal-pop"
    : "reveal";

  return (
    <div
      ref={revealRef}
      className={`${variantClass} ${className}`.trim()}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

// Hero — split layout per design spec.
// Left: text + search + CTAs. Right: rotating hero imagery (kept the slideshow
// for visual richness; lives in the right column on desktop, full-width
// background on mobile).
const HERO_SLIDES = [
  { src: heroFigma3, alt: "Hot air balloons above Cappadocia rock formations" },
  { src: heroFigma1, alt: "Cappadocia valley at sunrise" },
  { src: heroFigma5, alt: "Hot air balloons drifting at sunset" },
  { src: heroFigma6, alt: "Coastal city skyline at sunset" },
  { src: heroFigma7, alt: "Aerial view of the Golden Horn" },
  { src: heroFigma4, alt: "Old town panorama over the river" },
  { src: heroFigma2, alt: "Cappadocia village at twilight" },
];
const SLIDE_INTERVAL_MS = 6000;

function HeroSection() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { setDates, setGuests } = useBooking();
  const [activeSlide, setActiveSlide] = useState(0);
  const [searchData, setSearchData] = useState({
    destination: "",
    checkIn: "",
    checkOut: "",
    guests: "",
  });

  // Auto-advance hero imagery
  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchData.checkIn && searchData.checkOut) {
      setDates(searchData.checkIn, searchData.checkOut);
    }
    const guestsNum = parseInt(searchData.guests || "0", 10);
    if (Number.isFinite(guestsNum) && guestsNum > 0) {
      setGuests(guestsNum);
    }
    const params = new URLSearchParams();
    if (searchData.destination) params.set("destination", searchData.destination);
    if (searchData.checkIn) params.set("checkIn", searchData.checkIn);
    if (searchData.checkOut) params.set("checkOut", searchData.checkOut);
    if (searchData.guests) params.set("guests", searchData.guests);
    const qs = params.toString();
    navigate(qs ? `/listing?${qs}` : "/listing");
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <section
      id="home"
      className="relative bg-white dark:bg-[#161616] border-b border-[#E6EAF0] dark:border-white/10"
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-10 py-6 md:py-8 lg:py-10">
        <div className="grid lg:grid-cols-[6fr_6fr] gap-6 lg:gap-10 items-stretch">
          {/* LEFT: Brand + headline + search + CTAs */}
          <div className="order-1 flex flex-col">
            <div className="font-['Inter:SemiBold',sans-serif] text-[11px] md:text-[12px] tracking-[0.24em] uppercase text-[#2F80ED] mb-2 md:mb-3">
              {t("United Hotels")}
            </div>
            <h1 className="font-['Poppins:Bold',sans-serif] text-[28px] sm:text-[32px] md:text-[36px] lg:text-[40px] xl:text-[44px] leading-[1.1] tracking-[-0.02em] text-[#0B1F3B] dark:text-white mb-2 md:mb-3">
              {t("Trusted Stays for Every Journey in Turkey")}
            </h1>
            <p className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[15.5px] leading-[1.5] text-[#6B7280] dark:text-white/70 mb-4 md:mb-5 max-w-[540px]">
              {t("Verified hotels, transparent pricing, real local support — for individual travellers and groups alike.")}
            </p>

            {/* Search module — clean white card per spec.
                .dark-accent-ring adds a subtle blue outline + glow in dark
                mode so this primary action zone pops above the charcoal. */}
            <form
              onSubmit={handleSearch}
              className="dark-accent-ring bg-white border border-[#E6EAF0] dark:bg-[#161616] dark:border-white/10 rounded-2xl p-2.5 md:p-3 shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
              aria-label="Hotel search"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Destination */}
                <div className="relative sm:col-span-2">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                  <input
                    id="destination"
                    type="text"
                    placeholder={t("Where to? (e.g. Istanbul)")}
                    value={searchData.destination}
                    onChange={(e) => setSearchData({ ...searchData, destination: e.target.value })}
                    className="w-full h-[44px] pl-10 pr-3 rounded-xl bg-white border border-[#E6EAF0] dark:bg-[#161616] dark:border-white/10 text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#2F80ED]/15 font-['Inter:Regular',sans-serif] text-[14px] transition-colors"
                  />
                </div>

                {/* Check-in */}
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                  <input
                    id="checkIn"
                    type="date"
                    value={searchData.checkIn}
                    onChange={(e) => setSearchData({ ...searchData, checkIn: e.target.value })}
                    min={today}
                    aria-label={t("Check-in")}
                    className="w-full h-[44px] pl-10 pr-3 rounded-xl bg-white border border-[#E6EAF0] dark:bg-[#161616] dark:border-white/10 text-[#111827] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#2F80ED]/15 font-['Inter:Regular',sans-serif] text-[14px] transition-colors"
                  />
                </div>

                {/* Check-out */}
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                  <input
                    id="checkOut"
                    type="date"
                    value={searchData.checkOut}
                    onChange={(e) => setSearchData({ ...searchData, checkOut: e.target.value })}
                    min={searchData.checkIn || today}
                    aria-label={t("Check-out")}
                    className="w-full h-[44px] pl-10 pr-3 rounded-xl bg-white border border-[#E6EAF0] dark:bg-[#161616] dark:border-white/10 text-[#111827] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#2F80ED]/15 font-['Inter:Regular',sans-serif] text-[14px] transition-colors"
                  />
                </div>

                {/* Guests + Search button row */}
                <div className="relative sm:col-span-2 grid grid-cols-[1fr_auto] gap-2">
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                    <select
                      id="guests"
                      value={searchData.guests}
                      onChange={(e) => setSearchData({ ...searchData, guests: e.target.value })}
                      aria-label={t("Guests")}
                      className="w-full h-[44px] pl-10 pr-9 rounded-xl bg-white border border-[#E6EAF0] dark:bg-[#161616] dark:border-white/10 text-[#111827] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#2F80ED]/15 font-['Inter:Regular',sans-serif] text-[14px] appearance-none transition-colors"
                    >
                      <option value="">{t("Add guests")}</option>
                      <option value="1">{t("1 guest")}</option>
                      <option value="2">{t("2 guests")}</option>
                      <option value="3">{t("3 guests")}</option>
                      <option value="4">{t("4+ guests")}</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                  </div>
                  <button
                    type="submit"
                    className="h-[44px] px-5 md:px-6 rounded-xl bg-[#2F80ED] hover:bg-[#1E5FBC] text-white font-['Inter:SemiBold',sans-serif] text-[14px] flex items-center justify-center gap-2 transition-colors shadow-[0_2px_8px_rgba(47,128,237,0.25)]"
                  >
                    <Search className="w-4 h-4" strokeWidth={2.4} />
                    {t("Find Hotels")}
                  </button>
                </div>
              </div>
            </form>

            {/* Secondary CTAs */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-3 md:mt-4">
              <Link
                to="/groups"
                className="inline-flex items-center gap-2 px-4 md:px-5 h-[40px] rounded-xl border border-[#E6EAF0] bg-white hover:border-[#2F80ED] hover:text-[#2F80ED] text-[#0B1F3B] dark:text-white font-['Inter:SemiBold',sans-serif] text-[13.5px] transition-colors"
              >
                {t("Request Group Offer")}
              </Link>
              <Link
                to="/listing"
                onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "auto" })}
                className="inline-flex items-center gap-2 px-4 md:px-5 h-[40px] rounded-xl text-[#0B1F3B] dark:text-white hover:text-[#2F80ED] font-['Inter:SemiBold',sans-serif] text-[13.5px] transition-colors"
              >
                {t("Browse Hotels")} →
              </Link>
            </div>

            {/* Trust line — small, under CTAs per spec */}
            <p className="mt-3 md:mt-4 font-['Inter:Regular',sans-serif] text-[12.5px] text-[#6B7280] dark:text-white/70 flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#16A34A] shrink-0" strokeWidth={3} />
              {t("No surprises. No hidden fees. Just verified stays you can trust.")}
            </p>
          </div>

          {/* RIGHT: Hero imagery — fills the column height (matches left content)
              On mobile gets a bounded aspect ratio so it doesn't dominate. */}
          <div className="order-2 relative">
            <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[440px] rounded-2xl overflow-hidden bg-[#F1F4F9]">
              {HERO_SLIDES.map((slide, i) => (
                <img
                  key={i}
                  src={slide.src}
                  alt={slide.alt}
                  loading={i === 0 ? "eager" : "lazy"}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-out ${
                    i === activeSlide ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
              {/* Subtle bottom gradient for any caption overlay */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
              {/* Slide indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                {HERO_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveSlide(i)}
                    aria-label={`Show slide ${i + 1}`}
                    aria-current={i === activeSlide}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeSlide ? "w-6 bg-white" : "w-1.5 bg-white/55 hover:bg-white/75"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Stats band — glass card on cinematic Istanbul backdrop (mirrors hero theme)
function StatsBand() {
  const { t } = useLanguage();
  const stats = [
    { value: "120", suffix: "+", label: t("Verified Hotels") },
    { value: "8", suffix: "", label: t("Cities Across Turkey") },
    { value: "12,400", suffix: "+", label: t("Happy Guests") },
    { value: "4.8", suffix: "/5", label: t("Average Rating") },
  ];
  return (
    <section className="relative bg-white dark:bg-[#161616] py-10 md:py-14 border-y border-[#E6EAF0] dark:border-white/10">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        <div className="text-center mb-10 md:mb-12">
          <div className="font-['Inter:SemiBold',sans-serif] text-[11px] tracking-[0.24em] uppercase text-[#2F80ED] mb-3">
            {t("By the numbers")}
          </div>
          <h2 className="font-['Poppins:Bold',sans-serif] text-[28px] md:text-[36px] leading-[1.15] tracking-[-0.02em] text-[#0B1F3B]">
            {t("Trusted in practice.")}
          </h2>
        </div>

        {/* Centered stats row — flat, no card, hairline separators on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8">
          {stats.map((s, i) => (
            <div
              key={i}
              className={`text-center ${i > 0 ? "md:border-l md:border-[#E6EAF0]" : ""} md:px-4`}
            >
              <div className="flex items-baseline justify-center gap-0.5">
                <span className="font-['Poppins:Bold',sans-serif] text-[36px] md:text-[44px] leading-[1] tracking-[-0.025em] text-[#0B1F3B] count-pop">
                  {s.value}
                </span>
                {s.suffix && (
                  <span className="font-['Poppins:SemiBold',sans-serif] text-[18px] md:text-[22px] leading-none text-[#2F80ED]">
                    {s.suffix}
                  </span>
                )}
              </div>
              <div className="mt-2 md:mt-3 font-['Inter:Regular',sans-serif] text-[13px] md:text-[14px] text-[#6B7280] leading-[1.4]">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Trust Building Section
function TrustBuildingSection() {
  return <QualityAssuranceSection />;
}

// Verified Collection Section — replaces the old neighbourhoods slot
function CollectionSection() {
  return <VerifiedCollectionSection />;
}

// CTA Section — hero-glass slab on cinematic Kadiköy backdrop
function CTASection() {
  const { t } = useLanguage();
  return (
    <section className="relative bg-white dark:bg-[#161616] py-10 md:py-14 border-t border-[#E6EAF0] dark:border-white/10">
      <div className="max-w-[1080px] mx-auto px-4 md:px-10">
        {/* Solid navy CTA card — high contrast, conversion-focused */}
        <div className="rounded-2xl p-8 md:p-14 lg:p-16 text-center shadow-[0_8px_32px_rgba(11,31,59,0.18)]" style={{ background: "linear-gradient(135deg, #0B1F3B 0%, #112A52 100%)" }}>
          <h2 className="font-['Poppins:Bold',sans-serif] text-[28px] md:text-[40px] leading-[1.15] tracking-[-0.02em] text-white mb-4">
            {t("Ready to plan your stay in Turkey?")}
          </h2>
          <p className="font-['Inter:Regular',sans-serif] text-[15px] md:text-[16px] leading-[1.55] text-white/75 mb-8 max-w-[520px] mx-auto">
            {t("Choose from verified hotels — or request a tailored group offer.")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-3">
            <Link
              to="/listing"
              className="inline-flex items-center gap-2 h-[52px] px-7 rounded-xl bg-[#2F80ED] hover:bg-[#1E5FBC] text-white font-['Inter:SemiBold',sans-serif] text-[15px] transition-colors shadow-[0_4px_16px_rgba(47,128,237,0.3)]"
            >
              <Search className="w-[18px] h-[18px]" strokeWidth={2.4} />
              {t("Find Hotels")}
            </Link>
            <Link
              to="/groups"
              className="inline-flex items-center gap-2 h-[52px] px-7 rounded-xl border border-white/25 bg-white/5 hover:bg-white/10 hover:border-white/40 text-white font-['Inter:SemiBold',sans-serif] text-[15px] transition-colors"
            >
              {t("Request Group Offer")}
            </Link>
          </div>

          {/* Trust strip — short, comma-separated read */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 pt-6 border-t border-white/10">
            {[
              t("Free cancellation"),
              t("No hidden fees"),
              t("Local support 24/7"),
            ].map((label) => (
              <div key={label} className="flex items-center gap-1.5 text-white/75">
                <Check className="w-3.5 h-3.5 text-[#5DA0F8]" strokeWidth={2.6} />
                <span className="font-['Inter:Regular',sans-serif] text-[13px]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Main HomePage Component
export default function HomePage() {
  useScrollProgress();

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <div className="scroll-progress" aria-hidden />
      <Navigation />
      <HeroSection />
      {/* Funnel order — each section has a distinct job, no repetition:
          Hero (value prop) → Segmentation (entry points) → Top Stays (browse)
          → Why Us (differentiation) → Verified Collection (trust) → Stats (proof)
          → Quality Promise (risk reversal) → Final CTA (conversion). */}
      <RevealSection variant="up" className="section-shell">
        <SegmentationSection />
      </RevealSection>
      <RevealSection variant="up" className="section-shell">
        <FeaturedHotelsSection />
      </RevealSection>
      <RevealSection variant="up">
        <ValuePropositionSection />
      </RevealSection>
      <RevealSection variant="right" className="section-shell">
        <CollectionSection />
      </RevealSection>
      <RevealSection variant="pop" className="section-shell">
        <StatsBand />
      </RevealSection>
      <RevealSection variant="left" className="section-shell">
        <TrustBuildingSection />
      </RevealSection>
      <RevealSection variant="up" className="section-shell">
        <CTASection />
      </RevealSection>
      <Footer />
    </div>
  );
}
