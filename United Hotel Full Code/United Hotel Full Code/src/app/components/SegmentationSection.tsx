import { Link } from "react-router";
import { Search, MessageSquareQuote, ArrowRight, User, Users } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export function SegmentationSection() {
  const { t } = useLanguage();

  return (
    <section
      id="segments"
      className="py-10 md:py-14 relative overflow-hidden bg-[#EFF2F8] dark:bg-[#0A0A0A]"
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        {/* Editorial header */}
        <div className="text-center mb-8 md:mb-10">
          <div className="font-['Inter:Medium',sans-serif] text-[11px] tracking-[0.28em] uppercase text-[#8c8c8c] mb-4">
            {t("Choose your way to travel")}
          </div>
          <h2 className="font-['Poppins:Bold',sans-serif] text-[32px] md:text-[48px] leading-[1.08] tracking-[-0.022em] text-[#3b3b3b]">
            {t("Two ways to travel with us.")}
          </h2>
        </div>

        {/* Two cards side-by-side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* For Travelers */}
          <div
            id="for-travelers"
            className="group glass-card is-interactive rounded-2xl p-7 md:p-10 flex flex-col scroll-mt-24"
          >
            <div className="w-12 h-12 rounded-xl bg-white/70 dark:bg-white/[0.06] border border-[#2F80ED]/15 text-[#2F80ED] flex items-center justify-center mb-6 transition-colors duration-300 group-hover:bg-[#2F80ED] group-hover:text-white group-hover:border-[#2F80ED]">
              <User className="w-[22px] h-[22px]" strokeWidth={1.75} />
            </div>
            <div className="font-['Inter:Medium',sans-serif] text-[11px] tracking-[0.24em] uppercase text-[#2F80ED] mb-3">
              {t("Individual travellers")}
            </div>
            <h3 className="font-['Poppins:Bold',sans-serif] text-[24px] md:text-[28px] leading-[1.18] tracking-[-0.018em] text-[#3b3b3b] dark:text-white mb-4">
              {t("Find your stay in minutes.")}
            </h3>
            <p className="font-['Inter:Regular',sans-serif] text-[14.5px] md:text-[15.5px] leading-[1.6] text-[#6b7280] mb-7 flex-1">
              {t("Curated hotels in Turkey's most popular destinations — verified, fairly priced, instantly bookable.")}
            </p>
            <Link
              to="/listing"
              onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "auto" })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2F80ED] text-white font-['Inter:SemiBold',sans-serif] text-[14px] md:text-[15px] hover:bg-[#1E5FBC] transition-colors w-fit"
            >
              <Search className="w-4 h-4" strokeWidth={2.4} />
              {t("Browse hotels")}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </Link>
          </div>

          {/* For Groups */}
          <div
            id="for-groups"
            className="group glass-card is-interactive rounded-2xl p-7 md:p-10 flex flex-col scroll-mt-24"
          >
            <div className="w-12 h-12 rounded-xl bg-white/70 dark:bg-white/[0.06] border border-[#2F80ED]/15 text-[#2F80ED] flex items-center justify-center mb-6 transition-colors duration-300 group-hover:bg-[#2F80ED] group-hover:text-white group-hover:border-[#2F80ED]">
              <Users className="w-[22px] h-[22px]" strokeWidth={1.75} />
            </div>
            <div className="font-['Inter:Medium',sans-serif] text-[11px] tracking-[0.24em] uppercase text-[#2F80ED] mb-3">
              {t("Groups & events")}
            </div>
            <h3 className="font-['Poppins:Bold',sans-serif] text-[24px] md:text-[28px] leading-[1.18] tracking-[-0.018em] text-[#3b3b3b] dark:text-white mb-4">
              {t("Built for group travel, not adapted for it.")}
            </h3>
            <p className="font-['Inter:Regular',sans-serif] text-[14.5px] md:text-[15.5px] leading-[1.6] text-[#6b7280] mb-7 flex-1">
              {t("Tailored hotel solutions for groups, tours, and corporate travel — with dedicated coordination and negotiated rates.")}
            </p>
            <Link
              to="/groups"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#3b3b3b] text-white font-['Inter:SemiBold',sans-serif] text-[14px] md:text-[15px] hover:bg-[#2F80ED] transition-colors w-fit"
            >
              <MessageSquareQuote className="w-4 h-4" strokeWidth={2.4} />
              {t("Get group quote")}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SegmentationSection;
