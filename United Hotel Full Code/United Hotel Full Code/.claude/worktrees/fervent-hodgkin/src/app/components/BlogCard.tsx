import { ChevronRight } from 'lucide-react';

interface BlogCardProps {
  image: string;
  title: string;
  excerpt: string;
}

export function BlogCard({ image, title, excerpt }: BlogCardProps) {
  return (
    <div className="bg-white rounded-[12px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-shadow">
      <img 
        src={image} 
        alt={title}
        className="w-full h-[180px] object-cover"
      />
      
      <div className="p-[16px]">
        <h3 className="font-['Poppins'] font-semibold text-[16px] text-[#3b3b3b] mb-[8px] leading-[1.4]">
          {title}
        </h3>
        
        <p className="font-['Inter'] text-[14px] text-[#8c8c8c] mb-[12px] leading-[1.6]">
          {excerpt}
        </p>
        
        <button className="flex items-center gap-[6px] text-[#1ABC9C] font-['Inter'] font-medium text-[14px] hover:gap-[10px] transition-all min-h-[44px]">
          Read More
          <ChevronRight className="w-[16px] h-[16px]" />
        </button>
      </div>
    </div>
  );
}
