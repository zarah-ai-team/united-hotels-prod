import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import { Navigation } from "@/shared/components/Navigation";
import { Footer } from "@/shared/components/Footer";
import { HotelGridLoader } from "@/shared/components/HotelLoadingState";
import { hotelService, type PublicHotel } from "@/shared/api/services";
import { formatCurrency } from "@/shared/lib/currency";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useScrollProgress } from "@/shared/hooks/useScrollProgress";
import { useSEO, breadcrumbLd } from "@/shared/hooks/useSEO";
import { extractAmenityNames, capitalizeAmenity } from "@/shared/lib/amenities";
import { pickHotelImage, makeImageFallback } from "@/shared/lib/hotelImages";
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
  // True while the recommended/live price fetch is still in flight. The rest of
  // the card (image, name, location, amenities) is already populated from static
  // data; only the price slot shows a shimmer until prices arrive.
  pricingLoading: boolean;
}

function ListingCard({ hotel, language, t, pricingLoading }: ListingCardProps) {
  const hasDiscount = hotel.discountPercent > 0;
  const showOldPrice = hotel.basePrice && hotel.basePrice > hotel.directPrice;
  const hasPrice = Number.isFinite(hotel.directPrice) && hotel.directPrice > 0;

  return (
    <Link
      to={`/hotel/${hotel.id}`}
      onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "auto" })}
      className="group glass-card is-interactive rounded-2xl overflow-hidden block"
    >
      {/* Image zone — taller (4:3) on tablet+; shorter (16:11) on mobile so
          more cards fit per scroll without changing the desktop hero look. */}
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

        {/* Rating pill (top-left) — review count was a fixed seed stub
            (~250 across all hotels), so we just show the star rating
            until real review counts are wired in. */}
        <div className="card-glass-pill absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1">
          <Star className="w-3 h-3 fill-[#FFA500] text-[#FFA500] drop-shadow-[0_0_4px_rgba(255,165,0,0.6)]" strokeWidth={0} />
          <span className="font-['Inter:SemiBold',sans-serif] text-[11.5px] leading-none">
            {hotel.rating.toFixed(1)}
          </span>
        </div>

        {/* Discount (top-right) */}
        {hasDiscount && (
          <div className="absolute top-3 right-3 inline-flex items-center rounded-full bg-gradient-to-r from-[#2F80ED] to-[#5DA0F8] px-2.5 py-1 text-[11px] font-['Inter:SemiBold',sans-serif] text-white shadow-[0_6px_18px_-6px_rgba(47, 128, 237,0.7)] ring-1 ring-white/30">
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
            <span className="h-px w-5 bg-gradient-to-r from-[#2F80ED] to-transparent shrink-0" />
            <span className="font-['Inter:Medium',sans-serif] text-[9.5px] tracking-[0.26em] uppercase text-[#2F80ED] line-clamp-1">
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

        <h3 className="font-['Poppins:Bold',sans-serif] text-[19px] md:text-[20px] leading-[1.22] tracking-[-0.018em] text-[#1f2937] dark:text-white line-clamp-1 group-hover:text-[#2F80ED] transition-colors">
          {t(hotel.name)}
        </h3>

        {hotel.district ? (
          <div className="mt-1.5 mb-3.5">
            <span className="font-['Inter:Medium',sans-serif] text-[11.5px] text-[#6b7280] dark:text-white/70 line-clamp-1">
              {t(hotel.district)}
            </span>
          </div>
        ) : null}

        {hotel.amenities.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {hotel.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={`${hotel.id}-${amenity}-${idx}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/65 dark:bg-white/[0.05] backdrop-blur-sm ring-1 ring-[#2F80ED]/15 dark:ring-white/10 font-['Inter:Medium',sans-serif] text-[10.5px] text-[#3b3b3b] dark:text-white/80"
              >
                {t(capitalizeAmenity(amenity))}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Price band */}
      <div className="relative px-5 py-4 bg-gradient-to-br from-[#2F80ED]/[0.07] via-[#5DA0F8]/[0.04] to-transparent dark:from-[#5DA0F8]/[0.08] dark:via-[#5DA0F8]/[0.04] border-t border-[#2F80ED]/15 dark:border-white/10">
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
              {!pricingLoading && hasPrice && showOldPrice && (
                <span className="font-['Inter:Regular',sans-serif] text-[11.5px] line-through text-[#9aa0a6]">
                  {formatCurrency(hotel.basePrice ?? 0, language)}
                </span>
              )}
            </div>
            {pricingLoading ? (
              // Card is already on screen from static data; the live price is
              // still being fetched, so shimmer only the price slot.
              <div
                role="status"
                aria-label={t("Loading price")}
                className="h-[26px] w-28 rounded-md bg-gradient-to-r from-[#2F80ED]/12 via-[#2F80ED]/5 to-[#2F80ED]/12 dark:from-white/10 dark:via-white/5 dark:to-white/10 animate-pulse"
              />
            ) : hasPrice ? (
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="font-['Poppins:Bold',sans-serif] text-[22px] sm:text-[26px] leading-none tracking-[-0.025em] text-[#1E5FBC] dark:text-[#5DA0F8]">
                  {formatCurrency(hotel.directPrice, language)}
                </span>
                <span className="font-['Inter:Medium',sans-serif] text-[12px] text-[#6b7280] dark:text-white/60">
                  / {t("night")}
                </span>
              </div>
            ) : (
              <div className="font-['Poppins:SemiBold',sans-serif] text-[15px] text-[#6b7280] dark:text-white/70 italic">
                {t("Price on request")}
              </div>
            )}
            {!pricingLoading && hasPrice && hasDiscount && hotel.savings > 0 ? (
              <div className="mt-1 inline-flex items-center gap-1 font-['Inter:SemiBold',sans-serif] text-[11px] text-[#1E5FBC] dark:text-[#5DA0F8]">
                <Sparkles className="w-3 h-3" strokeWidth={2.2} />
                {t("You save")} {formatCurrency(hotel.savings, language)}
              </div>
            ) : null}
          </div>

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

// The /listing server page seeds the hotels it already fetched onto the window
// (see app/listing/page.tsx) so this client SPA can paint cards immediately
// rather than flashing a full-page skeleton. Returns null when there is no seed
// (e.g. in-app navigation to /listing), in which case we fall back to the normal
// client fetch + skeleton.
function readSeedHotels(): PublicHotel[] | null {
  if (typeof window === "undefined") return null;
  try {
    const seed = (window as any).__UH_LISTING_HOTELS__;
    return Array.isArray(seed) && seed.length > 0 ? (seed as PublicHotel[]) : null;
  } catch {
    return null;
  }
}

export function ListingPageNew() {
  const { language, t } = useLanguage();
  const location = useLocation();
  // Seed the grid from the server-injected hotels (if present) so cards render
  // on the very first paint with no full-page skeleton.
  const [hotels, setHotels] = useState<ListingHotel[]>(() => {
    const seed = readSeedHotels();
    return seed ? seed.map(mapHotel) : [];
  });
  // Only show the full-page skeleton when we have nothing to show yet (no seed).
  const [loading, setLoading] = useState(() => readSeedHotels() === null);
  // Distinct from `loading`: the grid is already visible (seed/static data in)
  // while this stays true and the live/recommended prices are still being
  // fetched. Seeded loads start with prices pending so only the price slots
  // shimmer.
  const [pricingLoading, setPricingLoading] = useState(() => readSeedHotels() !== null);
  const [error, setError] = useState<string | null>(null);
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

        if (!active) return;

        // Stage 1 — render the grid immediately from static hotel data (image,
        // name, location, amenities, rating). The slow recommended-price fetch
        // below must not block the cards from appearing.
        setHotels(allHotels.map((hotel) => mapHotel(hotel)));
        setLoading(false);
        setPricingLoading(true);

        // Stage 2 — fetch LIVE/recommended prices (the heavy OTA-anchor step)
        // and merge them into the already-visible cards once they arrive.
        // Forward the user's selected dates so the v2 engine fetches LIVE OTA
        // anchors for that stay window; without dates it falls back to the
        // analytical formula.
        const params = new URLSearchParams(location.search);
        const checkInDate = params.get("checkInDate") || params.get("checkin") || null;
        const checkOutDate = params.get("checkOutDate") || params.get("checkout") || null;
        const pricingPayload = await hotelService
          .getAllRecommended("active", true, checkInDate, checkOutDate)
          .catch(() => null);

        if (!active) return;

        const recommendedByHotelId = new Map<string, any[]>();
        if (pricingPayload && Array.isArray(pricingPayload.hotels)) {
          for (const item of pricingPayload.hotels) {
            recommendedByHotelId.set(String(item.hotelId), item.recommendedPrices || []);
          }
        }

        const mergedHotels = allHotels.map((hotel) => ({
          ...hotel,
          recommendedPrices:
            recommendedByHotelId.get(String(hotel.id)) ||
            hotel.recommendedPrices ||
            [],
        }));

        setHotels(mergedHotels.map((hotel) => mapHotel(hotel)));
        setPricingLoading(false);
      } catch (e: any) {
        if (!active) return;
        setError(e?.data?.error || e?.message || "Failed to load hotels");
      } finally {
        if (active) {
          setLoading(false);
          setPricingLoading(false);
        }
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

  // Per-route SEO. Title narrows when the user has filtered by destination so
  // the listing page can compete on long-tail queries like "hotels in galata".
  const destinationParam = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get("destination") || "").trim();
  }, [location.search]);
  const seoTitle = destinationParam
    ? `Hotels in ${destinationParam} | Book United Hotels`
    : "Hotels in Turkey | Book United Hotels";
  const seoDescription = destinationParam
    ? `Browse verified hotels in ${destinationParam}. Transparent direct rates, local support, and flexible cancellations.`
    : "Browse verified hotels across Istanbul and Turkey. Transparent direct rates, local support, and flexible cancellations.";
  const canonicalPath = destinationParam
    ? `/listing?destination=${encodeURIComponent(destinationParam)}`
    : "/listing";

  useSEO({
    title: seoTitle,
    description: seoDescription,
    canonical: canonicalPath,
    jsonLd: breadcrumbLd([
      { name: "Home", url: "/" },
      { name: destinationParam || "Hotels", url: canonicalPath },
    ]),
  });

  const pageWindowStart = Math.max(1, currentPage - 2);
  const pageWindowEnd = Math.min(totalPages, pageWindowStart + 4);
  const visiblePages = Array.from({ length: pageWindowEnd - pageWindowStart + 1 }, (_, idx) => pageWindowStart + idx);

  return (
    <div className="listing-page-bg min-h-screen">
      <div className="scroll-progress" aria-hidden />
      <Navigation />

      <section className="pt-12 md:pt-20 pb-20 md:pb-28 relative overflow-hidden">
        {/* Decorative blob removed — the page-level radial gradient already
            provides soft brand colour without competing with hotel cards. */}

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
                  <ListingCard key={hotel.id} hotel={hotel} language={language} t={t} pricingLoading={pricingLoading} />
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
                        ? "bg-gradient-to-r from-[#2F80ED] to-[#5DA0F8] text-white shadow-[0_8px_22px_-8px_rgba(47, 128, 237,0.6)]"
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
