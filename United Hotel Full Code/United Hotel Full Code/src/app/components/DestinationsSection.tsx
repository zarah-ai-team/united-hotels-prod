import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import imgImageSultanahmetFatih from "figma:asset/87fe0e3882960f57017f9db63227776eab6248b5.png";
import imgImageTaksimBeyoglu from "figma:asset/2d09c265965430947a0286c570bc0fa5fbd6debe.png";
import imgImageKadikoyAsianSide from "figma:asset/250023f532e568305b14dfb57c614f51c1fba582.png";
import { ChevronLeft, ChevronRight, ArrowRight, Star, Building2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { hotelService, type PublicHotel } from "../services/api";
import { useHorizontalScroll } from "../hooks/useHorizontalScroll";

interface Destination {
  image: string;
  title: string;
  hotelCount: number;
  avgPrice: number;
  rating: number;
}

const STATIC_IMAGES = [imgImageSultanahmetFatih, imgImageTaksimBeyoglu, imgImageKadikoyAsianSide];

const cityFromHotel = (hotel: PublicHotel): string => {
  const raw = (hotel.location || hotel.location_raw || "").trim();
  if (!raw) return "Turkey";
  const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
  const first = parts[0] || raw;
  const words = first.split(/\s+/).filter(Boolean);
  if (words.length > 1 && words[0].toLowerCase() === "old") return words.slice(0, 2).join(" ");
  return words[0] || first;
};

const lowestHotelPrice = (hotel: PublicHotel): number => {
  const recommended = Array.isArray(hotel.recommendedPrices) ? hotel.recommendedPrices : [];
  const recommendedMin = recommended
    .map((r) => Number(r.recommendedPrice || 0))
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b)[0] || 0;
  const roomMin = (Array.isArray(hotel.rooms) ? hotel.rooms : [])
    .map((r) => Number(r.price_per_night || r.base_price || 0))
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b)[0] || 0;
  return recommendedMin || roomMin || 0;
};

interface DestinationCardProps {
  destination: Destination;
  format: (amount: number | null | undefined) => string;
  t: (s: string) => string;
}

function DestinationCard({ destination, format, t }: DestinationCardProps) {
  return (
    <Link
      to={`/listing?destination=${encodeURIComponent(destination.title)}`}
      className="group glass-card is-interactive rounded-2xl overflow-hidden block"
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={destination.image}
          alt={destination.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-['Poppins:SemiBold',sans-serif] text-[22px] md:text-[24px] leading-[1.2] tracking-[-0.015em] text-white">
            {t(destination.title)}
          </h3>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-[#3b3b3b] mb-1">
              <Building2 className="w-3.5 h-3.5 text-[#1abc9c]" strokeWidth={2} />
              <span className="font-['Poppins:SemiBold',sans-serif] text-[15px] leading-none">
                {destination.hotelCount}
              </span>
            </div>
            <div className="font-['Inter:Regular',sans-serif] text-[11px] text-[#8c8c8c]">
              {t("Hotels")}
            </div>
          </div>
          <div className="border-x border-[#eaeaea]">
            <div className="font-['Poppins:SemiBold',sans-serif] text-[15px] leading-none text-[#3b3b3b] mb-1">
              {destination.avgPrice > 0 ? format(destination.avgPrice) : "—"}
            </div>
            <div className="font-['Inter:Regular',sans-serif] text-[11px] text-[#8c8c8c]">
              {t("Avg/night")}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-[#3b3b3b] mb-1">
              <Star className="w-3.5 h-3.5 fill-[#FFA500] text-[#FFA500]" />
              <span className="font-['Poppins:SemiBold',sans-serif] text-[15px] leading-none">
                {destination.rating.toFixed(1)}
              </span>
            </div>
            <div className="font-['Inter:Regular',sans-serif] text-[11px] text-[#8c8c8c]">
              {t("Rating")}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function DestinationsSection() {
  const { t, format } = useLanguage();
  const [hotels, setHotels] = useState<PublicHotel[]>([]);
  const { ref, canLeft, canRight, scrollBy } = useHorizontalScroll();

  useEffect(() => {
    let active = true;
    hotelService
      .getPublicHotels({ status: "active", includeRecommendedPrices: true, refreshPrices: true, limit: 200, offset: 0 })
      .then((res) => {
        if (!active) return;
        setHotels(Array.isArray(res.hotels) ? res.hotels : []);
      })
      .catch(() => {
        if (!active) return;
        setHotels([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const destinations = useMemo<Destination[]>(() => {
    if (!hotels.length) {
      return [
        {
          image: STATIC_IMAGES[0],
          title: "Turkey",
          hotelCount: 0,
          avgPrice: 0,
          rating: 4.5,
        },
      ];
    }

    const byCity = new Map<string, PublicHotel[]>();
    for (const hotel of hotels) {
      const city = cityFromHotel(hotel);
      if (!byCity.has(city)) byCity.set(city, []);
      byCity.get(city)!.push(hotel);
    }

    return Array.from(byCity.entries())
      .map(([city, list], index) => {
        const prices = list.map(lowestHotelPrice).filter((n) => n > 0);
        const ratings = list
          .map((h) => Number(h.starRating ?? h.star_rating ?? h.rating ?? 0))
          .filter((n) => Number.isFinite(n) && n > 0);

        return {
          image: STATIC_IMAGES[index % STATIC_IMAGES.length],
          title: city,
          hotelCount: list.length,
          avgPrice: prices.length ? Math.round(prices.reduce((s, p) => s + p, 0) / prices.length) : 0,
          rating: ratings.length ? Number((ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1)) : 4.5,
        };
      })
      .sort((a, b) => b.hotelCount - a.hotelCount)
      .slice(0, 9);
  }, [hotels]);

  return (
    <section id="destinations" className="glass-section-bg py-10 md:py-32 relative overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10 relative">
        {/* Editorial header with scroll controls */}
        <div className="flex items-end justify-between gap-6 mb-10 md:mb-14">
          <div className="max-w-[640px]">
            <div className="font-['Inter:Medium',sans-serif] text-[11px] tracking-[0.28em] uppercase text-[#8c8c8c] mb-4">
              {t("Explore neighbourhoods")}
            </div>
            <h2 className="font-['Poppins:Bold',sans-serif] text-[32px] md:text-[48px] leading-[1.08] tracking-[-0.022em] text-[#3b3b3b]">
              {t("Where to stay in Turkey.")}
            </h2>
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

        {/* Scroll row */}
        <div className="relative">
          <div
            ref={ref}
            className="overflow-x-auto scrollbar-hide -mx-4 md:-mx-10 px-4 md:px-10 snap-x snap-mandatory scroll-px-4 md:scroll-px-10 pb-2"
          >
            <div className="h-scroll-row">
              {destinations.map((d) => (
                <div key={d.title} className="h-scroll-item">
                  <DestinationCard destination={d} format={format} t={t} />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile scroll buttons */}
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

        {/* View all CTA */}
        <div className="flex justify-center mt-12 md:mt-16">
          <Link
            to="/listing"
            onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "auto" })}
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#eaeaea] bg-white/70 backdrop-blur-md font-['Inter:Medium',sans-serif] text-[14px] md:text-[15px] text-[#3b3b3b] hover:border-[#1abc9c] hover:text-[#1abc9c] transition-colors"
          >
            {t("View all neighbourhoods")}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default DestinationsSection;
