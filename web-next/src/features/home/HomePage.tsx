import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Link, useNavigate } from "react-router";
import { Navigation } from "@/shared/components/Navigation";
import { Footer } from "@/shared/components/Footer";
import { ValuePropositionSection } from "@/features/home/components/ValuePropositionSection";
import { FeaturedHotelsSection } from "@/features/home/components/FeaturedHotelsSection";
import { QualityAssuranceSection } from "@/features/home/components/QualityAssuranceSection";
import { VerifiedCollectionSection } from "@/features/home/components/VerifiedCollectionSection";
import { SegmentationSection } from "@/features/home/components/SegmentationSection";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import { useScrollProgress } from "@/shared/hooks/useScrollProgress";
import { useSEO, organizationLd, websiteLd, localBusinessLd } from "@/shared/hooks/useSEO";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useBooking } from "@/shared/context/BookingContext";
const heroFigma1 = "/assets/hero-figma-1.webp";
const heroFigma2 = "/assets/hero-figma-2.webp";
const heroFigma3 = "/assets/hero-figma-3.webp";
const heroFigma4 = "/assets/hero-figma-4.webp";
const heroFigma5 = "/assets/hero-figma-5.webp";
const heroFigma6 = "/assets/hero-figma-6.webp";
const heroFigma7 = "/assets/hero-figma-7.webp";
import {
  MapPin,
  Calendar,
  Users,
  Search,
  Check,
  ChevronDown,
  Plus,
  Minus,
  AlertCircle,
} from "lucide-react";

// Cities / districts (states) we currently serve. Drives the destination
// dropdown in the hero search. Keep label = what the user sees, value = what
// we send as the `destination` query param to /listing.
type ServingDestination = { value: string; city: string; state: string };
const SERVING_DESTINATIONS: ServingDestination[] = [
  { value: "Sultanahmet, Istanbul", city: "Sultanahmet", state: "Istanbul" },
  { value: "Beyoğlu, Istanbul", city: "Beyoğlu", state: "Istanbul" },
  { value: "Galata, Istanbul", city: "Galata", state: "Istanbul" },
  { value: "Karaköy, Istanbul", city: "Karaköy", state: "Istanbul" },
  { value: "Pera, Istanbul", city: "Pera", state: "Istanbul" },
  { value: "Sirkeci, Istanbul", city: "Sirkeci", state: "Istanbul" },
  { value: "Fatih, Istanbul", city: "Fatih", state: "Istanbul" },
];

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

function GuestRow({
  label,
  sublabel,
  value,
  min,
  onDec,
  onInc,
}: {
  label: string;
  sublabel: string;
  value: number;
  min: number;
  onDec: () => void;
  onInc: () => void;
}) {
  const decDisabled = value <= min;
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <span className="font-['Inter:SemiBold',sans-serif] text-[14px] text-[#0B1F3B] dark:text-white">
          {label}
        </span>
        <span className="text-[12px] text-[#6B7280] dark:text-white/60">{sublabel}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onDec}
          disabled={decDisabled}
          aria-label={`Decrease ${label}`}
          className="w-8 h-8 rounded-full border border-[#E6EAF0] dark:border-white/15 flex items-center justify-center text-[#0B1F3B] dark:text-white hover:border-[#2F80ED] hover:text-[#2F80ED] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Minus className="w-3.5 h-3.5" strokeWidth={2.4} />
        </button>
        <span className="w-6 text-center font-['Inter:SemiBold',sans-serif] text-[14px] text-[#0B1F3B] dark:text-white">
          {value}
        </span>
        <button
          type="button"
          onClick={onInc}
          aria-label={`Increase ${label}`}
          className="w-8 h-8 rounded-full border border-[#E6EAF0] dark:border-white/15 flex items-center justify-center text-[#0B1F3B] dark:text-white hover:border-[#2F80ED] hover:text-[#2F80ED] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}

function HeroSection() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { setDates, setGuests, setOccupancy, setRoomCount } = useBooking();
  const [activeSlide, setActiveSlide] = useState(0);
  // Only the slides the user has actually reached are allowed to load. Without
  // this every hero image fetches on first paint (they're all stacked
  // `absolute inset-0`, so `loading="lazy"` never applies) — ~2.7MB up front.
  // Slide 0 loads immediately (priority); later slides load as the carousel
  // advances, by which point the page is interactive.
  const [maxRevealed, setMaxRevealed] = useState(0);
  const [searchData, setSearchData] = useState({
    destination: "",
    checkIn: "",
    checkOut: "",
    adults: 2,
    children: 0,
    rooms: 1,
  });
  const [guestsOpen, setGuestsOpen] = useState(false);
  const guestsRef = useRef<HTMLDivElement | null>(null);
  // Field-level validation errors surfaced under each input on submit.
  // Cleared per-field as the user edits to avoid stale red after a fix.
  const [errors, setErrors] = useState<{
    destination?: string;
    checkIn?: string;
    checkOut?: string;
  }>({});

  // Auto-advance hero imagery
  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  // Reveal (i.e. allow loading of) each slide once it becomes active. Tracks a
  // high-water mark so already-seen slides stay loaded when the loop wraps.
  useEffect(() => {
    setMaxRevealed((m) => (activeSlide > m ? activeSlide : m));
  }, [activeSlide]);

  // Close the guests popover when clicking outside or hitting Escape
  useEffect(() => {
    if (!guestsOpen) return;
    const onDown = (e: MouseEvent) => {
      if (guestsRef.current && !guestsRef.current.contains(e.target as Node)) {
        setGuestsOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setGuestsOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [guestsOpen]);

  const totalGuests = searchData.adults + searchData.children;
  const guestsBase =
    searchData.children > 0
      ? `${searchData.adults} ${searchData.adults === 1 ? t("adult") : t("adults")} · ${searchData.children} ${
          searchData.children === 1 ? t("child") : t("children")
        }`
      : `${searchData.adults} ${searchData.adults === 1 ? t("adult") : t("adults")}`;
  const guestsLabel = `${guestsBase} · ${searchData.rooms} ${
    searchData.rooms === 1 ? t("room") : t("rooms")
  }`;

  const today = new Date().toISOString().split("T")[0];

  const validate = () => {
    const e: typeof errors = {};
    if (!searchData.destination) {
      e.destination = t("Please select a destination.");
    }
    if (!searchData.checkIn) {
      e.checkIn = t("Please choose a check-in date.");
    } else if (searchData.checkIn < today) {
      e.checkIn = t("Check-in cannot be in the past.");
    }
    if (!searchData.checkOut) {
      e.checkOut = t("Please choose a check-out date.");
    } else if (searchData.checkIn && searchData.checkOut <= searchData.checkIn) {
      e.checkOut = t("Check-out must be after check-in.");
    }
    return e;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) {
      // Move focus to the first failing field so keyboard users land on it.
      const firstKey = Object.keys(v)[0];
      const el = document.getElementById(firstKey);
      if (el && typeof (el as HTMLElement).focus === "function") {
        (el as HTMLElement).focus();
      }
      return;
    }
    setDates(searchData.checkIn, searchData.checkOut);
    if (totalGuests > 0) {
      setGuests(totalGuests);
      setOccupancy(searchData.adults, searchData.children);
    }
    setRoomCount(searchData.rooms);
    const params = new URLSearchParams();
    params.set("destination", searchData.destination);
    params.set("checkIn", searchData.checkIn);
    params.set("checkOut", searchData.checkOut);
    params.set("adults", String(searchData.adults));
    if (searchData.children) params.set("children", String(searchData.children));
    params.set("guests", String(totalGuests));
    params.set("rooms", String(searchData.rooms));
    navigate(`/listing?${params.toString()}`);
  };

  const adjustAdults = (delta: number) =>
    setSearchData((prev) => ({
      ...prev,
      adults: Math.max(1, Math.min(10, prev.adults + delta)),
    }));
  const adjustChildren = (delta: number) =>
    setSearchData((prev) => ({
      ...prev,
      children: Math.max(0, Math.min(10, prev.children + delta)),
    }));
  const adjustRooms = (delta: number) =>
    setSearchData((prev) => ({
      ...prev,
      rooms: Math.max(1, Math.min(10, prev.rooms + delta)),
    }));

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
                {/* Destination — dropdown of cities/states we currently serve */}
                <div className="sm:col-span-2">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                    <select
                      id="destination"
                      value={searchData.destination}
                      onChange={(e) => {
                        setSearchData({ ...searchData, destination: e.target.value });
                        if (errors.destination) setErrors((p) => ({ ...p, destination: undefined }));
                      }}
                      aria-label={t("Where to?")}
                      aria-invalid={!!errors.destination}
                      aria-describedby={errors.destination ? "destination-error" : undefined}
                      className={`w-full h-[44px] pl-10 pr-9 rounded-xl bg-white border border-[#E6EAF0] dark:bg-[#161616] dark:border-white/10 text-[#111827] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#2F80ED]/15 font-['Inter:Regular',sans-serif] text-[14px] appearance-none transition-colors ${
                        errors.destination
                          ? "!border-[#DC2626] focus:!border-[#DC2626] focus:!ring-[#DC2626]/15"
                          : ""
                      }`}
                    >
                      <option value="">{t("Where to?")}</option>
                      {SERVING_DESTINATIONS.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.city}, {d.state}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                  </div>
                  {errors.destination && (
                    <p
                      id="destination-error"
                      role="alert"
                      className="mt-1.5 flex items-center gap-1.5 font-['Inter:Regular',sans-serif] text-[12px] leading-[1.3] text-[#DC2626]"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={2.4} aria-hidden="true" />
                      <span>{errors.destination}</span>
                    </p>
                  )}
                </div>

                {/* Check-in */}
                <div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                    <input
                      id="checkIn"
                      type="date"
                      value={searchData.checkIn}
                      onChange={(e) => {
                        const next = e.target.value;
                        setSearchData((prev) => ({
                          ...prev,
                          checkIn: next,
                          // If a previously-chosen checkOut is now <= new checkIn, clear it.
                          checkOut: prev.checkOut && next && prev.checkOut <= next ? "" : prev.checkOut,
                        }));
                        if (errors.checkIn || errors.checkOut) {
                          setErrors((p) => ({ ...p, checkIn: undefined, checkOut: undefined }));
                        }
                      }}
                      min={today}
                      aria-label={t("Check-in")}
                      aria-invalid={!!errors.checkIn}
                      aria-describedby={errors.checkIn ? "checkIn-error" : undefined}
                      className={`w-full h-[44px] pl-10 pr-3 rounded-xl bg-white border border-[#E6EAF0] dark:bg-[#161616] dark:border-white/10 text-[#111827] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#2F80ED]/15 font-['Inter:Regular',sans-serif] text-[14px] transition-colors ${
                        errors.checkIn
                          ? "!border-[#DC2626] focus:!border-[#DC2626] focus:!ring-[#DC2626]/15"
                          : ""
                      }`}
                    />
                  </div>
                  {errors.checkIn && (
                    <p
                      id="checkIn-error"
                      role="alert"
                      className="mt-1.5 flex items-center gap-1.5 font-['Inter:Regular',sans-serif] text-[12px] leading-[1.3] text-[#DC2626]"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={2.4} aria-hidden="true" />
                      <span>{errors.checkIn}</span>
                    </p>
                  )}
                </div>

                {/* Check-out */}
                <div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                    <input
                      id="checkOut"
                      type="date"
                      value={searchData.checkOut}
                      onChange={(e) => {
                        setSearchData({ ...searchData, checkOut: e.target.value });
                        if (errors.checkOut) setErrors((p) => ({ ...p, checkOut: undefined }));
                      }}
                      min={searchData.checkIn || today}
                      aria-label={t("Check-out")}
                      aria-invalid={!!errors.checkOut}
                      aria-describedby={errors.checkOut ? "checkOut-error" : undefined}
                      className={`w-full h-[44px] pl-10 pr-3 rounded-xl bg-white border border-[#E6EAF0] dark:bg-[#161616] dark:border-white/10 text-[#111827] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#2F80ED]/15 font-['Inter:Regular',sans-serif] text-[14px] transition-colors ${
                        errors.checkOut
                          ? "!border-[#DC2626] focus:!border-[#DC2626] focus:!ring-[#DC2626]/15"
                          : ""
                      }`}
                    />
                  </div>
                  {errors.checkOut && (
                    <p
                      id="checkOut-error"
                      role="alert"
                      className="mt-1.5 flex items-center gap-1.5 font-['Inter:Regular',sans-serif] text-[12px] leading-[1.3] text-[#DC2626]"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={2.4} aria-hidden="true" />
                      <span>{errors.checkOut}</span>
                    </p>
                  )}
                </div>

                {/* Guests (adults + children) + Search button row */}
                <div className="relative sm:col-span-2 grid grid-cols-[1fr_auto] gap-2">
                  <div className="relative" ref={guestsRef}>
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setGuestsOpen((v) => !v)}
                      aria-haspopup="dialog"
                      aria-expanded={guestsOpen}
                      aria-label={t("Guests")}
                      className="w-full h-[44px] pl-10 pr-9 rounded-xl bg-white border border-[#E6EAF0] dark:bg-[#161616] dark:border-white/10 text-[#111827] dark:text-white focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#2F80ED]/15 font-['Inter:Regular',sans-serif] text-[14px] text-left transition-colors"
                    >
                      {guestsLabel}
                    </button>
                    <ChevronDown
                      className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none transition-transform ${
                        guestsOpen ? "rotate-180" : ""
                      }`}
                    />
                    {guestsOpen && (
                      <div
                        role="dialog"
                        aria-label={t("Select number of guests")}
                        className="absolute z-30 mt-2 left-0 right-0 sm:right-auto sm:w-[320px] rounded-2xl bg-white dark:bg-[#1f2937] border border-[#E6EAF0] dark:border-white/10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.25)] p-4 space-y-3"
                      >
                        <GuestRow
                          label={t("Adults")}
                          sublabel={t("Ages 13 or above")}
                          value={searchData.adults}
                          min={1}
                          onDec={() => adjustAdults(-1)}
                          onInc={() => adjustAdults(1)}
                        />
                        <GuestRow
                          label={t("Children")}
                          sublabel={t("Ages 0–12")}
                          value={searchData.children}
                          min={0}
                          onDec={() => adjustChildren(-1)}
                          onInc={() => adjustChildren(1)}
                        />
                        <GuestRow
                          label={t("Rooms")}
                          sublabel={t("Number of rooms")}
                          value={searchData.rooms}
                          min={1}
                          onDec={() => adjustRooms(-1)}
                          onInc={() => adjustRooms(1)}
                        />
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => setGuestsOpen(false)}
                            className="text-[13px] font-['Inter:SemiBold',sans-serif] text-[#2F80ED] hover:text-[#1E5FBC] px-3 py-1.5 rounded-lg"
                          >
                            {t("Done")}
                          </button>
                        </div>
                      </div>
                    )}
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
                <div
                  key={i}
                  aria-hidden={i !== activeSlide}
                  className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${
                    i === activeSlide ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {/* Gated: a slide only mounts (and thus loads) once revealed.
                      Slide 0 is the LCP image — priority preloads it and marks
                      it fetchpriority=high. next/image serves a phone-sized
                      AVIF instead of the full ~260KB+ WebP. */}
                  {i <= maxRevealed && (
                    <Image
                      src={slide.src}
                      alt={slide.alt}
                      fill
                      priority={i === 0}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  )}
                </div>
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
  useSEO({
    title: 'Book United Hotels | Trusted hotel stays across Turkey',
    // Kept ≤160 chars (was 176) so search engines show it in full — see the
    // SEO audit's "reduce meta description length" recommendation.
    description:
      'Verified hotels across Istanbul & Turkey at direct rates — transparent pricing and real local support, for individual travellers and groups. Book online.',
    canonical: '/',
    ogType: 'website',
    jsonLd: [
      organizationLd(),
      websiteLd(),
      localBusinessLd({
        address: {
          streetAddress: 'Beyoğlu, İstiklal Caddesi No: 123',
          addressLocality: 'Istanbul',
          postalCode: '34433',
          addressCountry: 'TR',
        },
        telephone: '+90 555 123 45 67',
        priceRange: '$$',
        openingHours: ['Mo-Su 09:00-22:00'],
      }),
    ],
  });

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
