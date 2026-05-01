import { Shield, TrendingDown, Eye, MessageCircle, MapPin, Award, Check, Star, DollarSign, Clock } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

function FeatureCard({ icon, title, description, index }: FeatureCardProps) {
  return (
    <div 
      className="group bg-white border-2 border-[#e5e7eb] rounded-2xl p-6 hover:border-[#1abc9c] hover:shadow-xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1abc9c]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content */}
      <div className="relative">
        {/* Icon */}
        <div className="bg-[#1abc9c]/10 w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-[#1abc9c] group-hover:bg-[#1abc9c] group-hover:text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
          {icon}
        </div>
        
        {/* Title */}
        <h3 className="font-['Poppins:SemiBold',sans-serif] text-[18px] leading-[26px] text-[#3b3b3b] mb-2 group-hover:text-[#1abc9c] transition-colors duration-300">
          {title}
        </h3>
        
        {/* Description */}
        <p className="font-['Inter:Regular',sans-serif] text-[15px] leading-[24px] text-[#6b7280]">
          {description}
        </p>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1abc9c] to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </div>
  );
}

interface BenefitItemProps {
  icon: React.ReactNode;
  text: string;
  index: number;
}

function BenefitItem({ icon, text, index }: BenefitItemProps) {
  return (
    <div 
      className="flex items-center gap-3 group"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex-shrink-0 bg-[#1abc9c]/10 w-8 h-8 rounded-lg flex items-center justify-center text-[#1abc9c] group-hover:bg-[#1abc9c] group-hover:text-white transition-colors duration-300">
        {icon}
      </div>
      <span className="font-['Inter:Medium',sans-serif] text-[15px] text-[#374151] group-hover:text-[#1abc9c] transition-colors duration-300">
        {text}
      </span>
    </div>
  );
}

export function SEOContentSection() {
  const features = [
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Local Expertise",
      description: "Our Turkey-based team personally visits every property to ensure quality standards"
    },
    {
      icon: <TrendingDown className="w-6 h-6" />,
      title: "Direct Rates",
      description: "Better prices through exclusive hotel partnerships—no middleman markups"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Total Transparency",
      description: "What you see is what you pay—no hidden fees, no surprises at checkout"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "24/7 Support",
      description: "WhatsApp assistance from our local team whenever you need help"
    }
  ];

  const benefits = [
    { icon: <Check className="w-4 h-4" />, text: "Free cancellation on most bookings" },
    { icon: <Check className="w-4 h-4" />, text: "Best price guarantee" },
    { icon: <Check className="w-4 h-4" />, text: "Instant booking confirmation" },
    { icon: <Check className="w-4 h-4" />, text: "No booking fees" }
  ];

  const stats = [
    { icon: <MapPin className="w-5 h-5" />, number: "12+", label: "Neighborhoods" },
    { icon: <Award className="w-5 h-5" />, number: "55+", label: "Verified Hotels" },
    { icon: <DollarSign className="w-5 h-5" />, number: "$32", label: "Starting Price" },
    { icon: <Star className="w-5 h-5" />, number: "4.6", label: "Avg. Rating" }
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#1abc9c]/3 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#1abc9c]/3 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="max-w-[1440px] mx-auto px-10 relative">
        {/* Main Heading Section */}
        <div className="max-w-[920px] mx-auto text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="font-['Poppins:Bold',sans-serif] text-[52px] leading-[68px] text-[#3b3b3b] mb-8">United Hotels in Turkey —<br />Affordable Stays in Prime Locations</h2>
          
          <p className="font-['Inter:Regular',sans-serif] text-[20px] leading-[36px] text-[#4b5563] max-w-[800px] mx-auto">
            Finding quality <span className="text-[#1abc9c] font-['Inter:SemiBold',sans-serif] border-b-2 border-[#1abc9c]/30">accommodation in Turkey</span> doesn't mean compromising on comfort or location. At United Hotels, we've personally inspected and selected the best affordable hotels across Turkey's most popular neighborhoods.
          </p>
        </div>

        {/* Stats Bar - Centered with 3 columns */}
        <div className="max-w-[960px] mx-auto grid grid-cols-3 gap-8 mb-32 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          {stats.slice(0, 3).map((stat, index) => (
            <div 
              key={index}
              className="relative bg-white border-2 border-[#eaeaea] rounded-2xl p-8 text-center hover:border-[#1abc9c] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group overflow-hidden"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1abc9c]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  <div className="bg-gradient-to-br from-[#1abc9c] to-[#16a085] p-4 rounded-xl text-white shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                    {stat.icon}
                  </div>
                </div>
                <div className="font-['Poppins:Bold',sans-serif] text-[44px] leading-none bg-gradient-to-r from-[#1abc9c] to-[#16a085] bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="font-['Inter:SemiBold',sans-serif] text-[15px] text-[#6b7280] group-hover:text-[#1abc9c] transition-colors duration-300">
                  {stat.label}
                </div>
              </div>
              
              {/* Bottom accent */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#1abc9c] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>

        {/* Feature Cards Grid - 3 columns for better spacing */}
        <div className="grid grid-cols-3 gap-8 mb-32 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          {features.slice(0, 3).map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>

        {/* Two Column Layout - More breathing room */}
        <div className="grid grid-cols-2 gap-20 items-start mb-32 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-[#1abc9c]/5 to-transparent border-l-4 border-[#1abc9c] rounded-r-2xl p-10">
              <div className="flex items-start gap-5">
                <div className="bg-gradient-to-br from-[#1abc9c] to-[#16a085] p-3 rounded-xl shadow-lg flex-shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-['Poppins:SemiBold',sans-serif] text-[24px] text-[#3b3b3b] mb-4">
                    Perfect for Every Traveler
                  </h3>
                  <p className="font-['Inter:Regular',sans-serif] text-[17px] leading-[30px] text-[#4b5563]">
                    Whether you're planning a weekend getaway or extended cultural exploration, our curated selection puts you in Turkey's best neighborhoods without breaking the bank.
                  </p>
                </div>
              </div>
            </div>

            {/* Highlight Box */}
            <div className="bg-white rounded-2xl p-8 border-2 border-[#eaeaea] shadow-sm">
              <p className="font-['Inter:Regular',sans-serif] text-[16px] leading-[28px] text-[#4b5563]">
                With <span className="font-['Inter:Bold',sans-serif] text-[#1abc9c]">free cancellation</span> on most bookings and local support, you can book with confidence knowing you're getting authentic value, not inflated OTA prices.
              </p>
            </div>
          </div>

          {/* Right Column - Benefits List */}
          <div>
            <div className="bg-white border-2 border-[#e5e7eb] rounded-2xl p-10 hover:border-[#1abc9c] hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-gradient-to-br from-[#10b981] to-[#059669] p-3 rounded-xl shadow-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-['Poppins:SemiBold',sans-serif] text-[24px] text-[#3b3b3b]">
                  Your Booking Benefits
                </h3>
              </div>

              <div className="space-y-5">
                {benefits.map((benefit, index) => (
                  <BenefitItem
                    key={index}
                    icon={benefit.icon}
                    text={benefit.text}
                    index={index}
                  />
                ))}
              </div>

              {/* Additional Info */}
              <div className="mt-8 pt-8 border-t-2 border-[#eaeaea]">
                <div className="flex items-center gap-3 text-[#6b7280]">
                  <Clock className="w-5 h-5" />
                  <span className="font-['Inter:Medium',sans-serif] text-[14px]">
                    Instant confirmation • Secure payment • 24/7 support
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Bar - Simplified */}
        <div className="max-w-[1120px] mx-auto bg-gradient-to-r from-white via-[#fafafa] to-white rounded-3xl p-10 border-2 border-[#eaeaea] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
          <div className="text-center mb-8">
            <p className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-[#3b3b3b]">
              Join 1,200+ travelers who chose direct booking
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-16 text-[#6b7280]">
            <div className="flex flex-col items-center gap-3">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 bg-gradient-to-br from-[#1abc9c] to-[#16a085] rounded-full border-3 border-white flex items-center justify-center text-white font-['Inter:Bold',sans-serif] text-[14px] shadow-md"
                  >
                    ✓
                  </div>
                ))}
              </div>
              <span className="font-['Inter:SemiBold',sans-serif] text-[15px] text-[#3b3b3b]">
                Verified Reviews
              </span>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 fill-[#FFA500] text-[#FFA500]" />
                <span className="font-['Poppins:Bold',sans-serif] text-[28px] text-[#3b3b3b]">
                  4.6<span className="text-[#6b7280] text-[18px]">/5</span>
                </span>
              </div>
              <span className="font-['Inter:SemiBold',sans-serif] text-[15px] text-[#3b3b3b]">
                Average Rating
              </span>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="bg-gradient-to-br from-[#10b981] to-[#059669] p-3 rounded-xl shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="font-['Inter:SemiBold',sans-serif] text-[15px] text-[#3b3b3b]">
                Secure & Protected
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SEOContentSection;