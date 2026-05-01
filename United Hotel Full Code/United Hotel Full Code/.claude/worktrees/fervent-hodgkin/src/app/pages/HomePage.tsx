import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { ValuePropositionSection } from "../components/ValuePropositionSection";
import { FeaturedHotelsSection } from "../components/FeaturedHotelsSection";
import { QualityAssuranceSection } from "../components/QualityAssuranceSection";
import { CountriesSection } from "../components/DestinationsSection";
import { SEOContentSection } from "../components/SEOContentSection";
import svgPaths from "../../imports/svg-nkrjt6kvoj";
const imgRectangle10 = "/figma-assets/2e73560823491cb7aae2b44b94830399bada8384.png";
import {
  MapPin, Calendar, Users, Search, Check,
  ChevronDown
} from "lucide-react";

// Enhanced Hero Section with functional search
function HeroSection() {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    destination: 'Turkey',
    checkIn: '',
    checkOut: '',
    guests: ''
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to listing page with search params
    navigate('/listing');
  };

  return (
    <div id="home" className="relative h-[827px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          alt="Turkey cityscape with mosques and Bosphorus"
          className="absolute h-full w-full object-cover"
          src={imgRectangle10}
        />
        <div className="absolute inset-0 bg-black/16" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col">
        {/* Centered Hero Text */}
        <div className="flex-1 flex items-center justify-center px-10">
          <div className="text-center max-w-[1057px]">
            <h1 className="font-['Poppins:Bold',sans-serif] text-[64px] leading-[72px] text-[#fafafa] mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">Stay Smart. Stay United.</h1>
            <p className="font-['Inter:Regular',sans-serif] text-[20px] leading-[28.8px] text-[#fafafa] max-w-[737px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              Handpicked affordable hotels in the best neighborhoods of Turkey. Verified. Transparent. Local support.
            </p>
          </div>
        </div>

        {/* Search Form Card - Positioned at Bottom */}
        <div className="px-10 pb-20">
          <div className="max-w-[1840px] mx-auto">
            <form
              onSubmit={handleSearch}
              className="bg-white rounded-xl shadow-[0px_4px_16px_0px_rgba(0,0,0,0.1)] border border-[#1abc9c] p-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200"
            >
              <div className="flex items-end gap-12">
                {/* Destination */}
                <div className="flex-1 flex flex-col gap-2">
                  <label htmlFor="destination" className="font-['Inter:Medium',sans-serif] text-[14px] text-[#3b3b3b]">
                    Destination
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#8c8c8c] pointer-events-none" />
                    <input
                      id="destination"
                      type="text"
                      value={searchData.destination}
                      onChange={(e) => setSearchData({...searchData, destination: e.target.value})}
                      className="w-full h-[49px] pl-10 pr-4 bg-[#fafafa] border border-[#eaeaea] rounded-lg font-['Inter:Regular',sans-serif] text-[16px] text-[#0a0a0a] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/20 transition-all"
                    />
                  </div>
                </div>

                {/* Check-in */}
                <div className="flex-1 flex flex-col gap-2">
                  <label htmlFor="checkIn" className="font-['Inter:Medium',sans-serif] text-[14px] text-[#3b3b3b]">
                    Check-in
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#8c8c8c] pointer-events-none" />
                    <input
                      id="checkIn"
                      type="date"
                      value={searchData.checkIn}
                      onChange={(e) => setSearchData({...searchData, checkIn: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      placeholder="Select date"
                      className="w-full h-[49px] pl-10 pr-3 border border-[#eaeaea] rounded-lg font-['Inter:Regular',sans-serif] text-[16px] text-[rgba(10,10,10,0.5)] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/20 transition-all"
                    />
                  </div>
                </div>

                {/* Check-out */}
                <div className="flex-1 flex flex-col gap-2">
                  <label htmlFor="checkOut" className="font-['Inter:Medium',sans-serif] text-[14px] text-[#3b3b3b]">
                    Check-out
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#8c8c8c] pointer-events-none" />
                    <input
                      id="checkOut"
                      type="date"
                      value={searchData.checkOut}
                      onChange={(e) => setSearchData({...searchData, checkOut: e.target.value})}
                      min={searchData.checkIn || new Date().toISOString().split('T')[0]}
                      placeholder="Select date"
                      className="w-full h-[49px] pl-10 pr-3 border border-[#eaeaea] rounded-lg font-['Inter:Regular',sans-serif] text-[16px] text-[rgba(10,10,10,0.5)] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/20 transition-all"
                    />
                  </div>
                </div>

                {/* Guests */}
                <div className="flex-1 flex flex-col gap-2">
                  <label htmlFor="guests" className="font-['Inter:Medium',sans-serif] text-[14px] text-[#3b3b3b]">
                    Guests
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#8c8c8c] pointer-events-none" />
                    <select
                      id="guests"
                      value={searchData.guests}
                      onChange={(e) => setSearchData({...searchData, guests: e.target.value})}
                      className="w-full h-[50px] pl-10 pr-4 border border-[#eaeaea] rounded-lg font-['Inter:Regular',sans-serif] text-[16px] text-[rgba(10,10,10,0.5)] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/20 transition-all appearance-none bg-white"
                    >
                      <option value="">Number of guests</option>
                      <option value="1">1 guest</option>
                      <option value="2">2 guests</option>
                      <option value="3">3 guests</option>
                      <option value="4">4+ guests</option>
                    </select>
                  </div>
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  className="bg-[#1abc9c] text-white px-8 h-[50px] rounded-lg hover:bg-[#16a085] transition-all hover:shadow-lg font-['Inter:SemiBold',sans-serif] text-[16px] flex items-center justify-center gap-2 shrink-0"
                >
                  <Search className="w-5 h-5" />
                  Find Hotels
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Trust Building Section
function TrustBuildingSection() {
  return (
    <div id="quality-promise">
      <QualityAssuranceSection />
    </div>
  );
}

// Countries Section (replaces Destinations)
function CountriesDiscoverySection() {
  return <CountriesSection />;
}

// FAQ Section
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is the average price of hotels in Turkey?",
      answer: "Our hotels in Turkey range from $32 to $75 per night, with most properties averaging around $45-50 per night. Prices vary by neighborhood and season."
    },
    {
      question: "Are hotels in Turkey safe?",
      answer: "Yes, all hotels on our platform are personally inspected by our local team. We verify security measures, location safety, and guest reviews before listing any property."
    },
    {
      question: "When is the best time to visit Turkey?",
      answer: "April-May and September-October offer the best weather and moderate prices. Winter (November-March) offers the lowest rates but cooler weather."
    }
  ];

  return (
    <section id="faqs" className="py-24 bg-[#fafafa]">
      <div className="max-w-[744px] mx-auto px-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-['Poppins:Bold',sans-serif] text-[48px] leading-[60px] text-[#3b3b3b] mb-4">
            Frequently Asked Questions
          </h2>
          <p className="font-['Inter:Regular',sans-serif] text-[18px] text-[#6b7280]">
            Everything you need to know about hotels in Turkey
          </p>
        </div>

        {/* FAQ Items */}
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
                <span className="font-['Poppins:SemiBold',sans-serif] text-[16px] text-[#3b3b3b]">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#1abc9c] transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5">
                  <p className="font-['Inter:Regular',sans-serif] text-[15px] text-[#6b7280] leading-[24px]">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  return (
    <section id="cta" className="relative py-32 bg-[#1abc9c] overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-[920px] mx-auto px-10 text-center">
        <h2 className="font-['Poppins:Bold',sans-serif] text-[56px] leading-[68px] text-white mb-6">
          Ready to Book Your Turkey Stay?
        </h2>
        <p className="font-['Inter:Regular',sans-serif] text-[22px] text-white/95 mb-10">
          Join thousands of travelers who chose direct booking and saved money
        </p>

        <Link to="/listing" className="bg-white text-[#1abc9c] px-10 py-5 rounded-xl hover:shadow-2xl transition-all font-['Inter:Bold',sans-serif] text-[18px] inline-flex items-center gap-3">
          <Search className="w-6 h-6" />
          Find Hotels in Turkey Now
        </Link>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-12 mt-12 text-white">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span className="text-[15px]">Free cancellation</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span className="text-[15px]">No hidden fees</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span className="text-[15px]">Local support 24/7</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// Main HomePage Component
export default function HomePage() {
  return (
    <div className="bg-[#fafafa] min-h-screen">
      <Navigation />
      <HeroSection />
      <ValuePropositionSection />
      <FeaturedHotelsSection />
      <TrustBuildingSection />
      <CountriesDiscoverySection />
      <SEOContentSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
