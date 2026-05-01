import { Eye, TrendingDown, Shield, MessageCircle, Award, Check, Clock, Sparkles, type LucideIcon } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface FeatureCardProps {
  Icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

function FeatureCard({ Icon, title, description, index }: FeatureCardProps) {
  const { t } = useLanguage();

  return (
    <div className="group relative glass-card is-interactive rounded-2xl p-6 md:p-7 overflow-hidden">
      {/* Soft accent blob — fades on hover for liveliness */}
      <div
        aria-hidden
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br from-[#1abc9c]/15 to-[#38bdf8]/10 blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-500"
      />

      {/* Index micro-label */}
      <div className="relative font-['Inter:Medium',sans-serif] text-[9.5px] tracking-[0.28em] uppercase text-[#1abc9c] mb-4">
        0{index + 1}
      </div>

      {/* Icon — gradient ring on hover */}
      <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-white/85 to-white/50 dark:from-white/[0.08] dark:to-white/[0.02] ring-1 ring-[#1abc9c]/20 text-[#1abc9c] flex items-center justify-center shadow-[0_8px_24px_-12px_rgba(26,188,156,0.4)] transition-all duration-300 group-hover:ring-[#1abc9c]/45 group-hover:shadow-[0_12px_28px_-10px_rgba(26,188,156,0.5)] group-hover:scale-105 mb-5">
        <Icon className="w-[20px] h-[20px]" strokeWidth={1.75} />
      </div>

      <h3 className="relative font-['Poppins:SemiBold',sans-serif] text-[17px] md:text-[18.5px] leading-[1.3] tracking-[-0.012em] text-[#1f2937] dark:text-white mb-2">
        {t(title)}
      </h3>
      <p className="relative font-['Inter:Regular',sans-serif] text-[13.5px] md:text-[14px] leading-[1.6] text-[#6b7280] dark:text-white/70">
        {t(description)}
      </p>

      {/* Hover hairline accent across bottom */}
      <div
        aria-hidden
        className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-[#1abc9c]/45 to-transparent scale-x-0 group-hover:scale-x-100 origin-center transition-transform duration-500"
      />
    </div>
  );
}

export function SEOContentSection() {
  const { t } = useLanguage();

  const features: Array<Omit<FeatureCardProps, "index">> = [
    {
      Icon: Eye,
      title: "Local Expertise",
      description:
        "Our Turkey-based team personally visits every property to ensure quality standards.",
    },
    {
      Icon: TrendingDown,
      title: "Direct Rates",
      description:
        "Better prices through exclusive hotel partnerships — no middleman markups.",
    },
    {
      Icon: Shield,
      title: "Total Transparency",
      description:
        "What you see is what you pay — no hidden fees, no surprises at checkout.",
    },
    {
      Icon: MessageCircle,
      title: "Local Support",
      description:
        "WhatsApp assistance from our on-the-ground team, every day of the week.",
    },
  ];

  const benefits = [
    "Free cancellation on most bookings",
    "Best price guarantee",
    "Instant booking confirmation",
    "No booking fees",
  ];

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Aurora blob backdrop — richer than glass-section-bg */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 8% 12%, rgba(26, 188, 156, 0.16), transparent 60%)," +
              "radial-gradient(ellipse 65% 55% at 95% 25%, rgba(56, 189, 248, 0.13), transparent 60%)," +
              "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(139, 92, 246, 0.12), transparent 55%)," +
              "#fafafa",
          }}
        />
        <div
          className="dark:block hidden absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 8% 12%, rgba(45, 212, 191, 0.16), transparent 60%)," +
              "radial-gradient(ellipse 65% 55% at 95% 25%, rgba(96, 165, 250, 0.14), transparent 60%)," +
              "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(167, 139, 250, 0.13), transparent 55%)," +
              "#0a0a0a",
          }}
        />
        {/* Floating soft orbs for visual depth */}
        <div className="absolute -top-24 left-1/4 w-72 h-72 rounded-full bg-[#1abc9c]/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-80 h-80 rounded-full bg-[#38bdf8]/10 blur-3xl" />
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-10 relative">
        {/* Editorial header — gradient accent on the headline */}
        <div className="grid md:grid-cols-[1.1fr_1fr] gap-6 md:gap-16 items-end mb-12 md:mb-16">
          <div>
            <div className="inline-flex items-center gap-2 font-['Inter:Medium',sans-serif] text-[11px] tracking-[0.28em] uppercase text-[#1abc9c] mb-4">
              <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
              {t("Why book with us")}
            </div>
            <h2 className="font-['Poppins:Bold',sans-serif] text-[32px] md:text-[52px] leading-[1.06] tracking-[-0.024em] text-[#1f2937] dark:text-white">
              {t("Affordable stays.")}{" "}
              <span className="bg-gradient-to-r from-[#1abc9c] via-[#2dd4bf] to-[#38bdf8] bg-clip-text text-transparent">
                {t("Prime locations.")}
              </span>
            </h2>
          </div>
          <p className="font-['Inter:Regular',sans-serif] text-[15px] md:text-[16.5px] leading-[1.65] text-[#6b7280] dark:text-white/70 max-w-[460px] md:justify-self-end">
            {t("Quality accommodation in Turkey doesn't have to mean compromise. Every property on our platform is personally inspected, transparently priced, and backed by local support.")}
          </p>
        </div>

        {/* Feature cards — 1 / 2 / 4 cols */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 md:mb-16">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} index={i} />
          ))}
        </div>

        {/* Two-up: traveller note + benefits list — both elevated */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-4 md:gap-5">
          {/* Traveller note — majestic glass with corner ribbon */}
          <div className="relative glass-card rounded-3xl p-7 md:p-10 overflow-hidden">
            {/* Corner ribbon */}
            <div
              aria-hidden
              className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#1abc9c]/30 via-[#2dd4bf]/15 to-transparent blur-2xl"
            />
            {/* Side accent bar */}
            <div className="absolute inset-y-7 md:inset-y-10 left-0 w-[3px] rounded-r-full bg-gradient-to-b from-[#1abc9c] via-[#2dd4bf] to-transparent" />

            <div className="relative pl-3 md:pl-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1abc9c] to-[#2dd4bf] text-white flex items-center justify-center shadow-[0_10px_30px_-10px_rgba(26,188,156,0.6)]">
                  <Sparkles className="w-[20px] h-[20px]" strokeWidth={1.75} />
                </div>
                <div className="font-['Inter:Medium',sans-serif] text-[10.5px] tracking-[0.28em] uppercase text-[#8c8c8c]">
                  {t("For every traveller")}
                </div>
              </div>

              <h3 className="font-['Poppins:Bold',sans-serif] text-[24px] md:text-[30px] leading-[1.18] tracking-[-0.018em] text-[#1f2937] dark:text-white mb-4">
                {t("Built for every kind of")}{" "}
                <span className="bg-gradient-to-r from-[#1abc9c] to-[#38bdf8] bg-clip-text text-transparent italic">
                  {t("traveller.")}
                </span>
              </h3>
              <p className="font-['Inter:Regular',sans-serif] text-[14.5px] md:text-[15.5px] leading-[1.7] text-[#6b7280] dark:text-white/70 max-w-[520px]">
                {t("Whether you're planning a weekend in Istanbul or weeks of slow travel along the coast, our curated selection puts you in Turkey's best neighbourhoods without inflated OTA pricing.")}
              </p>

              {/* Tag chips */}
              <div className="flex flex-wrap gap-2 mt-6">
                {[t("Weekend escapes"), t("Slow travel"), t("Family friendly"), t("Coastal stays")].map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-white/70 dark:bg-white/[0.06] backdrop-blur-md ring-1 ring-white/60 dark:ring-white/10 font-['Inter:Medium',sans-serif] text-[11.5px] text-[#3b3b3b] dark:text-white/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Benefits list — refined check items + glow on hover */}
          <div className="relative glass-card rounded-3xl p-7 md:p-10 overflow-hidden">
            <div
              aria-hidden
              className="absolute -bottom-20 -right-12 w-56 h-56 rounded-full bg-gradient-to-tr from-[#38bdf8]/15 to-[#1abc9c]/15 blur-3xl"
            />

            <div className="relative">
              <div className="flex items-center gap-3 mb-6 md:mb-7">
                <div className="w-12 h-12 rounded-2xl bg-white/80 dark:bg-white/[0.06] backdrop-blur-md ring-1 ring-[#1abc9c]/25 text-[#1abc9c] flex items-center justify-center shadow-[0_8px_24px_-12px_rgba(26,188,156,0.4)]">
                  <Award className="w-[20px] h-[20px]" strokeWidth={1.75} />
                </div>
                <div>
                  <div className="font-['Inter:Medium',sans-serif] text-[10.5px] tracking-[0.28em] uppercase text-[#8c8c8c] mb-1">
                    {t("On every booking")}
                  </div>
                  <h3 className="font-['Poppins:Bold',sans-serif] text-[20px] md:text-[24px] leading-[1.2] tracking-[-0.014em] text-[#1f2937] dark:text-white">
                    {t("Your booking benefits")}
                  </h3>
                </div>
              </div>

              <ul className="space-y-2">
                {benefits.map((text) => (
                  <li
                    key={text}
                    className="group flex items-center gap-3.5 px-3 py-2.5 -mx-3 rounded-xl transition-colors duration-300 hover:bg-white/50 dark:hover:bg-white/[0.04]"
                  >
                    <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-[#1abc9c] to-[#2dd4bf] text-white flex items-center justify-center shadow-[0_4px_14px_-4px_rgba(26,188,156,0.55)] transition-transform duration-300 group-hover:scale-110">
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    </div>
                    <span className="font-['Inter:Medium',sans-serif] text-[14px] md:text-[15px] text-[#3b3b3b] dark:text-white/85">
                      {t(text)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 md:mt-7 pt-5 md:pt-6 border-t border-white/40 dark:border-white/10">
                <div className="flex items-center gap-2 text-[#8c8c8c] dark:text-white/60">
                  <Clock className="w-4 h-4 shrink-0 text-[#1abc9c]" strokeWidth={2} />
                  <span className="font-['Inter:Regular',sans-serif] text-[12.5px] md:text-[13.5px]">
                    {t("Instant confirmation • Secure payment • 24/7 support")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SEOContentSection;
