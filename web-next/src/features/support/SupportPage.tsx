import { useState } from "react";
import {
  Phone, Mail, MessageCircle, Clock,
  ChevronDown, Send, MapPin, HelpCircle
} from "lucide-react";
import { Navigation } from "@/shared/components/Navigation";
import { useSEO, faqLd, breadcrumbLd } from "@/shared/hooks/useSEO";
import { API_BASE_URL, API_ENDPOINTS, joinUrl } from "@/shared/config/api";

// Subset of the in-page FAQ — surfaced to Google as FAQ schema so the
// support page can win "People Also Ask" placements.
const SUPPORT_FAQ_FOR_SCHEMA: Array<{ question: string; answer: string }> = [
  {
    question: "How do I make a hotel reservation?",
    answer:
      "Search for your destination and dates on the homepage, browse available hotels, select your preferred room, and complete the booking process. You'll receive instant confirmation via email with your booking ID.",
  },
  {
    question: "Can I cancel or modify my booking?",
    answer:
      "Most of our hotels offer free cancellation up to 24-48 hours before check-in. Manage bookings through the Guest Portal or contact our support team. Policies vary by hotel and are shown clearly during booking.",
  },
  {
    question: "Do you charge any booking fees?",
    answer:
      "We charge a small service fee that is clearly displayed before you complete the booking. There are no hidden fees — the final price you see is exactly what you pay.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "All major credit cards (Visa, Mastercard, American Express), debit cards, and local payment methods including UPI and net banking for Indian customers.",
  },
  {
    question: "How will I receive my booking confirmation?",
    answer:
      "An instant email confirmation with booking ID, hotel details, and booking voucher. All bookings are also accessible through the Guest Portal.",
  },
];

// FAQ Accordion Component
function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How do I make a hotel reservation?",
      answer: "Simply search for your destination and dates on our homepage, browse available hotels, select your preferred room, and complete the booking process. You'll receive instant confirmation via email with your booking ID."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and local payment methods including UPI and net banking for Indian customers."
    },
    {
      question: "Can I cancel or modify my booking?",
      answer: "Most of our hotels offer free cancellation up to 24-48 hours before check-in. You can manage your booking through the Guest Portal or contact our support team for assistance. Cancellation policies vary by hotel and are clearly shown during booking."
    },
    {
      question: "Is my payment secure?",
      answer: "Absolutely. We use industry-standard SSL encryption and work with trusted payment gateways to ensure your financial information is always protected. We never store your complete credit card details."
    },
    {
      question: "Do you charge any booking fees?",
      answer: "We charge a small service fee which is clearly displayed before you complete your booking. Unlike OTAs, there are no hidden fees—the final price you see is exactly what you pay."
    },
    {
      question: "What's included in the room price?",
      answer: "All applicable taxes and service fees are included in the displayed price. Additional amenities like breakfast or airport transfers are clearly marked if included or available for an extra charge."
    },
    {
      question: "How will I receive my booking confirmation?",
      answer: "You'll receive an instant email confirmation with your booking ID, hotel details, and booking voucher. You can also access all your bookings anytime through the Guest Portal."
    },
    {
      question: "What if I need to contact the hotel directly?",
      answer: "Your booking confirmation email includes the hotel's direct contact information. You can reach out to them for special requests or questions about your stay."
    },
    {
      question: "Do you offer airport transfers?",
      answer: "Many of our partner hotels offer airport shuttle services. This information is shown on each hotel's detail page. You can also request transfers through our WhatsApp support."
    },
    {
      question: "What is your price match guarantee?",
      answer: "If you find a lower price for the same hotel and room type on another platform within 24 hours of booking, contact us and we'll match the price and give you an additional 5% discount."
    }
  ];

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="bg-white border border-[#eaeaea] rounded-xl overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-4 md:px-6 py-4 md:py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-['Poppins:SemiBold',sans-serif] text-[15px] md:text-[17px] text-[#3b3b3b] pr-3 md:pr-4">
              {faq.question}
            </span>
            <ChevronDown
              className={`w-5 h-5 text-[#2F80ED] flex-shrink-0 transition-transform ${
                openIndex === index ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openIndex === index && (
            <div className="px-4 md:px-6 pb-4 md:pb-5">
              <p className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[16px] text-[#6b7280] leading-[22px] md:leading-[26px]">
                {faq.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function SupportPage() {
  useSEO({
    title: "Help & support | Book United Hotels",
    description:
      "Get help with bookings, cancellations, payments, and travel questions. WhatsApp, email, and phone support for travellers booking hotels in Turkey.",
    canonical: "/support",
    jsonLd: [
      breadcrumbLd([
        { name: "Home", url: "/" },
        { name: "Support", url: "/support" },
      ]),
      faqLd(SUPPORT_FAQ_FOR_SCHEMA),
    ],
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    notifyByEmail: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<
    | { kind: "idle" }
    | { kind: "success"; message: string }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback({ kind: "idle" });
    try {
      const res = await fetch(joinUrl(API_BASE_URL, API_ENDPOINTS.SUPPORT.CONTACT), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Could not send your message. Please try again.");
      }
      setFeedback({
        kind: "success",
        message: formData.notifyByEmail
          ? "Thanks! We've sent a confirmation to your email and our team will respond within 24 hours."
          : "Thanks! Our team will respond within 24 hours.",
      });
      setFormData({ name: "", email: "", subject: "", message: "", notifyByEmail: true });
    } catch (err: any) {
      setFeedback({ kind: "error", message: err?.message || "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-white py-12 md:py-20 border-b border-[#eaeaea]">
        <div className="max-w-[1840px] mx-auto px-5 md:px-10">
          <div className="max-w-[800px] mx-auto text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-[#2F80ED]/10 rounded-2xl mb-4 md:mb-6">
              <HelpCircle className="w-6 h-6 md:w-8 md:h-8 text-[#2F80ED]" />
            </div>
            <h1 className="font-['Poppins:Bold',sans-serif] text-[32px] sm:text-[40px] md:text-[56px] leading-[1.15] md:leading-[68px] text-[#3b3b3b] mb-4 md:mb-6">
              How Can We Help?
            </h1>
            <p className="font-['Inter:Regular',sans-serif] text-[15px] md:text-[20px] text-[#6b7280] leading-[24px] md:leading-[32px]">
              Get answers to your questions or reach out to our support team
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-10 md:py-16 bg-white border-b border-[#eaeaea]">
        <div className="max-w-[1840px] mx-auto px-5 md:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
            {/* WhatsApp Support */}
            <div className="bg-white border border-[#eaeaea] rounded-2xl p-6 md:p-8 text-center hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-[#25D366]/10 rounded-xl mb-4 md:mb-5">
                <MessageCircle className="w-6 h-6 md:w-7 md:h-7 text-[#25D366]" />
              </div>
              <h3 className="font-['Poppins:SemiBold',sans-serif] text-[18px] md:text-[22px] text-[#3b3b3b] mb-2 md:mb-3">
                WhatsApp Support
              </h3>
              <p className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[15px] text-[#6b7280] mb-4 md:mb-5 leading-[22px] md:leading-[24px]">
                Chat with our team for instant assistance
              </p>
              <p className="font-['Inter:Bold',sans-serif] text-[16px] md:text-[18px] text-[#3b3b3b] mb-4 md:mb-5 break-all">
                +90 544 958 07 98
              </p>
              <a
                href="https://wa.me/905449580798"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#25D366] text-white px-5 md:px-6 py-2.5 md:py-3 rounded-lg hover:bg-[#20ba5a] transition-colors font-['Inter:SemiBold',sans-serif] text-[14px] md:text-[15px]"
              >
                Start Chat
              </a>
            </div>

            {/* Email Support */}
            <div className="bg-white border border-[#eaeaea] rounded-2xl p-6 md:p-8 text-center hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-[#2F80ED]/10 rounded-xl mb-4 md:mb-5">
                <Mail className="w-6 h-6 md:w-7 md:h-7 text-[#2F80ED]" />
              </div>
              <h3 className="font-['Poppins:SemiBold',sans-serif] text-[18px] md:text-[22px] text-[#3b3b3b] mb-2 md:mb-3">
                Email Support
              </h3>
              <p className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[15px] text-[#6b7280] mb-4 md:mb-5 leading-[22px] md:leading-[24px]">
                We'll respond within 24 hours
              </p>
              <p className="font-['Inter:Bold',sans-serif] text-[16px] md:text-[18px] text-[#3b3b3b] mb-4 md:mb-5 break-all">
                info@united-tourism.com
              </p>
              <a
                href="mailto:info@united-tourism.com"
                className="inline-block bg-[#2F80ED] text-white px-5 md:px-6 py-2.5 md:py-3 rounded-lg hover:bg-[#1E5FBC] transition-colors font-['Inter:SemiBold',sans-serif] text-[14px] md:text-[15px]"
              >
                Send Email
              </a>
            </div>

            {/* Phone Support */}
            <div className="bg-white border border-[#eaeaea] rounded-2xl p-6 md:p-8 text-center hover:shadow-xl transition-shadow sm:col-span-2 lg:col-span-1">
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-[#2F80ED]/10 rounded-xl mb-4 md:mb-5">
                <Phone className="w-6 h-6 md:w-7 md:h-7 text-[#2F80ED]" />
              </div>
              <h3 className="font-['Poppins:SemiBold',sans-serif] text-[18px] md:text-[22px] text-[#3b3b3b] mb-2 md:mb-3">
                Phone Support
              </h3>
              <p className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[15px] text-[#6b7280] mb-4 md:mb-5 leading-[22px] md:leading-[24px]">
                Available 9 AM - 10 PM (Turkey time)
              </p>
              <p className="font-['Inter:Bold',sans-serif] text-[16px] md:text-[18px] text-[#3b3b3b] mb-4 md:mb-5 break-all">
                +90 544 958 07 98
              </p>
              <a
                href="tel:+905449580798"
                className="inline-block bg-[#2F80ED] text-white px-5 md:px-6 py-2.5 md:py-3 rounded-lg hover:bg-[#1E5FBC] transition-colors font-['Inter:SemiBold',sans-serif] text-[14px] md:text-[15px]"
              >
                Call Now
              </a>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="mt-6 md:mt-8 bg-[#f0fdf4] border border-[#2F80ED]/20 rounded-xl p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 text-center sm:text-left">
            <Clock className="w-6 h-6 text-[#2F80ED] mx-auto sm:mx-0 shrink-0" />
            <div>
              <p className="font-['Inter:SemiBold',sans-serif] text-[15px] md:text-[16px] text-[#3b3b3b] mb-1">
                Support Hours
              </p>
              <p className="font-['Inter:Regular',sans-serif] text-[13px] md:text-[14px] text-[#6b7280] leading-[20px] md:leading-normal">
                Monday - Sunday: 9:00 AM - 10:00 PM (Turkey Time) • WhatsApp available 24/7 for urgent matters
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-20 bg-[#fafafa]">
        <div className="max-w-[900px] mx-auto px-5 md:px-10">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="font-['Poppins:Bold',sans-serif] text-[28px] md:text-[48px] leading-[1.2] md:leading-[60px] text-[#3b3b3b] mb-3 md:mb-4">
              Frequently Asked Questions
            </h2>
            <p className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[18px] text-[#6b7280]">
              Find quick answers to common questions
            </p>
          </div>

          <FAQAccordion />
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-[800px] mx-auto px-5 md:px-10">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="font-['Poppins:Bold',sans-serif] text-[26px] md:text-[40px] leading-[1.2] md:leading-[52px] text-[#3b3b3b] mb-3 md:mb-4">
              Send Us a Message
            </h2>
            <p className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[18px] text-[#6b7280]">
              Can't find what you're looking for? Drop us a message and we'll get back to you
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
              {/* Name */}
              <div>
                <label className="block font-['Inter:Medium',sans-serif] text-[14px] md:text-[15px] text-[#3b3b3b] mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 md:py-3.5 border border-[#eaeaea] rounded-xl font-['Inter:Regular',sans-serif] text-[15px] md:text-[16px] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#2F80ED]/20 transition-all"
                  placeholder="John Doe"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block font-['Inter:Medium',sans-serif] text-[14px] md:text-[15px] text-[#3b3b3b] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 md:py-3.5 border border-[#eaeaea] rounded-xl font-['Inter:Regular',sans-serif] text-[15px] md:text-[16px] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#2F80ED]/20 transition-all"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block font-['Inter:Medium',sans-serif] text-[14px] md:text-[15px] text-[#3b3b3b] mb-2">
                Subject
              </label>
              <select
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 md:py-3.5 border border-[#eaeaea] rounded-xl font-['Inter:Regular',sans-serif] text-[15px] md:text-[16px] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#2F80ED]/20 transition-all appearance-none bg-white"
              >
                <option value="">Select a topic</option>
                <option value="booking">Booking Inquiry</option>
                <option value="modification">Modify/Cancel Booking</option>
                <option value="payment">Payment Issue</option>
                <option value="hotel">Hotel Question</option>
                <option value="feedback">Feedback</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block font-['Inter:Medium',sans-serif] text-[14px] md:text-[15px] text-[#3b3b3b] mb-2">
                Message
              </label>
              <textarea
                required
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 md:py-3.5 border border-[#eaeaea] rounded-xl font-['Inter:Regular',sans-serif] text-[15px] md:text-[16px] focus:outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#2F80ED]/20 transition-all resize-none"
                placeholder="How can we help you?"
              />
            </div>

            {/* Email notification opt-in */}
            <label className="flex items-start gap-3 p-3 md:p-4 rounded-xl border border-[#eaeaea] bg-[#fafafa] cursor-pointer hover:border-[#2F80ED]/40 transition-colors">
              <input
                type="checkbox"
                checked={formData.notifyByEmail}
                onChange={(e) =>
                  setFormData({ ...formData, notifyByEmail: e.target.checked })
                }
                className="mt-0.5 h-4 w-4 accent-[#2F80ED] cursor-pointer"
              />
              <span>
                <span className="block font-['Inter:SemiBold',sans-serif] text-[14px] md:text-[15px] text-[#3b3b3b]">
                  Email me a confirmation
                </span>
                <span className="block font-['Inter:Regular',sans-serif] text-[12.5px] md:text-[13px] text-[#6b7280] mt-0.5">
                  We'll send a copy of this message to {formData.email || "your email"} so you have it for reference.
                </span>
              </span>
            </label>

            {/* Submit feedback */}
            {feedback.kind === "success" && (
              <div
                role="status"
                className="p-3 md:p-4 rounded-xl bg-[#ecfdf5] border border-[#10B981]/30 font-['Inter:Regular',sans-serif] text-[14px] text-[#065f46]"
              >
                {feedback.message}
              </div>
            )}
            {feedback.kind === "error" && (
              <div
                role="alert"
                className="p-3 md:p-4 rounded-xl bg-[#fef2f2] border border-[#ef4444]/30 font-['Inter:Regular',sans-serif] text-[14px] text-[#991b1b]"
              >
                {feedback.message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#2F80ED] text-white py-3.5 md:py-4 rounded-xl hover:bg-[#1E5FBC] transition-colors font-['Inter:SemiBold',sans-serif] text-[15px] md:text-[16px] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              {submitting ? "Sending…" : "Send Message"}
            </button>
          </form>
        </div>
      </section>

      {/* Office Location */}
      <section className="py-12 md:py-20 bg-[#fafafa]">
        <div className="max-w-[1840px] mx-auto px-5 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* Map — free OpenStreetMap embed (no API key / billing). Centered
                on İstiklal Caddesi, Beyoğlu with a marker. */}
            <div className="rounded-2xl overflow-hidden h-[220px] md:h-[400px] order-2 lg:order-1 border border-[#eaeaea] shadow-sm">
              <iframe
                title="United Hotels office location — Beyoğlu, İstiklal Caddesi, Istanbul"
                src="https://www.openstreetmap.org/export/embed.html?bbox=28.9678%2C41.0275%2C28.9878%2C41.0395&layer=mapnik&marker=41.0335%2C28.9778"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Office Info */}
            <div className="order-1 lg:order-2">
              <h2 className="font-['Poppins:Bold',sans-serif] text-[26px] md:text-[40px] leading-[1.2] md:leading-[52px] text-[#3b3b3b] mb-4 md:mb-6">
                Visit Our Office
              </h2>
              <p className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[17px] text-[#6b7280] leading-[22px] md:leading-[28px] mb-6 md:mb-8">
                While we're a digital-first platform, you're always welcome to visit our Turkey office for in-person assistance with your booking or travel plans.
              </p>

              <div className="space-y-5 md:space-y-6">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="bg-[#2F80ED]/10 w-10 h-10 md:w-11 md:h-11 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#2F80ED]" />
                  </div>
                  <div>
                    <p className="font-['Inter:SemiBold',sans-serif] text-[15px] md:text-[16px] text-[#3b3b3b] mb-1">
                      Address
                    </p>
                    <p className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[15px] text-[#6b7280]">
                      Beyoğlu, İstiklal Caddesi No: 123<br />
                      34433 Turkey
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 md:gap-4">
                  <div className="bg-[#2F80ED]/10 w-10 h-10 md:w-11 md:h-11 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#2F80ED]" />
                  </div>
                  <div>
                    <p className="font-['Inter:SemiBold',sans-serif] text-[15px] md:text-[16px] text-[#3b3b3b] mb-1">
                      Office Hours
                    </p>
                    <p className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[15px] text-[#6b7280]">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 10:00 AM - 4:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SupportPage;
