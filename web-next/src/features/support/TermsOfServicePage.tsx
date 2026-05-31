import {
  FileText, LogIn, CalendarX, UserCheck, Hammer, CigaretteOff, CalendarClock,
} from "lucide-react";
import { Navigation } from "@/shared/components/Navigation";
import { Footer } from "@/shared/components/Footer";
import { useSEO, breadcrumbLd } from "@/shared/hooks/useSEO";

// ── General rules ───────────────────────────────────────────────────────────
// Apply to almost every hotel on the platform. Supplied by the business.
type Rule = { icon: typeof LogIn; title: string; body: string };

const GENERAL_RULES: Rule[] = [
  {
    icon: LogIn,
    title: "Check-in / Check-out",
    body:
      "Check-in is typically at 14:00 (2 PM) and check-out is at 12:00 (Noon). Late check-outs may incur additional fees.",
  },
  {
    icon: CalendarX,
    title: "No-Show & Cancellation",
    body:
      "If you do not arrive or fail to cancel within the specified window (usually 24–48 hours), the hotel reserves the right to charge the first night's stay.",
  },
  {
    icon: UserCheck,
    title: "Age Requirement",
    body:
      "At least one guest in the room must be 18 years or older with a valid ID.",
  },
  {
    icon: Hammer,
    title: "Damage Policy",
    body:
      "Guests are responsible for any damage caused to the room or hotel property during their stay.",
  },
  {
    icon: CigaretteOff,
    title: "Non-Smoking Policy",
    body:
      "Most boutique hotels in Istanbul are strictly non-smoking in rooms; violation usually results in a cleaning fee.",
  },
];

// ── Cancellation policies ────────────────────────────────────────────────────
// Grouped by area exactly as provided by the business. Each hotel is one row.
type HotelPolicy = { name: string; policy: string };
type PolicyGroup = { area: string; hotels: HotelPolicy[] };

const CANCELLATION_GROUPS: PolicyGroup[] = [
  {
    area: "Sultanahmet & Sirkeci",
    hotels: [
      { name: "Royan Hotel", policy: "Free cancellation up to 48 hours before arrival. Cancellations within 48 hours are charged the first night's stay." },
      { name: "Amiral Palace", policy: "Free cancellation up to 24–48 hours before check-in. Generally flexible for individual travellers." },
      { name: "Best Point Hotel", policy: "Typically requires 48 hours' notice for free cancellation due to high demand as a boutique property." },
      { name: "Ağan Hotel", policy: "One of the more flexible options — often free cancellation up to 24 hours before arrival." },
      { name: "Sirkeci Golden Horn", policy: "Free cancellation until 48 hours before the check-in date." },
      { name: "Erboy Hotel", policy: "Free cancellation until 24 to 48 hours before arrival." },
      { name: "Sirkeci Park Hotel", policy: "Free cancellation usually allowed up to 24 hours before the arrival date." },
      { name: "Triton Hotel", policy: "As a small boutique hotel, typically requires at least 48 hours' notice for a full refund." },
      { name: "Hotel Romantic", policy: "Free cancellation generally available until 48 hours before arrival." },
      { name: "Avicenna Hotel", policy: "Free cancellation up to 48 hours before the scheduled check-in." },
      { name: "Sumengen Hotel", policy: "Due to sea-view popularity, a 48-hour cancellation window is strictly enforced." },
      { name: "Evsen Hotel", policy: "Very flexible — usually free cancellation up to 24 hours before check-in." },
      { name: "Abel Hotel", policy: "Free cancellation standard until 48 hours prior to arrival." },
      { name: "Tria Hotel", policy: "Typically a 48-hour free cancellation window for standard rates." },
      { name: "Armada Hotel", policy: "Generally allows free cancellation up to 24–48 hours before arrival." },
    ],
  },
  {
    area: "Karaköy & Galata",
    hotels: [
      { name: "Wings Hotels (Karaköy / Pera / Collection)", policy: "Modern boutique policy — free cancellation up to 48 hours before arrival." },
      { name: "Root Hotel Karaköy", policy: "Usually requires a 48-hour notice period for free cancellation." },
      { name: "Sub Hotel Karaköy", policy: "Standard free cancellation window is 48 hours before check-in." },
      { name: "Weingart Istanbul (Suite / Seaside)", policy: "Typically free cancellation up to 48 hours before arrival." },
      { name: "Khai Hotel Karaköy", policy: "As a high-end boutique, may require 72 hours' notice during peak seasons, otherwise 48 hours." },
      { name: "Bankerhan Hotel", policy: "Free cancellation available until 48 hours before the arrival date." },
      { name: "The Galata Istanbul Hotel (MGallery)", policy: "Follows Accor standards — usually 24–48 hours before arrival (often by 2:00 PM or 6:00 PM local time)." },
      { name: "Galatas Hotel", policy: "Free cancellation generally accepted up to 48 hours before arrival." },
      { name: "The House Hotel", policy: "Often requires 48 to 72 hours' notice for free cancellation due to its luxury status." },
      { name: "Nordstern Hotel Galata", policy: "Standard policy allows free cancellation up to 48 hours before arrival." },
      { name: "The Haze Karaköy", policy: "Generally offers a flexible 24 to 48-hour cancellation window." },
      { name: "Anemon Galata Hotel", policy: "Standard chain policy usually allows cancellation up to 24 hours before arrival." },
      { name: "Walton Hotels Galata", policy: "Free cancellation typically allowed up to 48 hours before check-in." },
    ],
  },
  {
    area: "Beyoğlu & Other Areas",
    hotels: [
      { name: "Ramada Tryp Beyoğlu", policy: "Follows Wyndham corporate policy — usually free cancellation until 24 hours before arrival (by 4:00 PM or 6:00 PM)." },
      { name: "City Centre Beyoğlu", policy: "Standard policy is free cancellation until 24–48 hours before arrival." },
      { name: "Tryp Bosphorus Hotel", policy: "Generally allows free cancellation up to 24 hours before the arrival date." },
      { name: "Union Hotel", policy: "Typically offers a flexible 24-hour cancellation policy." },
      { name: "OrientBank Hotel / Orient Occident Hotel", policy: "Follows Marriott Autograph Collection standards — usually 48 to 72 hours' notice for free cancellation." },
      { name: "Hotel Momento Golden Horn", policy: "Usually offers free cancellation up to 24–48 hours before the arrival date." },
    ],
  },
];

export function TermsOfServicePage() {
  useSEO({
    title: "Terms of Service & Cancellation Policy | Book United Hotels",
    description:
      "General booking rules — check-in times, no-show and cancellation terms, age and damage policies — plus hotel-by-hotel cancellation windows.",
    canonical: "/terms",
    jsonLd: [
      breadcrumbLd([
        { name: "Home", url: "/" },
        { name: "Terms of Service", url: "/terms" },
      ]),
    ],
  });

  return (
    <div className="bg-[#fafafa] min-h-screen flex flex-col">
      <Navigation />

      {/* Hero */}
      <section className="bg-white py-12 md:py-20 border-b border-[#eaeaea]">
        <div className="max-w-[900px] mx-auto px-5 md:px-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-[#2F80ED]/10 rounded-2xl mb-4 md:mb-6">
            <FileText className="w-6 h-6 md:w-8 md:h-8 text-[#2F80ED]" />
          </div>
          <h1 className="font-['Poppins:Bold',sans-serif] text-[30px] sm:text-[40px] md:text-[52px] leading-[1.15] md:leading-[62px] text-[#3b3b3b] mb-4 md:mb-6">
            Terms of Service
          </h1>
          <p className="font-['Inter:Regular',sans-serif] text-[15px] md:text-[19px] text-[#6b7280] leading-[24px] md:leading-[31px]">
            The booking rules that apply across our partner hotels, plus
            hotel-by-hotel cancellation windows so there are no surprises.
          </p>
        </div>
      </section>

      {/* General rules */}
      <section className="py-12 md:py-20">
        <div className="max-w-[1000px] mx-auto px-5 md:px-10">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="font-['Poppins:Bold',sans-serif] text-[26px] md:text-[40px] leading-[1.2] md:leading-[50px] text-[#3b3b3b] mb-3 md:mb-4">
              General Rules
            </h2>
            <p className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[18px] text-[#6b7280]">
              These terms apply to almost every hotel on our list.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {GENERAL_RULES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="bg-white border border-[#d1d5db] rounded-2xl p-6 md:p-7 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-11 h-11 bg-[#2F80ED]/10 rounded-xl mb-4">
                  <Icon className="w-5 h-5 text-[#2F80ED]" />
                </div>
                <h3 className="font-['Poppins:SemiBold',sans-serif] text-[17px] md:text-[18px] text-[#3b3b3b] mb-2">
                  {title}
                </h3>
                <p className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[15px] text-[#6b7280] leading-[23px] md:leading-[25px]">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cancellation policies */}
      <section className="py-12 md:py-20 bg-white border-t border-[#eaeaea]">
        <div className="max-w-[1000px] mx-auto px-5 md:px-10">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-[#2F80ED]/10 rounded-2xl mb-4 md:mb-5">
              <CalendarClock className="w-6 h-6 md:w-7 md:h-7 text-[#2F80ED]" />
            </div>
            <h2 className="font-['Poppins:Bold',sans-serif] text-[26px] md:text-[40px] leading-[1.2] md:leading-[50px] text-[#3b3b3b] mb-3 md:mb-4">
              Cancellation Policies
            </h2>
            <p className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[18px] text-[#6b7280] max-w-[620px] mx-auto">
              Windows vary by property. The exact policy for your stay is always
              shown clearly during booking.
            </p>
          </div>

          <div className="space-y-8 md:space-y-12">
            {CANCELLATION_GROUPS.map((group) => (
              <div key={group.area}>
                <h3 className="font-['Poppins:SemiBold',sans-serif] text-[18px] md:text-[22px] text-[#3b3b3b] mb-4 md:mb-5">
                  {group.area}
                </h3>

                {/* Bordered table. The wrapper draws the outer border + rounded
                    corners; each row is divided by a clearly-visible line. The
                    Hotel/Policy header only shows from md+ — on mobile each row
                    stacks (hotel name above its policy) so nothing overflows. */}
                <div className="overflow-hidden rounded-xl border border-[#d1d5db]">
                  {/* Header row (md+ only) */}
                  <div className="hidden md:grid grid-cols-[260px_1fr] bg-[#f3f4f6] border-b border-[#d1d5db]">
                    <div className="px-5 py-3 font-['Poppins:SemiBold',sans-serif] text-[14px] text-[#3b3b3b] border-r border-[#d1d5db]">
                      Hotel
                    </div>
                    <div className="px-5 py-3 font-['Poppins:SemiBold',sans-serif] text-[14px] text-[#3b3b3b]">
                      Cancellation Policy
                    </div>
                  </div>

                  {group.hotels.map((h, i) => (
                    <div
                      key={h.name}
                      className={`flex flex-col md:grid md:grid-cols-[260px_1fr] ${
                        i % 2 === 1 ? "bg-[#fafafa]" : "bg-white"
                      } ${i > 0 ? "border-t border-[#d1d5db]" : ""}`}
                    >
                      <div className="px-4 md:px-5 pt-4 pb-1.5 md:py-4 font-['Inter:SemiBold',sans-serif] text-[15px] md:text-[15px] text-[#3b3b3b] md:border-r md:border-[#d1d5db]">
                        {h.name}
                      </div>
                      <div className="px-4 md:px-5 pb-4 md:py-4 font-['Inter:Regular',sans-serif] text-[13.5px] md:text-[15px] text-[#6b7280] leading-[21px] md:leading-[24px]">
                        {h.policy}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 md:mt-12 font-['Inter:Regular',sans-serif] text-[12.5px] md:text-[13px] text-[#9ca3af] text-center leading-[20px]">
            Policies are indicative and may vary by rate plan, season, and
            availability. The cancellation terms confirmed at checkout always
            take precedence.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default TermsOfServicePage;
