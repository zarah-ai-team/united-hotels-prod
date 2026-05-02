import {
  BadgeCheck,
  BadgePercent,
  ReceiptText,
  MessageCircle,
  CalendarCheck,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface ValueCardProps {
  number: string;
  Icon: LucideIcon;
  title: string;
  description: string;
}

function ValueCard({ number, Icon, title, description }: ValueCardProps) {
  const { t } = useLanguage();

  return (
    <div className="group glass-card is-interactive rounded-2xl p-6 md:p-7">
      {/* Top row: icon + index */}
      <div className="flex items-center justify-between mb-7 md:mb-9">
        <div className="w-11 h-11 rounded-xl bg-white/70 dark:bg-white/[0.06] border border-[#1abc9c]/15 text-[#1abc9c] flex items-center justify-center transition-colors duration-300 group-hover:bg-[#1abc9c] group-hover:text-white group-hover:border-[#1abc9c]">
          <Icon className="w-[20px] h-[20px]" strokeWidth={1.75} />
        </div>
        <span className="font-['Inter:Medium',sans-serif] text-[11px] tracking-[0.22em] text-[#8c8c8c]">
          {number}
        </span>
      </div>

      {/* Content */}
      <h3 className="font-['Poppins:SemiBold',sans-serif] text-[17px] md:text-[18px] leading-[1.35] tracking-[-0.01em] text-[#3b3b3b] mb-2.5">
        {t(title)}
      </h3>
      <p className="font-['Inter:Regular',sans-serif] text-[13.5px] md:text-[14px] leading-[1.6] text-[#6b7280]">
        {t(description)}
      </p>

      {/* Hover arrow */}
      <ArrowUpRight
        className="absolute bottom-5 right-5 w-4 h-4 text-[#1abc9c] opacity-0 -translate-x-1 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0"
        strokeWidth={2}
      />
    </div>
  );
}

export function ValuePropositionSection() {
  const { t } = useLanguage();

  const values: Array<Omit<ValueCardProps, "number"> & { number: string }> = [
    {
      number: "01",
      Icon: BadgeCheck,
      title: "Personally Selected",
      description: "Every hotel is visited and approved by our local team in Turkey.",
    },
    {
      number: "02",
      Icon: BadgePercent,
      title: "Better Direct Rates",
      description: "Negotiated prices you won't find on the major OTAs.",
    },
    {
      number: "03",
      Icon: ReceiptText,
      title: "Total Price Upfront",
      description: "What you see is what you pay. No surprise fees at checkout.",
    },
    {
      number: "04",
      Icon: MessageCircle,
      title: "WhatsApp Support",
      description: "Real people on the ground, replying within minutes.",
    },
    {
      number: "05",
      Icon: CalendarCheck,
      title: "Flexible Cancellation",
      description: "Most hotels offer free cancellation, with terms shown clearly.",
    },
  ];

  return (
    <section
      id="why-choose-united-hotels"
      className="glass-section-bg py-10 md:py-32 relative overflow-hidden"
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        {/* Editorial header — left/right balanced */}
        <div className="grid md:grid-cols-[1.1fr_1fr] gap-8 md:gap-16 items-end mb-12 md:mb-20">
          <div>
            <div className="font-['Inter:Medium',sans-serif] text-[11px] tracking-[0.28em] uppercase text-[#8c8c8c] mb-4">
              {t("Why United Hotels")}
            </div>
            <h2 className="font-['Poppins:Bold',sans-serif] text-[32px] md:text-[48px] leading-[1.08] tracking-[-0.022em] text-[#3b3b3b]">
              {t("Not another OTA.")}
            </h2>
          </div>
          <p className="font-['Inter:Regular',sans-serif] text-[15px] md:text-[16px] leading-[1.65] text-[#6b7280] max-w-[460px] md:justify-self-end">
            {t("We focus on one country and one job — helping you find the right stay in Turkey, end to end. No noise, no surprises.")}
          </p>
        </div>

        {/* Value Cards — 1 / 2 / 5 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          {values.map((v) => (
            <ValueCard
              key={v.number}
              number={v.number}
              Icon={v.Icon}
              title={v.title}
              description={v.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ValuePropositionSection;
