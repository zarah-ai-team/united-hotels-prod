import { MapPin, Star } from 'lucide-react';
import { Link } from 'react-router';

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
  return (
    <Link 
      to={`/hotel/${id}`}
      className="block bg-white rounded-[16px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all group"
    >
      {/* Image Section */}
      <div className="relative h-[240px] overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {savings && (
          <div className="absolute top-[16px] right-[16px] bg-[#10B981] text-white px-[14px] py-[8px] rounded-[10px] text-[13px] font-bold font-['Inter'] shadow-lg">
            Save ${savings}
          </div>
        )}
      </div>
      
      {/* Content Section */}
      <div className="p-[20px]">
        <h3 className="font-['Poppins'] font-semibold text-[18px] text-[#3b3b3b] mb-[8px] group-hover:text-[#1ABC9C] transition-colors line-clamp-1">
          {name}
        </h3>
        
        <div className="flex items-center gap-[6px] mb-[12px]">
          <MapPin className="w-[14px] h-[14px] text-[#8c8c8c]" />
          <span className="font-['Inter'] text-[13px] text-[#8c8c8c]">{location}</span>
        </div>
        
        <div className="flex items-center gap-[8px] mb-[16px]">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-[14px] h-[14px] ${i < rating ? 'fill-[#FFA500] text-[#FFA500]' : 'text-[#E5E7EB]'}`}
              />
            ))}
          </div>
          <span className="font-['Inter'] text-[13px] text-[#8c8c8c]">
            ({reviewCount})
          </span>
        </div>
        
        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-[6px] mb-[16px]">
            {amenities.slice(0, 3).map((amenity, index) => (
              <span 
                key={index}
                className="px-[10px] py-[5px] bg-[#f0fdf4] text-[#1ABC9C] rounded-[6px] font-['Inter'] text-[11px] font-medium"
              >
                {amenity}
              </span>
            ))}
            {amenities.length > 3 && (
              <span className="px-[10px] py-[5px] bg-[#fafafa] text-[#8c8c8c] rounded-[6px] font-['Inter'] text-[11px] font-medium">
                +{amenities.length - 3}
              </span>
            )}
          </div>
        )}
        
        {urgency && (
          <div className="text-[12px] text-[#EF4444] font-['Inter'] font-medium mb-[16px] flex items-center gap-[6px]">
            <div className="w-[6px] h-[6px] bg-[#EF4444] rounded-full animate-pulse"></div>
            {urgency}
          </div>
        )}
        
        {/* Price Section */}
        <div className="border-t border-[#e5e7eb] pt-[16px] mb-[16px]">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-[8px] mb-[4px]">
                <span className="font-['Poppins'] font-bold text-[32px] text-[#3b3b3b]">
                  ${directPrice}
                </span>
                <span className="font-['Inter'] text-[14px] text-[#8c8c8c] mb-[6px]">
                  /night
                </span>
              </div>
              {otaPrice && (
                <div className="flex items-center gap-[8px]">
                  <span className="font-['Inter'] text-[13px] text-[#8c8c8c] line-through">
                    ${otaPrice}
                  </span>
                  <span className="font-['Inter'] text-[12px] text-[#10B981] font-semibold bg-[#f0fdf4] px-[8px] py-[2px] rounded-[6px]">
                    on OTAs
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <button className="w-full bg-[#1ABC9C] text-white px-[20px] py-[12px] rounded-[10px] font-['Inter'] font-semibold text-[14px] min-h-[44px] hover:bg-[#16a085] transition-colors">
          View Rooms
        </button>
      </div>
    </Link>
  );
}