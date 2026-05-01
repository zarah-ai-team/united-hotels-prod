const imgImageHotelInspection = "/figma-assets/9783e6851bc031fabe001ad50fc466eb1ba42e2e.png";
import { Check, Eye, MapPin, Sparkles, Shield, ClipboardCheck, Award } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
  number: string;
}

function FeatureCard({ icon, title, description, index, number }: FeatureCardProps) {
  return (
    <div 
      className="group bg-white rounded-2xl p-6 border border-[#e5e7eb] hover:border-[#1abc9c] hover:shadow-xl hover:-translate-x-2 transition-all duration-500 relative overflow-hidden"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1abc9c]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Number badge */}
      <div className="absolute top-4 right-4 font-['Poppins:Bold',sans-serif] text-[48px] text-[#1abc9c]/10 group-hover:text-[#1abc9c]/20 transition-colors duration-500">
        {number}
      </div>

      <div className="flex gap-4 relative z-10">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="bg-[#1abc9c]/10 w-12 h-12 rounded-xl flex items-center justify-center text-[#1abc9c] group-hover:bg-[#1abc9c] group-hover:text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-sm">
            {icon}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="font-['Poppins:SemiBold',sans-serif] text-[18px] leading-[26px] text-[#3b3b3b] mb-2 group-hover:text-[#1abc9c] transition-colors duration-300">
            {title}
          </h3>
          <p className="font-['Inter:Regular',sans-serif] text-[15px] leading-[24px] text-[#6b7280] group-hover:text-[#374151] transition-colors duration-300">
            {description}
          </p>
        </div>

        {/* Check icon */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-[#10b981]/10 w-8 h-8 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-[#10b981]" />
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1abc9c] to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </div>
  );
}

export function QualityAssuranceSection() {
  const features = [
    {
      icon: <Eye className="w-5 h-5" />,
      title: "Personally Reviewed",
      description: "Our local team visits and photographs each property before listing",
      number: "01"
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "Verified Location Accuracy",
      description: "Exact distances and neighborhood details confirmed on-site",
      number: "02"
    },
    {
      icon: <ClipboardCheck className="w-5 h-5" />,
      title: "Cleanliness Standards Checked",
      description: "We verify hygiene, room quality, and maintenance levels",
      number: "03"
    }
  ];

  return (
    <section className="bg-[#fafafa] py-24 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#1abc9c]/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1abc9c]/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
      
      <div className="max-w-[1840px] mx-auto px-10 relative">
        <div className="grid grid-cols-2 gap-20 items-center">
          {/* Left Column - Image */}
          <div className="relative animate-in fade-in slide-in-from-left-8 duration-700">
            {/* Badge */}
            <div className="absolute -top-6 left-8 z-20 bg-white rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-3 animate-in slide-in-from-top-4 duration-700 delay-300">
              <div className="bg-[#10b981]/10 w-12 h-12 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#10b981]" />
              </div>
              <div>
                <div className="font-['Poppins:Bold',sans-serif] text-[24px] text-[#1abc9c]">100%</div>
                <div className="font-['Inter:Medium',sans-serif] text-[13px] text-[#6b7280]">Verified Hotels</div>
              </div>
            </div>

            {/* Main Image Container */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
              {/* Image */}
              <img 
                src={imgImageHotelInspection}
                alt="Hotel inspection by our team"
                className="w-full h-[680px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Quality Badge Overlay */}
              <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-sm rounded-2xl p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="flex items-center gap-4 mb-3">
                  <Award className="w-6 h-6 text-[#1abc9c]" />
                  <span className="font-['Poppins:SemiBold',sans-serif] text-[16px] text-[#3b3b3b]">
                    Quality Certified
                  </span>
                </div>
                <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#6b7280] leading-[22px]">
                  Every property undergoes our 25-point inspection checklist before listing
                </p>
              </div>

              {/* Corner decoration */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#1abc9c]/20 to-transparent" />
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#1abc9c]/10 rounded-full blur-2xl animate-pulse" />
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-[#1abc9c]/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          {/* Right Column - Content */}
          <div className="animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
            {/* Section Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1abc9c]/10 text-[#1abc9c] rounded-full font-['Inter:SemiBold',sans-serif] text-[13px] tracking-wide uppercase mb-6">
              <Sparkles className="w-4 h-4" />
              Our Quality Promise
            </div>

            {/* Heading */}
            <h2 className="font-['Poppins:Bold',sans-serif] text-[52px] leading-[64px] text-[#3b3b3b] mb-6">We Visit Every Hotel We List</h2>

            {/* Description */}
            <p className="font-['Inter:Regular',sans-serif] text-[19px] leading-[32px] text-[#6b7280] mb-10 max-w-[520px]">
              Unlike generic booking platforms, we personally inspect each property. No hotel appears on our platform without our team's approval.
            </p>

            {/* Feature Cards */}
            <div className="space-y-5">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  number={feature.number}
                  index={index}
                />
              ))}
            </div>

            {/* Trust Indicator */}
            <div className="mt-10 bg-gradient-to-r from-[#1abc9c]/5 to-transparent rounded-2xl p-6 border border-[#1abc9c]/20 animate-in fade-in duration-700 delay-500">
              <div className="flex items-start gap-4">
                <div className="bg-[#1abc9c]/10 p-3 rounded-xl">
                  <Shield className="w-6 h-6 text-[#1abc9c]" />
                </div>
                <div>
                  <div className="font-['Poppins:SemiBold',sans-serif] text-[16px] text-[#3b3b3b] mb-1">
                    Quality Guaranteed
                  </div>
                  <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#6b7280] leading-[22px]">
                    If a hotel doesn't meet our standards, we'll immediately find you a comparable or better alternative at no extra cost.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 grid grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-600">
          {[
            { number: "50+", label: "Hotels Inspected", icon: <Eye className="w-5 h-5" /> },
            { number: "25", label: "Point Checklist", icon: <ClipboardCheck className="w-5 h-5" /> },
            { number: "100%", label: "Team Verified", icon: <Shield className="w-5 h-5" /> }
          ].map((stat, index) => (
            <div 
              key={index}
              className="relative bg-gradient-to-br from-white via-[#fafafa] to-white rounded-2xl p-6 text-center border-2 border-[#eaeaea] hover:border-[#1abc9c] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group overflow-hidden"
            >
              {/* Background shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1abc9c]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#1abc9c]/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Icon */}
              <div className="relative z-10 flex justify-center mb-4">
                <div className="bg-gradient-to-br from-[#1abc9c] to-[#16a085] p-3 rounded-xl text-white shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                  {stat.icon}
                </div>
              </div>
              
              {/* Number */}
              <div className="relative z-10 font-['Poppins:Bold',sans-serif] text-[40px] leading-none bg-gradient-to-r from-[#1abc9c] to-[#16a085] bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                {stat.number}
              </div>
              
              {/* Label */}
              <div className="relative z-10 font-['Inter:SemiBold',sans-serif] text-[14px] text-[#6b7280] group-hover:text-[#1abc9c] transition-colors duration-300">
                {stat.label}
              </div>
              
              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#1abc9c] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default QualityAssuranceSection;