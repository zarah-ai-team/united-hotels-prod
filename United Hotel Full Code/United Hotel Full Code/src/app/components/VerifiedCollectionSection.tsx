import { useEffect, useState } from "react";
import { Link } from "react-router";
import { MapPin, Star, ArrowUpRight, BadgeCheck, ShieldCheck } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { hotelService, type PublicHotel } from "../services/api";
import { pickHotelImage, makeImageFallback } from "../utils/hotelImages";

type CollectionHotel = {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  price: number;
  image: string;
};

const mapHotel = (hotel: PublicHotel): CollectionHotel => {
  const rooms = Array.isArray(hotel.rooms) ? hotel.rooms : [];
  const recommended = Array.isArray(hotel.recommendedPrices) ? hotel.recommendedPrices : [];

  const recommendedMin = recommended
    .map((r) => Number(r.recommendedPrice || 0))
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b)[0] || 0;

  const roomMin = rooms
    .map((r) => Number(r.price_per_night || r.base_price || 0))
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b)[0] || 0;

  const rawLocation = hotel.location || hotel.location_raw || "Turkey";
  const cityFromLocation =
    rawLocation.split(",").map((p) => p.trim()).filter(Boolean).slice(-2, -1)[0] ||
    rawLocation.split(",")[0]?.trim() ||
    "Turkey";

  return {
    id: String(hotel.id),
    name: hotel.name || hotel.hotel_name || "Hotel",
    location: cityFromLocation,
    rating: Number(hotel.rating || hotel.starRating || hotel.star_rating || 4),
    reviews: Number(hotel.reviewCount || 0),
    price: recommendedMin || roomMin || 0,
    image: pickHotelImage(hotel),
  };
};

interface CardProps {
  hotel: CollectionHotel;
  format: (amount: number | null | undefined) => string;
  t: (s: string) => string;
  variant: "feature" | "tile";
}

function CollectionCard({ hotel, format, t, variant }: CardProps) {
  const isFeature = variant === "feature";

  return (
    <Link
      to={`/hotel/${hotel.id}`}
      className={`group glass-card is-interactive rounded-2xl overflow-hidden block relative ${
        isFeature ? "h-full" : ""
      }`}
    >
      <div className={`relative overflow-hidden ${isFeature ? "aspect-[16/11] md:aspect-[4/5] md:h-full" : "aspect-[16/11]"}`}>
        <img
          src={hotel.image}
          alt={hotel.name}
          loading="lazy"
          onError={makeImageFallback({ id: hotel.id, name: hotel.name })}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
        />
        {/* Stronger bottom gradient — deeper in dark mode for crisp copy contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent dark:from-black/90 dark:via-black/45" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/20 to-transparent opacity-50 mix-blend-overlay pointer-events-none" />

        {/* Verified ribbon — top-left */}
        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/85 dark:bg-black/60 backdrop-blur-md px-2.5 py-1 ring-1 ring-white/70 dark:ring-white/15 shadow-[0_4px_14px_-4px_rgba(15,23,42,0.25)]">
          <BadgeCheck className="w-3.5 h-3.5 text-[#1abc9c] dark:text-[#2dd4bf]" strokeWidth={2.2} />
          <span className="font-['Inter:SemiBold',sans-serif] text-[10.5px] tracking-[0.14em] uppercase leading-none text-[#1f2937] dark:text-white">
            {t("Verified")}
          </span>
        </div>

        {/* Rating pill — top-right */}
        <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/55 backdrop-blur-md px-2.5 py-1 ring-1 ring-white/20">
          <Star className="w-3 h-3 fill-[#FFA500] text-[#FFA500]" strokeWidth={0} />
          <span className="font-['Inter:SemiBold',sans-serif] text-[11px] leading-none text-white">
            {hotel.rating.toFixed(1)}
          </span>
        </div>

        {/* Bottom content stack — typography rhythm: thin meta → display name → bold price */}
        <div className={`absolute inset-x-0 bottom-0 p-5 ${isFeature ? "md:p-7" : ""}`}>
          {/* Eyebrow — extra-tracked, light-weight location label */}
          <div className="flex items-center gap-1.5 text-white/85 dark:text-white/80 mb-2">
            <MapPin className={`shrink-0 ${isFeature ? "w-3.5 h-3.5" : "w-3 h-3"}`} strokeWidth={2.4} />
            <span
              className={`font-['Inter:Regular',sans-serif] uppercase tracking-[0.22em] leading-none line-clamp-1 ${
                isFeature ? "text-[11px] md:text-[12px]" : "text-[10.5px]"
              }`}
            >
              {hotel.location}
            </span>
          </div>

          {/* Display name — feature gets extra weight + tighter tracking + drop shadow */}
          <h3
            className={`font-['Poppins:Bold',sans-serif] text-white line-clamp-2 ${
              isFeature
                ? "text-[20px] md:text-[24px] lg:text-[28px] leading-[1.12] tracking-[-0.025em] drop-shadow-[0_4px_18px_rgba(0,0,0,0.6)]"
                : "text-[19px] md:text-[21px] leading-[1.18] tracking-[-0.02em] drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
            }`}
          >
            {hotel.name}
          </h3>

          {/* Hairline divider — visually separates name from price (subtle) */}
          <div
            className={`bg-gradient-to-r from-white/30 via-white/15 to-transparent ${
              isFeature ? "h-px mt-5 mb-4 md:mt-6 md:mb-5" : "h-px mt-3 mb-3"
            }`}
          />

          {/* Price row */}
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div
                className={`font-['Inter:Regular',sans-serif] tracking-[0.26em] uppercase text-white/55 mb-1 ${
                  isFeature ? "text-[10px]" : "text-[9px]"
                }`}
              >
                {t("From")}
              </div>
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`font-['Poppins:Bold',sans-serif] text-white leading-none tracking-[-0.025em] ${
                    isFeature ? "text-[22px] md:text-[26px]" : "text-[22px]"
                  }`}
                >
                  {hotel.price > 0 ? format(hotel.price) : "—"}
                </span>
                <span
                  className={`font-['Inter:Regular',sans-serif] text-white/60 ${
                    isFeature ? "text-[12px]" : "text-[11px]"
                  }`}
                >
                  / {t("night")}
                </span>
              </div>
            </div>

            <span
              aria-hidden
              className={`shrink-0 inline-flex items-center justify-center rounded-full bg-white/15 dark:bg-white/10 backdrop-blur-md ring-1 ring-white/30 dark:ring-white/20 text-white shadow-[0_6px_18px_-6px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover:bg-[#1abc9c] group-hover:ring-[#1abc9c]/50 group-hover:translate-x-0.5 group-hover:scale-105 ${
                isFeature ? "w-11 h-11 md:w-12 md:h-12" : "w-10 h-10"
              }`}
            >
              <ArrowUpRight className={isFeature ? "w-[18px] h-[18px] md:w-5 md:h-5" : "w-4 h-4"} strokeWidth={2.2} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function VerifiedCollectionSection() {
  const { t, format } = useLanguage();
  const [hotels, setHotels] = useState<CollectionHotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    hotelService
      .getPublicHotels({
        status: "active",
        includeRecommendedPrices: true,
        refreshPrices: false,
        limit: 30,
        offset: 0,
      })
      .then((res) => {
        if (!active) return;
        const list = Array.isArray(res.hotels) ? res.hotels : [];
        // Sort by review count → highest "real engagement" surfaces first
        const sorted = [...list].sort((a, b) => Number(b.reviewCount || 0) - Number(a.reviewCount || 0));
        setHotels(sorted.slice(0, 5).map((h) => mapHotel(h)));
      })
      .catch(() => {
        if (active) setHotels([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const feature = hotels[0];
  const tiles = hotels.slice(1, 5);

  return (
    <section
      id="verified-collection"
      className="relative overflow-hidden pt-12 md:pt-28 pb-10 md:pb-28"
    >
      {/* Decorative gradient blob backdrop — adds richness without imagery */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 15% 10%, rgba(26, 188, 156, 0.18), transparent 60%)," +
              "radial-gradient(ellipse 60% 55% at 95% 30%, rgba(99, 102, 241, 0.14), transparent 60%)," +
              "radial-gradient(ellipse 80% 60% at 50% 110%, rgba(255, 165, 0, 0.10), transparent 55%)," +
              "#fafafa",
          }}
        />
        <div className="dark:block hidden absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 15% 10%, rgba(45, 212, 191, 0.16), transparent 60%)," +
              "radial-gradient(ellipse 60% 55% at 95% 30%, rgba(129, 140, 248, 0.14), transparent 60%)," +
              "radial-gradient(ellipse 80% 60% at 50% 110%, rgba(251, 146, 60, 0.10), transparent 55%)," +
              "#0a0a0a",
          }}
        />
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-10 relative">
        {/* Editorial header */}
        <div className="grid md:grid-cols-[1.1fr_1fr] gap-6 md:gap-16 items-end mb-12 md:mb-16">
          <div>
            <div className="inline-flex items-center gap-2 font-['Inter:Medium',sans-serif] text-[11px] tracking-[0.28em] uppercase text-[#1abc9c] mb-4">
              <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
              {t("Our verified collection")}
            </div>
            <h2 className="font-['Poppins:Bold',sans-serif] text-[32px] md:text-[48px] leading-[1.06] tracking-[-0.022em] text-[#1f2937] dark:text-white">
              {t("Hand-picked hotels,")}{" "}
              <span className="bg-gradient-to-r from-[#1abc9c] via-[#2dd4bf] to-[#38bdf8] bg-clip-text text-transparent">
                {t("personally inspected.")}
              </span>
            </h2>
          </div>
          <p className="font-['Inter:Regular',sans-serif] text-[15px] md:text-[16px] leading-[1.65] text-[#6b7280] dark:text-white/70 max-w-[460px] md:justify-self-end">
            {t("Every property in our portfolio has been visited, vetted, and approved by our local team — not by an algorithm.")}
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl aspect-[16/11] animate-pulse" />
            ))}
          </div>
        )}

        {!loading && hotels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 auto-rows-fr">
            {/* Feature card spans 2 rows on md+ */}
            {feature && (
              <div className="md:col-span-1 md:row-span-2">
                <CollectionCard hotel={feature} format={format} t={t} variant="feature" />
              </div>
            )}
            {tiles.map((h) => (
              <div key={h.id} className="md:col-span-1">
                <CollectionCard hotel={h} format={format} t={t} variant="tile" />
              </div>
            ))}
          </div>
        )}

        {/* Footer note + CTA */}
        <div className="mt-10 md:mt-12 flex flex-col md:flex-row items-center justify-between gap-5 md:gap-6">
          <div className="flex items-center gap-3 text-[#6b7280] dark:text-white/65">
            <div className="w-9 h-9 rounded-full bg-white/70 dark:bg-white/[0.06] backdrop-blur-md ring-1 ring-white/60 dark:ring-white/10 flex items-center justify-center text-[#1abc9c]">
              <BadgeCheck className="w-4 h-4" strokeWidth={2.2} />
            </div>
            <p className="font-['Inter:Regular',sans-serif] text-[13.5px] md:text-[14.5px] leading-[1.5] max-w-[460px]">
              {t("Inspected on-site by our local team. Updated quarterly.")}
            </p>
          </div>
          <Link
            to="/listing"
            onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "auto" })}
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#1abc9c] to-[#2dd4bf] text-white font-['Inter:SemiBold',sans-serif] text-[14px] md:text-[15px] shadow-[0_10px_30px_-10px_rgba(26,188,156,0.6)] hover:shadow-[0_14px_36px_-10px_rgba(26,188,156,0.75)] transition-shadow"
          >
            {t("Explore the full collection")}
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.2} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default VerifiedCollectionSection;
