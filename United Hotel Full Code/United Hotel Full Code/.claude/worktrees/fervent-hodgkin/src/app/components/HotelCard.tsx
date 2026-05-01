import { MapPin, Star } from 'lucide-react';

interface HotelCardProps {
  image: string;
  name: string;
  location: string;
  rating: number;
  price: number;
  savings?: number;
  urgency?: string;
}

export function HotelCard({ image, name, location, rating, price, savings, urgency }: HotelCardProps) {
  return (
    <div className="bg-white rounded-[12px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-shadow">
      <div className="relative">
        <img 
          src={image} 
          alt={name}
          className="w-full h-[200px] object-cover"
        />
        {savings && (
          <div className="absolute top-[12px] right-[12px] bg-[#10B981] text-white px-[12px] py-[6px] rounded-[8px] text-[14px] font-semibold font-['Inter']">
            Save ${savings}
          </div>
        )}
      </div>
      
      <div className="p-[16px]">
        <h3 className="font-['Poppins'] font-semibold text-[18px] text-[#3b3b3b] mb-[4px]">
          {name}
        </h3>
        
        <div className="flex items-center gap-[6px] mb-[12px]">
          <MapPin className="w-[14px] h-[14px] text-[#8c8c8c]" />
          <span className="font-['Inter'] text-[14px] text-[#8c8c8c]">{location}</span>
        </div>
        
        <div className="flex items-center mb-[12px]">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-[14px] h-[14px] ${i < rating ? 'fill-[#FFA500] text-[#FFA500]' : 'text-[#E5E7EB]'}`}
            />
          ))}
        </div>
        
        {urgency && (
          <div className="text-[13px] text-[#EF4444] font-['Inter'] mb-[12px]">
            {urgency}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div>
            <span className="font-['Poppins'] font-bold text-[24px] text-[#3b3b3b]">
              ${price}
            </span>
            <span className="font-['Inter'] text-[14px] text-[#8c8c8c]"> / night</span>
          </div>
          
          <button className="bg-[#1ABC9C] text-white px-[20px] py-[12px] rounded-[8px] font-['Inter'] font-medium text-[14px] min-h-[44px] hover:bg-[#16a085] transition-colors">
            View Rooms
          </button>
        </div>
      </div>
    </div>
  );
}
