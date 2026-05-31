import { Quote, Star } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  rating: number;
}

export function TestimonialsSection() {
  const { t } = useLanguage();

  const testimonials: Testimonial[] = [
    {
      quote:
        "We booked a 40-room block for our annual sales conference in Istanbul. United Hotels handled every detail — rates, room blocks, billing — and saved us nearly 18% versus the OTA quotes.",
      name: "Priya Menon",
      role: "Events Lead, Northwind Travel",
      rating: 5,
    },
    {
      quote:
        "I'm a fussy traveller and I usually spend hours researching hotels. The team picked exactly the kind of boutique stay in Cappadocia I would have chosen myself. Zero surprises at check-in.",
      name: "Daniel Brooks",
      role: "Solo traveller, London",
      rating: 5,
    },
    {
      quote:
        "Booked a multi-city tour for a 24-person family reunion. Their group desk replied on WhatsApp within minutes and got us better rates than I'd ever seen advertised. Will use again.",
      name: "Aylin Demir",
      role: "Family group, Ankara",
      rating: 5,
    },
  ];

  return (
    <section
      id="testimonials"
      className="glass-section-bg py-10 md:py-32 relative overflow-hidden"
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        {/* Editorial header */}
        <div className="text-center mb-10 md:mb-16">
          <div className="font-['Inter:Medium',sans-serif] text-[11px] tracking-[0.28em] uppercase text-[#8c8c8c] mb-4">
            {t("Trusted by travellers and groups")}
          </div>
          <h2 className="font-['Poppins:Bold',sans-serif] text-[32px] md:text-[48px] leading-[1.08] tracking-[-0.022em] text-[#3b3b3b] mb-4">
            {t("What our guests say.")}
          </h2>
          <p className="font-['Inter:Regular',sans-serif] text-[15px] md:text-[16px] leading-[1.65] text-[#6b7280] max-w-[560px] mx-auto">
            {t("Real stories from individual travellers, families, and group bookers — verified after their stay.")}
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {testimonials.map((tst, i) => (
            <figure
              key={i}
              className="group glass-card is-interactive rounded-2xl p-6 md:p-7 flex flex-col"
            >
              {/* Top row: quote icon + stars */}
              <div className="flex items-center justify-between mb-5">
                <div className="w-10 h-10 rounded-xl bg-white/70 dark:bg-white/[0.06] border border-[#2F80ED]/15 text-[#2F80ED] flex items-center justify-center transition-colors duration-300 group-hover:bg-[#2F80ED] group-hover:text-white group-hover:border-[#2F80ED]">
                  <Quote className="w-[18px] h-[18px]" strokeWidth={1.75} />
                </div>
                <div className="flex items-center gap-0.5" aria-label={`${tst.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w-[12px] h-[12px] ${
                        idx < tst.rating
                          ? "fill-[#FFA500] text-[#FFA500]"
                          : "text-[#E5E7EB] dark:text-white/15"
                      }`}
                      strokeWidth={0}
                    />
                  ))}
                </div>
              </div>

              <blockquote className="font-['Inter:Regular',sans-serif] text-[14.5px] md:text-[15px] leading-[1.65] text-[#3b3b3b] mb-6 flex-1">
                "{t(tst.quote)}"
              </blockquote>

              <figcaption className="border-t border-current/10 pt-4">
                <div className="font-['Poppins:SemiBold',sans-serif] text-[14.5px] tracking-[-0.01em] text-[#3b3b3b]">
                  {tst.name}
                </div>
                <div className="font-['Inter:Regular',sans-serif] text-[12.5px] text-[#6b7280] mt-0.5">
                  {t(tst.role)}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
