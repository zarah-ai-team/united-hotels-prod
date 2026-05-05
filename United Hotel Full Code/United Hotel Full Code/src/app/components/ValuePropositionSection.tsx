import {
  Compass,
  BadgePercent,
  ReceiptText,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface ValueItem {
  Icon: LucideIcon;
  title: string;
}

export function ValuePropositionSection() {
  const { t } = useLanguage();

  const values: ValueItem[] = [
    { Icon: Compass, title: "Local expertise in every destination" },
    { Icon: BadgePercent, title: "Exclusive hotel agreements" },
    { Icon: ReceiptText, title: "Transparent pricing" },
    { Icon: MessageCircle, title: "Real WhatsApp support" },
  ];

  return (
    <section
      id="why-choose-united-hotels"
      className="glass-section-bg py-8 md:py-12 relative overflow-hidden"
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        {/* Editorial header — left/right balanced */}
        <div className="grid md:grid-cols-[1.1fr_1fr] gap-6 md:gap-16 items-end mb-8 md:mb-10">
          <div>
            <div className="font-['Inter:Medium',sans-serif] text-[11px] tracking-[0.28em] uppercase text-[#8c8c8c] mb-4">
              {t("Why United Hotels")}
            </div>
            <h2 className="font-['Poppins:Bold',sans-serif] text-[32px] md:text-[48px] leading-[1.08] tracking-[-0.022em] text-[#3b3b3b]">
              {t("A better way to book hotels in Turkey.")}
            </h2>
          </div>
          <p className="font-['Inter:Regular',sans-serif] text-[15px] md:text-[16px] leading-[1.65] text-[#6b7280] max-w-[460px] md:justify-self-end">
            {t("We focus on trust, transparency, and real human support — not mass listings or algorithm-driven results.")}
          </p>
        </div>

        {/* Compact 4-up row — icon + single line, no body copy.
            Keeps the section short so each pillar reads in seconds. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {values.map(({ Icon, title }) => (
            <div
              key={title}
              className="group glass-card is-interactive rounded-2xl p-5 md:p-6 flex items-center gap-4"
            >
              <div className="shrink-0 w-11 h-11 rounded-xl bg-white/70 dark:bg-white/[0.06] border border-[#2F80ED]/15 text-[#2F80ED] flex items-center justify-center transition-colors duration-300 group-hover:bg-[#2F80ED] group-hover:text-white group-hover:border-[#2F80ED]">
                <Icon className="w-[20px] h-[20px]" strokeWidth={1.75} />
              </div>
              <h3 className="font-['Poppins:SemiBold',sans-serif] text-[15px] md:text-[16px] leading-[1.3] tracking-[-0.005em] text-[#3b3b3b]">
                {t(title)}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ValuePropositionSection;
