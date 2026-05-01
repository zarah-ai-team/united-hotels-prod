import { Link, useNavigate } from 'react-router';
import { useEffect } from 'react';
import { 
  Calendar, Users, Check, ChevronLeft, MapPin, Bed, 
  Maximize2, Clock, Shield, AlertCircle, Star, Wifi,
  Coffee, TrendingDown, Info, CheckCircle2
} from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import svgPaths from '../../imports/svg-nnzqmx1xjq';

export function BookingStep1() {
  const navigate = useNavigate();
  const { booking, calculateNights } = useBooking();

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
  const basePrice = (booking.room?.price || 42) * nights;
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
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="bg-white border-b border-[#eaeaea] sticky top-0 z-50">
        <div className="max-w-[1840px] mx-auto px-10">
          <div className="flex items-center justify-between h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="h-[26px] w-[28px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 26">
                  <mask fill="white" id="path-1-inside-1_20_512">
                    <path d={svgPaths.p32095b00} />
                  </mask>
                  <path d={svgPaths.p32095b00} fill="#1ABC9C" mask="url(#path-1-inside-1_20_512)" stroke="#1ABC9C" strokeWidth="0.4" />
                </svg>
              </div>
              <span className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-[#1abc9c]">
                United Hotels
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-8">
              <Link to="/listing" className="text-[#3b3b3b] hover:text-[#1abc9c] transition-colors font-['Inter:Medium',sans-serif] text-[15px]">
                Hotels
              </Link>
              <Link to="/blog" className="text-[#3b3b3b] hover:text-[#1abc9c] transition-colors font-['Inter:Medium',sans-serif] text-[15px]">
                Travel Guide
              </Link>
              <Link to="/portal" className="text-[#3b3b3b] hover:text-[#1abc9c] transition-colors font-['Inter:Medium',sans-serif] text-[15px]">
                My Bookings
              </Link>
            </div>

            {/* Support */}
            <div className="flex items-center gap-4">
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

      {/* Progress Stepper */}
      <div className="bg-white border-b border-[#eaeaea]">
        <div className="max-w-[1840px] mx-auto px-10 py-8">
          <div className="flex items-center justify-center gap-8">
            {/* Step 1 - Active */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1abc9c] rounded-full flex items-center justify-center text-white font-['Inter:Bold',sans-serif] text-[16px]">
                  1
                </div>
                <div>
                  <div className="font-['Poppins:SemiBold',sans-serif] text-[14px] text-[#3b3b3b]">
                    Room Selection
                  </div>
                  <div className="font-['Inter:Regular',sans-serif] text-[12px] text-[#8c8c8c]">
                    Confirm your choice
                  </div>
                </div>
              </div>
              <div className="w-16 h-0.5 bg-[#eaeaea]" />
            </div>

            {/* Step 2 - Inactive */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f3f4f6] rounded-full flex items-center justify-center text-[#8c8c8c] font-['Inter:Bold',sans-serif] text-[16px]">
                  2
                </div>
                <div>
                  <div className="font-['Poppins:SemiBold',sans-serif] text-[14px] text-[#8c8c8c]">
                    Guest Details
                  </div>
                  <div className="font-['Inter:Regular',sans-serif] text-[12px] text-[#8c8c8c]">
                    Enter your information
                  </div>
                </div>
              </div>
              <div className="w-16 h-0.5 bg-[#eaeaea]" />
            </div>

            {/* Step 3 - Inactive */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f3f4f6] rounded-full flex items-center justify-center text-[#8c8c8c] font-['Inter:Bold',sans-serif] text-[16px]">
                3
              </div>
              <div>
                <div className="font-['Poppins:SemiBold',sans-serif] text-[14px] text-[#8c8c8c]">
                  Payment
                </div>
                <div className="font-['Inter:Regular',sans-serif] text-[12px] text-[#8c8c8c]">
                  Complete booking
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-[1840px] mx-auto px-10 py-10">
        {/* Back Button */}
        <Link 
          to={`/hotel/${booking.hotel.id}`}
          className="inline-flex items-center gap-2 text-[#1abc9c] hover:text-[#16a085] transition-colors font-['Inter:SemiBold',sans-serif] text-[15px] mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Go Back
        </Link>

        <div className="grid grid-cols-[1fr_460px] gap-8">
          {/* Left Column */}
          <div>
            <h1 className="font-['Poppins:Bold',sans-serif] text-[36px] leading-[44px] text-[#3b3b3b] mb-8">
              Confirm Your Selection
            </h1>

            {/* Hotel & Room Card */}
            <div className="bg-white rounded-2xl border border-[#eaeaea] p-6 mb-6">
              <div className="flex gap-6 mb-6">
                <img 
                  src={booking.hotel.image} 
                  alt={booking.hotel.name}
                  className="w-32 h-32 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <h3 className="font-['Poppins:SemiBold',sans-serif] text-[22px] text-[#3b3b3b] mb-2">
                    {booking.hotel.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-[#1abc9c]" />
                    <span className="font-['Inter:Regular',sans-serif] text-[15px] text-[#6b7280]">
                      {booking.hotel.location}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-[#f9fafb] px-3 py-1.5 rounded-lg border border-[#eaeaea]">
                    <Bed className="w-4 h-4 text-[#1abc9c]" />
                    <span className="font-['Inter:SemiBold',sans-serif] text-[14px] text-[#3b3b3b]">
                      {booking.room.name}
                    </span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-start gap-1">
                  {[...Array(4)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#FFA500] text-[#FFA500]" />
                  ))}
                  <Star className="w-4 h-4 text-[#e5e7eb]" />
                </div>
              </div>

              {/* Room Details */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#eaeaea]">
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
            </div>

            {/* Booking Details */}
            <div className="bg-white rounded-2xl border border-[#eaeaea] p-6 mb-6">
              <h3 className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-[#3b3b3b] mb-6">
                Booking Details
              </h3>

              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Check-in */}
                <div className="bg-[#fafafa] rounded-xl p-5 border border-[#eaeaea]">
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
                <div className="bg-[#fafafa] rounded-xl p-5 border border-[#eaeaea]">
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
              </div>

              {/* Duration & Guests */}
              <div className="grid grid-cols-2 gap-6">
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

            {/* Room Amenities */}
            <div className="bg-white rounded-2xl border border-[#eaeaea] p-6 mb-6">
              <h3 className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-[#3b3b3b] mb-6">
                Room Amenities Included
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Wifi className="w-5 h-5" />, name: 'Free WiFi', desc: 'High-speed internet' },
                  { icon: <Coffee className="w-5 h-5" />, name: 'Breakfast', desc: 'Continental breakfast' },
                  { icon: <Check className="w-5 h-5" />, name: 'Private Bathroom', desc: 'With shower' },
                  { icon: <Check className="w-5 h-5" />, name: 'Air Conditioning', desc: 'Climate control' }
                ].map((amenity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-[#fafafa] rounded-lg border border-[#eaeaea]">
                    <div className="w-8 h-8 bg-[#1abc9c]/10 rounded-lg flex items-center justify-center text-[#1abc9c] flex-shrink-0">
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
            </div>

            {/* Cancellation Policy */}
            <div className="bg-gradient-to-br from-[#d1fae5] to-[#a7f3d0] border-2 border-[#86efac] rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#10b981] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-['Poppins:SemiBold',sans-serif] text-[18px] text-[#047857] mb-2">
                    Free Cancellation Available
                  </h4>
                  <p className="font-['Inter:Regular',sans-serif] text-[15px] text-[#065f46] leading-[24px] mb-3">
                    Cancel up to 24 hours before check-in for a full refund. No questions asked, no hidden fees.
                  </p>
                  <div className="flex items-center gap-2 text-[#047857]">
                    <Shield className="w-4 h-4" />
                    <span className="font-['Inter:SemiBold',sans-serif] text-[13px]">
                      100% Money-Back Guarantee
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sticky Summary */}
          <div>
            <div className="sticky top-24">
              {/* Price Summary Card */}
              <div className="bg-white rounded-2xl border-2 border-[#1abc9c] p-8 mb-6 shadow-xl">
                <h3 className="font-['Poppins:Bold',sans-serif] text-[24px] text-[#3b3b3b] mb-6">
                  Price Summary
                </h3>

                {/* Price Breakdown */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-['Inter:Regular',sans-serif] text-[15px] text-[#3b3b3b]">
                        ${booking.room.price} × {nights} {nights === 1 ? 'night' : 'nights'}
                      </div>
                    </div>
                    <div className="font-['Inter:SemiBold',sans-serif] text-[16px] text-[#3b3b3b]">
                      ${basePrice}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-['Inter:Regular',sans-serif] text-[15px] text-[#3b3b3b]">
                        Taxes & fees
                      </span>
                      <button className="text-[#8c8c8c] hover:text-[#1abc9c]">
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="font-['Inter:SemiBold',sans-serif] text-[16px] text-[#3b3b3b]">
                      ${taxes}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-['Inter:Regular',sans-serif] text-[15px] text-[#3b3b3b]">
                      Service fee
                    </span>
                    <div className="font-['Inter:SemiBold',sans-serif] text-[16px] text-[#3b3b3b]">
                      ${serviceFee}
                    </div>
                  </div>
                </div>

                {/* Savings Banner */}
                <div className="bg-gradient-to-r from-[#10b981]/20 to-[#10b981]/10 border border-[#10b981]/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingDown className="w-5 h-5 text-[#10b981]" />
                    <span className="font-['Inter:Bold',sans-serif] text-[15px] text-[#047857]">
                      You're saving ${savings}
                    </span>
                  </div>
                  <div className="font-['Inter:Regular',sans-serif] text-[13px] text-[#065f46]">
                    Compared to OTA prices (${otaPrice})
                  </div>
                </div>

                {/* Total */}
                <div className="h-px bg-[#eaeaea] mb-6" />
                
                <div className="flex justify-between items-center mb-8">
                  <span className="font-['Poppins:Bold',sans-serif] text-[20px] text-[#3b3b3b]">
                    Total Amount
                  </span>
                  <div className="text-right">
                    <div className="font-['Poppins:Bold',sans-serif] text-[36px] leading-[36px] text-[#1abc9c]">
                      ${total}
                    </div>
                    <div className="font-['Inter:Regular',sans-serif] text-[13px] text-[#8c8c8c] mt-1">
                      for {nights} {nights === 1 ? 'night' : 'nights'}
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => navigate('/auth')}
                  className="w-full bg-[#1abc9c] text-white py-4 rounded-xl hover:bg-[#16a085] transition-all font-['Inter:Bold',sans-serif] text-[16px] mb-4 relative overflow-hidden group"
                >
                  <span className="relative z-10">Continue to Guest Details</span>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </button>

                <p className="font-['Inter:Regular',sans-serif] text-[13px] text-[#8c8c8c] text-center">
                  No payment required at this step
                </p>
              </div>

              {/* Trust Badges */}
              <div className="bg-gradient-to-br from-[#f3f4f6] to-white rounded-2xl p-6 border border-[#eaeaea]">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#10b981]/10 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                    </div>
                    <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#3b3b3b]">
                      Free cancellation
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#10b981]/10 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-[#10b981]" />
                    </div>
                    <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#3b3b3b]">
                      Secure payment processing
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#10b981]/10 rounded-lg flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-[#10b981]" />
                    </div>
                    <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#3b3b3b]">
                      Best price guarantee
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#10b981]/10 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-[#10b981]" />
                    </div>
                    <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#3b3b3b]">
                      24/7 customer support
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default BookingStep1;