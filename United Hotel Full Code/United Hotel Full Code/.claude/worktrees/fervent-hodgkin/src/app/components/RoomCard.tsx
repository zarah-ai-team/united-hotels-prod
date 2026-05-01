import { Users, Maximize, Check } from 'lucide-react';
import { Button } from './ui/Button';

interface RoomCardProps {
  id: string;
  name: string;
  image: string;
  size: string;
  maxGuests: number;
  amenities: string[];
  cancellationPolicy: string;
  directPrice: number;
  otaPrice?: number;
  available: number;
  onSelect: (roomId: string) => void;
  isSelected?: boolean;
}

export function RoomCard({
  id,
  name,
  image,
  size,
  maxGuests,
  amenities,
  cancellationPolicy,
  directPrice,
  otaPrice,
  available,
  onSelect,
  isSelected = false
}: RoomCardProps) {
  const savings = otaPrice ? otaPrice - directPrice : 0;
  
  return (
    <div className={`
      bg-white rounded-[12px] overflow-hidden border-2 transition-all
      ${isSelected ? 'border-[#1ABC9C] shadow-[0_4px_16px_rgba(26,188,156,0.2)]' : 'border-[#eaeaea]'}
      ${available === 0 ? 'opacity-60' : ''}
    `}>
      <div className="md:flex">
        <div className="md:w-[240px] flex-shrink-0">
          <img 
            src={image} 
            alt={name}
            className="w-full h-[180px] md:h-full object-cover"
          />
        </div>
        
        <div className="p-[16px] md:p-[20px] flex-1">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-[16px]">
            <div className="flex-1">
              <h3 className="font-['Poppins'] font-semibold text-[20px] text-[#3b3b3b] mb-[12px]">
                {name}
              </h3>
              
              <div className="flex items-center gap-[16px] mb-[16px]">
                <div className="flex items-center gap-[6px] text-[#8c8c8c]">
                  <Maximize className="w-[16px] h-[16px]" />
                  <span className="font-['Inter'] text-[14px]">{size}</span>
                </div>
                <div className="flex items-center gap-[6px] text-[#8c8c8c]">
                  <Users className="w-[16px] h-[16px]" />
                  <span className="font-['Inter'] text-[14px]">Up to {maxGuests} guests</span>
                </div>
              </div>
              
              <div className="mb-[12px]">
                <div className="font-['Inter'] font-medium text-[14px] text-[#3b3b3b] mb-[8px]">
                  Amenities:
                </div>
                <div className="grid grid-cols-2 gap-[6px]">
                  {amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-[6px]">
                      <Check className="w-[14px] h-[14px] text-[#1ABC9C]" />
                      <span className="font-['Inter'] text-[14px] text-[#3b3b3b]">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-start gap-[6px] text-[#10B981] mb-[8px]">
                <Check className="w-[16px] h-[16px] flex-shrink-0 mt-[2px]" />
                <span className="font-['Inter'] text-[14px]">{cancellationPolicy}</span>
              </div>
              
              {available > 0 && available <= 3 && (
                <div className="text-[13px] text-[#EF4444] font-['Inter']">
                  Only {available} room{available > 1 ? 's' : ''} left
                </div>
              )}
            </div>
            
            <div className="md:text-right flex-shrink-0 md:min-w-[200px]">
              {otaPrice && (
                <div className="mb-[4px]">
                  <span className="font-['Inter'] text-[14px] text-[#8c8c8c] line-through">
                    ${otaPrice}
                  </span>
                  <span className="font-['Inter'] text-[12px] text-[#8c8c8c] ml-[4px]">
                    on OTAs
                  </span>
                </div>
              )}
              
              <div className="mb-[2px]">
                <span className="font-['Poppins'] font-bold text-[28px] text-[#3b3b3b]">
                  ${directPrice}
                </span>
              </div>
              
              <div className="font-['Inter'] text-[14px] text-[#8c8c8c] mb-[8px]">
                per night
              </div>
              
              {savings > 0 && (
                <div className="bg-[#f0fdf4] text-[#10B981] px-[8px] py-[4px] rounded-[6px] font-['Inter'] text-[12px] font-semibold mb-[16px] inline-block">
                  Save ${savings}
                </div>
              )}
              
              <Button
                variant={isSelected ? 'secondary' : 'primary'}
                size="md"
                fullWidth
                onClick={() => onSelect(id)}
                disabled={available === 0}
              >
                {available === 0 ? 'Sold Out' : isSelected ? 'Selected' : 'Select Room'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
