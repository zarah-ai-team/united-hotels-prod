import { Check } from 'lucide-react';

interface Step {
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="w-full">
      {/* Mobile - Compact Stepper */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-[16px]">
          <span className="font-['Inter'] text-[14px] text-[#8c8c8c]">
            Step {currentStep} of {steps.length}
          </span>
          <span className="font-['Inter'] font-medium text-[14px] text-[#3b3b3b]">
            {steps[currentStep - 1].label}
          </span>
        </div>
        <div className="h-[4px] bg-[#eaeaea] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#1ABC9C] transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Desktop - Full Stepper */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;
          
          return (
            <div key={index} className="flex items-center flex-1">
              <div className="flex items-center gap-[12px]">
                <div className={`
                  w-[40px] h-[40px] rounded-full flex items-center justify-center
                  font-['Inter'] font-semibold text-[16px] transition-all
                  ${isCompleted ? 'bg-[#1ABC9C] text-white' : ''}
                  ${isActive ? 'bg-[#1ABC9C] text-white ring-4 ring-[rgba(26,188,156,0.2)]' : ''}
                  ${isUpcoming ? 'bg-[#eaeaea] text-[#8c8c8c]' : ''}
                `}>
                  {isCompleted ? <Check className="w-[20px] h-[20px]" /> : stepNumber}
                </div>
                
                <div>
                  <div className={`
                    font-['Poppins'] font-semibold text-[14px]
                    ${isActive || isCompleted ? 'text-[#3b3b3b]' : 'text-[#8c8c8c]'}
                  `}>
                    {step.label}
                  </div>
                  {step.description && (
                    <div className="font-['Inter'] text-[12px] text-[#8c8c8c]">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-[2px] mx-[16px]
                  ${stepNumber < currentStep ? 'bg-[#1ABC9C]' : 'bg-[#eaeaea]'}
                `} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
