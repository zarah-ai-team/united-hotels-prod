import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-[12px]">
      {items.map((item, index) => (
        <div 
          key={index}
          className="bg-white rounded-[12px] border border-[#eaeaea] overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between p-[16px] text-left min-h-[60px] hover:bg-[#fafafa] transition-colors"
          >
            <span className="font-['Poppins'] font-semibold text-[16px] text-[#3b3b3b] pr-[16px]">
              {item.question}
            </span>
            <ChevronDown 
              className={`w-[20px] h-[20px] text-[#1ABC9C] flex-shrink-0 transition-transform ${
                openIndex === index ? 'rotate-180' : ''
              }`}
            />
          </button>
          
          {openIndex === index && (
            <div className="px-[16px] pb-[16px]">
              <p className="font-['Inter'] text-[16px] text-[#8c8c8c] leading-[1.6]">
                {item.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
