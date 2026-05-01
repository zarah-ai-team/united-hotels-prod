import { MapPin, Star } from 'lucide-react';
import { Link } from 'react-router';
import { useLanguage } from '../context/LanguageContext';

interface ListingHotelCardProps {
  id: string;
  image: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  directPrice: number;
  otaPrice?: number;
  savings?: number;
  urgency?: string;
  amenities?: string[];
}

export function ListingHotelCard({
  id,
  image,
  name,
  location,
  rating,
  reviewCount,
  directPrice,
  otaPrice,
  savings,
  urgency,
  amenities = []
}: ListingHotelCardProps) {
  const { format } = useLanguage();

  return (
    <Link 
      to={`/hotel/${id}`}
      onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "auto" })}
      className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group border border-[#e5e7eb] hover:border-[#1abc9c]"
    >
      {/* Image Section - Better proportions for single column mobile */}
      <div className="relative aspect-[4/3] md:aspect-[4/3] overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {savings && (
          <div className="absolute top-3 right-3 bg-[#10B981] text-white px-3 py-1.5 rounded-lg text-[12px] md:text-[13px] font-bold font-['Inter',sans-serif] shadow-lg">
            -{format(savings)}
          </div>
        )}
      </div>
      
      {/* Content Section - Better spacing for single column mobile */}
      <div className="p-4 md:p-4">
        {/* Location and Rating - Top line */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin className="w-4 h-4 text-[#8c8c8c] flex-shrink-0" />
              <span className="font-['Inter:Medium',sans-serif] text-[12px] md:text-[12px] text-[#8c8c8c] truncate">{location}</span>
            </div>
            <h3 className="font-['Inter:SemiBold',sans-serif] text-[16px] md:text-[18px] text-[#3b3b3b] group-hover:text-[#1abc9c] transition-colors line-clamp-2 leading-tight">
              {name}
            </h3>
          </div>
          
          {/* Rating badge - Better size */}
          <div className="flex items-center gap-1 bg-[#f9fafb] px-2 py-1 rounded-lg flex-shrink-0">
            <Star className="w-3.5 h-3.5 md:w-4 md:h-4 fill-[#FFA500] text-[#FFA500]" />
            <span className="font-['Inter:Bold',sans-serif] text-[12px] md:text-[13px] text-[#3b3b3b]">
              {rating.toFixed(1)}
            </span>
          </div>
        </div>
        
        {/* Review count - Better visibility */}
        <div className="text-[11px] md:text-[12px] text-[#8c8c8c] mb-3 font-['Inter:Regular',sans-serif]">
          {reviewCount} reviews
        </div>
        
        {/* Price Section - Prominent */}
        <div className="pt-3 border-t border-[#e5e7eb]">
          <div className="flex items-baseline gap-1">
            <span className="font-['Poppins:Bold',sans-serif] text-[20px] md:text-[22px] text-[#3b3b3b]">
              {format(directPrice)}
            </span>
            <span className="font-['Inter:Regular',sans-serif] text-[12px] md:text-[13px] text-[#8c8c8c]">
              /night
            </span>
          </div>
          {otaPrice && (
            <div className="text-[11px] md:text-[12px] text-[#10B981] font-['Inter:SemiBold',sans-serif] mt-1">
              {format(otaPrice - directPrice)} less than OTAs
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}