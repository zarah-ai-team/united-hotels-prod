import { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: ReactNode;
  fullWidth?: boolean;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  isLoading = false,
  fullWidth = false,
  children, 
  className = '',
  disabled,
  ...props 
}: ButtonProps) {
  const baseStyles = "font-['Inter'] font-semibold rounded-[8px] transition-all inline-flex items-center justify-center gap-[8px]";
  
  const variantStyles = {
    primary: "bg-[#2F80ED] text-white hover:bg-[#1E5FBC] disabled:bg-[#8c8c8c] disabled:cursor-not-allowed",
    secondary: "bg-white text-[#2F80ED] border-2 border-[#2F80ED] hover:bg-[#f0fdf4] disabled:opacity-50 disabled:cursor-not-allowed",
    outline: "bg-transparent text-[#3b3b3b] border border-[#eaeaea] hover:border-[#2F80ED] hover:text-[#2F80ED] disabled:opacity-50 disabled:cursor-not-allowed",
    ghost: "bg-transparent text-[#2F80ED] hover:bg-[rgba(47, 128, 237,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
  };
  
  const sizeStyles = {
    sm: "px-[16px] py-[8px] text-[14px] min-h-[36px]",
    md: "px-[20px] py-[12px] text-[16px] min-h-[44px]",
    lg: "px-[32px] py-[16px] text-[18px] min-h-[56px]"
  };
  
  const widthStyle = fullWidth ? "w-full" : "";
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-[20px] w-[20px]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </>
      ) : children}
    </button>
  );
}
