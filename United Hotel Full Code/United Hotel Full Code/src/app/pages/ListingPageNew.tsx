import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { HotelGridLoader } from "../components/HotelLoadingState";
import { hotelService, type PublicHotel } from "../services/api";
import { formatCurrency } from "../utils/currency";
import { useLanguage } from "../context/LanguageContext";
import { useScrollProgress } from "../hooks/useScrollProgress";
import { extractAmenityNames, capitalizeAmenity } from "../utils/amenities";
import { pickHotelImage, makeImageFallback } from "../utils/hotelImages";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
const FETCH_BATCH_SIZE = 50;
const LISTING_PAGE_SIZE = 12;

type ListingHotel = {
  id: string;
  name: string;
  location: string;
  district: string;
  rating: number;
  reviewCount: number;
  amenities: string[];
  directPrice: number;
  basePrice: number | null;
  discountPercent: number;
  savings: number;
  starClass: number;
  image: string;
};

const mapHotel = (hotel: PublicHotel): ListingHotel => {
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

  const rooms = Array.isArray(hotel.rooms) ? hotel.rooms : [];
  const minBase =
    rooms
      .map((room) => Number(room.price_per_night || room.base_price || 0))
      .filter((n) => Number.isFinite(n) && n > 0)
      .sort((a, b) => a - b)[0] || 0;

  const directPrice = bestRecommended?.recommendedPrice || minBase;
  const basePrice = bestRecommended?.basePrice && bestRecommended.basePrice > directPrice
    ? bestRecommended.basePrice
    : minBase > directPrice
      ? minBase
      : null;
  const savings = Number.isFinite(bestRecommended?.savingsAmount)
    ? Math.max(0, bestRecommended?.savingsAmount || 0)
    : Math.max(0, (basePrice || 0) - directPrice);

  const starRaw = Number((hotel as any).starRating ?? (hotel as any).star_rating ?? 0);
  const starClass = Number.isFinite(starRaw) && starRaw > 0 ? Math.min(5, Math.round(starRaw)) : 4;

  return {
    id: String(hotel.id),
    name: hotel.name || hotel.hotel_name || "Hotel",
    location: hotel.location || "Turkey",
    district: hotel.district || "",
    rating: Number(hotel.rating || hotel.starRating || hotel.star_rating || 4),
    reviewCount: Number(hotel.reviewCount || 0),
    amenities: extractAmenityNames(hotel.amenities),
    directPrice,
    basePrice,
    discountPercent: Number(bestRecommended?.discountPercent || 0),
    savings,
    starClass,
    image: pickHotelImage(hotel),
  };
};

interface ListingCardProps {
  hotel: ListingHotel;
  language: string;
  t: (s: string) => string;
}

function ListingCard({ hotel, language, t }: ListingCardProps) {
  const hasDiscount = hotel.discountPercent > 0;
  const showOldPrice = hotel.basePrice && hotel.basePrice > hotel.directPrice;
  const hasPrice = Number.isFinite(hotel.directPrice) && hotel.directPrice > 0;

  return (
    <Link
      to={`/hotel/${hotel.id}`}
      onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "auto" })}
      className="group glass-card is-interactive rounded-2xl overflow-hidden block"
    >
      {/* Image zone */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={hotel.image}
          alt={hotel.name}
          loading="lazy"
          onError={makeImageFallback({ id: hotel.id, name: hotel.name })}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/20 to-transparent opacity-60 mix-blend-overlay pointer-events-none" />

        {/* Rating pill (top-left) */}
        <div className="card-glass-pill absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1">
          <Star className="w-3 h-3 fill-[#FFA500] text-[#FFA500] drop-shadow-[0_0_4px_rgba(255,165,0,0.6)]" strokeWidth={0} />
          <span className="font-['Inter:SemiBold',sans-serif] text-[11.5px] leading-none">
            {hotel.rating.toFixed(1)}
          </span>
          <span className="card-glass-muted font-['Inter:Regular',sans-serif] text-[11px] leading-none">
            ({hotel.reviewCount})
          </span>
        </div>

        {/* Discount (top-right) */}
        {hasDiscount && (
          <div className="absolute top-3 right-3 inline-flex items-center rounded-full bg-gradient-to-r from-[#1abc9c] to-[#2dd4bf] px-2.5 py-1 text-[11px] font-['Inter:SemiBold',sans-serif] text-white shadow-[0_6px_18px_-6px_rgba(26,188,156,0.7)] ring-1 ring-white/30">
            −{hotel.discountPercent.toFixed(0)}%
          </div>
        )}

        {/* Location pill (bottom-left) */}
        <div className="card-glass-pill absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 max-w-[78%]">
          <MapPin className="card-glass-accent w-3 h-3" strokeWidth={2.4} />
          <span className="font-['Inter:Medium',sans-serif] text-[11.5px] leading-none line-clamp-1">
            {t(hotel.location)}
          </span>
        </div>
      </div>

      {/* Info zone */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-px w-5 bg-gradient-to-r from-[#1abc9c] to-transparent shrink-0" />
            <span className="font-['Inter:Medium',sans-serif] text-[9.5px] tracking-[0.26em] uppercase text-[#1abc9c] line-clamp-1">
              {hasDiscount ? t("Limited offer") : t("Direct rate")}
            </span>
          </div>
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

        <h3 className="font-['Poppins:Bold',sans-serif] text-[19px] md:text-[20px] leading-[1.22] tracking-[-0.018em] text-[#1f2937] dark:text-white line-clamp-1 group-hover:text-[#1abc9c] transition-colors">
          {t(hotel.name)}
        </h3>

        <div className="font-['Inter:Regular',sans-serif] italic text-[12px] text-[#6b7280] dark:text-white/55 mt-1.5 mb-3.5 flex items-center gap-2">
          <span>
            {hotel.reviewCount > 0
              ? `${hotel.reviewCount} ${t("verified reviews")}`
              : t("Newly listed stay")}
          </span>
          {hotel.district ? (
            <>
              <span className="text-[#d1d5db] dark:text-white/20">·</span>
              <span className="not-italic font-['Inter:Medium',sans-serif] text-[11.5px] text-[#6b7280] dark:text-white/65 line-clamp-1">
                {t(hotel.district)}
              </span>
            </>
          ) : null}
        </div>

        {hotel.amenities.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {hotel.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={`${hotel.id}-${amenity}-${idx}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/65 dark:bg-white/[0.05] backdrop-blur-sm ring-1 ring-[#1abc9c]/15 dark:ring-white/10 font-['Inter:Medium',sans-serif] text-[10.5px] text-[#3b3b3b] dark:text-white/80"
              >
                {t(capitalizeAmenity(amenity))}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Price band */}
      <div className="relative px-5 py-4 bg-gradient-to-br from-[#1abc9c]/[0.07] via-[#2dd4bf]/[0.04] to-transparent dark:from-[#2dd4bf]/[0.08] dark:via-[#2dd4bf]/[0.04] border-t border-[#1abc9c]/15 dark:border-white/10">
        <span
          aria-hidden
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-r-full bg-gradient-to-b from-[#1abc9c] to-[#2dd4bf]"
        />

        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-['Inter:SemiBold',sans-serif] text-[10px] tracking-[0.22em] uppercase text-[#1abc9c]">
                {t("From")}
              </span>
              {hasPrice && showOldPrice && (
                <span className="font-['Inter:Regular',sans-serif] text-[11.5px] line-through text-[#9aa0a6]">
                  {formatCurrency(hotel.basePrice ?? 0, language)}
                </span>
              )}
            </div>
            {hasPrice ? (
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="font-['Poppins:Bold',sans-serif] text-[26px] leading-none tracking-[-0.025em] text-[#0f9b86] dark:text-[#2dd4bf]">
                  {formatCurrency(hotel.directPrice, language)}
                </span>
                <span className="font-['Inter:Medium',sans-serif] text-[12px] text-[#6b7280] dark:text-white/55">
                  / {t("night")}
                </span>
              </div>
            ) : (
              <div className="font-['Poppins:SemiBold',sans-serif] text-[15px] text-[#6b7280] dark:text-white/65 italic">
                {t("Price on request")}
              </div>
            )}
            {hasPrice && hasDiscount && hotel.savings > 0 ? (
              <div className="mt-1 inline-flex items-center gap-1 font-['Inter:SemiBold',sans-serif] text-[11px] text-[#0f9b86] dark:text-[#2dd4bf]">
                <Sparkles className="w-3 h-3" strokeWidth={2.2} />
                {t("You save")} {formatCurrency(hotel.savings, language)}
              </div>
            ) : null}
          </div>

          <span
            aria-hidden
            className="shrink-0 inline-flex items-center gap-1.5 px-3.5 h-10 rounded-full bg-gradient-to-r from-[#1abc9c] to-[#2dd4bf] text-white font-['Inter:SemiBold',sans-serif] text-[12px] shadow-[0_8px_22px_-8px_rgba(26,188,156,0.6)] transition-all duration-300 group-hover:shadow-[0_12px_28px_-8px_rgba(26,188,156,0.8)] group-hover:translate-x-0.5"
          >
            {t("View")}
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.4} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ListingPageNew() {
  const { language, t } = useLanguage();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hotels, setHotels] = useState<ListingHotel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useScrollProgress();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const destination = params.get("destination") || "";
    setSearchTerm(destination);
    setCurrentPage(1);
  }, [location.search]);

  useEffect(() => {
    let active = true;

    const loadHotels = async () => {
      try {
        setLoading(true);
        setError(null);

        const allHotels: PublicHotel[] = [];

        const firstResponse = await hotelService.getPublicHotels({
          status: "active",
          includeRecommendedPrices: false,
          refreshPrices: false,
          limit: FETCH_BATCH_SIZE,
          offset: 0,
        });

        allHotels.push(...(firstResponse.hotels || []));

        const totalCount = Number(firstResponse.count || allHotels.length);
        for (let offset = allHotels.length; offset < totalCount; offset += FETCH_BATCH_SIZE) {
          const nextResponse = await hotelService.getPublicHotels({
            status: "active",
            includeRecommendedPrices: false,
            refreshPrices: false,
            limit: FETCH_BATCH_SIZE,
            offset,
          });
          allHotels.push(...(nextResponse.hotels || []));
        }

        const pricingPayload = await hotelService
          .getAllRecommended("active", true)
          .catch(() => null);

        const recommendedByHotelId = new Map<string, any[]>();
        if (pricingPayload && Array.isArray(pricingPayload.hotels)) {
          for (const item of pricingPayload.hotels) {
            recommendedByHotelId.set(String(item.hotelId), item.recommendedPrices || []);
          }
        }

        if (!active) return;

        const mergedHotels = allHotels.map((hotel) => ({
          ...hotel,
          recommendedPrices:
            recommendedByHotelId.get(String(hotel.id)) ||
            hotel.recommendedPrices ||
            [],
        }));

        const mapped = mergedHotels.map((hotel) => mapHotel(hotel));
        setHotels(mapped);
      } catch (e: any) {
        if (!active) return;
        setError(e?.data?.error || e?.message || "Failed to load hotels");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadHotels();
    return () => {
      active = false;
    };
  }, []);

  const filteredHotels = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return hotels;

    return hotels.filter((hotel) => {
      const haystack = `${hotel.name} ${hotel.location} ${hotel.district} ${hotel.amenities.join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [hotels, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredHotels.length / LISTING_PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedHotels = useMemo(() => {
    const start = (currentPage - 1) * LISTING_PAGE_SIZE;
    return filteredHotels.slice(start, start + LISTING_PAGE_SIZE);
  }, [filteredHotels, currentPage]);

  const pageWindowStart = Math.max(1, currentPage - 2);
  const pageWindowEnd = Math.min(totalPages, pageWindowStart + 4);
  const visiblePages = Array.from({ length: pageWindowEnd - pageWindowStart + 1 }, (_, idx) => pageWindowStart + idx);

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <div className="scroll-progress" aria-hidden />
      <Navigation />

      <section className="glass-section-bg pt-12 md:pt-20 pb-20 md:pb-28 relative overflow-hidden">
        {/* Soft floating blob — frosted-glass haze on the left */}
        <span
          className="blob blob-teal w-[380px] h-[380px] -left-32 top-32 opacity-[0.18] dark:opacity-[0.12] mix-blend-multiply dark:mix-blend-screen"
          style={{ filter: 'blur(110px)' }}
          aria-hidden
        />

        <main className="max-w-[1840px] mx-auto px-4 md:px-10 relative">
          {/* Editorial header */}
          <div className="mb-10 md:mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="font-['Inter:Medium',sans-serif] text-[11px] tracking-[0.28em] uppercase text-[#8c8c8c] mb-4">
                {t("Curated stays")}
              </div>
              <h1 className="font-['Poppins:Bold',sans-serif] text-[32px] md:text-[48px] leading-[1.08] tracking-[-0.022em] text-[#3b3b3b]">
                {t("Hotels in Turkey")}
              </h1>
              <p className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[16px] text-[#6b7280] dark:text-white/60 mt-2">
                {filteredHotels.length} {t("properties found")}
              </p>
            </div>

            <div className="w-full md:w-[460px]">
              <div className="hero-glass rounded-2xl p-2 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] opacity-60 pointer-events-none" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t("Search by city, district, hotel or amenity")}
                    className="w-full h-[44px] pl-11 pr-3 rounded-xl font-['Inter:Regular',sans-serif] text-[14px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {loading && <HotelGridLoader count={6} />}

          {!loading && error && (
            <div className="glass-card rounded-2xl p-8 text-center text-red-500 dark:text-red-300">
              {error}
            </div>
          )}

          {!loading && !error && filteredHotels.length === 0 && (
            <div className="glass-card rounded-2xl p-10 text-center">
              <div className="font-['Poppins:SemiBold',sans-serif] text-[18px] text-[#3b3b3b] dark:text-white mb-2">
                {t("No hotels matched your search")}
              </div>
              <div className="font-['Inter:Regular',sans-serif] text-[14px] text-[#6b7280] dark:text-white/60">
                {t("Try a different city, neighbourhood or amenity.")}
              </div>
            </div>
          )}

          {!loading && !error && filteredHotels.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
                {paginatedHotels.map((hotel) => (
                  <ListingCard key={hotel.id} hotel={hotel} language={language} t={t} />
                ))}
              </div>

              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-scroll-btn"
                  aria-label={t("Previous page")}
                >
                  <ChevronLeft className="w-[18px] h-[18px]" strokeWidth={2} />
                </button>

                {visiblePages.map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    aria-current={page === currentPage ? "page" : undefined}
                    className={`min-w-[44px] h-[44px] px-3 rounded-full font-['Inter:SemiBold',sans-serif] text-[13px] transition-all ${
                      page === currentPage
                        ? "bg-gradient-to-r from-[#1abc9c] to-[#2dd4bf] text-white shadow-[0_8px_22px_-8px_rgba(26,188,156,0.6)]"
                        : "h-scroll-btn"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-scroll-btn"
                  aria-label={t("Next page")}
                >
                  <ChevronRight className="w-[18px] h-[18px]" strokeWidth={2} />
                </button>
              </div>
            </>
          )}
        </main>
      </section>

      <Footer />
    </div>
  );
}
