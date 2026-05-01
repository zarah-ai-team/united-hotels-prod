import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { 
  Mail, Phone, User, ChevronLeft, Calendar, Clock, 
  Users, Shield, CheckCircle2, AlertCircle, Info,
  MapPin, Bed, TrendingDown, MessageSquare
} from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import svgPaths from '../../imports/svg-nnzqmx1xjq';

export function BookingStep2() {
  const navigate = useNavigate();
  const { booking, setGuestDetails, calculateNights } = useBooking();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequest: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setGuestDetails(formData);
      navigate('/booking/step3');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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

            {/* Step 2 - Active */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1abc9c] rounded-full flex items-center justify-center text-white font-['Inter:Bold',sans-serif] text-[16px]">
                  2
                </div>
                <div>
                  <div className="font-['Poppins:SemiBold',sans-serif] text-[14px] text-[#3b3b3b]">
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
          to="/booking/step1"
          className="inline-flex items-center gap-2 text-[#1abc9c] hover:text-[#16a085] transition-colors font-['Inter:SemiBold',sans-serif] text-[15px] mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Room Selection
        </Link>

        <div className="grid grid-cols-[1fr_460px] gap-8">
          {/* Left Column */}
          <div>
            <h1 className="font-['Poppins:Bold',sans-serif] text-[36px] leading-[44px] text-[#3b3b3b] mb-2">
              Guest Information
            </h1>
            <p className="font-['Inter:Regular',sans-serif] text-[16px] text-[#6b7280] mb-8">
              Please provide the details of the primary guest checking in
            </p>

            <form onSubmit={handleSubmit}>
              {/* Contact Information */}
              <div className="bg-white rounded-2xl border border-[#eaeaea] p-8 mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#1abc9c]/10 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-[#1abc9c]" />
                  </div>
                  <h3 className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-[#3b3b3b]">
                    Contact Information
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="font-['Inter:Medium',sans-serif] text-[14px] text-[#3b3b3b] mb-2 block">
                      First Name *
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8c8c8c]">
                        <User className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        className={`w-full pl-12 pr-4 py-3.5 border ${errors.firstName ? 'border-[#ef4444]' : 'border-[#eaeaea]'} rounded-xl font-['Inter:Regular',sans-serif] text-[15px] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/10 transition-all`}
                      />
                    </div>
                    {errors.firstName && (
                      <p className="mt-1.5 text-[#ef4444] text-[13px] font-['Inter:Regular',sans-serif] flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="font-['Inter:Medium',sans-serif] text-[14px] text-[#3b3b3b] mb-2 block">
                      Last Name *
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8c8c8c]">
                        <User className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        className={`w-full pl-12 pr-4 py-3.5 border ${errors.lastName ? 'border-[#ef4444]' : 'border-[#eaeaea]'} rounded-xl font-['Inter:Regular',sans-serif] text-[15px] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/10 transition-all`}
                      />
                    </div>
                    {errors.lastName && (
                      <p className="mt-1.5 text-[#ef4444] text-[13px] font-['Inter:Regular',sans-serif] flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="font-['Inter:Medium',sans-serif] text-[14px] text-[#3b3b3b] mb-2 block">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8c8c8c]">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      placeholder="john.doe@example.com"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={`w-full pl-12 pr-4 py-3.5 border ${errors.email ? 'border-[#ef4444]' : 'border-[#eaeaea]'} rounded-xl font-['Inter:Regular',sans-serif] text-[15px] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/10 transition-all`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-[#ef4444] text-[13px] font-['Inter:Regular',sans-serif] flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.email}
                    </p>
                  )}
                  <p className="mt-2 font-['Inter:Regular',sans-serif] text-[13px] text-[#6b7280] flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    Booking confirmation will be sent to this email
                  </p>
                </div>

                <div>
                  <label className="font-['Inter:Medium',sans-serif] text-[14px] text-[#3b3b3b] mb-2 block">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8c8c8c]">
                      <Phone className="w-5 h-5" />
                    </div>
                    <input
                      type="tel"
                      placeholder="+90 555 123 4567"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className={`w-full pl-12 pr-4 py-3.5 border ${errors.phone ? 'border-[#ef4444]' : 'border-[#eaeaea]'} rounded-xl font-['Inter:Regular',sans-serif] text-[15px] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/10 transition-all`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1.5 text-[#ef4444] text-[13px] font-['Inter:Regular',sans-serif] flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.phone}
                    </p>
                  )}
                  <p className="mt-2 font-['Inter:Regular',sans-serif] text-[13px] text-[#6b7280] flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    For booking updates and hotel contact
                  </p>
                </div>
              </div>

              {/* Special Requests */}
              <div className="bg-white rounded-2xl border border-[#eaeaea] p-8 mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#1abc9c]/10 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-[#1abc9c]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-[#3b3b3b]">
                      Special Requests
                    </h3>
                    <p className="font-['Inter:Regular',sans-serif] text-[13px] text-[#6b7280]">
                      Optional - Let the hotel know if you have any special requirements
                    </p>
                  </div>
                </div>

                <textarea
                  placeholder="Example: Early check-in, high floor room, extra pillows, airport transfer..."
                  value={formData.specialRequest}
                  onChange={(e) => handleChange('specialRequest', e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3.5 border border-[#eaeaea] rounded-xl font-['Inter:Regular',sans-serif] text-[15px] resize-none focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/10 transition-all"
                />
                
                <div className="mt-3 bg-[#fffbeb] border border-[#fbbf24]/20 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-[#f59e0b] flex-shrink-0 mt-0.5" />
                  <p className="font-['Inter:Regular',sans-serif] text-[13px] text-[#92400e]">
                    Special requests cannot be guaranteed but the hotel will do their best to accommodate them
                  </p>
                </div>
              </div>

              {/* Important Information */}
              <div className="bg-gradient-to-br from-[#fffbeb] to-[#fef3c7] border-2 border-[#fbbf24]/30 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#f59e0b] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Info className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-['Poppins:SemiBold',sans-serif] text-[18px] text-[#78350f] mb-3">
                      Important Check-in Information
                    </h4>
                    <ul className="space-y-2.5">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 text-[#f59e0b] flex-shrink-0 mt-0.5" />
                        <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#92400e]">
                          Check-in time is from <strong>2:00 PM</strong> onwards
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 text-[#f59e0b] flex-shrink-0 mt-0.5" />
                        <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#92400e]">
                          Check-out time is until <strong>12:00 PM (noon)</strong>
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 text-[#f59e0b] flex-shrink-0 mt-0.5" />
                        <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#92400e]">
                          A valid <strong>government-issued photo ID</strong> and <strong>credit card</strong> are required at check-in
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 text-[#f59e0b] flex-shrink-0 mt-0.5" />
                        <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#92400e]">
                          The credit card holder must be present at check-in
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column - Sticky Summary */}
          <div>
            <div className="sticky top-24">
              {/* Booking Summary Card */}
              <div className="bg-white rounded-2xl border-2 border-[#1abc9c] p-8 mb-6 shadow-xl">
                <h3 className="font-['Poppins:Bold',sans-serif] text-[24px] text-[#3b3b3b] mb-6">
                  Booking Summary
                </h3>

                {/* Hotel Details */}
                <div className="mb-6 pb-6 border-b border-[#eaeaea]">
                  <div className="flex gap-4 mb-4">
                    <img 
                      src={booking.hotel.image} 
                      alt={booking.hotel.name}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h4 className="font-['Poppins:SemiBold',sans-serif] text-[16px] text-[#3b3b3b] mb-1">
                        {booking.hotel.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mb-2">
                        <MapPin className="w-3.5 h-3.5 text-[#8c8c8c]" />
                        <p className="font-['Inter:Regular',sans-serif] text-[13px] text-[#8c8c8c]">
                          {booking.hotel.location}
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-1.5 bg-[#f9fafb] px-2.5 py-1 rounded-lg border border-[#eaeaea]">
                        <Bed className="w-3.5 h-3.5 text-[#1abc9c]" />
                        <span className="font-['Inter:SemiBold',sans-serif] text-[12px] text-[#3b3b3b]">
                          {booking.room.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="space-y-4 mb-6 pb-6 border-b border-[#eaeaea]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#1abc9c]" />
                      <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#8c8c8c]">
                        Check-in
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-['Inter:SemiBold',sans-serif] text-[14px] text-[#3b3b3b]">
                        {formatDate(booking.checkIn)}
                      </div>
                      <div className="font-['Inter:Regular',sans-serif] text-[12px] text-[#8c8c8c]">
                        From 2:00 PM
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#1abc9c]" />
                      <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#8c8c8c]">
                        Check-out
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-['Inter:SemiBold',sans-serif] text-[14px] text-[#3b3b3b]">
                        {formatDate(booking.checkOut)}
                      </div>
                      <div className="font-['Inter:Regular',sans-serif] text-[12px] text-[#8c8c8c]">
                        Until 12:00 PM
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#1abc9c]" />
                      <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#8c8c8c]">
                        Duration
                      </span>
                    </div>
                    <span className="font-['Inter:SemiBold',sans-serif] text-[14px] text-[#3b3b3b]">
                      {nights} {nights === 1 ? 'Night' : 'Nights'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#1abc9c]" />
                      <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#8c8c8c]">
                        Guests
                      </span>
                    </div>
                    <span className="font-['Inter:SemiBold',sans-serif] text-[14px] text-[#3b3b3b]">
                      {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}
                    </span>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#3b3b3b]">
                      ${booking.room.price} × {nights} {nights === 1 ? 'night' : 'nights'}
                    </span>
                    <span className="font-['Inter:SemiBold',sans-serif] text-[15px] text-[#3b3b3b]">
                      ${basePrice}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#3b3b3b]">
                      Taxes & fees
                    </span>
                    <span className="font-['Inter:SemiBold',sans-serif] text-[15px] text-[#3b3b3b]">
                      ${taxes}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#3b3b3b]">
                      Service fee
                    </span>
                    <span className="font-['Inter:SemiBold',sans-serif] text-[15px] text-[#3b3b3b]">
                      ${serviceFee}
                    </span>
                  </div>
                </div>

                {/* Savings Banner */}
                <div className="bg-gradient-to-r from-[#10b981]/20 to-[#10b981]/10 border border-[#10b981]/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3 mb-1">
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
                  onClick={handleSubmit}
                  className="w-full bg-[#1abc9c] text-white py-4 rounded-xl hover:bg-[#16a085] transition-all font-['Inter:Bold',sans-serif] text-[16px] mb-4 relative overflow-hidden group"
                >
                  <span className="relative z-10">Continue to Payment</span>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </button>

                <p className="font-['Inter:Regular',sans-serif] text-[13px] text-[#8c8c8c] text-center">
                  No payment required at this step
                </p>
              </div>

              {/* Security Badge */}
              <div className="bg-gradient-to-br from-[#d1fae5] to-[#a7f3d0] rounded-2xl p-6 border border-[#86efac]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#10b981] rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-['Poppins:SemiBold',sans-serif] text-[16px] text-[#047857]">
                      Your Information is Secure
                    </h4>
                  </div>
                </div>
                <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#065f46] leading-[22px]">
                  We use industry-standard encryption to protect your personal information. Your data will never be shared with third parties.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default BookingStep2;
