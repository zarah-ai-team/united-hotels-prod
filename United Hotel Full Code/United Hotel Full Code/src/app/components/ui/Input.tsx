import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="font-['Inter'] font-medium text-[14px] text-[#3b3b3b] mb-[8px] block">
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[#8c8c8c]">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            className={`
              w-full 
              ${icon ? 'pl-[40px]' : 'pl-[16px]'} 
              pr-[16px] 
              py-[12px] 
              border 
              ${error ? 'border-[#EF4444]' : 'border-[#eaeaea]'}
              rounded-[8px] 
              font-['Inter'] 
              text-[16px]
              bg-white
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
          />
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

Input.displayName = 'Input';
