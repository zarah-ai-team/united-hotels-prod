import { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="font-['Inter'] font-medium text-[14px] text-[#3b3b3b] mb-[8px] block">
            {label}
          </label>
        )}
        
        <div className="relative">
          <select
            ref={ref}
            className={`
              w-full 
              pl-[16px] 
              pr-[40px] 
              py-[12px] 
              border 
              ${error ? 'border-[#EF4444]' : 'border-[#eaeaea]'}
              rounded-[8px] 
              font-['Inter'] 
              text-[16px]
              bg-white
              appearance-none
              focus:outline-none
              focus:border-[#1ABC9C]
              focus:ring-2
              focus:ring-[rgba(26,188,156,0.1)]
              disabled:bg-[#fafafa]
              disabled:cursor-not-allowed
              transition-all
              ${className}
            `}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <ChevronDown className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-[#8c8c8c] pointer-events-none" />
        </div>
        
        {error && (
          <p className="font-['Inter'] text-[14px] text-[#EF4444] mt-[6px]">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
