import { Link } from "react-router";
import { hotels } from "../data/mockData";
import {
  MapPin,
  Building2,
  TrendingDown,
  ChevronRight,
  Navigation,
  Compass,
  Star,
  DollarSign,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { formatCurrency } from "../utils/currency";

// Group hotels by location
function groupHotelsByLocation() {
  const grouped: { [key: string]: any[] } = {};
  hotels.forEach((hotel) => {
    if (!grouped[hotel.location]) {
      grouped[hotel.location] = [];
    }
    grouped[hotel.location].push(hotel);
  });
  return grouped;
}

interface HotelCardProps {
  hotel: any;
}

function HotelCard({ hotel }: HotelCardProps) {
  const { language } = useLanguage();

  return (
    <Link
      to="/listing"
      className="group block p-4 bg-white border border-[#e5e7eb] rounded-xl hover:border-[#1abc9c] hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center gap-4">
        <img
          src={hotel.image}
          alt={hotel.name}
          className="w-16 h-16 object-cover rounded-lg"
        />
        <div className="flex-1">
          <h4 className="font-['Poppins:SemiBold',sans-serif] text-[16px] text-[#3b3b3b] mb-1">
            {hotel.name}
          </h4>
          <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#6b7280]">
            {hotel.location}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-[#FFA500] fill-[#FFA500]" />
              <span className="font-['Inter:Medium',sans-serif] text-[12px] text-[#3b3b3b]">
                {hotel.rating}
              </span>
            </div>
            <span className="font-['Inter:Bold',sans-serif] text-[14px] text-[#1abc9c]">
              {formatCurrency(hotel.rooms[0]?.directPrice, language)}/night
            </span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-[#1abc9c] group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}

interface LocationSectionProps {
  location: string;
  locationHotels: any[];
}

function LocationSection({ location, locationHotels }: LocationSectionProps) {
  return (
    <div className="mb-8">
      <h3 className="font-['Poppins:Bold',sans-serif] text-[24px] text-[#3b3b3b] mb-4">
        {location}
      </h3>
      <div className="grid grid-cols-1 gap-4">
        {locationHotels.map((hotel: any) => (
          <HotelCard key={hotel.id} hotel={hotel} />
        ))}
      </div>
    </div>
  );
}

export function CountriesSection() {
  return (
    <section className="py-24 bg-[#fafafa] relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1abc9c]/3 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#1abc9c]/3 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

      <div className="max-w-[1840px] mx-auto px-10 relative">
        {/* Section Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1abc9c]/10 text-[#1abc9c] rounded-full font-['Inter:SemiBold',sans-serif] text-[13px] tracking-wide uppercase mb-6">
            <Compass className="w-4 h-4" />
            Countries & Cities
          </div>

          <h2 className="font-['Poppins:Bold',sans-serif] text-[52px] leading-[64px] text-[#3b3b3b] mb-4">
            Explore Hotels by Country
          </h2>

          <p className="font-['Inter:Regular',sans-serif] text-[20px] leading-[32px] text-[#6b7280] max-w-[680px] mx-auto">
            Discover the best hotels organized by countries and cities
          </p>

          {/* Decorative Line */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-16 h-1 bg-gradient-to-r from-transparent to-[#1abc9c] rounded-full" />
            <div className="w-2 h-2 bg-[#1abc9c] rounded-full" />
            <div className="w-16 h-1 bg-gradient-to-l from-transparent to-[#1abc9c] rounded-full" />
          </div>
        </div>

        {/* Hotels by Location Grid */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Poppins:Bold',sans-serif] text-[32px] text-[#3b3b3b]">
                Turkey Hotels
              </h2>
              <div className="flex items-center gap-2 text-[#1abc9c]">
                <Building2 className="w-6 h-6" />
                <span className="font-['Inter:SemiBold',sans-serif] text-[16px]">
                  {hotels.length} Hotels
                </span>
              </div>
            </div>
            {Object.entries(groupHotelsByLocation()).map(
              ([location, locationHotels]) => (
                <LocationSection
                  key={location}
                  location={location}
                  locationHotels={locationHotels}
                />
              ),
            )}
          </div>
        </div>

        {/* Bottom Info Bar */}
        <div className="bg-gradient-to-r from-[#1abc9c]/5 via-[#1abc9c]/10 to-[#1abc9c]/5 rounded-2xl p-6 sm:p-8 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-0">
            {/* Left Side */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="bg-[#1abc9c]/10 p-4 rounded-xl">
                <MapPin className="w-6 h-6 text-[#1abc9c]" />
              </div>
              <div>
                <div className="font-['Poppins:SemiBold',sans-serif] text-[18px] text-[#3b3b3b] mb-1">
                  Need help choosing a destination?
                </div>
                <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#6b7280]">
                  Our local team can help you find the perfect location for your
                  needs
                </p>
              </div>
            </div>

            {/* Right Side - CTA */}
            <Link
              to="/listing"
              onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "auto" })}
              className="group inline-flex items-center gap-2 border-2 border-[#1abc9c] text-[#1abc9c] px-8 py-3 rounded-xl hover:bg-[#1abc9c] hover:text-white transition-all duration-300 font-['Inter:Bold',sans-serif] text-[15px] whitespace-nowrap"
            >
              View All Hotels
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
