import { useState } from "react";
import { Link } from "react-router";
const imgImageSultanahmetFatih = "/figma-assets/87fe0e3882960f57017f9db63227776eab6248b5.png";
const imgImageTaksimBeyoglu = "/figma-assets/2d09c265965430947a0286c570bc0fa5fbd6debe.png";
const imgImageKadikoyAsianSide = "/figma-assets/250023f532e568305b14dfb57c614f51c1fba582.png";
import { MapPin, Building2, ChevronRight, ChevronDown, Globe, Star, DollarSign } from "lucide-react";

interface Hotel {
  name: string;
  rating: number;
  avgPrice: number;
  image: string;
}

interface City {
  name: string;
  hotelCount: number;
  avgPrice: number;
  rating: number;
  highlights: string[];
  badge?: string;
  image: string;
  hotels: Hotel[];
}

interface Country {
  name: string;
  flag: string;
  cities: City[];
}

function CityCard({ city }: { city: City }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#e5e7eb] hover:border-[#1abc9c] hover:shadow-2xl transition-all duration-500">
      {/* City Image */}
      <div className="relative h-[220px] overflow-hidden group">
        <img
          src={city.image}
          alt={city.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {city.badge && (
          <div className="absolute top-4 right-4 bg-[#1abc9c] text-white px-4 py-2 rounded-xl shadow-lg font-['Inter:Bold',sans-serif] text-[12px] flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-white" />
            {city.badge}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h4 className="font-['Poppins:Bold',sans-serif] text-[24px] text-white mb-1">
            {city.name}
          </h4>
          <div className="flex items-center gap-2 text-white/80 font-['Inter:Regular',sans-serif] text-[14px]">
            <Building2 className="w-4 h-4" />
            {city.hotelCount} Hotels
          </div>
        </div>
      </div>

      {/* City Stats */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="text-center bg-[#fafafa] rounded-xl p-3">
            <div className="flex items-center justify-center mb-1">
              <Building2 className="w-4 h-4 text-[#1abc9c]" />
            </div>
            <div className="font-['Poppins:Bold',sans-serif] text-[18px] text-[#1abc9c]">
              {city.hotelCount}+
            </div>
            <div className="font-['Inter:Regular',sans-serif] text-[11px] text-[#6b7280]">
              Hotels
            </div>
          </div>
          <div className="text-center bg-[#fafafa] rounded-xl p-3">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="w-4 h-4 text-[#1abc9c]" />
            </div>
            <div className="font-['Poppins:Bold',sans-serif] text-[18px] text-[#1abc9c]">
              ${city.avgPrice}
            </div>
            <div className="font-['Inter:Regular',sans-serif] text-[11px] text-[#6b7280]">
              Avg/night
            </div>
          </div>
          <div className="text-center bg-[#fafafa] rounded-xl p-3">
            <div className="flex items-center justify-center mb-1">
              <Star className="w-4 h-4 text-[#FFA500] fill-[#FFA500]" />
            </div>
            <div className="font-['Poppins:Bold',sans-serif] text-[18px] text-[#1abc9c]">
              {city.rating}
            </div>
            <div className="font-['Inter:Regular',sans-serif] text-[11px] text-[#6b7280]">
              Rating
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="flex flex-wrap gap-2 mb-5">
          {city.highlights.map((highlight, idx) => (
            <span
              key={idx}
              className="bg-white border border-[#eaeaea] text-[#6b7280] px-3 py-1.5 rounded-lg font-['Inter:Medium',sans-serif] text-[12px]"
            >
              {highlight}
            </span>
          ))}
        </div>

        {/* Expand Hotels */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between bg-[#fafafa] hover:bg-[#1abc9c]/10 text-[#3b3b3b] px-4 py-3 rounded-xl transition-colors font-['Inter:SemiBold',sans-serif] text-[14px]"
        >
          <span>View Hotels in {city.name}</span>
          <ChevronDown className={`w-4 h-4 text-[#1abc9c] transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>

        {expanded && (
          <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            {city.hotels.map((hotel, idx) => (
              <Link
                key={idx}
                to="/listing"
                className="flex items-center gap-4 p-3 bg-[#fafafa] rounded-xl hover:bg-[#1abc9c]/10 transition-colors group"
              >
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-14 h-14 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-['Inter:SemiBold',sans-serif] text-[14px] text-[#3b3b3b] group-hover:text-[#1abc9c] transition-colors truncate">
                    {hotel.name}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-[12px] text-[#6b7280]">
                      <Star className="w-3 h-3 fill-[#FFA500] text-[#FFA500]" />
                      {hotel.rating}
                    </span>
                    <span className="text-[12px] text-[#1abc9c] font-['Inter:Bold',sans-serif]">
                      From ${hotel.avgPrice}/night
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8c8c8c] group-hover:text-[#1abc9c] transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}

        {/* Explore CTA */}
        <Link
          to="/listing"
          className="mt-4 w-full bg-[#1abc9c] text-white py-3 rounded-xl hover:bg-[#16a085] transition-all duration-300 font-['Inter:Bold',sans-serif] text-[14px] flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
        >
          Explore {city.name}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export function CountriesSection() {
  const [activeCountry, setActiveCountry] = useState(0);

  const countries: Country[] = [
    {
      name: "Turkey",
      flag: "🇹🇷",
      cities: [
        {
          name: "Sultanahmet & Fatih",
          hotelCount: 18,
          avgPrice: 42,
          rating: 4.6,
          highlights: ["Blue Mosque", "Hagia Sophia", "Grand Bazaar"],
          badge: "Most Popular",
          image: imgImageSultanahmetFatih,
          hotels: [
            { name: "Sultanahmet Boutique Hotel", rating: 4.6, avgPrice: 42, image: imgImageSultanahmetFatih },
            { name: "Old City Heritage Inn", rating: 4.4, avgPrice: 38, image: imgImageSultanahmetFatih },
            { name: "Blue Mosque View Hotel", rating: 4.8, avgPrice: 55, image: imgImageSultanahmetFatih },
          ]
        },
        {
          name: "Taksim & Beyoğlu",
          hotelCount: 22,
          avgPrice: 48,
          rating: 4.5,
          highlights: ["Istiklal Street", "Nightlife", "Modern"],
          image: imgImageTaksimBeyoglu,
          hotels: [
            { name: "Taksim Central Stay", rating: 4.5, avgPrice: 38, image: imgImageTaksimBeyoglu },
            { name: "Beyoğlu Art Hotel", rating: 4.3, avgPrice: 45, image: imgImageTaksimBeyoglu },
            { name: "Istiklal Boutique Suites", rating: 4.6, avgPrice: 52, image: imgImageTaksimBeyoglu },
          ]
        },
        {
          name: "Kadıköy (Asian Side)",
          hotelCount: 15,
          avgPrice: 38,
          rating: 4.7,
          highlights: ["Local Vibe", "Markets", "Cafes"],
          badge: "Best Value",
          image: imgImageKadikoyAsianSide,
          hotels: [
            { name: "Kadıköy Harbor View", rating: 4.7, avgPrice: 45, image: imgImageKadikoyAsianSide },
            { name: "Asian Side Retreat", rating: 4.5, avgPrice: 35, image: imgImageKadikoyAsianSide },
          ]
        }
      ]
    }
  ];

  const activeCountryData = countries[activeCountry];
  const totalHotels = activeCountryData.cities.reduce((sum, c) => sum + c.hotelCount, 0);
  const totalCities = activeCountryData.cities.length;

  return (
    <section id="countries" className="py-24 bg-white relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1abc9c]/3 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#1abc9c]/3 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

      <div className="max-w-[1840px] mx-auto px-10 relative">
        {/* Section Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1abc9c]/10 text-[#1abc9c] rounded-full font-['Inter:SemiBold',sans-serif] text-[13px] tracking-wide uppercase mb-6">
            <Globe className="w-4 h-4" />
            Explore by Country
          </div>

          <h2 className="font-['Poppins:Bold',sans-serif] text-[52px] leading-[64px] text-[#3b3b3b] mb-4">
            Countries We Serve
          </h2>

          <p className="font-['Inter:Regular',sans-serif] text-[20px] leading-[32px] text-[#6b7280] max-w-[680px] mx-auto">
            Browse hotels by country, city, and property — find the perfect stay for your adventure
          </p>

          {/* Decorative Line */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-16 h-1 bg-gradient-to-r from-transparent to-[#1abc9c] rounded-full" />
            <div className="w-2 h-2 bg-[#1abc9c] rounded-full" />
            <div className="w-16 h-1 bg-gradient-to-l from-transparent to-[#1abc9c] rounded-full" />
          </div>
        </div>

        {/* Country Tabs */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {countries.map((country, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCountry(idx)}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-['Inter:Bold',sans-serif] text-[16px] transition-all duration-300 border-2 ${
                activeCountry === idx
                  ? 'bg-[#1abc9c] text-white border-[#1abc9c] shadow-lg'
                  : 'bg-white text-[#3b3b3b] border-[#eaeaea] hover:border-[#1abc9c]'
              }`}
            >
              <span className="text-[24px]">{country.flag}</span>
              {country.name}
              <span className={`text-[13px] px-2 py-0.5 rounded-full ${
                activeCountry === idx ? 'bg-white/20' : 'bg-[#1abc9c]/10 text-[#1abc9c]'
              }`}>
                {country.cities.length} cities
              </span>
            </button>
          ))}
        </div>

        {/* Breadcrumb Path */}
        <div className="flex items-center gap-2 mb-8 text-[#6b7280] font-['Inter:Medium',sans-serif] text-[14px]">
          <Globe className="w-4 h-4 text-[#1abc9c]" />
          <span className="text-[#1abc9c]">{activeCountryData.name}</span>
          <ChevronRight className="w-3 h-3" />
          <span>{totalCities} Cities</span>
          <ChevronRight className="w-3 h-3" />
          <span>{totalHotels}+ Hotels</span>
        </div>

        {/* City Cards Grid */}
        <div className="grid grid-cols-3 gap-8 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          {activeCountryData.cities.map((city, index) => (
            <CityCard key={index} city={city} />
          ))}
        </div>

        {/* Bottom Info Bar */}
        <div className="bg-gradient-to-r from-[#1abc9c]/5 via-[#1abc9c]/10 to-[#1abc9c]/5 rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-[#1abc9c]/10 p-4 rounded-xl">
                <MapPin className="w-6 h-6 text-[#1abc9c]" />
              </div>
              <div>
                <div className="font-['Poppins:SemiBold',sans-serif] text-[18px] text-[#3b3b3b] mb-1">
                  Not sure which city to choose?
                </div>
                <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#6b7280]">
                  Our local team can help you find the perfect city and hotel for your needs
                </p>
              </div>
            </div>

            <Link
              to="/listing"
              className="group inline-flex items-center gap-2 border-2 border-[#1abc9c] text-[#1abc9c] px-8 py-3 rounded-xl hover:bg-[#1abc9c] hover:text-white transition-all duration-300 font-['Inter:Bold',sans-serif] text-[15px] whitespace-nowrap"
            >
              View All Hotels
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-4 gap-6 animate-in fade-in duration-700 delay-500">
          {[
            { icon: <Globe className="w-5 h-5" />, number: "1", label: "Country" },
            { icon: <MapPin className="w-5 h-5" />, number: `${totalCities}`, label: "Cities Covered" },
            { icon: <Building2 className="w-5 h-5" />, number: `${totalHotels}+`, label: "Hotels Available" },
            { icon: <Star className="w-5 h-5" />, number: "4.6", label: "Average Guest Rating" }
          ].map((stat, index) => (
            <div
              key={index}
              className="flex items-center gap-3 bg-[#fafafa] rounded-xl p-4 border border-[#eaeaea] hover:border-[#1abc9c] hover:bg-white transition-all duration-300 group"
            >
              <div className="bg-[#1abc9c]/10 p-2 rounded-lg text-[#1abc9c] group-hover:bg-[#1abc9c] group-hover:text-white transition-colors flex-shrink-0">
                {stat.icon}
              </div>
              <div>
                <div className="font-['Poppins:Bold',sans-serif] text-[20px] text-[#1abc9c]">
                  {stat.number}
                </div>
                <div className="font-['Inter:Regular',sans-serif] text-[12px] text-[#6b7280]">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { CountriesSection as DestinationsSection };
export default CountriesSection;
