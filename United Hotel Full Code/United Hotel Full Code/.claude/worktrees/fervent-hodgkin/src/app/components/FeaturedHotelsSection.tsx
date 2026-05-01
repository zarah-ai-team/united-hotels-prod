import { Link } from "react-router";
const imgImageHotel = "/figma-assets/24b94370ae50cf05c8eda404c2045b52c5b68320.png";
const imgImageHotel1 = "/figma-assets/126d7e43c8c296ca95f6cc5a2e933adaced67080.png";
const imgImageHotel2 = "/figma-assets/2192c11a429594d69f4c28f4fc3ed22cdc4449b5.png";
import { MapPin, Star, Clock, Check, TrendingDown, ChevronRight, Sparkles } from "lucide-react";

interface Hotel {
  id: number;
  name: string;
  location: string;
  image: string;
  rating: number;
  reviews: number;
  otaPrice: number;
  directPrice: number;
  savings: number;
  urgencyMessage?: string;
  urgencyType?: 'limited' | 'popular' | 'flexible';
  badge?: string;
}

interface HotelCardProps {
  hotel: Hotel;
  index: number;
}

function HotelCard({ hotel, index }: HotelCardProps) {
  const fullStars = Math.floor(hotel.rating);
  
  // Determine urgency styling
  const getUrgencyStyle = () => {
    switch (hotel.urgencyType) {
      case 'limited':
        return {
          icon: <Clock className="w-4 h-4" />,
          bgColor: 'bg-[#fef2f2]',
          textColor: 'text-[#ef4444]',
          iconColor: 'text-[#ef4444]'
        };
      case 'popular':
        return {
          icon: <TrendingDown className="w-4 h-4" />,
          bgColor: 'bg-[#eff6ff]',
          textColor: 'text-[#3b82f6]',
          iconColor: 'text-[#3b82f6]'
        };
      case 'flexible':
        return {
          icon: <Check className="w-4 h-4" />,
          bgColor: 'bg-[#d1fae5]',
          textColor: 'text-[#059669]',
          iconColor: 'text-[#059669]'
        };
      default:
        return null;
    }
  };

  const urgencyStyle = getUrgencyStyle();

  return (
    <div 
      className="group bg-white rounded-2xl overflow-hidden border border-[#e5e7eb] hover:border-[#1abc9c] hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 relative"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={hotel.image}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Savings Badge */}
        {hotel.badge && (
          <div className="absolute top-4 right-4 bg-[#10b981] text-white px-4 py-2 rounded-xl shadow-lg font-['Inter:Bold',sans-serif] text-[14px] flex items-center gap-1.5 animate-in slide-in-from-top-2 duration-500 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            {hotel.badge}
          </div>
        )}

        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="text-white font-['Inter:SemiBold',sans-serif] text-[15px] transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            Click to view details
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Hotel Name & Location */}
        <div className="mb-4">
          <h3 className="font-['Poppins:SemiBold',sans-serif] text-[20px] leading-[28px] text-[#3b3b3b] mb-2 group-hover:text-[#1abc9c] transition-colors duration-300">
            {hotel.name}
          </h3>
          
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#8c8c8c] flex-shrink-0" />
            <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#6b7280]">
              {hotel.location}
            </span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-5">
          <div className="flex items-center gap-0.5">
            {[...Array(fullStars)].map((_, i) => (
              <Star 
                key={i} 
                className="w-4 h-4 fill-[#FFA500] text-[#FFA500] transition-all duration-300 group-hover:scale-110" 
                style={{ transitionDelay: `${i * 50}ms` }}
              />
            ))}
            {[...Array(5 - fullStars)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-[#E5E7EB]" />
            ))}
          </div>
          <span className="font-['Inter:Regular',sans-serif] text-[13px] text-[#6b7280]">
            ({hotel.reviews} reviews)
          </span>
        </div>

        {/* Pricing Section */}
        <div className="bg-gradient-to-br from-[#fafafa] to-[#f3f4f6] rounded-xl p-5 mb-4 border border-[#eaeaea] group-hover:border-[#1abc9c]/30 transition-colors duration-300">
          {/* OTA Price */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-['Inter:Medium',sans-serif] text-[12px] text-[#8c8c8c] uppercase tracking-wide">
                OTA Price
              </span>
              <div className="w-1 h-1 bg-[#8c8c8c] rounded-full" />
              <span className="font-['Inter:Regular',sans-serif] text-[13px] text-[#6b7280] line-through">
                ${hotel.otaPrice}
              </span>
            </div>
          </div>

          {/* Direct Price */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-['Inter:SemiBold',sans-serif] text-[12px] text-[#1abc9c] uppercase tracking-wide block mb-1">
                Direct Price
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-['Poppins:Bold',sans-serif] text-[36px] leading-none text-[#1abc9c] group-hover:scale-110 transition-transform inline-block">
                  ${hotel.directPrice}
                </span>
                <span className="font-['Inter:Regular',sans-serif] text-[15px] text-[#6b7280]">
                  /night
                </span>
              </div>
            </div>

            {/* Savings Indicator */}
            <div className="text-right">
              <div className="bg-[#10b981]/10 text-[#10b981] px-3 py-1.5 rounded-lg inline-flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span className="font-['Inter:Bold',sans-serif] text-[13px]">
                  ${hotel.savings} off
                </span>
              </div>
              <div className="font-['Inter:Regular',sans-serif] text-[11px] text-[#8c8c8c] mt-1">
                vs booking sites
              </div>
            </div>
          </div>
        </div>

        {/* Urgency Message */}
        {hotel.urgencyMessage && urgencyStyle && (
          <div className={`${urgencyStyle.bgColor} rounded-lg px-3 py-2.5 mb-5 flex items-center gap-2 animate-pulse-slow`}>
            <span className={urgencyStyle.iconColor}>
              {urgencyStyle.icon}
            </span>
            <span className={`font-['Inter:Medium',sans-serif] text-[13px] ${urgencyStyle.textColor}`}>
              {hotel.urgencyMessage}
            </span>
          </div>
        )}

        {/* CTA Button */}
        <Link 
          to={`/hotel/${hotel.id}`}
          className="w-full bg-[#1abc9c] text-white py-3.5 rounded-xl hover:bg-[#16a085] transition-all duration-300 font-['Inter:Bold',sans-serif] text-[15px] flex items-center justify-center gap-2 group/btn shadow-md hover:shadow-xl relative overflow-hidden"
        >
          <span className="relative z-10">View Rooms & Availability</span>
          <ChevronRight className="w-5 h-5 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
          
          {/* Button shimmer effect */}
          <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </Link>
      </div>

      {/* Top right corner decoration */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#1abc9c]/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
}

export function FeaturedHotelsSection() {
  const hotels: Hotel[] = [
    {
      id: 1,
      name: "Sultanahmet Boutique Hotel",
      location: "Sultanahmet, Asian Side",
      image: imgImageHotel,
      rating: 4,
      reviews: 127,
      otaPrice: 57,
      directPrice: 42,
      savings: 15,
      urgencyMessage: "Only 2 rooms left",
      urgencyType: 'limited',
      badge: "Save $15"
    },
    {
      id: 2,
      name: "Taksim Central Stay",
      location: "Taksim, Beyoğlu",
      image: imgImageHotel1,
      rating: 4,
      reviews: 89,
      otaPrice: 50,
      directPrice: 38,
      savings: 12,
      urgencyMessage: "Booked 12 times this week",
      urgencyType: 'popular',
      badge: "Save $12"
    },
    {
      id: 3,
      name: "Kadıköy Harbor View",
      location: "Kadıköy, Asian Side",
      image: imgImageHotel2,
      rating: 5,
      reviews: 156,
      otaPrice: 57,
      directPrice: 45,
      savings: 12,
      urgencyMessage: "Free cancellation",
      urgencyType: 'flexible',
      badge: "Save $12"
    }
  ];

  return (
    <section id="best-value-picks" className="py-24 bg-white relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#1abc9c]/3 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#1abc9c]/3 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      
      <div className="max-w-[1840px] mx-auto px-10 relative">
        {/* Section Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Label Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1abc9c]/10 text-[#1abc9c] rounded-full font-['Inter:SemiBold',sans-serif] text-[13px] tracking-wide uppercase mb-6">
            <Sparkles className="w-4 h-4" />
            Best Value Picks
          </div>

          <h2 className="font-['Poppins:Bold',sans-serif] text-[52px] leading-[64px] text-[#3b3b3b] mb-4">Featured United Hotels in Turkey</h2>
          
          <p className="font-['Inter:Regular',sans-serif] text-[20px] leading-[32px] text-[#6b7280] max-w-[680px] mx-auto">
            Handpicked stays offering exceptional value in Turkey's best neighborhoods
          </p>

          {/* Decorative Line */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-16 h-1 bg-gradient-to-r from-transparent to-[#1abc9c] rounded-full" />
            <div className="w-2 h-2 bg-[#1abc9c] rounded-full" />
            <div className="w-16 h-1 bg-gradient-to-l from-transparent to-[#1abc9c] rounded-full" />
          </div>
        </div>

        {/* Hotel Cards Grid */}
        <div className="grid grid-cols-3 gap-8 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          {hotels.map((hotel, index) => (
            <HotelCard key={hotel.id} hotel={hotel} index={index} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
          <Link 
            to="/listing"
            className="group inline-flex items-center gap-3 border-2 border-[#1abc9c] text-[#1abc9c] px-10 py-4 rounded-xl hover:bg-[#1abc9c] hover:text-white transition-all duration-300 font-['Inter:Bold',sans-serif] text-[16px] shadow-md hover:shadow-xl"
          >
            View All Hotels in Turkey
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Trust Indicator */}
          <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#8c8c8c] mt-6">
            <span className="font-['Inter:SemiBold',sans-serif] text-[#1abc9c]">50+ verified hotels</span> • All prices include taxes • No booking fees
          </p>
        </div>

        {/* Bottom Trust Bar */}
        <div className="mt-16 grid grid-cols-4 gap-6 animate-in fade-in duration-700 delay-500">
          {[
            { icon: <Check className="w-5 h-5" />, text: "Best Price Guarantee", gradient: "from-[#1abc9c] to-[#16a085]" },
            { icon: <Check className="w-5 h-5" />, text: "Free Cancellation", gradient: "from-[#1abc9c] to-[#16a085]" },
            { icon: <Check className="w-5 h-5" />, text: "24/7 Local Support", gradient: "from-[#1abc9c] to-[#16a085]" },
            { icon: <Check className="w-5 h-5" />, text: "Instant Confirmation", gradient: "from-[#1abc9c] to-[#16a085]" }
          ].map((item, index) => (
            <div 
              key={index}
              className="relative flex items-center gap-4 bg-gradient-to-br from-white to-[#fafafa] rounded-2xl p-6 border-2 border-[#eaeaea] hover:border-[#1abc9c] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group overflow-hidden"
            >
              {/* Background shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              {/* Icon with gradient background */}
              <div className={`relative z-10 bg-gradient-to-br ${item.gradient} p-3.5 rounded-xl text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                {item.icon}
              </div>
              
              {/* Text */}
              <span className="relative z-10 font-['Inter:Bold',sans-serif] text-[15px] text-[#3b3b3b] group-hover:text-[#1abc9c] transition-colors duration-300">
                {item.text}
              </span>
              
              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#1abc9c]/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedHotelsSection;