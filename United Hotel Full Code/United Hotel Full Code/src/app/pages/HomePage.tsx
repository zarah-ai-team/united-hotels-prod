import { type CSSProperties, type ReactNode, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { ValuePropositionSection } from "../components/ValuePropositionSection";
import { FeaturedHotelsSection } from "../components/FeaturedHotelsSection";
import { QualityAssuranceSection } from "../components/QualityAssuranceSection";
import { VerifiedCollectionSection } from "../components/VerifiedCollectionSection";
import { SEOContentSection } from "../components/SEOContentSection";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { useScrollProgress } from "../hooks/useScrollProgress";
import { useParallax } from "../hooks/useParallax";
import { useLanguage } from "../context/LanguageContext";
import { useBooking } from "../context/BookingContext";
import imgKadikoy from "figma:asset/250023f532e568305b14dfb57c614f51c1fba582.png";
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
  HeartHandshake,
  ShieldCheck,
  HelpCircle,
  Wallet,
  CalendarClock,
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

// Refined Hero Section — slideshow + glass-morphism search
const HERO_SLIDES = [
  { src: heroFigma1, alt: "Cappadocia valley at sunrise", caption: "Cappadocia" },
  { src: heroFigma2, alt: "Cappadocia village at twilight", caption: "Göreme" },
  { src: heroFigma3, alt: "Hot air balloon above Cappadocia rock formations", caption: "Cappadocia" },
  { src: heroFigma4, alt: "Old town panorama over the river", caption: "Heritage" },
  { src: heroFigma5, alt: "Hot air balloons drifting over the valley at sunset", caption: "Anatolia" },
  { src: heroFigma6, alt: "Coastal city skyline at sunset", caption: "Bosphorus" },
  { src: heroFigma7, alt: "Aerial view of the Golden Horn", caption: "Istanbul" },
];
const SLIDE_INTERVAL_MS = 6000;

function HeroSection() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { setDates, setGuests } = useBooking();
  const [activeSlide, setActiveSlide] = useState(0);
  // Modest parallax speed — the slideshow wrapper has a vertical buffer below,
  // so this stays well within the safe window and never exposes empty space.
  const heroParallax = useParallax<HTMLDivElement>(60);
  const heroTextParallax = useParallax<HTMLDivElement>(-30);
  const [searchData, setSearchData] = useState({
    destination: "",
    checkIn: "",
    checkOut: "",
    guests: "",
  });

  // Auto-advance slideshow every 5s
  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Persist the search to BookingContext so the listing + detail pages can
    // pre-fill from it, and mirror to URL params so a refresh / shared link
    // keeps the selection. Without this every downstream page reset to
    // today/tomorrow regardless of what the guest picked here.
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

  return (
    <div
      id="home"
      className="relative -mt-16 md:-mt-[68px] h-[88svh] min-h-[540px] md:h-[100svh] md:min-h-[600px] overflow-hidden"
    >
      {/* Slideshow — wrapper extends 160px above and below the hero so the
          parallax translation never reveals empty space. The hero container
          itself has overflow-hidden, so the buffer is invisibly clipped. */}
      <div
        ref={heroParallax}
        className="absolute left-0 right-0 -top-40 -bottom-40 parallax"
      >
        {HERO_SLIDES.map((slide, i) => (
          <div
            key={i}
            className={`hero-slide ${i === activeSlide ? "is-active" : ""}`}
            aria-hidden={i !== activeSlide}
          >
            <img src={slide.src} alt={slide.alt} loading={i === 0 ? "eager" : "lazy"} />
          </div>
        ))}
      </div>

      {/* Vignette stays pinned to the visible hero (no parallax) so the
          dark-to-light gradient lands where the search form actually sits. */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="hero-vignette" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col">
        {/* Centered Hero Text — minimal */}
        <div className="flex-1 flex items-center justify-center px-4 md:px-10 pt-16 md:pt-8">
          <div ref={heroTextParallax} className="text-center max-w-[820px] parallax">
            <span className="inline-flex items-center gap-1.5 md:gap-2 mb-2 md:mb-4 px-2.5 md:px-3 py-0.5 md:py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-[10px] md:text-[12px] tracking-[0.16em] md:tracking-[0.18em] uppercase font-['Inter:Medium',sans-serif] animate-in fade-in slide-in-from-bottom-2 duration-700">
              <span className="w-1 h-1 rounded-full bg-white/80" />
              {HERO_SLIDES[activeSlide].caption}, {t("Turkey")}
            </span>
            <h1 className="font-['Poppins:Bold',sans-serif] text-[26px] md:text-[54px] leading-[32px] md:leading-[62px] text-white mb-2 md:mb-4 tracking-[-0.01em] animate-in fade-in slide-in-from-bottom-3 duration-700">
              {t("Stay Smart. Stay United.")}
            </h1>
            <p className="font-['Inter:Regular',sans-serif] text-[12.5px] md:text-[17px] leading-[18px] md:leading-[26px] text-white/80 max-w-[440px] md:max-w-[620px] mx-auto animate-in fade-in slide-in-from-bottom-3 duration-700 delay-100">
              {t(
                "Handpicked stays in Turkey's most loved neighborhoods. Verified, transparent, and quietly excellent.",
              )}
            </p>
          </div>
        </div>

        {/* Glass Search Container */}
        <div className="px-4 md:px-10 pb-4 md:pb-10">
          <div className="max-w-[1280px] mx-auto">
            <form
              onSubmit={handleSearch}
              className="hero-glass p-3 md:p-6 lg:p-7 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200"
            >
              {/* Desktop layout */}
              <div className="hidden md:grid grid-cols-[1.4fr_1fr_1fr_1fr_auto] gap-3 lg:gap-4 items-end">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="destination" className="hero-glass-label font-['Inter:Medium',sans-serif] text-[12px] tracking-wider uppercase">
                    {t("Destination")}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-current opacity-60 pointer-events-none" />
                    <input
                      id="destination"
                      type="text"
                      placeholder={t("Where to?")}
                      value={searchData.destination}
                      onChange={(e) => setSearchData({ ...searchData, destination: e.target.value })}
                      className="w-full h-[48px] pl-10 pr-4 rounded-xl font-['Inter:Regular',sans-serif] text-[15px]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="checkIn" className="hero-glass-label font-['Inter:Medium',sans-serif] text-[12px] tracking-wider uppercase">
                    {t("Check-in")}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-current opacity-60 pointer-events-none" />
                    <input
                      id="checkIn"
                      type="date"
                      value={searchData.checkIn}
                      onChange={(e) => setSearchData({ ...searchData, checkIn: e.target.value })}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full h-[48px] pl-10 pr-3 rounded-xl font-['Inter:Regular',sans-serif] text-[15px]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="checkOut" className="hero-glass-label font-['Inter:Medium',sans-serif] text-[12px] tracking-wider uppercase">
                    {t("Check-out")}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-current opacity-60 pointer-events-none" />
                    <input
                      id="checkOut"
                      type="date"
                      value={searchData.checkOut}
                      onChange={(e) => setSearchData({ ...searchData, checkOut: e.target.value })}
                      min={searchData.checkIn || new Date().toISOString().split("T")[0]}
                      className="w-full h-[48px] pl-10 pr-3 rounded-xl font-['Inter:Regular',sans-serif] text-[15px]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="guests" className="hero-glass-label font-['Inter:Medium',sans-serif] text-[12px] tracking-wider uppercase">
                    {t("Guests")}
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-current opacity-60 pointer-events-none" />
                    <select
                      id="guests"
                      value={searchData.guests}
                      onChange={(e) => setSearchData({ ...searchData, guests: e.target.value })}
                      className="w-full h-[48px] pl-10 pr-9 rounded-xl font-['Inter:Regular',sans-serif] text-[15px] appearance-none"
                    >
                      <option value="">{t("Add guests")}</option>
                      <option value="1">{t("1 guest")}</option>
                      <option value="2">{t("2 guests")}</option>
                      <option value="3">{t("3 guests")}</option>
                      <option value="4">{t("4+ guests")}</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-current opacity-60 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="hero-cta-btn h-[48px] px-6 rounded-xl font-['Inter:SemiBold',sans-serif] text-[15px] flex items-center justify-center gap-2 shrink-0"
                >
                  <Search className="w-4 h-4" strokeWidth={2.4} />
                  {t("Search")}
                </button>
              </div>

              {/* Mobile layout */}
              <div className="md:hidden flex flex-col gap-2">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-current opacity-60" strokeWidth={2} />
                  <input
                    id="destination-mobile"
                    type="text"
                    value={searchData.destination}
                    onChange={(e) => setSearchData({ ...searchData, destination: e.target.value })}
                    placeholder={t("Where are you going?")}
                    className="w-full h-[42px] pl-9 pr-3 rounded-lg font-['Inter:Regular',sans-serif] text-[13.5px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-current opacity-60" />
                    <input
                      id="checkIn-mobile"
                      type="date"
                      value={searchData.checkIn}
                      onChange={(e) => setSearchData({ ...searchData, checkIn: e.target.value })}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full h-[42px] pl-8 pr-1.5 rounded-lg text-[12.5px] font-['Inter:Regular',sans-serif]"
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-current opacity-60" />
                    <input
                      id="checkOut-mobile"
                      type="date"
                      value={searchData.checkOut}
                      onChange={(e) => setSearchData({ ...searchData, checkOut: e.target.value })}
                      min={searchData.checkIn || new Date().toISOString().split("T")[0]}
                      className="w-full h-[42px] pl-8 pr-1.5 rounded-lg text-[12.5px] font-['Inter:Regular',sans-serif]"
                    />
                  </div>
                </div>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-current opacity-60" strokeWidth={2} />
                  <select
                    id="guests-mobile"
                    value={searchData.guests}
                    onChange={(e) => setSearchData({ ...searchData, guests: e.target.value })}
                    className="w-full h-[42px] pl-9 pr-9 rounded-lg text-[13.5px] font-['Inter:Regular',sans-serif] appearance-none"
                  >
                    <option value="">{t("Add guests")}</option>
                    <option value="1">{t("1 guest")}</option>
                    <option value="2">{t("2 guests")}</option>
                    <option value="3">{t("3 guests")}</option>
                    <option value="4">{t("4+ guests")}</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-current opacity-60 pointer-events-none" />
                </div>
                <button
                  type="submit"
                  className="hero-cta-btn w-full h-[44px] rounded-lg font-['Inter:SemiBold',sans-serif] text-[13.5px] flex items-center justify-center gap-1.5 mt-0.5"
                >
                  <Search className="w-4 h-4" strokeWidth={2.4} />
                  {t("Search Hotels")}
                </button>
              </div>
            </form>

            {/* Slide indicators */}
            <div className="flex items-center justify-center gap-2 mt-3 md:mt-5">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveSlide(i)}
                  className={`hero-dot ${i === activeSlide ? "is-active" : ""}`}
                  aria-label={`Show slide ${i + 1}`}
                  aria-current={i === activeSlide}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stats band — glass card on cinematic Istanbul backdrop (mirrors hero theme)
function StatsBand() {
  const { t } = useLanguage();
  const stats = [
    { value: "120", suffix: "+", label: t("Verified hotels") },
    { value: "8", suffix: "", label: t("Turkish cities") },
    { value: "12,400", suffix: "+", label: t("Happy guests") },
    { value: "4.8", suffix: "/5", label: t("Average rating") },
  ];
  return (
    <section className="relative py-10 md:py-32 overflow-hidden">
      {/* Cinematic backdrop — same image language as the hero */}
      <div className="absolute inset-0">
        <img
          src={heroFigma6}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover scale-[1.04]"
        />
        {/* Layered vignette + warm gradient for legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(8,12,16,0.55) 0%, rgba(8,12,16,0.45) 40%, rgba(8,12,16,0.7) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0) 35%, rgba(0,0,0,0.45) 100%)",
          }}
        />
        {/* Aurora tint to echo hero */}
        <div className="absolute inset-0 hero-aurora opacity-40 pointer-events-none" />
      </div>

      <div className="relative max-w-[1280px] mx-auto px-4 md:px-10">
        <div className="hero-glass rounded-[24px] p-7 md:p-12 lg:p-14">
          {/* Editorial header */}
          <div className="grid md:grid-cols-[1.1fr_1fr] gap-6 md:gap-16 items-end mb-10 md:mb-14">
            <div>
              <div className="font-['Inter:Medium',sans-serif] text-[11px] tracking-[0.28em] uppercase text-white/70 mb-4">
                {t("By the numbers")}
              </div>
              <h2 className="font-['Poppins:Bold',sans-serif] text-[30px] md:text-[46px] leading-[1.08] tracking-[-0.022em] text-white">
                {t("A focused team. Real outcomes.")}
              </h2>
            </div>
            <p className="font-['Inter:Regular',sans-serif] text-[14.5px] md:text-[16px] leading-[1.65] text-white/80 max-w-[460px] md:justify-self-end">
              {t("We measure ourselves on the things travellers actually care about — quality, transparency, and a real human at the other end of the line.")}
            </p>
          </div>

          {/* Stats row — hairline-separated columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-t border-white/15">
            {stats.map((s, i) => (
              <div
                key={i}
                className={`relative py-7 md:py-9 ${
                  i > 0 ? "md:border-l border-white/15" : ""
                } ${i === 1 ? "border-l border-white/15 md:border-l" : ""} ${
                  i >= 2 ? "border-t md:border-t-0 border-white/15" : ""
                } md:px-5`}
              >
                <div className="flex items-baseline gap-0.5 md:gap-1">
                  <span className="font-['Poppins:Bold',sans-serif] text-[40px] md:text-[58px] leading-[0.95] tracking-[-0.035em] text-white count-pop">
                    {s.value}
                  </span>
                  {s.suffix && (
                    <span className="font-['Poppins:Medium',sans-serif] text-[18px] md:text-[24px] leading-none text-[#1abc9c]">
                      {s.suffix}
                    </span>
                  )}
                </div>
                <div className="mt-3 md:mt-4 font-['Inter:Regular',sans-serif] text-[12.5px] md:text-[14px] text-white/75 leading-[1.4]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
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

// FAQ Section — glass-section-bg + glass-card items
function FAQSection() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      icon: Wallet,
      question: "What is the average price of hotels in Turkey?",
      answer:
        "Our hotels in Turkey range from $32 to $75 per night, with most properties averaging around $45-50 per night. Prices vary by neighbourhood and season.",
    },
    {
      icon: ShieldCheck,
      question: "Are hotels in Turkey safe?",
      answer:
        "Yes, all hotels on our platform are personally inspected by our local team. We verify security measures, location safety, and guest reviews before listing any property.",
    },
    {
      icon: CalendarClock,
      question: "When is the best time to visit Turkey?",
      answer:
        "April–May and September–October offer the best weather and moderate prices. Winter (November–March) offers the lowest rates but cooler weather.",
    },
  ];

  return (
    <section id="faqs" className="relative glass-section-bg py-10 md:py-32 overflow-hidden">
      <div className="relative max-w-[860px] mx-auto px-4 md:px-10">
        {/* Editorial header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="font-['Inter:Medium',sans-serif] text-[11px] tracking-[0.28em] uppercase text-[#8c8c8c] mb-4 inline-flex items-center gap-2 justify-center">
            <HelpCircle className="w-3.5 h-3.5" strokeWidth={2} />
            {t("Got questions?")}
          </div>
          <h2 className="font-['Poppins:Bold',sans-serif] text-[32px] md:text-[48px] leading-[1.08] tracking-[-0.022em] text-[#3b3b3b] mb-4">
            {t("Frequently asked questions.")}
          </h2>
          <p className="font-['Inter:Regular',sans-serif] text-[15px] md:text-[16px] leading-[1.6] text-[#6b7280] max-w-[560px] mx-auto">
            {t("Everything you need to know about hotels in Turkey.")}
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3 md:space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`group glass-card rounded-2xl overflow-hidden transition-all duration-300 ${
                  !isOpen ? "is-interactive" : ""
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-5 md:px-6 py-5 flex items-center gap-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span
                    className={`shrink-0 w-11 h-11 rounded-xl bg-white/70 dark:bg-white/[0.06] border border-[#1abc9c]/15 text-[#1abc9c] flex items-center justify-center transition-colors duration-300 ${
                      isOpen ? "bg-[#1abc9c] text-white border-[#1abc9c]" : ""
                    }`}
                  >
                    <faq.icon className="w-[20px] h-[20px]" strokeWidth={1.75} />
                  </span>
                  <span className="flex-1 font-['Poppins:SemiBold',sans-serif] text-[15px] md:text-[17px] tracking-[-0.01em] text-[#3b3b3b] leading-snug">
                    {t(faq.question)}
                  </span>
                  <ChevronDown
                    className={`shrink-0 w-5 h-5 text-[#1abc9c] transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 md:px-6 pb-5 pl-[76px] md:pl-[76px]">
                      <div className="h-px w-full mb-4 bg-[#1abc9c]/30" />
                      <p className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[15px] text-[#6b7280] leading-[1.6]">
                        {t(faq.answer)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Help CTA card — glass slab with brand accent */}
        <div className="mt-10 md:mt-14 relative overflow-hidden glass-card rounded-2xl p-6 md:p-8 text-center">
          <div className="absolute inset-y-0 left-0 w-1 bg-[#1abc9c]" />
          <div className="relative pl-3 md:pl-4">
            <div className="font-['Inter:Medium',sans-serif] text-[11px] tracking-[0.28em] uppercase text-[#8c8c8c] mb-2">
              {t("Still have questions?")}
            </div>
            <h3 className="font-['Poppins:SemiBold',sans-serif] text-[20px] md:text-[22px] tracking-[-0.01em] text-[#3b3b3b] mb-3">
              {t("Our local team replies within minutes — any time, any day.")}
            </h3>
            <Link
              to="/support"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1abc9c] text-white font-['Inter:SemiBold',sans-serif] text-[14px] md:text-[15px] hover:bg-[#16a085] transition-colors"
            >
              <HeartHandshake className="w-4 h-4" />
              {t("Talk to us")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// CTA Section — hero-glass slab on cinematic Kadiköy backdrop
function CTASection() {
  const { t } = useLanguage();
  return (
    <section className="relative py-10 md:py-32 overflow-hidden">
      {/* Cinematic backdrop */}
      <div className="absolute inset-0">
        <img
          src={imgKadikoy}
          alt=""
          aria-hidden
          className="w-full h-full object-cover scale-[1.04]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(8,12,16,0.72) 0%, rgba(8,12,16,0.55) 40%, rgba(8,12,16,0.82) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0) 30%, rgba(0,0,0,0.5) 100%)",
          }}
        />
        <div className="absolute inset-0 hero-aurora opacity-45 pointer-events-none" />
      </div>

      <div className="relative max-w-[1080px] mx-auto px-4 md:px-10">
        <div className="hero-glass rounded-[24px] p-8 md:p-14 lg:p-16 text-center">
          <div className="font-['Inter:Medium',sans-serif] text-[11px] tracking-[0.28em] uppercase text-white/70 mb-4">
            {t("Plan your stay")}
          </div>
          <h2 className="font-['Poppins:Bold',sans-serif] text-[32px] md:text-[52px] leading-[1.08] tracking-[-0.022em] text-white mb-5">
            {t("Ready to book your Turkey stay?")}
          </h2>
          <p className="font-['Inter:Regular',sans-serif] text-[15px] md:text-[17px] leading-[1.65] text-white/80 mb-9 max-w-[560px] mx-auto">
            {t("Join thousands of travellers who skipped the OTAs, booked direct, and got a real human on the line when it mattered.")}
          </p>

          <Link
            to="/listing"
            className="hero-cta-btn inline-flex items-center gap-3 px-8 md:px-10 py-4 md:py-[18px] rounded-xl font-['Inter:SemiBold',sans-serif] text-[15px] md:text-[16px]"
          >
            <Search className="w-[18px] h-[18px]" strokeWidth={2.4} />
            {t("Find hotels in Turkey")}
          </Link>

          {/* Trust strip */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-10 mt-10 md:mt-12 pt-8 border-t border-white/15">
            {[
              t("Free cancellation"),
              t("No hidden fees"),
              t("Local support 24/7"),
            ].map((label) => (
              <div key={label} className="flex items-center gap-2 text-white/85">
                <Check className="w-4 h-4 text-[#1abc9c]" strokeWidth={2.4} />
                <span className="font-['Inter:Regular',sans-serif] text-[14px]">{label}</span>
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
      <RevealSection variant="up">
        <ValuePropositionSection />
      </RevealSection>
      <RevealSection variant="pop" className="section-shell">
        <StatsBand />
      </RevealSection>
      <RevealSection variant="up" className="section-shell">
        <FeaturedHotelsSection />
      </RevealSection>
      <RevealSection variant="left" className="section-shell">
        <TrustBuildingSection />
      </RevealSection>
      <RevealSection variant="right" className="section-shell">
        <CollectionSection />
      </RevealSection>
      <RevealSection variant="up" className="section-shell">
        <SEOContentSection />
      </RevealSection>
      <RevealSection variant="pop" className="section-shell">
        <FAQSection />
      </RevealSection>
      <RevealSection variant="up" className="section-shell">
        <CTASection />
      </RevealSection>
      <Footer />
    </div>
  );
}
