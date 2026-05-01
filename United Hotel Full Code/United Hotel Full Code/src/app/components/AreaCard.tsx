import { ChevronRight } from 'lucide-react';

interface AreaCardProps {
  name: string;
  description: string;
  image: string;
}

export function AreaCard({ name, description, image }: AreaCardProps) {
  return (
    <div className="bg-white rounded-[12px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-shadow">
      <img 
        src={image} 
        alt={name}
        className="w-full h-[160px] object-cover"
      />
      
      <div className="p-[16px]">
        <h3 className="font-['Poppins'] font-semibold text-[18px] text-[#3b3b3b] mb-[8px]">
          {name}
        </h3>
        
        <p className="font-['Inter'] text-[14px] text-[#8c8c8c] mb-[16px] leading-[1.6]">
          {description}
        </p>
        
        <button className="flex items-center gap-[6px] text-[#1ABC9C] font-['Inter'] font-medium text-[14px] hover:gap-[10px] transition-all min-h-[44px]">
          Explore Hotels
          <ChevronRight className="w-[16px] h-[16px]" />
        </button>
      </div>
    </div>
  );
}
