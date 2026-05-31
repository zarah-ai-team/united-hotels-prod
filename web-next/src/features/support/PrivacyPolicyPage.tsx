import { ShieldCheck, Database, Target, Share2, Archive, Mail } from "lucide-react";
import { Navigation } from "@/shared/components/Navigation";
import { Footer } from "@/shared/components/Footer";
import { useSEO, breadcrumbLd } from "@/shared/hooks/useSEO";

// Privacy Policy content is supplied by the business. Each entry renders as a
// card so the page stays readable on every viewport. `points` becomes a
// bulleted list; `body` is a single paragraph.
type PolicySection = {
  icon: typeof Database;
  title: string;
  body?: string;
  points?: string[];
};

const PRIVACY_SECTIONS: PolicySection[] = [
  {
    icon: Database,
    title: "Data Collection",
    body:
      "Upon check-in, hotels are legally required to collect your full name, passport or ID details (for the Kbs / Police notification system), contact information, and payment details.",
  },
  {
    icon: Target,
    title: "Purpose of Use",
    body:
      "Your data is used to process your reservation, ensure hotel security, meet legal reporting requirements, and provide requested services (e.g. tour bookings).",
  },
  {
    icon: Share2,
    title: "Third-Party Sharing",
    body:
      "Hotels do not share your personal data with third parties except for legal authorities (law enforcement) or service providers directly related to your stay (e.g. credit card processors).",
  },
  {
    icon: Archive,
    title: "Storage & Retention",
    body:
      "Most hotels retain guest records for 10 years, as required by Turkish tax and commercial laws.",
  },
];

export function PrivacyPolicyPage() {
  useSEO({
    title: "Privacy Policy | Book United Hotels",
    description:
      "How United Hotels and our partner hotels collect, use, share, and store your personal data — in line with Turkish legal requirements.",
    canonical: "/privacy",
    jsonLd: [
      breadcrumbLd([
        { name: "Home", url: "/" },
        { name: "Privacy Policy", url: "/privacy" },
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
            <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-[#2F80ED]" />
          </div>
          <h1 className="font-['Poppins:Bold',sans-serif] text-[30px] sm:text-[40px] md:text-[52px] leading-[1.15] md:leading-[62px] text-[#3b3b3b] mb-4 md:mb-6">
            Privacy Policy
          </h1>
          <p className="font-['Inter:Regular',sans-serif] text-[15px] md:text-[19px] text-[#6b7280] leading-[24px] md:leading-[31px]">
            How your personal data is collected, used, and protected when you
            book and stay with our partner hotels.
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="py-12 md:py-20 flex-1">
        <div className="max-w-[900px] mx-auto px-5 md:px-10">
          <div className="mb-8 md:mb-12">
            <p className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[16px] text-[#6b7280] leading-[24px] md:leading-[28px]">
              For all hotels on our list, the following data-privacy rules apply
              under legal obligation. We keep them transparent so you always know
              what happens with your information.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
            {PRIVACY_SECTIONS.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="bg-white border border-[#d1d5db] rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-11 h-11 md:w-12 md:h-12 bg-[#2F80ED]/10 rounded-xl mb-4 md:mb-5">
                  <Icon className="w-5 h-5 md:w-6 md:h-6 text-[#2F80ED]" />
                </div>
                <h2 className="font-['Poppins:SemiBold',sans-serif] text-[18px] md:text-[20px] text-[#3b3b3b] mb-2 md:mb-3">
                  {title}
                </h2>
                <p className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[15px] text-[#6b7280] leading-[23px] md:leading-[25px]">
                  {body}
                </p>
              </div>
            ))}
          </div>

          {/* Contact callout */}
          <div className="mt-8 md:mt-12 bg-white border border-[#2F80ED]/40 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
            <div className="inline-flex items-center justify-center w-11 h-11 md:w-12 md:h-12 bg-[#2F80ED]/10 rounded-xl shrink-0 mx-auto sm:mx-0">
              <Mail className="w-5 h-5 md:w-6 md:h-6 text-[#2F80ED]" />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-['Poppins:SemiBold',sans-serif] text-[16px] md:text-[18px] text-[#3b3b3b] mb-1.5 md:mb-2">
                Questions about your data?
              </h3>
              <p className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[15px] text-[#6b7280] leading-[22px] md:leading-[24px]">
                Reach our team at{" "}
                <a
                  href="mailto:hello@unitedhotels.com"
                  className="text-[#2F80ED] hover:underline break-all"
                >
                  hello@unitedhotels.com
                </a>{" "}
                and we'll be happy to help.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default PrivacyPolicyPage;
