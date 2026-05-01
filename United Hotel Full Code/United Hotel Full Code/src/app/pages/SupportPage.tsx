import { useState } from "react";
import { Link } from "react-router";
import { 
  Phone, Mail, MessageCircle, Clock, 
  ChevronDown, Send, MapPin, HelpCircle 
} from "lucide-react";
import svgPaths from "../../imports/svg-nnzqmx1xjq";

// Navigation Component
function Navigation() {
  return (
    <nav className="bg-white/95 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-[1840px] mx-auto px-10">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-[26px] w-[28px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 26">
                <mask fill="white" id="path-1-inside-1_20_512">
                  <path d={svgPaths.p32095b00} />
                </mask>
                <path d={svgPaths.p32095b00} fill="#1ABC9C" mask="url(#path-1-inside-1_20_512)" stroke="#1ABC9C" strokeWidth="0.4" />
              </svg>
            </div>
            <span className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-[#1abc9c]">
              United Hotels
            </span>
          </Link>

          {/* Main Navigation */}
          <div className="flex items-center gap-8">
            <a href="/#home" className="text-[#3b3b3b] hover:text-[#1abc9c] transition-colors font-['Inter:Medium',sans-serif] text-[15px]">
              Home
            </a>
            <a href="/#why-choose-united-hotels" className="text-[#3b3b3b] hover:text-[#1abc9c] transition-colors font-['Inter:Medium',sans-serif] text-[15px]">
              Why Choose United Hotels
            </a>
            <a href="/#featured-hotels" className="text-[#3b3b3b] hover:text-[#1abc9c] transition-colors font-['Inter:Medium',sans-serif] text-[15px]">
              Featured Hotels
            </a>
            <a href="/#quality" className="text-[#3b3b3b] hover:text-[#1abc9c] transition-colors font-['Inter:Medium',sans-serif] text-[15px]">
              Quality
            </a>
            <a href="/#faqs" className="text-[#3b3b3b] hover:text-[#1abc9c] transition-colors font-['Inter:Medium',sans-serif] text-[15px]">
              FAQ
            </a>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            <Link to="/portal" className="text-[#3b3b3b] hover:text-[#1abc9c] transition-colors text-[14px] font-['Inter:Medium',sans-serif]">
              Login / Register
            </Link>
            <Link to="/listing" className="bg-[#1abc9c] text-white px-6 py-2.5 rounded-lg hover:bg-[#16a085] transition-colors font-['Inter:SemiBold',sans-serif] text-[14px]">
              Find Hotels
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

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
            className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-['Poppins:SemiBold',sans-serif] text-[17px] text-[#3b3b3b] pr-4">
              {faq.question}
            </span>
            <ChevronDown 
              className={`w-5 h-5 text-[#1abc9c] flex-shrink-0 transition-transform ${
                openIndex === index ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openIndex === index && (
            <div className="px-6 pb-5">
              <p className="font-['Inter:Regular',sans-serif] text-[16px] text-[#6b7280] leading-[26px]">
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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert("Thank you for contacting us! We'll respond within 24 hours.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-white py-20 border-b border-[#eaeaea]">
        <div className="max-w-[1840px] mx-auto px-10">
          <div className="max-w-[800px] mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1abc9c]/10 rounded-2xl mb-6">
              <HelpCircle className="w-8 h-8 text-[#1abc9c]" />
            </div>
            <h1 className="font-['Poppins:Bold',sans-serif] text-[56px] leading-[68px] text-[#3b3b3b] mb-6">
              How Can We Help?
            </h1>
            <p className="font-['Inter:Regular',sans-serif] text-[20px] text-[#6b7280] leading-[32px]">
              Get answers to your questions or reach out to our support team
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 bg-white border-b border-[#eaeaea]">
        <div className="max-w-[1840px] mx-auto px-10">
          <div className="grid grid-cols-3 gap-8">
            {/* WhatsApp Support */}
            <div className="bg-white border border-[#eaeaea] rounded-2xl p-8 text-center hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-[#25D366]/10 rounded-xl mb-5">
                <MessageCircle className="w-7 h-7 text-[#25D366]" />
              </div>
              <h3 className="font-['Poppins:SemiBold',sans-serif] text-[22px] text-[#3b3b3b] mb-3">
                WhatsApp Support
              </h3>
              <p className="font-['Inter:Regular',sans-serif] text-[15px] text-[#6b7280] mb-5 leading-[24px]">
                Chat with our team for instant assistance
              </p>
              <p className="font-['Inter:Bold',sans-serif] text-[18px] text-[#3b3b3b] mb-5">
                +90 555 123 4567
              </p>
              <a 
                href="https://wa.me/905551234567"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#25D366] text-white px-6 py-3 rounded-lg hover:bg-[#20ba5a] transition-colors font-['Inter:SemiBold',sans-serif] text-[15px]"
              >
                Start Chat
              </a>
            </div>

            {/* Email Support */}
            <div className="bg-white border border-[#eaeaea] rounded-2xl p-8 text-center hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-[#1abc9c]/10 rounded-xl mb-5">
                <Mail className="w-7 h-7 text-[#1abc9c]" />
              </div>
              <h3 className="font-['Poppins:SemiBold',sans-serif] text-[22px] text-[#3b3b3b] mb-3">
                Email Support
              </h3>
              <p className="font-['Inter:Regular',sans-serif] text-[15px] text-[#6b7280] mb-5 leading-[24px]">
                We'll respond within 24 hours
              </p>
              <p className="font-['Inter:Bold',sans-serif] text-[18px] text-[#3b3b3b] mb-5">
                hello@unitedhotels.com
              </p>
              <a 
                href="mailto:hello@unitedhotels.com"
                className="inline-block bg-[#1abc9c] text-white px-6 py-3 rounded-lg hover:bg-[#16a085] transition-colors font-['Inter:SemiBold',sans-serif] text-[15px]"
              >
                Send Email
              </a>
            </div>

            {/* Phone Support */}
            <div className="bg-white border border-[#eaeaea] rounded-2xl p-8 text-center hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-[#1abc9c]/10 rounded-xl mb-5">
                <Phone className="w-7 h-7 text-[#1abc9c]" />
              </div>
              <h3 className="font-['Poppins:SemiBold',sans-serif] text-[22px] text-[#3b3b3b] mb-3">
                Phone Support
              </h3>
              <p className="font-['Inter:Regular',sans-serif] text-[15px] text-[#6b7280] mb-5 leading-[24px]">
                Available 9 AM - 10 PM (Turkey time)
              </p>
              <p className="font-['Inter:Bold',sans-serif] text-[18px] text-[#3b3b3b] mb-5">
                +90 555 123 4567
              </p>
              <a 
                href="tel:+905551234567"
                className="inline-block bg-[#1abc9c] text-white px-6 py-3 rounded-lg hover:bg-[#16a085] transition-colors font-['Inter:SemiBold',sans-serif] text-[15px]"
              >
                Call Now
              </a>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="mt-8 bg-[#f0fdf4] border border-[#1abc9c]/20 rounded-xl p-6 flex items-center gap-4">
            <Clock className="w-6 h-6 text-[#1abc9c]" />
            <div>
              <p className="font-['Inter:SemiBold',sans-serif] text-[16px] text-[#3b3b3b] mb-1">
                Support Hours
              </p>
              <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#6b7280]">
                Monday - Sunday: 9:00 AM - 10:00 PM (Turkey Time) • WhatsApp available 24/7 for urgent matters
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-[#fafafa]">
        <div className="max-w-[900px] mx-auto px-10">
          <div className="text-center mb-12">
            <h2 className="font-['Poppins:Bold',sans-serif] text-[48px] leading-[60px] text-[#3b3b3b] mb-4">
              Frequently Asked Questions
            </h2>
            <p className="font-['Inter:Regular',sans-serif] text-[18px] text-[#6b7280]">
              Find quick answers to common questions
            </p>
          </div>

          <FAQAccordion />
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-white">
        <div className="max-w-[800px] mx-auto px-10">
          <div className="text-center mb-12">
            <h2 className="font-['Poppins:Bold',sans-serif] text-[40px] leading-[52px] text-[#3b3b3b] mb-4">
              Send Us a Message
            </h2>
            <p className="font-['Inter:Regular',sans-serif] text-[18px] text-[#6b7280]">
              Can't find what you're looking for? Drop us a message and we'll get back to you
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block font-['Inter:Medium',sans-serif] text-[15px] text-[#3b3b3b] mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3.5 border border-[#eaeaea] rounded-xl font-['Inter:Regular',sans-serif] text-[16px] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/20 transition-all"
                  placeholder="John Doe"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block font-['Inter:Medium',sans-serif] text-[15px] text-[#3b3b3b] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3.5 border border-[#eaeaea] rounded-xl font-['Inter:Regular',sans-serif] text-[16px] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/20 transition-all"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block font-['Inter:Medium',sans-serif] text-[15px] text-[#3b3b3b] mb-2">
                Subject
              </label>
              <select
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3.5 border border-[#eaeaea] rounded-xl font-['Inter:Regular',sans-serif] text-[16px] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/20 transition-all appearance-none bg-white"
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
              <label className="block font-['Inter:Medium',sans-serif] text-[15px] text-[#3b3b3b] mb-2">
                Message
              </label>
              <textarea
                required
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3.5 border border-[#eaeaea] rounded-xl font-['Inter:Regular',sans-serif] text-[16px] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/20 transition-all resize-none"
                placeholder="How can we help you?"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#1abc9c] text-white py-4 rounded-xl hover:bg-[#16a085] transition-colors font-['Inter:SemiBold',sans-serif] text-[16px] flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* Office Location */}
      <section className="py-20 bg-[#fafafa]">
        <div className="max-w-[1840px] mx-auto px-10">
          <div className="grid grid-cols-2 gap-16 items-center">
            {/* Map Placeholder */}
            <div className="bg-gray-200 rounded-2xl h-[400px] flex items-center justify-center">
              <MapPin className="w-16 h-16 text-gray-400" />
            </div>

            {/* Office Info */}
            <div>
              <h2 className="font-['Poppins:Bold',sans-serif] text-[40px] leading-[52px] text-[#3b3b3b] mb-6">
                Visit Our Office
              </h2>
              <p className="font-['Inter:Regular',sans-serif] text-[17px] text-[#6b7280] leading-[28px] mb-8">
                While we're a digital-first platform, you're always welcome to visit our Turkey office for in-person assistance with your booking or travel plans.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-[#1abc9c]/10 w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#1abc9c]" />
                  </div>
                  <div>
                    <p className="font-['Inter:SemiBold',sans-serif] text-[16px] text-[#3b3b3b] mb-1">
                      Address
                    </p>
                    <p className="font-['Inter:Regular',sans-serif] text-[15px] text-[#6b7280]">
                      Beyoğlu, İstiklal Caddesi No: 123<br />
                      34433 Turkey
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#1abc9c]/10 w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#1abc9c]" />
                  </div>
                  <div>
                    <p className="font-['Inter:SemiBold',sans-serif] text-[16px] text-[#3b3b3b] mb-1">
                      Office Hours
                    </p>
                    <p className="font-['Inter:Regular',sans-serif] text-[15px] text-[#6b7280]">
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
