import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  Mail,
  Phone,
  User,
  ChevronLeft,
  Calendar,
  Clock,
  Users,
  Shield,
  CheckCircle2,
  AlertCircle,
  Info,
  MapPin,
  Bed,
  TrendingDown,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { useBooking } from "../context/BookingContext";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import svgPaths from "../../imports/svg-nnzqmx1xjq";
import { Navigation } from "../components/Navigation";
import { formatCurrency } from "../utils/currency";
import { makeImageFallback } from "../utils/hotelImages";

export function BookingStep2() {
  const navigate = useNavigate();
  const { booking, setGuestDetails, calculateNights } = useBooking();
  const { language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequest: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle missing booking data
  useEffect(() => {
    if (!booking.hotel || !booking.room) {
      navigate("/listing");
    }
  }, [booking.hotel, booking.room, navigate]);

  // Prefill from the logged-in user. We only fill fields the guest hasn't
  // already touched so we don't clobber their edits if they switch accounts
  // or come back to the page. Source of truth is AuthContext (in-memory),
  // not localStorage — so the data is always fresh from /api/users/me.
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    setFormData((prev) => {
      const fullName = String(user.name || '').trim();
      const [first, ...rest] = fullName.split(/\s+/);
      const next = { ...prev };
      if (!next.firstName && first) next.firstName = first;
      if (!next.lastName && rest.length) next.lastName = rest.join(' ');
      if (!next.email && user.email) next.email = String(user.email);
      if (!next.phone && user.phoneNumber) next.phone = String(user.phoneNumber);
      return next;
    });
  }, [isAuthenticated, user]);

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setGuestDetails(formData);
      navigate("/booking/step3");
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen glass-section-bg pb-0 md:pb-0">
      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Navigation />
      </div>

      {/* Desktop Header */}
      <header className="hidden md:block bg-white/72 dark:bg-[#0a0a0a]/72 backdrop-blur-xl backdrop-saturate-150 border-b border-black/[0.06] dark:border-white/[0.06] sticky top-0 z-50 shadow-[0_8px_24px_-16px_rgba(0,0,0,0.08)]">
        <div className="max-w-[1840px] mx-auto px-4 md:px-10">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="h-[22px] w-6 md:h-[26px] md:w-7">
                <svg
                  className="block size-full"
                  fill="none"
                  preserveAspectRatio="none"
                  viewBox="0 0 28 26"
                >
                  <mask fill="white" id="path-1-inside-1_20_512">
                    <path d={svgPaths.p32095b00} />
                  </mask>
                  <path
                    d={svgPaths.p32095b00}
                    fill="#1ABC9C"
                    mask="url(#path-1-inside-1_20_512)"
                    stroke="#1ABC9C"
                    strokeWidth="0.4"
                  />
                </svg>
              </div>
              <span className="font-['Poppins:SemiBold',sans-serif] text-[16px] md:text-[20px] text-[#1abc9c]">
                United Hotels
              </span>
            </Link>

            {/* Navigation Links - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="/#home"
                className="text-[#3b3b3b] hover:text-[#1abc9c] transition-colors font-['Inter:Medium',sans-serif] text-[15px]"
              >
                Home
              </a>
              <a
                href="/#why-choose-united-hotels"
                className="text-[#3b3b3b] hover:text-[#1abc9c] transition-colors font-['Inter:Medium',sans-serif] text-[15px]"
              >
                Why Choose United Hotels
              </a>
              <a
                href="/#featured-hotels"
                className="text-[#3b3b3b] hover:text-[#1abc9c] transition-colors font-['Inter:Medium',sans-serif] text-[15px]"
              >
                Featured Hotels
              </a>
              <a
                href="/#quality"
                className="text-[#3b3b3b] hover:text-[#1abc9c] transition-colors font-['Inter:Medium',sans-serif] text-[15px]"
              >
                Quality
              </a>
              <a
                href="/#faqs"
                className="text-[#3b3b3b] hover:text-[#1abc9c] transition-colors font-['Inter:Medium',sans-serif] text-[15px]"
              >
                FAQ
              </a>
            </div>

            {/* Support - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-4">
              <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#8c8c8c]">
                Need help?
              </span>
              <Link
                to="/support"
                className="font-['Inter:SemiBold',sans-serif] text-[14px] text-[#1abc9c] hover:text-[#16a085] transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Stepper - Desktop */}
      <div className="hidden md:block bg-white/55 dark:bg-white/[0.03] backdrop-blur-md border-b border-black/[0.05] dark:border-white/[0.06]">
        <div className="max-w-[1840px] mx-auto px-10 py-4">
          <div className="flex items-center justify-center gap-6">
            {/* Step 1 - Completed */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#10b981] rounded-full flex items-center justify-center text-white">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-['Poppins:SemiBold',sans-serif] text-[13px] text-[#10b981] leading-tight">
                    Room Selection
                  </div>
                  <div className="font-['Inter:Regular',sans-serif] text-[11px] text-[#8c8c8c]">
                    Completed
                  </div>
                </div>
              </div>
              <div className="w-10 h-0.5 bg-[#10b981]" />
            </div>

            {/* Step 2 - Active */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-[#1abc9c] to-[#2dd4bf] rounded-full flex items-center justify-center text-white font-['Inter:Bold',sans-serif] shadow-[0_6px_16px_-6px_rgba(26,188,156,0.55)] ring-2 ring-white/40 dark:ring-white/10 text-[13px]">
                  2
                </div>
                <div>
                  <div className="font-['Poppins:SemiBold',sans-serif] text-[13px] text-[#3b3b3b] dark:text-white/85 leading-tight">
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

      {/* Progress Stepper - Mobile */}
      <div className="bg-white/65 dark:bg-white/[0.04] backdrop-blur-md border-b border-black/[0.05] dark:border-white/[0.06] md:hidden">
        <div className="max-w-[1840px] mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-3">
            {/* Step 1 - Completed */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 bg-[#10b981] rounded-full flex items-center justify-center text-white">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="text-center">
                <div className="font-['Inter:SemiBold',sans-serif] text-[11px] text-[#10b981]">
                  Room Selection
                </div>
              </div>
            </div>

            {/* Connector */}
            <div className="w-6 h-0.5 bg-[#10b981]" />

            {/* Step 2 - Active */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 bg-gradient-to-br from-[#1abc9c] to-[#2dd4bf] rounded-full flex items-center justify-center text-white font-['Inter:Bold',sans-serif] shadow-[0_6px_16px_-6px_rgba(26,188,156,0.55)] ring-2 ring-white/40 dark:ring-white/10 text-[11px]">
                2
              </div>
              <div className="text-center">
                <div className="font-['Inter:SemiBold',sans-serif] text-[11px] text-[#3b3b3b] dark:text-white/85">
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

      <main className="max-w-[1840px] mx-auto px-4 md:px-10 py-4 md:py-6">
        {/* Back Button */}
        <Link
          to="/booking/step1"
          className="inline-flex items-center gap-1.5 text-[#1abc9c] hover:text-[#16a085] transition-colors font-['Inter:SemiBold',sans-serif] text-[13px] md:text-[14px] mb-3 md:mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Room Selection
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 lg:gap-6">
          {/* Left Column */}
          <div>
            <h1 className="font-['Poppins:Bold',sans-serif] text-[20px] md:text-[26px] leading-tight text-[#3b3b3b] dark:text-white mb-1">
              Guest Information
            </h1>
            <p className="font-['Inter:Regular',sans-serif] text-[13px] text-[#6b7280] dark:text-white/55 mb-4 md:mb-5">
              Please provide the details of the primary guest checking in
            </p>

            <form onSubmit={handleSubmit}>
              {/* Contact Information */}
              <div className="glass-card rounded-2xl p-4 md:p-5 mb-4">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 bg-[#1abc9c]/10 dark:bg-[#2dd4bf]/15 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-[#1abc9c] dark:text-[#2dd4bf]" />
                  </div>
                  <h3 className="font-['Poppins:SemiBold',sans-serif] text-[16px] md:text-[17px] text-[#3b3b3b] dark:text-white">
                    Contact Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="font-['Inter:Medium',sans-serif] text-[13px] text-[#3b3b3b] dark:text-white/85 mb-1.5 block">
                      First Name *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c8c8c]">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleChange("firstName", e.target.value)
                        }
                        className={`w-full pl-9 pr-3 py-2.5 border ${errors.firstName ? "border-[#ef4444]" : "border-[#eaeaea] dark:border-white/[0.08]"} bg-white/80 dark:bg-white/[0.04] dark:text-white rounded-xl font-['Inter:Regular',sans-serif] text-[13.5px] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/10 transition-all`}
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
                    <label className="font-['Inter:Medium',sans-serif] text-[13px] text-[#3b3b3b] dark:text-white/85 mb-1.5 block">
                      Last Name *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c8c8c]">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleChange("lastName", e.target.value)
                        }
                        className={`w-full pl-9 pr-3 py-2.5 border ${errors.lastName ? "border-[#ef4444]" : "border-[#eaeaea] dark:border-white/[0.08]"} bg-white/80 dark:bg-white/[0.04] dark:text-white rounded-xl font-['Inter:Regular',sans-serif] text-[13.5px] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/10 transition-all`}
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

                <div className="mb-4">
                  <label className="font-['Inter:Medium',sans-serif] text-[13px] text-[#3b3b3b] dark:text-white/85 mb-1.5 block">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c8c8c]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      placeholder="john.doe@example.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className={`w-full pl-9 pr-3 py-2.5 border ${errors.email ? "border-[#ef4444]" : "border-[#eaeaea] dark:border-white/[0.08]"} bg-white/80 dark:bg-white/[0.04] dark:text-white rounded-xl font-['Inter:Regular',sans-serif] text-[13.5px] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/10 transition-all`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-[#ef4444] text-[12px] font-['Inter:Regular',sans-serif] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                  <p className="mt-1.5 font-['Inter:Regular',sans-serif] text-[11.5px] text-[#6b7280] dark:text-white/55 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Booking confirmation will be sent to this email
                  </p>
                </div>

                <div>
                  <label className="font-['Inter:Medium',sans-serif] text-[13px] text-[#3b3b3b] dark:text-white/85 mb-1.5 block">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c8c8c]">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      placeholder="+90 555 123 4567"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className={`w-full pl-9 pr-3 py-2.5 border ${errors.phone ? "border-[#ef4444]" : "border-[#eaeaea] dark:border-white/[0.08]"} bg-white/80 dark:bg-white/[0.04] dark:text-white rounded-xl font-['Inter:Regular',sans-serif] text-[13.5px] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/10 transition-all`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-[#ef4444] text-[12px] font-['Inter:Regular',sans-serif] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.phone}
                    </p>
                  )}
                  <p className="mt-1.5 font-['Inter:Regular',sans-serif] text-[11.5px] text-[#6b7280] dark:text-white/55 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    For booking updates and hotel contact
                  </p>
                </div>
              </div>

              {/* Special Requests */}
              <div className="glass-card rounded-2xl p-4 md:p-5 mb-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 bg-[#1abc9c]/10 dark:bg-[#2dd4bf]/15 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-[#1abc9c] dark:text-[#2dd4bf]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-['Poppins:SemiBold',sans-serif] text-[16px] md:text-[17px] text-[#3b3b3b] dark:text-white">
                      Special Requests
                    </h3>
                    <p className="font-['Inter:Regular',sans-serif] text-[11.5px] text-[#6b7280] dark:text-white/55">
                      Optional — let the hotel know if you have any special requirements
                    </p>
                  </div>
                </div>

                <textarea
                  placeholder="Example: Early check-in, high floor room, extra pillows, airport transfer..."
                  value={formData.specialRequest}
                  onChange={(e) =>
                    handleChange("specialRequest", e.target.value)
                  }
                  rows={4}
                  className="w-full px-3 py-2.5 border border-[#eaeaea] dark:border-white/[0.08] bg-white/80 dark:bg-white/[0.04] dark:text-white rounded-xl font-['Inter:Regular',sans-serif] text-[13.5px] resize-none focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/10 transition-all"
                />

                <div className="mt-2.5 bg-[#fffbeb] dark:bg-amber-500/[0.08] border border-[#fbbf24]/20 dark:border-amber-400/25 rounded-lg p-2.5 flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-[#f59e0b] shrink-0 mt-0.5" />
                  <p className="font-['Inter:Regular',sans-serif] text-[12px] text-[#92400e] dark:text-amber-200/85">
                    Special requests cannot be guaranteed but the hotel will do their best to accommodate.
                  </p>
                </div>
              </div>

              {/* Important Information */}
              <div className="bg-linear-to-br from-[#fffbeb] to-[#fef3c7] dark:from-amber-500/[0.10] dark:to-amber-500/[0.06] border border-[#fbbf24]/30 dark:border-amber-400/25 rounded-2xl p-4 md:p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-[#f59e0b] dark:bg-amber-500/30 rounded-xl flex items-center justify-center shrink-0">
                    <Info className="w-4 h-4 text-white dark:text-amber-200" />
                  </div>
                  <div>
                    <h4 className="font-['Poppins:SemiBold',sans-serif] text-[14.5px] text-[#78350f] dark:text-amber-200 mb-2">
                      Important Check-in Information
                    </h4>
                    <ul className="space-y-1.5">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#f59e0b] shrink-0 mt-0.5" />
                        <span className="font-['Inter:Regular',sans-serif] text-[12.5px] text-[#92400e] dark:text-amber-100/85">
                          Check-in is from <strong>2:00 PM</strong> onwards
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#f59e0b] shrink-0 mt-0.5" />
                        <span className="font-['Inter:Regular',sans-serif] text-[12.5px] text-[#92400e] dark:text-amber-100/85">
                          Check-out is until <strong>12:00 PM (noon)</strong>
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#f59e0b] shrink-0 mt-0.5" />
                        <span className="font-['Inter:Regular',sans-serif] text-[12.5px] text-[#92400e] dark:text-amber-100/85">
                          A valid <strong>government-issued photo ID</strong> and <strong>credit card</strong> are required at check-in
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#f59e0b] shrink-0 mt-0.5" />
                        <span className="font-['Inter:Regular',sans-serif] text-[12.5px] text-[#92400e] dark:text-amber-100/85">
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
            <div className="lg:sticky lg:top-24">
              {/* Booking Summary Card */}
              <div className="hero-glass rounded-2xl p-5 mb-4 ring-1 ring-[#1abc9c]/30 dark:ring-[#2dd4bf]/35">
                <h3 className="font-['Poppins:Bold',sans-serif] text-[18px] text-[#3b3b3b] dark:text-white mb-4">
                  Booking Summary
                </h3>

                {/* Hotel Details */}
                <div className="mb-4 pb-4 border-b border-[#eaeaea] dark:border-white/[0.06]">
                  <div className="flex gap-3">
                    <img
                      src={booking.hotel.image}
                      alt={booking.hotel.name}
                      onError={makeImageFallback({ id: booking.hotel.id, name: booking.hotel.name })}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-['Poppins:SemiBold',sans-serif] text-[14px] text-[#3b3b3b] dark:text-white mb-1 truncate">
                        {booking.hotel.name}
                      </h4>
                      <div className="flex items-center gap-1 mb-1.5">
                        <MapPin className="w-3 h-3 text-[#8c8c8c]" />
                        <p className="font-['Inter:Regular',sans-serif] text-[11.5px] text-[#8c8c8c] truncate">
                          {booking.hotel.location}
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-1 bg-[#f9fafb] dark:bg-white/[0.04] px-2 py-0.5 rounded-md border border-[#eaeaea] dark:border-white/[0.06]">
                        <Bed className="w-3 h-3 text-[#1abc9c]" />
                        <span className="font-['Inter:SemiBold',sans-serif] text-[11px] text-[#3b3b3b] dark:text-white/85">
                          {booking.room.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="space-y-2.5 mb-4 pb-4 border-b border-[#eaeaea] dark:border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#1abc9c]" />
                      <span className="font-['Inter:Regular',sans-serif] text-[12.5px] text-[#8c8c8c]">
                        Check-in
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-['Inter:SemiBold',sans-serif] text-[12.5px] text-[#3b3b3b] dark:text-white/90">
                        {formatDate(booking.checkIn)}
                      </div>
                      <div className="font-['Inter:Regular',sans-serif] text-[11px] text-[#8c8c8c]">
                        From 2:00 PM
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#1abc9c]" />
                      <span className="font-['Inter:Regular',sans-serif] text-[12.5px] text-[#8c8c8c]">
                        Check-out
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-['Inter:SemiBold',sans-serif] text-[12.5px] text-[#3b3b3b] dark:text-white/90">
                        {formatDate(booking.checkOut)}
                      </div>
                      <div className="font-['Inter:Regular',sans-serif] text-[11px] text-[#8c8c8c]">
                        Until 12:00 PM
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#1abc9c]" />
                      <span className="font-['Inter:Regular',sans-serif] text-[12.5px] text-[#8c8c8c]">
                        Duration
                      </span>
                    </div>
                    <span className="font-['Inter:SemiBold',sans-serif] text-[12.5px] text-[#3b3b3b] dark:text-white/90">
                      {nights} {nights === 1 ? "Night" : "Nights"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#1abc9c]" />
                      <span className="font-['Inter:Regular',sans-serif] text-[12.5px] text-[#8c8c8c]">
                        Guests
                      </span>
                    </div>
                    <span className="font-['Inter:SemiBold',sans-serif] text-[12.5px] text-[#3b3b3b] dark:text-white/90">
                      {booking.guests}{" "}
                      {booking.guests === 1 ? "Guest" : "Guests"}
                    </span>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-start gap-3">
                    <span className="font-['Inter:Regular',sans-serif] text-[12.5px] text-[#3b3b3b] dark:text-white/80 leading-snug">
                      {formatCurrency(booking.room.price, language)} × {nights}{" "}
                      {nights === 1 ? "night" : "nights"} × {roomCount} room{roomCount > 1 ? "s" : ""}
                    </span>
                    <span className="font-['Inter:SemiBold',sans-serif] text-[13px] text-[#3b3b3b] dark:text-white shrink-0">
                      {formatCurrency(basePrice, language)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-['Inter:Regular',sans-serif] text-[12.5px] text-[#3b3b3b] dark:text-white/80">
                      Taxes & fees
                    </span>
                    <span className="font-['Inter:SemiBold',sans-serif] text-[13px] text-[#3b3b3b] dark:text-white">
                      {formatCurrency(taxes, language)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-['Inter:Regular',sans-serif] text-[12.5px] text-[#3b3b3b] dark:text-white/80">
                      Service fee
                    </span>
                    <span className="font-['Inter:SemiBold',sans-serif] text-[13px] text-[#3b3b3b] dark:text-white">
                      {formatCurrency(serviceFee, language)}
                    </span>
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
                      for {nights} {nights === 1 ? "night" : "nights"}
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="w-full bg-[#1abc9c] text-white py-3 rounded-xl hover:bg-[#16a085] transition-all font-['Inter:Bold',sans-serif] text-[14px] mb-2.5 relative overflow-hidden group"
                >
                  <span className="relative z-10">Continue to Payment</span>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/20 to-transparent" />
                </button>

                <p className="font-['Inter:Regular',sans-serif] text-[11.5px] text-[#8c8c8c] text-center">
                  No payment required at this step
                </p>
              </div>

              {/* Security Badge */}
              <div className="bg-linear-to-br from-[#d1fae5]/70 to-[#a7f3d0]/60 dark:from-emerald-500/[0.08] dark:to-emerald-500/[0.04] rounded-2xl p-4 border border-[#86efac] dark:border-emerald-400/25">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 bg-[#10b981] dark:bg-emerald-500/25 dark:ring-1 dark:ring-emerald-400/40 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white dark:text-emerald-200" />
                  </div>
                  <h4 className="font-['Poppins:SemiBold',sans-serif] text-[13.5px] text-[#047857] dark:text-emerald-300">
                    Your Information is Secure
                  </h4>
                </div>
                <p className="font-['Inter:Regular',sans-serif] text-[12px] text-[#065f46] dark:text-emerald-100/80 leading-[18px]">
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
