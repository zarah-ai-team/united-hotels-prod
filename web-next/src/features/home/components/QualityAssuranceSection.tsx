import { Check, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";

export function QualityAssuranceSection() {
  const { t } = useLanguage();

  // What we actually verify on every property — the 4 trust pillars,
  // distilled from the previous 6 to keep the section short and focused.
  const checks = [
    "Location accuracy",
    "Cleanliness standards",
    "Safety and facilities",
    "Real guest experience consistency",
  ];

  return (
    <section
      id="standards"
      className="relative py-10 md:py-14"
      style={{ background: "var(--brand-accent-soft)" }}
    >
      <div className="max-w-[1080px] mx-auto px-4 md:px-10 space-y-5 md:space-y-6">
        {/* Slab 1 — header + 4-check grid (white card on light blue tint) */}
        <div className="bg-white rounded-2xl border border-[#E6EAF0] dark:bg-[#161616] dark:border-white/10 p-6 md:p-8 lg:p-10 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
          <div className="grid md:grid-cols-[1.1fr_1fr] gap-6 md:gap-12 items-end">
            <div>
              <div className="inline-flex items-center gap-2 font-['Inter:SemiBold',sans-serif] text-[11px] tracking-[0.24em] uppercase text-[#2F80ED] mb-3">
                <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
                {t("Quality you can verify")}
              </div>
              <h2 className="font-['Poppins:Bold',sans-serif] text-[28px] md:text-[36px] leading-[1.15] tracking-[-0.02em] text-[#0B1F3B]">
                {t("Verified hotels. No surprises.")}
              </h2>
            </div>
            <p className="font-['Inter:Regular',sans-serif] text-[14.5px] md:text-[16px] leading-[1.6] text-[#6B7280] dark:text-white/70 max-w-[440px] md:justify-self-end">
              {t("Every hotel is personally inspected before it appears on our platform — so what you see is exactly what you get.")}
            </p>
          </div>

          {/* What we check — 4 quick items in a clean grid */}
          <div className="mt-8 md:mt-10 pt-6 md:pt-7 border-t border-[#E6EAF0]">
            <div className="font-['Inter:SemiBold',sans-serif] text-[11px] tracking-[0.24em] uppercase text-[#0B1F3B] dark:text-white mb-4 md:mb-5">
              {t("We check")}
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 md:gap-y-4">
              {checks.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 font-['Inter:Medium',sans-serif] text-[14.5px] md:text-[15.5px] text-[#0B1F3B]"
                >
                  <span className="shrink-0 w-6 h-6 rounded-full bg-[#2F80ED]/10 text-[#2F80ED] flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" strokeWidth={2.6} />
                  </span>
                  {t(item)}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Slab 2 — promise (risk reversal) */}
        <div className="bg-white rounded-2xl border border-[#E6EAF0] dark:bg-[#161616] dark:border-white/10 p-6 md:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.06)] relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1 bg-[#2F80ED]" />
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5 md:gap-6 pl-3 md:pl-4">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-[#2F80ED]/10 text-[#2F80ED] flex items-center justify-center">
              <ShieldCheck className="w-[22px] h-[22px]" strokeWidth={1.75} />
            </div>
            <div className="flex-1">
              <div className="font-['Inter:SemiBold',sans-serif] text-[11px] tracking-[0.24em] uppercase text-[#6B7280] dark:text-white/70 mb-1.5">
                {t("If something goes wrong")}
              </div>
              <h3 className="font-['Poppins:SemiBold',sans-serif] text-[18px] md:text-[20px] leading-[1.4] tracking-[-0.01em] text-[#0B1F3B] dark:text-white mb-1">
                {t("If your stay doesn't match what we promised, we relocate you — at our cost.")}
              </h3>
              <p className="font-['Inter:Regular',sans-serif] text-[13.5px] md:text-[14.5px] leading-[1.55] text-[#6B7280]">
                {t("To a comparable or better hotel. No debate. No delays.")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default QualityAssuranceSection;
