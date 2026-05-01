import imgQualityBackdrop from "../../assets/istanbul-golden-horn.jpg";
import {
  Eye,
  MapPin,
  Sparkles,
  Shield,
  ClipboardCheck,
  Award,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface PillarSpec {
  Icon: LucideIcon;
  title: string;
  description: string;
}

export function QualityAssuranceSection() {
  const { t } = useLanguage();

  const pillars: PillarSpec[] = [
    {
      Icon: Eye,
      title: "In-Person Verification",
      description: "Our team visits every hotel in person before it appears on the platform.",
    },
    {
      Icon: MapPin,
      title: "Location Reality Check",
      description: "We confirm walking times, neighbourhood feel, and safe transport access.",
    },
    {
      Icon: Sparkles,
      title: "Cleanliness Audits",
      description: "Unannounced inspections keep hygiene standards consistent year-round.",
    },
    {
      Icon: Shield,
      title: "Safety Standards",
      description: "Fire systems, locks, and emergency procedures are reviewed on every visit.",
    },
    {
      Icon: ClipboardCheck,
      title: "Price Transparency",
      description: "What you see is exactly what you pay. No surprise resort or service fees.",
    },
    {
      Icon: Award,
      title: "Guest Review Watch",
      description: "We track recurring complaints and remove properties that slip in quality.",
    },
  ];

  const inspectionStats = [
    { value: "100%", label: t("Hotels visited in person") },
    { value: "48h", label: t("Avg. support response") },
    { value: "1:1", label: t("Local team per region") },
  ];

  const pillarRows: PillarSpec[][] = [
    pillars.slice(0, 2),
    pillars.slice(2, 4),
    pillars.slice(4, 6),
  ];

  return (
    <section id="quality" className="relative py-20 md:py-32 overflow-hidden">
      {/* Cinematic backdrop — same image language as the numbers section */}
      <div className="absolute inset-0">
        <img
          src={imgQualityBackdrop}
          alt=""
          aria-hidden
          className="w-full h-full object-cover scale-[1.04]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(8,12,16,0.72) 0%, rgba(8,12,16,0.6) 40%, rgba(8,12,16,0.82) 100%)",
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

      <div className="relative max-w-[1280px] mx-auto px-4 md:px-10 space-y-5 md:space-y-7">
        {/* Slab 1 — header, stats, pillars all in one focused glass panel */}
        <div className="hero-glass rounded-[24px] p-7 md:p-12 lg:p-14">
          {/* Editorial header */}
          <div className="grid md:grid-cols-[1.1fr_1fr] gap-6 md:gap-16 items-end">
            <div>
              <div className="inline-flex items-center gap-2 font-['Inter:Medium',sans-serif] text-[11px] tracking-[0.28em] uppercase text-[#1abc9c] mb-4">
                <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
                {t("Quality you can verify")}
              </div>
              <h2 className="font-['Poppins:Bold',sans-serif] text-[30px] md:text-[46px] leading-[1.08] tracking-[-0.022em] text-white">
                {t("Every hotel, personally vetted.")}
              </h2>
            </div>
            <p className="font-['Inter:Regular',sans-serif] text-[14.5px] md:text-[16px] leading-[1.65] text-white/80 max-w-[460px] md:justify-self-end">
              {t("OTAs list whoever pays. We physically inspect every property — no fake photos, no surprise disappointments, no booking and hoping for the best.")}
            </p>
          </div>

          {/* Inspection stats */}
          <div className="grid grid-cols-3 mt-10 md:mt-14 border-t border-white/15">
            {inspectionStats.map((s, i) => (
              <div
                key={i}
                className={`py-6 md:py-8 ${
                  i > 0 ? "border-l border-white/15 pl-4 md:pl-6" : "pr-4 md:pr-6"
                }`}
              >
                <div className="font-['Poppins:Bold',sans-serif] text-[26px] md:text-[40px] leading-none tracking-[-0.03em] text-white">
                  {s.value}
                </div>
                <div className="mt-2 md:mt-3 font-['Inter:Regular',sans-serif] text-[11.5px] md:text-[13.5px] text-white/70 leading-[1.4]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Pillars — clean editorial list, 2 cols × 3 rows, hairline separators */}
          <div className="mt-10 md:mt-14 pt-10 md:pt-14 border-t border-white/15">
            <div className="font-['Inter:Medium',sans-serif] text-[11px] tracking-[0.28em] uppercase text-white/60 mb-7 md:mb-10">
              {t("How we vet every property")}
            </div>

            <div className="space-y-7 md:space-y-0">
              {pillarRows.map((row, rowIdx) => (
                <div
                  key={rowIdx}
                  className={`grid sm:grid-cols-2 gap-y-7 sm:gap-x-10 md:gap-x-14 ${
                    rowIdx > 0
                      ? "sm:border-t sm:border-white/10 sm:pt-7 md:sm:pt-9 sm:mt-7 md:sm:mt-9"
                      : ""
                  }`}
                >
                  {row.map((p, j) => {
                    const idx = rowIdx * 2 + j;
                    const Icon = p.Icon;
                    return (
                      <div
                        key={p.title}
                        className={`group flex gap-4 md:gap-5 ${
                          j === 1 ? "sm:pl-10 md:sm:pl-14 sm:border-l sm:border-white/10" : ""
                        }`}
                      >
                        <div className="shrink-0 w-11 h-11 rounded-xl bg-white/10 border border-white/15 text-[#1abc9c] flex items-center justify-center transition-colors duration-300 group-hover:bg-[#1abc9c] group-hover:text-white group-hover:border-[#1abc9c]">
                          <Icon className="w-[20px] h-[20px]" strokeWidth={1.75} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-['Inter:Medium',sans-serif] text-[10.5px] tracking-[0.24em] uppercase text-white/55 mb-1.5">
                            0{idx + 1}
                          </div>
                          <h3 className="font-['Poppins:SemiBold',sans-serif] text-[16.5px] md:text-[17.5px] leading-[1.35] text-white mb-1.5">
                            {t(p.title)}
                          </h3>
                          <p className="font-['Inter:Regular',sans-serif] text-[13.5px] md:text-[14px] leading-[1.6] text-white/75">
                            {t(p.description)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Slab 2 — promise */}
        <div className="hero-glass rounded-[24px] p-6 md:p-8 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1 bg-[#1abc9c]" />
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5 md:gap-6 pl-3 md:pl-4">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-white/10 border border-white/15 text-[#1abc9c] flex items-center justify-center">
              <ShieldCheck className="w-[22px] h-[22px]" strokeWidth={1.75} />
            </div>
            <div className="flex-1">
              <div className="font-['Inter:Medium',sans-serif] text-[11px] tracking-[0.28em] uppercase text-white/55 mb-1.5">
                {t("Our promise")}
              </div>
              <h3 className="font-['Poppins:SemiBold',sans-serif] text-[18px] md:text-[20px] leading-[1.4] tracking-[-0.01em] text-white mb-1">
                {t("If a stay doesn't match what we promised, we relocate you — at our cost.")}
              </h3>
              <p className="font-['Inter:Regular',sans-serif] text-[13.5px] md:text-[14.5px] leading-[1.6] text-white/75">
                {t("Cleanliness, safety, photos, location — if we got any of it wrong, we move you to a comparable or better hotel and cover the difference.")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default QualityAssuranceSection;
