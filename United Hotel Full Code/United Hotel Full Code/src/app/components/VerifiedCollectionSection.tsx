import { useEffect, useState } from "react";
import { Link } from "react-router";
import { BadgeCheck, ArrowRight, ShieldCheck } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { hotelService, type PublicHotel } from "../services/api";
import { pickHotelImage, makeImageFallback } from "../utils/hotelImages";

type CollectionImage = { id: string; src: string; name: string };

const mapImage = (hotel: PublicHotel): CollectionImage => ({
  id: String(hotel.id),
  src: pickHotelImage(hotel),
  name: hotel.name || hotel.hotel_name || "Hotel",
});

export function VerifiedCollectionSection() {
  const { t } = useLanguage();
  const [images, setImages] = useState<CollectionImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    hotelService
      .getPublicHotels({
        status: "active",
        includeRecommendedPrices: false,
        refreshPrices: false,
        limit: 30,
        offset: 0,
      })
      .then((res) => {
        if (!active) return;
        const list = Array.isArray(res.hotels) ? res.hotels : [];
        // Top 4 by reviewCount — show real verified-portfolio imagery
        const sorted = [...list].sort(
          (a, b) => Number(b.reviewCount || 0) - Number(a.reviewCount || 0),
        );
        setImages(sorted.slice(0, 4).map(mapImage));
      })
      .catch(() => {
        if (active) setImages([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const [a, b, c, d] = images;

  return (
    <section
      id="verified-collection"
      className="relative bg-white dark:bg-[#161616] py-10 md:py-14 border-t border-[#E6EAF0]"
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        <div className="grid lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-16 items-center">
          {/* LEFT — text block */}
          <div>
            <div className="inline-flex items-center gap-2 font-['Inter:SemiBold',sans-serif] text-[11px] tracking-[0.24em] uppercase text-[#2F80ED] mb-3">
              <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
              {t("Our verified collection")}
            </div>
            <h2 className="font-['Poppins:Bold',sans-serif] text-[28px] md:text-[40px] lg:text-[44px] leading-[1.12] tracking-[-0.02em] text-[#0B1F3B] mb-5">
              {t("Handpicked hotels, personally inspected.")}
            </h2>
            <p className="font-['Inter:Regular',sans-serif] text-[15px] md:text-[16.5px] leading-[1.6] text-[#6B7280] dark:text-white/70 mb-7 max-w-[480px]">
              {t("Every property is visited and approved on the ground to ensure real quality, accurate location, and a consistent guest experience.")}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/listing"
                onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "auto" })}
                className="inline-flex items-center gap-2 h-[48px] px-6 rounded-xl bg-[#2F80ED] hover:bg-[#1E5FBC] text-white font-['Inter:SemiBold',sans-serif] text-[14.5px] transition-colors shadow-[0_2px_8px_rgba(47,128,237,0.25)]"
              >
                {t("Explore the full collection")}
                <ArrowRight className="w-4 h-4" strokeWidth={2.4} />
              </Link>
              <span className="inline-flex items-center gap-2 text-[#6B7280] font-['Inter:Regular',sans-serif] text-[13px]">
                <BadgeCheck className="w-4 h-4 text-[#2F80ED]" strokeWidth={2.2} />
                {t("Inspected on-site, updated quarterly.")}
              </span>
            </div>
          </div>

          {/* RIGHT — 2x2 image collage with offset hero tile */}
          <div className="relative">
            {loading || images.length < 4 ? (
              <div className="grid grid-cols-2 gap-3 md:gap-4 aspect-[1/1]">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-2xl bg-[#F1F4F9] animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 grid-rows-[auto_auto] gap-3 md:gap-4">
                {/* Tall left tile spans both rows */}
                <div className="row-span-2 rounded-2xl overflow-hidden aspect-[3/4]">
                  <img
                    src={a.src}
                    alt={a.name}
                    loading="lazy"
                    onError={makeImageFallback({ id: a.id, name: a.name })}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden aspect-[4/3]">
                  <img
                    src={b.src}
                    alt={b.name}
                    loading="lazy"
                    onError={makeImageFallback({ id: b.id, name: b.name })}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden aspect-[4/3] grid grid-cols-2 gap-3 md:gap-4">
                  <div className="rounded-2xl overflow-hidden">
                    <img
                      src={c.src}
                      alt={c.name}
                      loading="lazy"
                      onError={makeImageFallback({ id: c.id, name: c.name })}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="rounded-2xl overflow-hidden">
                    <img
                      src={d.src}
                      alt={d.name}
                      loading="lazy"
                      onError={makeImageFallback({ id: d.id, name: d.name })}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Floating verified badge over the collage */}
            <div className="absolute -bottom-4 -left-4 md:bottom-4 md:left-4 inline-flex items-center gap-2 bg-white border border-[#E6EAF0] dark:bg-[#161616] dark:border-white/10 rounded-full px-4 py-2 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
              <BadgeCheck className="w-4 h-4 text-[#2F80ED]" strokeWidth={2.4} />
              <span className="font-['Inter:SemiBold',sans-serif] text-[12px] text-[#0B1F3B] dark:text-white tracking-[0.06em] uppercase">
                {t("Verified portfolio")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default VerifiedCollectionSection;
