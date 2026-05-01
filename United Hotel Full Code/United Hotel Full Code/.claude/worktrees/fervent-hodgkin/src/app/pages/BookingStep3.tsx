import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { 
  CreditCard, Lock, ChevronLeft, Calendar, Clock, Users, 
  Shield, CheckCircle2, AlertCircle, MapPin, Bed, TrendingDown,
  Building2, Info, Star, Mail, Phone, User
} from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import svgPaths from '../../imports/svg-nnzqmx1xjq';

export function BookingStep3() {
  const navigate = useNavigate();
  const { booking, calculateNights } = useBooking();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Handle missing booking data
  useEffect(() => {
    if (!booking.hotel || !booking.room || !booking.guestDetails) {
      navigate('/listing');
    }
  }, [booking.hotel, booking.room, booking.guestDetails, navigate]);

  // Don't render if no booking data
  if (!booking.hotel || !booking.room || !booking.guestDetails) {
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

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/booking/confirmation');
    }, 2000);
  };

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

  // Format card number with spaces
  const handleCardNumberChange = (value: string) => {
    const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted.slice(0, 19));
  };

  // Format expiry date
  const handleExpiryChange = (value: string) => {
    const formatted = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
    setExpiry(formatted.slice(0, 5));
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
            {/* Step 1 - Completed */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#10b981] rounded-full flex items-center justify-center text-white">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-['Poppins:SemiBold',sans-serif] text-[14px] text-[#10b981]">
                    Room Selection
                  </div>
                  <div className="font-['Inter:Regular',sans-serif] text-[12px] text-[#8c8c8c]">
                    Confirmed
                  </div>
                </div>
              </div>
              <div className="w-16 h-0.5 bg-[#10b981]" />
            </div>

            {/* Step 2 - Completed */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#10b981] rounded-full flex items-center justify-center text-white">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-['Poppins:SemiBold',sans-serif] text-[14px] text-[#10b981]">
                    Guest Details
                  </div>
                  <div className="font-['Inter:Regular',sans-serif] text-[12px] text-[#8c8c8c]">
                    Completed
                  </div>
                </div>
              </div>
              <div className="w-16 h-0.5 bg-[#10b981]" />
            </div>

            {/* Step 3 - Active */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1abc9c] rounded-full flex items-center justify-center text-white font-['Inter:Bold',sans-serif] text-[16px]">
                3
              </div>
              <div>
                <div className="font-['Poppins:SemiBold',sans-serif] text-[14px] text-[#3b3b3b]">
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
          to="/booking/step2"
          className="inline-flex items-center gap-2 text-[#1abc9c] hover:text-[#16a085] transition-colors font-['Inter:SemiBold',sans-serif] text-[15px] mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Guest Details
        </Link>

        <div className="grid grid-cols-[1fr_460px] gap-8">
          {/* Left Column */}
          <div>
            <h1 className="font-['Poppins:Bold',sans-serif] text-[36px] leading-[44px] text-[#3b3b3b] mb-2">
              Review & Payment
            </h1>
            <p className="font-['Inter:Regular',sans-serif] text-[16px] text-[#6b7280] mb-8">
              Please review your booking details and complete the payment
            </p>

            {/* Booking Review Card */}
            <div className="bg-white rounded-2xl border border-[#eaeaea] p-8 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#1abc9c]/10 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#1abc9c]" />
                </div>
                <h3 className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-[#3b3b3b]">
                  Booking Details
                </h3>
              </div>

              {/* Hotel Info */}
              <div className="flex gap-6 mb-6 pb-6 border-b border-[#eaeaea]">
                <img 
                  src={booking.hotel.image} 
                  alt={booking.hotel.name}
                  className="w-28 h-28 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <h4 className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-[#3b3b3b] mb-2">
                    {booking.hotel.name}
                  </h4>
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

              {/* Check-in/out Details */}
              <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-[#eaeaea]">
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

              {/* Guest Information */}
              <div className="bg-[#f9fafb] rounded-xl p-5 border border-[#eaeaea]">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-4 h-4 text-[#1abc9c]" />
                  <span className="font-['Inter:Medium',sans-serif] text-[13px] text-[#8c8c8c] uppercase tracking-wide">
                    Guest Information
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#6b7280]" />
                    <span className="font-['Inter:SemiBold',sans-serif] text-[15px] text-[#3b3b3b]">
                      {booking.guestDetails.firstName} {booking.guestDetails.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#6b7280]" />
                    <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#6b7280]">
                      {booking.guestDetails.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#6b7280]" />
                    <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#6b7280]">
                      {booking.guestDetails.phone}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <form onSubmit={handlePayment}>
              <div className="bg-white rounded-2xl border border-[#eaeaea] p-8 mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#1abc9c]/10 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-[#1abc9c]" />
                  </div>
                  <h3 className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-[#3b3b3b]">
                    Payment Method
                  </h3>
                </div>

                <div className="space-y-3 mb-6">
                  {/* Credit Card Option */}
                  <label className={`flex items-center gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'card' 
                      ? 'border-[#1abc9c] bg-[#1abc9c]/5' 
                      : 'border-[#eaeaea] hover:border-[#1abc9c]/30'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 accent-[#1abc9c]"
                    />
                    <div className="w-10 h-10 bg-[#1abc9c]/10 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-[#1abc9c]" />
                    </div>
                    <div className="flex-1">
                      <div className="font-['Inter:SemiBold',sans-serif] text-[15px] text-[#3b3b3b]">
                        Credit / Debit Card
                      </div>
                      <div className="font-['Inter:Regular',sans-serif] text-[13px] text-[#8c8c8c]">
                        Visa, Mastercard, American Express
                      </div>
                    </div>
                    {paymentMethod === 'card' && (
                      <CheckCircle2 className="w-5 h-5 text-[#1abc9c]" />
                    )}
                  </label>

                  {/* Pay at Hotel Option */}
                  <label className={`flex items-center gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'hotel' 
                      ? 'border-[#1abc9c] bg-[#1abc9c]/5' 
                      : 'border-[#eaeaea] hover:border-[#1abc9c]/30'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="hotel"
                      checked={paymentMethod === 'hotel'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 accent-[#1abc9c]"
                    />
                    <div className="w-10 h-10 bg-[#1abc9c]/10 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-[#1abc9c]" />
                    </div>
                    <div className="flex-1">
                      <div className="font-['Inter:SemiBold',sans-serif] text-[15px] text-[#3b3b3b]">
                        Pay at Hotel
                      </div>
                      <div className="font-['Inter:Regular',sans-serif] text-[13px] text-[#8c8c8c]">
                        Pay when you check-in
                      </div>
                    </div>
                    {paymentMethod === 'hotel' && (
                      <CheckCircle2 className="w-5 h-5 text-[#1abc9c]" />
                    )}
                  </label>
                </div>

                {/* Card Details Form */}
                {paymentMethod === 'card' && (
                  <div className="space-y-5 pt-6 border-t border-[#eaeaea]">
                    <div>
                      <label className="font-['Inter:Medium',sans-serif] text-[14px] text-[#3b3b3b] mb-2 block">
                        Card Number
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8c8c8c]">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={(e) => handleCardNumberChange(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 border border-[#eaeaea] rounded-xl font-['Inter:Regular',sans-serif] text-[15px] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/10 transition-all"
                        />
                        {/* Card Brand Icons */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                          <div className="w-8 h-6 bg-[#f3f4f6] rounded flex items-center justify-center text-[10px] font-bold">
                            VISA
                          </div>
                          <div className="w-8 h-6 bg-[#f3f4f6] rounded flex items-center justify-center text-[10px] font-bold">
                            MC
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="font-['Inter:Medium',sans-serif] text-[14px] text-[#3b3b3b] mb-2 block">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        placeholder="JOHN DOE"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value.toUpperCase())}
                        className="w-full px-4 py-3.5 border border-[#eaeaea] rounded-xl font-['Inter:Regular',sans-serif] text-[15px] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/10 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="font-['Inter:Medium',sans-serif] text-[14px] text-[#3b3b3b] mb-2 block">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={(e) => handleExpiryChange(e.target.value)}
                          className="w-full px-4 py-3.5 border border-[#eaeaea] rounded-xl font-['Inter:Regular',sans-serif] text-[15px] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/10 transition-all"
                        />
                      </div>

                      <div>
                        <label className="font-['Inter:Medium',sans-serif] text-[14px] text-[#3b3b3b] mb-2 flex items-center gap-2">
                          CVV
                          <div className="group relative">
                            <Info className="w-4 h-4 text-[#8c8c8c] cursor-help" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#3b3b3b] text-white text-[12px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              3 digits on back of card
                            </div>
                          </div>
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                          maxLength={3}
                          className="w-full px-4 py-3.5 border border-[#eaeaea] rounded-xl font-['Inter:Regular',sans-serif] text-[15px] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/10 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Security Notice */}
              <div className="bg-gradient-to-br from-[#d1fae5] to-[#a7f3d0] border-2 border-[#86efac] rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#10b981] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-['Poppins:SemiBold',sans-serif] text-[18px] text-[#047857] mb-2">
                      Secure Payment Processing
                    </h4>
                    <p className="font-['Inter:Regular',sans-serif] text-[15px] text-[#065f46] leading-[24px] mb-3">
                      Your payment information is encrypted using industry-standard SSL technology. We never store your card details on our servers.
                    </p>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#047857]" />
                        <span className="font-['Inter:SemiBold',sans-serif] text-[13px] text-[#047857]">
                          256-bit Encryption
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#047857]" />
                        <span className="font-['Inter:SemiBold',sans-serif] text-[13px] text-[#047857]">
                          PCI DSS Compliant
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
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
                      <button type="button" className="text-[#8c8c8c] hover:text-[#1abc9c]">
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
                  type="submit"
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className={`w-full bg-[#1abc9c] text-white py-4 rounded-xl hover:bg-[#16a085] transition-all font-['Inter:Bold',sans-serif] text-[16px] mb-4 relative overflow-hidden group ${
                    isProcessing ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing Payment...
                    </span>
                  ) : (
                    <>
                      <span className="relative z-10">
                        {paymentMethod === 'hotel' ? 'Confirm Booking' : `Pay $${total} Now`}
                      </span>
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </>
                  )}
                </button>

                <p className="font-['Inter:Regular',sans-serif] text-[12px] text-[#8c8c8c] text-center leading-[18px]">
                  By completing this booking, you agree to our{' '}
                  <Link to="/terms" className="text-[#1abc9c] hover:underline">terms and conditions</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-[#1abc9c] hover:underline">privacy policy</Link>
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
                      Instant confirmation
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#10b981]/10 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-[#10b981]" />
                    </div>
                    <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#3b3b3b]">
                      Free cancellation
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#10b981]/10 rounded-lg flex items-center justify-center">
                      <Lock className="w-5 h-5 text-[#10b981]" />
                    </div>
                    <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#3b3b3b]">
                      Secure payment
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#10b981]/10 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-[#10b981]" />
                    </div>
                    <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#3b3b3b]">
                      24/7 support
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

export default BookingStep3;
