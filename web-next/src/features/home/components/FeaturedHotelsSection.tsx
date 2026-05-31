import { useEffect, useState, type ComponentType, type SVGProps } from "react";
import { Link } from "react-router";
import {
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Wifi,
  Coffee,
  Dog,
  Baby,
  Wind,
  ParkingCircle,
  Waves,
  Sparkles as SparklesIcon,
  Building2,
} from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { HotelGridLoader } from "@/shared/components/HotelLoadingState";
import { hotelService, type PublicHotel } from "@/shared/api/services";
import { useHorizontalScroll } from "@/shared/hooks/useHorizontalScroll";
import { extractAmenityNames } from "@/shared/lib/amenities";
import { pickHotelImage, makeImageFallback } from "@/shared/lib/hotelImages";

type IconCmp = ComponentType<SVGProps<SVGSVGElement>>;
type FeatureChip = { Icon: IconCmp; label: string };

type CardHotel = {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  directPrice: number;
  basePrice: number | null;
  discountPercent: number;
  savings: number;
  image: string;
  starClass: number;
  totalRooms: number | null;
  features: FeatureChip[];
};

// Derive 3 visual feature chips from policy fields, amenity strings, and description.
// Order is by priority: amenity-driven > policy-driven > universal default
const deriveFeatures = (hotel: PublicHotel): FeatureChip[] => {
  const amenityStrings = extractAmenityNames((hotel as any).amenities).map((s) => s.toLowerCase());
  const description = String(hotel.description || hotel.hotel_description || "").toLowerCase();
  const haystack = amenityStrings.join(" ") + " " + description;

  const candidates: FeatureChip[] = [];
  const seen = new Set<string>();
  const push = (key: string, chip: FeatureChip) => {
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push(chip);
  };

  // Universal-ish — most hotels have wifi
  if (/wi-?fi|wireless|internet/.test(haystack) || candidates.length === 0) {
    push("wifi", { Icon: Wifi, label: "Free Wi-Fi" });
  }
  if (/breakfast/.test(haystack)) push("breakfast", { Icon: Coffee, label: "Breakfast" });
  if (/pool|swim/.test(haystack)) push("pool", { Icon: Waves, label: "Pool" });
  if (/park/.test(haystack)) push("parking", { Icon: ParkingCircle, label: "Parking" });
  if (/air ?cond|a\/c|climate/.test(haystack)) push("ac", { Icon: Wind, label: "Air-conditioned" });
  if (/boutique|design|stylish/.test(haystack)) push("boutique", { Icon: SparklesIcon, label: "Boutique" });

  // Policy-derived
  const petPolicy = String(hotel.petPolicy || hotel.pet_policy || "").toLowerCase();
  if (petPolicy.includes("pet friendly") || petPolicy.includes("pets allowed") || /pet[- ]friendly/.test(haystack)) {
    push("pet", { Icon: Dog, label: "Pet-friendly" });
  }
  const childPolicy = String(hotel.childPolicy || hotel.child_policy || "").toLowerCase();
  if (childPolicy.includes("free") || childPolicy.includes("kid") || /family/.test(haystack)) {
    push("family", { Icon: Baby, label: "Family-friendly" });
  }

  // Pad to 3 with neutral fallbacks if we still don't have enough
  if (candidates.length < 3) {
    push("rooms", { Icon: Building2, label: "Modern rooms" });
  }
  if (candidates.length < 3) {
    push("ac", { Icon: Wind, label: "Air-conditioned" });
  }

  return candidates.slice(0, 3);
};

const mapHotel = (hotel: PublicHotel): CardHotel => {
  const rooms = Array.isArray(hotel.rooms) ? hotel.rooms : [];
  const recommended = Array.isArray(hotel.recommendedPrices) ? hotel.recommendedPrices : [];

  const bestRecommended =
    recommended
      .map((entry) => ({
        recommendedPrice: Number(entry.recommendedPrice || 0),
        basePrice: Number(entry.basePrice || 0),
        discountPercent: Number(entry.discountPercent || 0),
        savingsAmount: Number(entry.savingsAmount || 0),
      }))
      .filter((entry) => Number.isFinite(entry.recommendedPrice) && entry.recommendedPrice > 0)
      .sort((a, b) => a.recommendedPrice - b.recommendedPrice)[0] || null;

  const directPrice =
    bestRecommended?.recommendedPrice ||
    rooms
      .map((r) => Number(r.price_per_night || r.base_price || 0))
      .filter((n) => Number.isFinite(n) && n > 0)
      .sort((a, b) => a - b)[0] ||
    0;

  const basePrice = bestRecommended?.basePrice && bestRecommended.basePrice > directPrice ? bestRecommended.basePrice : null;
  const savings = Number.isFinite(bestRecommended?.savingsAmount)
    ? Math.max(0, bestRecommended?.savingsAmount || 0)
    : Math.max(0, (basePrice || 0) - directPrice);

  const rawLocation = hotel.location || hotel.location_raw || "Turkey";
  const cityFromLocation = rawLocation.split(",").map((p) => p.trim()).filter(Boolean).slice(-2, -1)[0] ||
    rawLocation.split(",")[0]?.trim() ||
    "Turkey";

  const starClassRaw = Number(hotel.starRating ?? hotel.star_rating ?? 0);
  const starClass = Number.isFinite(starClassRaw) && starClassRaw > 0 ? Math.min(5, Math.round(starClassRaw)) : 4;

  return {
    id: String(hotel.id),
    name: hotel.name || hotel.hotel_name || "Hotel",
    location: cityFromLocation,
    rating: Number(hotel.rating || hotel.starRating || hotel.star_rating || 4),
    reviews: Number(hotel.reviewCount || 0),
    directPrice,
    basePrice,
    discountPercent: Number(bestRecommended?.discountPercent || 0),
    savings,
    image: pickHotelImage(hotel),
    starClass,
    totalRooms: Number.isFinite(Number(hotel.totalRooms ?? hotel.total_rooms))
      ? Number(hotel.totalRooms ?? hotel.total_rooms)
      : null,
    features: deriveFeatures(hotel),
  };
};

interface HotelCardProps {
  hotel: CardHotel;
  format: (amount: number | null | undefined) => string;
  t: (s: string) => string;
}

function HotelCard({ hotel, format, t }: HotelCardProps) {
  const hasDiscount = hotel.discountPercent > 0;
  const showOldPrice = hotel.basePrice && hotel.basePrice > hotel.directPrice;

  return (
    <Link
      to={`/hotel/${hotel.id}`}
      className="group glass-card is-interactive rounded-2xl overflow-hidden block"
    >
      {/* ───────── ZONE 1: IMAGE ───────── */}
      <div className="relative overflow-hidden aspect-[16/11] sm:aspect-[4/3]">
        <img
          src={hotel.image}
          alt={hotel.name}
          loading="lazy"
          onError={makeImageFallback({ id: hotel.id, name: hotel.name })}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/20 to-transparent opacity-60 mix-blend-overlay pointer-events-none" />

        {/* Review-rating pill (top-left) — review count was a fixed 250
            stub from the seed, so we just show the star rating itself
            until real review counts are wired in. */}
        <div className="card-glass-pill absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1">
          <Star className="w-3 h-3 fill-[#FFA500] text-[#FFA500] drop-shadow-[0_0_4px_rgba(255,165,0,0.6)]" strokeWidth={0} />
          <span className="font-['Inter:SemiBold',sans-serif] text-[11.5px] leading-none">
            {hotel.rating.toFixed(1)}
          </span>
        </div>

        {/* Discount badge (top-right) */}
        {hasDiscount && (
          <div className="absolute top-3 right-3 inline-flex items-center rounded-full bg-gradient-to-r from-[#2F80ED] to-[#5DA0F8] px-2.5 py-1 text-[11px] font-['Inter:SemiBold',sans-serif] text-white shadow-[0_6px_18px_-6px_rgba(47, 128, 237,0.7)] ring-1 ring-white/30">
            −{hotel.discountPercent.toFixed(0)}%
          </div>
        )}

        {/* Location pill (bottom-left) — glassy in both themes */}
        <div className="card-glass-pill absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 max-w-[70%]">
          <MapPin className="card-glass-accent w-3 h-3" strokeWidth={2.4} />
          <span className="font-['Inter:Medium',sans-serif] text-[11.5px] leading-none line-clamp-1">
            {hotel.location}
          </span>
        </div>
      </div>

      {/* ───────── ZONE 2: INFO ───────── */}
      <div className="px-5 pt-5 pb-4">
        {/* Eyebrow row — accent + star class */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-px w-5 bg-gradient-to-r from-[#2F80ED] to-transparent shrink-0" />
            <span className="font-['Inter:Medium',sans-serif] text-[9.5px] tracking-[0.26em] uppercase text-[#2F80ED] line-clamp-1">
              {hasDiscount ? t("Limited offer") : t("Editor's pick")}
            </span>
          </div>
          {/* Star class — property tier (separate from review rating) */}
          <div className="flex items-center gap-0.5 shrink-0" aria-label={`${hotel.starClass} star hotel`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-[11px] h-[11px] ${
                  i < hotel.starClass ? "fill-[#FFA500] text-[#FFA500]" : "text-[#E5E7EB] dark:text-white/15"
                }`}
                strokeWidth={0}
              />
            ))}
          </div>
        </div>

        {/* Hotel name */}
        <h3 className="font-['Poppins:Bold',sans-serif] text-[19px] md:text-[20px] leading-[1.22] tracking-[-0.018em] text-[#1f2937] dark:text-white line-clamp-1 mb-3.5 group-hover:text-[#2F80ED] transition-colors">
          {hotel.name}
        </h3>

        {/* Feature chips — top 3 amenities with icons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {hotel.features.map(({ Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/65 dark:bg-white/[0.05] backdrop-blur-sm ring-1 ring-[#2F80ED]/15 dark:ring-white/10 font-['Inter:Medium',sans-serif] text-[10.5px] text-[#3b3b3b] dark:text-white/80"
            >
              <Icon className="w-3 h-3 text-[#2F80ED]" strokeWidth={2.2} />
              {t(label)}
            </span>
          ))}
        </div>
      </div>

      {/* ───────── ZONE 3: PRICE — visually distinct teal-tinted band ───────── */}
      <div className="relative px-5 py-4 bg-gradient-to-br from-[#2F80ED]/[0.07] via-[#5DA0F8]/[0.04] to-transparent dark:from-[#5DA0F8]/[0.08] dark:via-[#5DA0F8]/[0.04] border-t border-[#2F80ED]/15 dark:border-white/10">
        {/* Subtle accent dot left edge */}
        <span
          aria-hidden
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-r-full bg-gradient-to-b from-[#2F80ED] to-[#5DA0F8]"
        />

        {/* Stack price + CTA vertically on mobile so the View pill never
            collides with the price text on narrow viewports; revert to a
            horizontal split from sm: upward where there's room. */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-['Inter:SemiBold',sans-serif] text-[10px] tracking-[0.22em] uppercase text-[#2F80ED]">
                {t("From")}
              </span>
              {showOldPrice && (
                <span className="font-['Inter:Regular',sans-serif] text-[11.5px] line-through text-[#9aa0a6]">
                  {format(hotel.basePrice)}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="font-['Poppins:Bold',sans-serif] text-[22px] sm:text-[26px] leading-none tracking-[-0.025em] text-[#1E5FBC] dark:text-[#5DA0F8]">
                {format(hotel.directPrice)}
              </span>
              <span className="font-['Inter:Medium',sans-serif] text-[12px] text-[#6b7280] dark:text-white/60">
                / {t("night")}
              </span>
            </div>
            {hasDiscount && hotel.savings > 0 ? (
              <div className="mt-1 inline-flex items-center gap-1 font-['Inter:SemiBold',sans-serif] text-[11px] text-[#1E5FBC] dark:text-[#5DA0F8]">
                <SparklesIcon className="w-3 h-3" strokeWidth={2.2} />
                {t("You save")} {format(hotel.savings)}
              </div>
            ) : null}
          </div>

          {/* CTA — gradient pill, full-width on mobile, auto on larger screens. */}
          <span
            aria-hidden
            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 h-10 rounded-full bg-gradient-to-r from-[#2F80ED] to-[#5DA0F8] text-white font-['Inter:SemiBold',sans-serif] text-[12px] shadow-[0_8px_22px_-8px_rgba(47, 128, 237,0.6)] transition-all duration-300 group-hover:shadow-[0_12px_28px_-8px_rgba(47, 128, 237,0.8)] group-hover:translate-x-0.5"
          >
            {t("View")}
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.4} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function FeaturedHotelsSection() {
  const { t, format } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [hotels, setHotels] = useState<CardHotel[]>([]);
  const { ref, canLeft, canRight, scrollBy } = useHorizontalScroll();

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await hotelService.getPublicHotels({
          status: "active",
          includeRecommendedPrices: true,
          refreshPrices: false,
          limit: 9,
          offset: 0,
        });

        if (!active) return;
        setHotels((response.hotels || []).slice(0, 9).map((hotel) => mapHotel(hotel)));
      } catch {
        if (active) setHotels([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="featured-hotels" className="glass-section-bg pt-8 md:pt-14 pb-8 md:pb-12 relative overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10 relative">
        {/* Editorial header with scroll controls aligned right */}
        <div className="flex items-end justify-between gap-6 mb-8 md:mb-10">
          <div className="max-w-[640px]">
            <div className="font-['Inter:Medium',sans-serif] text-[11px] tracking-[0.28em] uppercase text-[#8c8c8c] mb-4">
              {t("Our hotels")}
            </div>
            <h2 className="font-['Poppins:Bold',sans-serif] text-[32px] md:text-[48px] leading-[1.08] tracking-[-0.022em] text-[#3b3b3b] dark:text-white mb-4 md:mb-5">
              {t("Top stays this week.")}
            </h2>
            <p className="font-['Inter:Regular',sans-serif] text-[15px] md:text-[16px] leading-[1.65] text-[#6b7280]">
              {t("Our best hotel picks — verified, well-priced, and ready for your next trip.")}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button
              type="button"
              className="h-scroll-btn"
              onClick={() => scrollBy(-1)}
              aria-disabled={!canLeft}
              aria-label={t("Scroll previous")}
            >
              <ChevronLeft className="w-[18px] h-[18px]" strokeWidth={2} />
            </button>
            <button
              type="button"
              className="h-scroll-btn"
              onClick={() => scrollBy(1)}
              aria-disabled={!canRight}
              aria-label={t("Scroll next")}
            >
              <ChevronRight className="w-[18px] h-[18px]" strokeWidth={2} />
            </button>
          </div>
        </div>

        {loading && <HotelGridLoader count={3} />}

        {!loading && (
          <div className="relative h-scroll-stage">
            <div
              ref={ref}
              className="overflow-x-auto scrollbar-hide -mx-4 md:-mx-10 px-4 md:px-10 snap-x snap-mandatory scroll-px-4 md:scroll-px-10 pb-2"
            >
              <div className="h-scroll-row">
                {hotels.map((hotel) => (
                  <div key={hotel.id} className="h-scroll-item">
                    <HotelCard hotel={hotel} format={format} t={t} />
                  </div>
                ))}
              </div>
            </div>

            {/* Side fade gradients to hint at more content */}
            <div className="h-scroll-fade-left pointer-events-none" aria-hidden />
            <div className="h-scroll-fade-right pointer-events-none" aria-hidden />

            {/* Floating side arrows — visible on desktop, always shown so users
                see they can navigate horizontally */}
            <button
              type="button"
              className="h-scroll-side h-scroll-side-left hidden md:inline-flex"
              onClick={() => scrollBy(-1)}
              aria-disabled={!canLeft}
              aria-label={t("Scroll previous")}
            >
              <ChevronLeft className="w-[22px] h-[22px]" strokeWidth={2.4} />
            </button>
            <button
              type="button"
              className="h-scroll-side h-scroll-side-right hidden md:inline-flex"
              onClick={() => scrollBy(1)}
              aria-disabled={!canRight}
              aria-label={t("Scroll next")}
            >
              <ChevronRight className="w-[22px] h-[22px]" strokeWidth={2.4} />
            </button>

            {/* Mobile scroll buttons (small, below the row) */}
            <div className="flex md:hidden items-center justify-center gap-2 mt-4">
              <button
                type="button"
                className="h-scroll-btn"
                onClick={() => scrollBy(-1)}
                aria-disabled={!canLeft}
                aria-label={t("Scroll previous")}
              >
                <ChevronLeft className="w-[18px] h-[18px]" strokeWidth={2} />
              </button>
              <button
                type="button"
                className="h-scroll-btn"
                onClick={() => scrollBy(1)}
                aria-disabled={!canRight}
                aria-label={t("Scroll next")}
              >
                <ChevronRight className="w-[18px] h-[18px]" strokeWidth={2} />
              </button>
            </div>
          </div>
        )}

        {/* View all CTA — beneath the row */}
        <div className="flex justify-center mt-8 md:mt-10">
          <Link
            to="/listing"
            onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "auto" })}
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#eaeaea] bg-white/70 backdrop-blur-md font-['Inter:Medium',sans-serif] text-[14px] md:text-[15px] text-[#3b3b3b] hover:border-[#2F80ED] hover:text-[#2F80ED] transition-colors dark:border-white/12 dark:bg-white/[0.04] dark:text-white/85 dark:hover:border-[#5DA0F8] dark:hover:text-[#5DA0F8] dark:hover:bg-[#5DA0F8]/[0.06]"
          >
            {t("View all stays")}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FeaturedHotelsSection;
