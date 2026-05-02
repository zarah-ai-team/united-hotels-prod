import { Link, useNavigate } from 'react-router';
import { useEffect } from 'react';
import { 
  Calendar, Users, Check, ChevronLeft, MapPin, Bed, 
  Maximize2, Clock, Shield, AlertCircle, Star, Wifi,
  Coffee, TrendingDown, Info, CheckCircle2, ChevronRight
} from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import svgPaths from '../../imports/svg-nnzqmx1xjq';
import { Navigation } from '../components/Navigation';
import { formatCurrency } from '../utils/currency';
import { makeImageFallback } from '../utils/hotelImages';

export function BookingStep1() {
  const navigate = useNavigate();
  const { booking, calculateNights } = useBooking();
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();

  // Logged-in users skip the /auth gate — they go straight to step 2 where
  // BookingStep2 prefills their details from AuthContext. Guests still pass
  // through /auth to register, log in, or continue as guest.
  const continueToNext = () => {
    if (isAuthenticated) {
      navigate('/booking/step2');
    } else {
      sessionStorage.setItem('authReturnUrl', '/booking/step2');
      navigate('/auth');
    }
  };

  // Handle missing booking data
  useEffect(() => {
    if (!booking.hotel || !booking.room) {
      navigate('/listing');
    }
  }, [booking.hotel, booking.room, navigate]);

  // Don't render if no booking data
  if (!booking.hotel || !booking.room) {
    return null;
  }

  const nights = calculateNights();
  const roomCount = booking.roomCount || 1;
  const basePrice = (booking.room?.price || 42) * nights * roomCount;
  const taxes = Math.round(basePrice * 0.1);
  const serviceFee = 5;
  const total = basePrice + taxes + serviceFee;
  
  // Calculate OTA comparison
  const otaPrice = Math.round(basePrice * 1.35);
  const savings = otaPrice - basePrice;

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen glass-section-bg pb-0 md:pb-0">
      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Navigation />
      </div>

      {/* Progress Stepper - Mobile & Desktop */}
      <div className="bg-white/65 dark:bg-white/[0.04] backdrop-blur-md border-b border-black/[0.05] dark:border-white/[0.06] md:hidden">
        <div className="max-w-[1840px] mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-3">
            {/* Step 1 - Active */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 bg-gradient-to-br from-[#1abc9c] to-[#2dd4bf] rounded-full flex items-center justify-center text-white font-['Inter:Bold',sans-serif] shadow-[0_6px_16px_-6px_rgba(26,188,156,0.55)] ring-2 ring-white/40 dark:ring-white/10 text-[11px]">
                1
              </div>
              <div className="text-center">
                <div className="font-['Inter:SemiBold',sans-serif] text-[11px] text-[#3b3b3b] dark:text-white/85">
                  Room Selection
                </div>
              </div>
            </div>

            {/* Connector */}
            <div className="w-6 h-0.5 bg-[#eaeaea] dark:bg-white/10" />

            {/* Step 2 - Inactive */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 bg-white/60 dark:bg-white/[0.05] backdrop-blur-sm border border-black/[0.06] dark:border-white/[0.08] rounded-full flex items-center justify-center text-[#8c8c8c] dark:text-white/45 font-['Inter:Bold',sans-serif] text-[11px]">
                2
              </div>
              <div className="text-center">
                <div className="font-['Inter:SemiBold',sans-serif] text-[11px] text-[#8c8c8c]">
                  Guest Details
                </div>
              </div>
            </div>

            {/* Connector */}
            <div className="w-6 h-0.5 bg-[#eaeaea] dark:bg-white/10" />

            {/* Step 3 - Inactive */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 bg-white/60 dark:bg-white/[0.05] backdrop-blur-sm border border-black/[0.06] dark:border-white/[0.08] rounded-full flex items-center justify-center text-[#8c8c8c] dark:text-white/45 font-['Inter:Bold',sans-serif] text-[11px]">
                3
              </div>
              <div className="text-center">
                <div className="font-['Inter:SemiBold',sans-serif] text-[11px] text-[#8c8c8c]">
                  Payment
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <header className="hidden md:block bg-white/72 dark:bg-[#0a0a0a]/72 backdrop-blur-xl backdrop-saturate-150 border-b border-black/[0.06] dark:border-white/[0.06] sticky top-0 z-50 shadow-[0_8px_24px_-16px_rgba(0,0,0,0.08)]">
        <div className="max-w-[1840px] mx-auto px-4 md:px-10">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="h-[22px] w-6 md:h-[26px] md:w-7">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 26">
                  <mask fill="white" id="path-1-inside-1_20_512">
                    <path d={svgPaths.p32095b00} />
                  </mask>
                  <path d={svgPaths.p32095b00} fill="#1ABC9C" mask="url(#path-1-inside-1_20_512)" stroke="#1ABC9C" strokeWidth="0.4" />
                </svg>
              </div>
              <span className="font-['Poppins:SemiBold',sans-serif] text-[16px] md:text-[20px] text-[#1abc9c]">
                United Hotels
              </span>
            </Link>

            {/* Navigation Links - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-8">
              <a href="/#home" className="text-[#3b3b3b] hover:text-[#1abc9c] transition-colors font-['Inter:Medium',sans-serif] text-[15px]">
                Home
              </a>
              <a href="/#why-choose-united-hotels" className="text-[#3b3b3b] hover:text-[#1abc9c] transition-colors font-['Inter:Medium',sans-serif] text-[15px]">
                Why Choose United Hotels
              </a>
              <a href="/#featured-hotels" className="text-[#3b3b3b] hover:text-[#1abc9c] transition-colors font-['Inter:Medium',sans-serif] text-[15px]">
                Featured Hotels
              </a>
              <a href="/#quality" className="text-[#3b3b3b] hover:text-[#1abc9c] transition-colors font-['Inter:Medium',sans-serif] text-[15px]">
                Quality
              </a>
              <a href="/#faqs" className="text-[#3b3b3b] hover:text-[#1abc9c] transition-colors font-['Inter:Medium',sans-serif] text-[15px]">
                FAQ
              </a>
            </div>

            {/* Support - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-4">
              <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#8c8c8c]">
                Need help?
              </span>
              <Link to="/support" className="font-['Inter:SemiBold',sans-serif] text-[14px] text-[#1abc9c] hover:text-[#16a085] transition-colors">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Stepper - Desktop Only */}
      <div className="hidden md:block bg-white/55 dark:bg-white/[0.03] backdrop-blur-md border-b border-black/[0.05] dark:border-white/[0.06]">
        <div className="max-w-[1840px] mx-auto px-10 py-4">
          <div className="flex items-center justify-center gap-6">
            {/* Step 1 - Active */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-[#1abc9c] to-[#2dd4bf] rounded-full flex items-center justify-center text-white font-['Inter:Bold',sans-serif] shadow-[0_6px_16px_-6px_rgba(26,188,156,0.55)] ring-2 ring-white/40 dark:ring-white/10 text-[13px]">
                  1
                </div>
                <div>
                  <div className="font-['Poppins:SemiBold',sans-serif] text-[13px] text-[#3b3b3b] dark:text-white/85 leading-tight">
                    Room Selection
                  </div>
                  <div className="font-['Inter:Regular',sans-serif] text-[11px] text-[#8c8c8c]">
                    Confirm your choice
                  </div>
                </div>
              </div>
              <div className="w-10 h-0.5 bg-[#eaeaea] dark:bg-white/10" />
            </div>

            {/* Step 2 - Inactive */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-white/60 dark:bg-white/[0.05] backdrop-blur-sm border border-black/[0.06] dark:border-white/[0.08] rounded-full flex items-center justify-center text-[#8c8c8c] dark:text-white/45 font-['Inter:Bold',sans-serif] text-[13px]">
                  2
                </div>
                <div>
                  <div className="font-['Poppins:SemiBold',sans-serif] text-[13px] text-[#8c8c8c] leading-tight">
                    Guest Details
                  </div>
                  <div className="font-['Inter:Regular',sans-serif] text-[11px] text-[#8c8c8c]">
                    Enter your information
                  </div>
                </div>
              </div>
              <div className="w-10 h-0.5 bg-[#eaeaea] dark:bg-white/10" />
            </div>

            {/* Step 3 - Inactive */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/60 dark:bg-white/[0.05] backdrop-blur-sm border border-black/[0.06] dark:border-white/[0.08] rounded-full flex items-center justify-center text-[#8c8c8c] dark:text-white/45 font-['Inter:Bold',sans-serif] text-[13px]">
                3
              </div>
              <div>
                <div className="font-['Poppins:SemiBold',sans-serif] text-[13px] text-[#8c8c8c] leading-tight">
                  Payment
                </div>
                <div className="font-['Inter:Regular',sans-serif] text-[11px] text-[#8c8c8c]">
                  Complete booking
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1840px] mx-auto px-4 md:px-10 py-4 md:py-6 pb-32 md:pb-8 overflow-x-hidden">
        {/* Back Button */}
        <Link
          to={`/hotel/${booking.hotel.id}`}
          className="inline-flex items-center gap-1.5 text-[#1abc9c] hover:text-[#16a085] transition-colors font-['Inter:SemiBold',sans-serif] text-[13px] md:text-[14px] mb-3 md:mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Go Back
        </Link>

        <div className="flex flex-col md:grid md:grid-cols-[1fr_400px] gap-4 md:gap-6 overflow-x-hidden">
          {/* Main Content */}
          <div className="w-full overflow-x-hidden">
            <h1 className="font-['Poppins:Bold',sans-serif] text-[20px] md:text-[26px] leading-tight text-[#3b3b3b] dark:text-white mb-4 md:mb-5">
              Confirm Your Selection
            </h1>

            {/* Hotel & Room Card */}
            <div className="glass-card rounded-2xl p-4 md:p-5 mb-4">
              {/* Mobile: Vertical Layout */}
              <div className="md:hidden">
                <img 
                  src={booking.hotel.image}
                  alt={booking.hotel.name}
                  onError={makeImageFallback({ id: booking.hotel.id, name: booking.hotel.name })}
                  className="w-full h-48 rounded-xl object-cover mb-4"
                />
                <div className="space-y-3">
                  <div>
                    <h3 className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-[#3b3b3b] mb-2">
                      {booking.hotel.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-[#1abc9c]" />
                      <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#6b7280]">
                        {booking.hotel.location}
                      </span>
                    </div>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(4)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#FFA500] text-[#FFA500]" />
                    ))}
                    <Star className="w-4 h-4 text-[#e5e7eb]" />
                    <span className="font-['Inter:Regular',sans-serif] text-[12px] text-[#8c8c8c] ml-2">
                      4.0 (245 reviews)
                    </span>
                  </div>

                  {/* Room Type */}
                  <div className="inline-flex items-center gap-2 bg-[#f9fafb] px-3 py-2 rounded-lg border border-[#eaeaea]">
                    <Bed className="w-4 h-4 text-[#1abc9c]" />
                    <span className="font-['Inter:SemiBold',sans-serif] text-[14px] text-[#3b3b3b]">
                      {booking.room.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop: Horizontal Layout */}
              <div className="hidden md:flex gap-4 mb-4">
                <img
                  src={booking.hotel.image}
                  alt={booking.hotel.name}
                  onError={makeImageFallback({ id: booking.hotel.id, name: booking.hotel.name })}
                  className="w-24 h-24 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1">
                  <h3 className="font-['Poppins:SemiBold',sans-serif] text-[17px] text-[#3b3b3b] dark:text-white mb-1.5">
                    {booking.hotel.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-[#1abc9c]" />
                    <span className="font-['Inter:Regular',sans-serif] text-[13px] text-[#6b7280] dark:text-white/65">
                      {booking.hotel.location}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 bg-[#f9fafb] dark:bg-white/[0.05] px-2.5 py-1 rounded-lg border border-[#eaeaea] dark:border-white/10">
                    <Bed className="w-3.5 h-3.5 text-[#1abc9c]" />
                    <span className="font-['Inter:SemiBold',sans-serif] text-[12.5px] text-[#3b3b3b] dark:text-white/85">
                      {booking.room.name}
                    </span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-start gap-0.5">
                  {[...Array(4)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#FFA500] text-[#FFA500]" />
                  ))}
                  <Star className="w-3.5 h-3.5 text-[#e5e7eb]" />
                </div>
              </div>

              {/* Room Details */}
              {/* Mobile: Vertical Layout */}
              <div className="md:hidden space-y-4 pt-6 border-t border-[#eaeaea]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1abc9c]/10 rounded-lg flex items-center justify-center">
                    <Maximize2 className="w-5 h-5 text-[#1abc9c]" />
                  </div>
                  <div>
                    <div className="font-['Inter:Regular',sans-serif] text-[12px] text-[#8c8c8c]">
                      Room Size
                    </div>
                    <div className="font-['Inter:SemiBold',sans-serif] text-[14px] text-[#3b3b3b]">
                      18 m²
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1abc9c]/10 rounded-lg flex items-center justify-center">
                    <Bed className="w-5 h-5 text-[#1abc9c]" />
                  </div>
                  <div>
                    <div className="font-['Inter:Regular',sans-serif] text-[12px] text-[#8c8c8c]">
                      Bed Type
                    </div>
                    <div className="font-['Inter:SemiBold',sans-serif] text-[14px] text-[#3b3b3b]">
                      1 Queen bed
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1abc9c]/10 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#1abc9c]" />
                  </div>
                  <div>
                    <div className="font-['Inter:Regular',sans-serif] text-[12px] text-[#8c8c8c]">
                      Max Guests
                    </div>
                    <div className="font-['Inter:SemiBold',sans-serif] text-[14px] text-[#3b3b3b]">
                      2 adults
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop: Grid Layout */}
              <div className="hidden md:grid md:grid-cols-3 gap-3 pt-4 border-t border-[#eaeaea] dark:border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-[#1abc9c]/10 dark:bg-[#2dd4bf]/15 rounded-lg flex items-center justify-center">
                    <Maximize2 className="w-4 h-4 text-[#1abc9c] dark:text-[#2dd4bf]" />
                  </div>
                  <div>
                    <div className="font-['Inter:Regular',sans-serif] text-[11px] text-[#8c8c8c]">
                      Room Size
                    </div>
                    <div className="font-['Inter:SemiBold',sans-serif] text-[13px] text-[#3b3b3b] dark:text-white/85">
                      18 m²
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-[#1abc9c]/10 dark:bg-[#2dd4bf]/15 rounded-lg flex items-center justify-center">
                    <Bed className="w-4 h-4 text-[#1abc9c] dark:text-[#2dd4bf]" />
                  </div>
                  <div>
                    <div className="font-['Inter:Regular',sans-serif] text-[11px] text-[#8c8c8c]">
                      Bed Type
                    </div>
                    <div className="font-['Inter:SemiBold',sans-serif] text-[13px] text-[#3b3b3b] dark:text-white/85">
                      1 Queen bed
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-[#1abc9c]/10 dark:bg-[#2dd4bf]/15 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-[#1abc9c] dark:text-[#2dd4bf]" />
                  </div>
                  <div>
                    <div className="font-['Inter:Regular',sans-serif] text-[11px] text-[#8c8c8c]">
                      Max Guests
                    </div>
                    <div className="font-['Inter:SemiBold',sans-serif] text-[13px] text-[#3b3b3b] dark:text-white/85">
                      2 adults
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="glass-card rounded-2xl p-4 md:p-5 mb-4">
              <h3 className="font-['Poppins:SemiBold',sans-serif] text-[16px] md:text-[17px] text-[#3b3b3b] dark:text-white mb-4">
                Booking Details
              </h3>

              {/* Mobile: Vertical Layout */}
              <div className="md:hidden space-y-4 mb-6">
                {/* Check-in */}
                <div className="bg-[#fafafa] rounded-xl p-4 border border-[#eaeaea]">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-[#1abc9c]" />
                    <span className="font-['Inter:Medium',sans-serif] text-[13px] text-[#8c8c8c] uppercase tracking-wide">
                      Check-in
                    </span>
                  </div>
                  <div className="font-['Inter:Bold',sans-serif] text-[16px] text-[#3b3b3b] mb-1">
                    {formatDate(booking.checkIn)}
                  </div>
                  <div className="font-['Inter:Regular',sans-serif] text-[13px] text-[#6b7280]">
                    From 2:00 PM
                  </div>
                </div>

                {/* Check-out */}
                <div className="bg-[#fafafa] rounded-xl p-4 border border-[#eaeaea]">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-[#1abc9c]" />
                    <span className="font-['Inter:Medium',sans-serif] text-[13px] text-[#8c8c8c] uppercase tracking-wide">
                      Check-out
                    </span>
                  </div>
                  <div className="font-['Inter:Bold',sans-serif] text-[16px] text-[#3b3b3b] mb-1">
                    {formatDate(booking.checkOut)}
                  </div>
                  <div className="font-['Inter:Regular',sans-serif] text-[13px] text-[#6b7280]">
                    Until 12:00 PM
                  </div>
                </div>

                {/* Duration & Guests - Stacked */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-[#f9fafb] rounded-xl p-4 border border-[#eaeaea]">
                    <div className="w-12 h-12 bg-[#1abc9c] rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-['Inter:Regular',sans-serif] text-[13px] text-[#8c8c8c]">
                        Total Duration
                      </div>
                      <div className="font-['Inter:Bold',sans-serif] text-[18px] text-[#3b3b3b]">
                        {nights} {nights === 1 ? 'Night' : 'Nights'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-[#f9fafb] rounded-xl p-4 border border-[#eaeaea]">
                    <div className="w-12 h-12 bg-[#1abc9c] rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-['Inter:Regular',sans-serif] text-[13px] text-[#8c8c8c]">
                        Number of Guests
                      </div>
                      <div className="font-['Inter:Bold',sans-serif] text-[18px] text-[#3b3b3b]">
                        {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop: Grid Layout */}
              <div className="hidden md:grid md:grid-cols-2 gap-4 mb-4">
                {/* Check-in */}
                <div className="bg-[#fafafa] dark:bg-white/[0.04] rounded-xl p-3.5 border border-[#eaeaea] dark:border-white/[0.06]">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Calendar className="w-4 h-4 text-[#1abc9c]" />
                    <span className="font-['Inter:Medium',sans-serif] text-[11px] text-[#8c8c8c] uppercase tracking-wide">
                      Check-in
                    </span>
                  </div>
                  <div className="font-['Inter:Bold',sans-serif] text-[14px] text-[#3b3b3b] dark:text-white">
                    {formatDate(booking.checkIn)}
                  </div>
                  <div className="font-['Inter:Regular',sans-serif] text-[12px] text-[#6b7280] dark:text-white/55">
                    From 2:00 PM
                  </div>
                </div>

                {/* Check-out */}
                <div className="bg-[#fafafa] dark:bg-white/[0.04] rounded-xl p-3.5 border border-[#eaeaea] dark:border-white/[0.06]">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Calendar className="w-4 h-4 text-[#1abc9c]" />
                    <span className="font-['Inter:Medium',sans-serif] text-[11px] text-[#8c8c8c] uppercase tracking-wide">
                      Check-out
                    </span>
                  </div>
                  <div className="font-['Inter:Bold',sans-serif] text-[14px] text-[#3b3b3b] dark:text-white">
                    {formatDate(booking.checkOut)}
                  </div>
                  <div className="font-['Inter:Regular',sans-serif] text-[12px] text-[#6b7280] dark:text-white/55">
                    Until 12:00 PM
                  </div>
                </div>
              </div>

              {/* Duration & Guests - Desktop */}
              <div className="hidden md:grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-[#f9fafb] dark:bg-white/[0.04] rounded-xl p-3 border border-[#eaeaea] dark:border-white/[0.06]">
                  <div className="w-9 h-9 bg-[#1abc9c] rounded-lg flex items-center justify-center">
                    <Clock className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <div className="font-['Inter:Regular',sans-serif] text-[11px] text-[#8c8c8c]">
                      Total Duration
                    </div>
                    <div className="font-['Inter:Bold',sans-serif] text-[15px] text-[#3b3b3b] dark:text-white">
                      {nights} {nights === 1 ? 'Night' : 'Nights'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-[#f9fafb] dark:bg-white/[0.04] rounded-xl p-3 border border-[#eaeaea] dark:border-white/[0.06]">
                  <div className="w-9 h-9 bg-[#1abc9c] rounded-lg flex items-center justify-center">
                    <Users className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <div className="font-['Inter:Regular',sans-serif] text-[11px] text-[#8c8c8c]">
                      Number of Guests
                    </div>
                    <div className="font-['Inter:Bold',sans-serif] text-[15px] text-[#3b3b3b] dark:text-white">
                      {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Room Amenities */}
            <div className="glass-card rounded-2xl p-4 md:p-5 mb-4">
              <h3 className="font-['Poppins:SemiBold',sans-serif] text-[16px] md:text-[17px] text-[#3b3b3b] dark:text-white mb-4">
                Room Amenities Included
              </h3>
              
              {/* Mobile: Vertical Layout */}
              <div className="md:hidden space-y-3">
                {[
                  { icon: <Wifi className="w-5 h-5" />, name: 'Free WiFi', desc: 'High-speed internet' },
                  { icon: <Coffee className="w-5 h-5" />, name: 'Breakfast', desc: 'Continental breakfast' },
                  { icon: <Check className="w-5 h-5" />, name: 'Private Bathroom', desc: 'With shower' },
                  { icon: <Check className="w-5 h-5" />, name: 'Air Conditioning', desc: 'Climate control' }
                ].map((amenity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-[#fafafa] rounded-lg border border-[#eaeaea]">
                    <div className="w-8 h-8 bg-[#1abc9c]/10 rounded-lg flex items-center justify-center text-[#1abc9c] shrink-0">
                      {amenity.icon}
                    </div>
                    <div>
                      <div className="font-['Inter:SemiBold',sans-serif] text-[14px] text-[#3b3b3b]">
                        {amenity.name}
                      </div>
                      <div className="font-['Inter:Regular',sans-serif] text-[12px] text-[#8c8c8c]">
                        {amenity.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: Grid Layout */}
              <div className="hidden md:grid md:grid-cols-2 gap-3">
                {[
                  { icon: <Wifi className="w-4 h-4" />, name: 'Free WiFi', desc: 'High-speed internet' },
                  { icon: <Coffee className="w-4 h-4" />, name: 'Breakfast', desc: 'Continental breakfast' },
                  { icon: <Check className="w-4 h-4" />, name: 'Private Bathroom', desc: 'With shower' },
                  { icon: <Check className="w-4 h-4" />, name: 'Air Conditioning', desc: 'Climate control' }
                ].map((amenity, index) => (
                  <div key={index} className="flex items-start gap-2.5 p-2.5 bg-[#fafafa] dark:bg-white/[0.04] rounded-lg border border-[#eaeaea] dark:border-white/[0.06]">
                    <div className="w-7 h-7 bg-[#1abc9c]/10 dark:bg-[#2dd4bf]/15 rounded-lg flex items-center justify-center text-[#1abc9c] dark:text-[#2dd4bf] shrink-0">
                      {amenity.icon}
                    </div>
                    <div>
                      <div className="font-['Inter:SemiBold',sans-serif] text-[13px] text-[#3b3b3b] dark:text-white/85">
                        {amenity.name}
                      </div>
                      <div className="font-['Inter:Regular',sans-serif] text-[11.5px] text-[#8c8c8c]">
                        {amenity.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cancellation Policy — bright pastel green in light mode, a
                muted emerald-on-charcoal tint in dark mode so it doesn't glare. */}
            <div className="rounded-2xl p-4 md:p-5 border
              bg-gradient-to-br from-[#d1fae5]/70 to-[#a7f3d0]/60 border-[#86efac]
              dark:bg-none dark:bg-emerald-500/[0.08] dark:border-emerald-400/25
              dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-[#10b981] dark:bg-emerald-500/25 dark:ring-1 dark:ring-emerald-400/40 rounded-xl flex items-center justify-center shrink-0">
                  <Check className="w-4.5 h-4.5 text-white dark:text-emerald-300" />
                </div>
                <div className="flex-1">
                  <h4 className="font-['Poppins:SemiBold',sans-serif] text-[15px] text-[#047857] dark:text-emerald-300 mb-1">
                    Free Cancellation Available
                  </h4>
                  <p className="font-['Inter:Regular',sans-serif] text-[13px] text-[#065f46] dark:text-emerald-100/80 leading-[20px] mb-2">
                    Cancel up to 24 hours before check-in for a full refund. No questions asked, no hidden fees.
                  </p>
                  <div className="flex items-center gap-1.5 text-[#047857] dark:text-emerald-300">
                    <Shield className="w-3.5 h-3.5" />
                    <span className="font-['Inter:SemiBold',sans-serif] text-[12px]">
                      100% Money-Back Guarantee
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sticky Summary - Desktop Only */}
          <div className="hidden md:block">
            <div className="sticky top-24">
              {/* Price Summary Card */}
              <div className="hero-glass rounded-2xl p-5 mb-4 ring-1 ring-[#1abc9c]/30 dark:ring-[#2dd4bf]/35">
                <h3 className="font-['Poppins:Bold',sans-serif] text-[18px] text-[#3b3b3b] dark:text-white mb-4">
                  Price Summary
                </h3>

                {/* Price Breakdown */}
                <div className="space-y-2.5 mb-4">
                  <div className="flex justify-between items-start gap-3">
                    <div className="font-['Inter:Regular',sans-serif] text-[13px] text-[#3b3b3b] dark:text-white/80 leading-snug">
                      {formatCurrency(booking.room.price, language)} × {nights} {nights === 1 ? 'night' : 'nights'} × {roomCount} room{roomCount > 1 ? 's' : ''}
                    </div>
                    <div className="font-['Inter:SemiBold',sans-serif] text-[14px] text-[#3b3b3b] dark:text-white shrink-0">
                      {formatCurrency(basePrice, language)}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <span className="font-['Inter:Regular',sans-serif] text-[13px] text-[#3b3b3b] dark:text-white/80">
                        Taxes & fees
                      </span>
                      <button className="text-[#8c8c8c] hover:text-[#1abc9c]">
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="font-['Inter:SemiBold',sans-serif] text-[14px] text-[#3b3b3b] dark:text-white">
                      {formatCurrency(taxes, language)}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-['Inter:Regular',sans-serif] text-[13px] text-[#3b3b3b] dark:text-white/80">
                      Service fee
                    </span>
                    <div className="font-['Inter:SemiBold',sans-serif] text-[14px] text-[#3b3b3b] dark:text-white">
                      {formatCurrency(serviceFee, language)}
                    </div>
                  </div>
                </div>

                {/* Savings Banner */}
                <div className="bg-linear-to-r from-[#10b981]/20 to-[#10b981]/10 border border-[#10b981]/30 rounded-xl p-3 mb-4">
                  <div className="flex items-center gap-2 mb-0.5">
                    <TrendingDown className="w-4 h-4 text-[#10b981]" />
                    <span className="font-['Inter:Bold',sans-serif] text-[13px] text-[#047857] dark:text-emerald-300">
                      You're saving {formatCurrency(savings, language)}
                    </span>
                  </div>
                  <div className="font-['Inter:Regular',sans-serif] text-[11.5px] text-[#065f46] dark:text-emerald-100/75">
                    Compared to OTA prices ({formatCurrency(otaPrice, language)})
                  </div>
                </div>

                {/* Total */}
                <div className="h-px bg-[#eaeaea] dark:bg-white/[0.08] mb-4" />

                <div className="flex justify-between items-center mb-5">
                  <span className="font-['Poppins:Bold',sans-serif] text-[16px] text-[#3b3b3b] dark:text-white">
                    Total Amount
                  </span>
                  <div className="text-right">
                    <div className="font-['Poppins:Bold',sans-serif] text-[26px] leading-tight text-[#1abc9c] dark:text-[#2dd4bf]">
                      {formatCurrency(total, language)}
                    </div>
                    <div className="font-['Inter:Regular',sans-serif] text-[11.5px] text-[#8c8c8c] mt-0.5">
                      for {nights} {nights === 1 ? 'night' : 'nights'}
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={continueToNext}
                  className="w-full bg-[#1abc9c] text-white py-3 rounded-xl hover:bg-[#16a085] transition-all font-['Inter:Bold',sans-serif] text-[14px] mb-2.5 relative overflow-hidden group"
                >
                  <span className="relative z-10">Continue to Guest Details</span>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/20 to-transparent" />
                </button>

                <p className="font-['Inter:Regular',sans-serif] text-[11.5px] text-[#8c8c8c] text-center">
                  No payment required at this step
                </p>
              </div>

              {/* Trust Badges */}
              <div className="glass-card rounded-2xl p-4">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-[#10b981]/10 dark:bg-[#10b981]/20 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-[#10b981] dark:text-[#34d399]" />
                    </div>
                    <span className="font-['Inter:Regular',sans-serif] text-[13px] text-[#3b3b3b] dark:text-white/85">
                      Free cancellation
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-[#10b981]/10 dark:bg-[#10b981]/20 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-[#10b981] dark:text-[#34d399]" />
                    </div>
                    <span className="font-['Inter:Regular',sans-serif] text-[13px] text-[#3b3b3b] dark:text-white/85">
                      Secure payment processing
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-[#10b981]/10 dark:bg-[#10b981]/20 rounded-lg flex items-center justify-center">
                      <TrendingDown className="w-4 h-4 text-[#10b981] dark:text-[#34d399]" />
                    </div>
                    <span className="font-['Inter:Regular',sans-serif] text-[13px] text-[#3b3b3b] dark:text-white/85">
                      Best price guarantee
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-[#10b981]/10 dark:bg-[#10b981]/20 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-[#10b981] dark:text-[#34d399]" />
                    </div>
                    <span className="font-['Inter:Regular',sans-serif] text-[13px] text-[#3b3b3b] dark:text-white/85">
                      24/7 customer support
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/82 dark:bg-[#0a0a0a]/82 backdrop-blur-xl backdrop-saturate-150 border-t border-black/[0.06] dark:border-white/[0.08] shadow-[0_-12px_32px_-8px_rgba(0,0,0,0.18)] z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Price Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-['Poppins:Bold',sans-serif] text-[24px] leading-6 text-[#1abc9c]">
                  {formatCurrency(total, language)}
                </span>
                <span className="font-['Inter:Regular',sans-serif] text-[12px] text-[#6b7280]">
                  total
                </span>
              </div>
              <div className="font-['Inter:Regular',sans-serif] text-[12px] text-[#8c8c8c]">
                {nights} {nights === 1 ? 'night' : 'nights'} • Save {formatCurrency(savings, language)}
              </div>
            </div>

            {/* CTA Button */}
            <button
                onClick={continueToNext}
              className="bg-[#1abc9c] text-white px-6 py-3 rounded-xl hover:bg-[#16a085] transition-all font-['Inter:Bold',sans-serif] text-[15px] min-h-12 flex items-center justify-center gap-2 shrink-0"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingStep1;