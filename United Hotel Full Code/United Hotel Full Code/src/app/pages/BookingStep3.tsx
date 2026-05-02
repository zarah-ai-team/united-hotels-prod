import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import {
  CreditCard,
  Lock,
  ChevronLeft,
  Calendar,
  Clock,
  Users,
  Shield,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Bed,
  TrendingDown,
  Building2,
  Info,
  Star,
  Mail,
  Phone,
  User,
  MessageCircle,
} from "lucide-react";
import { useBooking } from "../context/BookingContext";
import { useLanguage } from "../context/LanguageContext";
import { bookingService } from "../services/api";
import svgPaths from "../../imports/svg-nnzqmx1xjq";
import { Navigation } from "../components/Navigation";
import { formatCurrency } from "../utils/currency";
import { makeImageFallback } from "../utils/hotelImages";

export function BookingStep3() {
  const navigate = useNavigate();
  const { booking, calculateNights, setConfirmationId } = useBooking();
  const { language } = useLanguage();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  // Handle missing booking data
  useEffect(() => {
    if (!booking.hotel || !booking.room || !booking.guestDetails) {
      navigate("/listing");
    }
  }, [booking.hotel, booking.room, booking.guestDetails, navigate]);

  // Don't render if no booking data
  if (!booking.hotel || !booking.room || !booking.guestDetails) {
    return null;
  }

  const currentHotel = booking.hotel;
  const currentRoom = booking.room;
  const currentGuest = booking.guestDetails;

  const nights = Math.max(1, calculateNights());
  const roomCount = booking.roomCount || 1;
  const nightlyPrice = Number(currentRoom.price || 0);
  const total = nightlyPrice * nights * roomCount;
  const isCardPaymentPending = paymentMethod === "card";
  const isActionDisabled = isProcessing || isCardPaymentPending;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isCardPaymentPending) {
      toast.info("Card payment will be enabled soon", {
        description: "Please choose Pay at hotel to complete this booking now.",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await bookingService.bookRoom({
        room: {
          id: Number(currentRoom.id),
          name: currentRoom.name,
          hotelid: Number(currentHotel.id),
        },
        fromdate: booking.checkIn,
        todate: booking.checkOut,
        totalamount: total,
        totaldays: nights,
        bookedRooms: roomCount,
        paymentMode: paymentMethod,
        email: currentGuest.email,
        phoneNumber: currentGuest.phone,
        specialRequest: currentGuest.specialRequest || "",
      });

      const bookingId = response?.booking?.id || response?.id || response?.bookingId || null;
      if (bookingId) {
        setConfirmationId(String(bookingId));
      }

      toast.success("Booking confirmed", {
        description: "Your reservation was completed successfully.",
      });
      navigate("/booking/confirmation");
    } catch (error: any) {
      const errorMessage =
        error?.data?.error ||
        error?.message ||
        "We couldn't complete your booking. Please try again.";
      toast.error("Booking failed", { description: errorMessage });
      console.error("Booking failed:", error);
    } finally {
      setIsProcessing(false);
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

  // Format card number with spaces
  const handleCardNumberChange = (value: string) => {
    const formatted = value
      .replace(/\s/g, "")
      .replace(/(\d{4})/g, "$1 ")
      .trim();
    setCardNumber(formatted.slice(0, 19));
  };

  // Format expiry date
  const handleExpiryChange = (value: string) => {
    const formatted = value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2");
    setExpiry(formatted.slice(0, 5));
  };

  return (
    <div className="min-h-screen glass-section-bg">
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

            {/* Step 2 - Completed */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#10b981] rounded-full flex items-center justify-center text-white">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-['Poppins:SemiBold',sans-serif] text-[13px] text-[#10b981] leading-tight">
                    Guest Details
                  </div>
                  <div className="font-['Inter:Regular',sans-serif] text-[11px] text-[#8c8c8c]">
                    Completed
                  </div>
                </div>
              </div>
              <div className="w-10 h-0.5 bg-[#10b981]" />
            </div>

            {/* Step 3 - Active */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-[#1abc9c] to-[#2dd4bf] rounded-full flex items-center justify-center text-white font-['Inter:Bold',sans-serif] shadow-[0_6px_16px_-6px_rgba(26,188,156,0.55)] ring-2 ring-white/40 dark:ring-white/10 text-[13px]">
                3
              </div>
              <div>
                <div className="font-['Poppins:SemiBold',sans-serif] text-[13px] text-[#3b3b3b] dark:text-white/85 leading-tight">
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

            {/* Step 2 - Completed */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 bg-[#10b981] rounded-full flex items-center justify-center text-white">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="text-center">
                <div className="font-['Inter:SemiBold',sans-serif] text-[11px] text-[#10b981]">
                  Guest Details
                </div>
              </div>
            </div>

            {/* Connector */}
            <div className="w-6 h-0.5 bg-[#10b981]" />

            {/* Step 3 - Active */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 bg-gradient-to-br from-[#1abc9c] to-[#2dd4bf] rounded-full flex items-center justify-center text-white font-['Inter:Bold',sans-serif] shadow-[0_6px_16px_-6px_rgba(26,188,156,0.55)] ring-2 ring-white/40 dark:ring-white/10 text-[11px]">
                3
              </div>
              <div className="text-center">
                <div className="font-['Inter:SemiBold',sans-serif] text-[11px] text-[#3b3b3b] dark:text-white/85">
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
          to="/booking/step2"
          className="inline-flex items-center gap-1.5 text-[#1abc9c] hover:text-[#16a085] transition-colors font-['Inter:SemiBold',sans-serif] text-[13px] md:text-[14px] mb-3 md:mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Guest Details
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 lg:gap-6">
          {/* Left Column */}
          <div>
            <h1 className="font-['Poppins:Bold',sans-serif] text-[20px] md:text-[26px] leading-tight text-[#3b3b3b] dark:text-white mb-1">
              Review & Payment
            </h1>
            <p className="font-['Inter:Regular',sans-serif] text-[13px] text-[#6b7280] dark:text-white/55 mb-4 md:mb-5">
              Please review your booking details and complete the payment
            </p>

            {/* Booking Review Card */}
            <div className="glass-card rounded-2xl p-4 md:p-5 mb-4">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-[#1abc9c]/10 dark:bg-[#2dd4bf]/15 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-[#1abc9c] dark:text-[#2dd4bf]" />
                </div>
                <h3 className="font-['Poppins:SemiBold',sans-serif] text-[16px] md:text-[17px] text-[#3b3b3b] dark:text-white">
                  Booking Details
                </h3>
              </div>

              {/* Hotel Info */}
              <div className="flex gap-4 mb-4 pb-4 border-b border-[#eaeaea] dark:border-white/[0.06]">
                <img
                  src={booking.hotel.image}
                  alt={booking.hotel.name}
                  onError={makeImageFallback({ id: booking.hotel.id, name: booking.hotel.name })}
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-['Poppins:SemiBold',sans-serif] text-[16px] text-[#3b3b3b] dark:text-white mb-1">
                    {booking.hotel.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-[#1abc9c]" />
                    <span className="font-['Inter:Regular',sans-serif] text-[12.5px] text-[#6b7280] dark:text-white/65">
                      {booking.hotel.location}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 bg-[#f9fafb] dark:bg-white/[0.04] px-2.5 py-1 rounded-lg border border-[#eaeaea] dark:border-white/[0.06]">
                    <Bed className="w-3.5 h-3.5 text-[#1abc9c]" />
                    <span className="font-['Inter:SemiBold',sans-serif] text-[12.5px] text-[#3b3b3b] dark:text-white/85">
                      {booking.room.name}
                    </span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-start gap-0.5">
                  {[...Array(4)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-[#FFA500] text-[#FFA500]"
                    />
                  ))}
                  <Star className="w-3.5 h-3.5 text-[#e5e7eb]" />
                </div>
              </div>

              {/* Check-in/out Details */}
              <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-[#eaeaea] dark:border-white/[0.06]">
                <div className="bg-[#fafafa] dark:bg-white/[0.04] rounded-xl p-3 border border-[#eaeaea] dark:border-white/[0.06]">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#1abc9c]" />
                    <span className="font-['Inter:Medium',sans-serif] text-[10.5px] text-[#8c8c8c] uppercase tracking-wide">
                      Check-in
                    </span>
                  </div>
                  <div className="font-['Inter:Bold',sans-serif] text-[13.5px] text-[#3b3b3b] dark:text-white">
                    {formatDate(booking.checkIn)}
                  </div>
                  <div className="font-['Inter:Regular',sans-serif] text-[11.5px] text-[#6b7280] dark:text-white/55">
                    From 2:00 PM
                  </div>
                </div>

                <div className="bg-[#fafafa] dark:bg-white/[0.04] rounded-xl p-3 border border-[#eaeaea] dark:border-white/[0.06]">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#1abc9c]" />
                    <span className="font-['Inter:Medium',sans-serif] text-[10.5px] text-[#8c8c8c] uppercase tracking-wide">
                      Check-out
                    </span>
                  </div>
                  <div className="font-['Inter:Bold',sans-serif] text-[13.5px] text-[#3b3b3b] dark:text-white">
                    {formatDate(booking.checkOut)}
                  </div>
                  <div className="font-['Inter:Regular',sans-serif] text-[11.5px] text-[#6b7280] dark:text-white/55">
                    Until 12:00 PM
                  </div>
                </div>
              </div>

              {/* Guest Information */}
              <div className="bg-[#f9fafb] dark:bg-white/[0.04] rounded-xl p-3.5 border border-[#eaeaea] dark:border-white/[0.06]">
                <div className="flex items-center gap-1.5 mb-2">
                  <User className="w-3.5 h-3.5 text-[#1abc9c]" />
                  <span className="font-['Inter:Medium',sans-serif] text-[10.5px] text-[#8c8c8c] uppercase tracking-wide">
                    Guest Information
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#6b7280] dark:text-white/55" />
                    <span className="font-['Inter:SemiBold',sans-serif] text-[13.5px] text-[#3b3b3b] dark:text-white">
                      {booking.guestDetails.firstName}{" "}
                      {booking.guestDetails.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#6b7280] dark:text-white/55" />
                    <span className="font-['Inter:Regular',sans-serif] text-[12.5px] text-[#6b7280] dark:text-white/65">
                      {booking.guestDetails.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#6b7280] dark:text-white/55" />
                    <span className="font-['Inter:Regular',sans-serif] text-[12.5px] text-[#6b7280] dark:text-white/65">
                      {booking.guestDetails.phone}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <form onSubmit={handlePayment}>
              <div className="glass-card rounded-2xl p-4 md:p-5 mb-4">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 bg-[#1abc9c]/10 dark:bg-[#2dd4bf]/15 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-[#1abc9c] dark:text-[#2dd4bf]" />
                  </div>
                  <h3 className="font-['Poppins:SemiBold',sans-serif] text-[16px] md:text-[17px] text-[#3b3b3b] dark:text-white">
                    Payment Method
                  </h3>
                </div>

                <div className="space-y-2.5 mb-4">
                  {/* Credit Card Option */}
                  <label
                    className={`flex items-center gap-3 p-3.5 border-2 rounded-xl cursor-pointer transition-all ${
                      paymentMethod === "card"
                        ? "border-[#1abc9c] bg-[#1abc9c]/5 dark:bg-[#2dd4bf]/[0.07]"
                        : "border-[#eaeaea] dark:border-white/[0.08] hover:border-[#1abc9c]/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 accent-[#1abc9c]"
                    />
                    <div className="w-8 h-8 bg-[#1abc9c]/10 dark:bg-[#2dd4bf]/15 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-[#1abc9c] dark:text-[#2dd4bf]" />
                    </div>
                    <div className="flex-1">
                      <div className="font-['Inter:SemiBold',sans-serif] text-[13.5px] text-[#3b3b3b] dark:text-white">
                        Credit / Debit Card
                      </div>
                      <div className="font-['Inter:Regular',sans-serif] text-[11.5px] text-[#8c8c8c]">
                        Visa, Mastercard, American Express
                      </div>
                    </div>
                    {paymentMethod === "card" && (
                      <CheckCircle2 className="w-4 h-4 text-[#1abc9c] dark:text-[#2dd4bf]" />
                    )}
                  </label>

                  {/* Pay at Hotel Option */}
                  <label
                    className={`flex items-center gap-3 p-3.5 border-2 rounded-xl cursor-pointer transition-all ${
                      paymentMethod === "hotel"
                        ? "border-[#1abc9c] bg-[#1abc9c]/5 dark:bg-[#2dd4bf]/[0.07]"
                        : "border-[#eaeaea] dark:border-white/[0.08] hover:border-[#1abc9c]/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="hotel"
                      checked={paymentMethod === "hotel"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 accent-[#1abc9c]"
                    />
                    <div className="w-8 h-8 bg-[#1abc9c]/10 dark:bg-[#2dd4bf]/15 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-[#1abc9c] dark:text-[#2dd4bf]" />
                    </div>
                    <div className="flex-1">
                      <div className="font-['Inter:SemiBold',sans-serif] text-[13.5px] text-[#3b3b3b] dark:text-white">
                        Pay at Hotel
                      </div>
                      <div className="font-['Inter:Regular',sans-serif] text-[11.5px] text-[#8c8c8c]">
                        Pay when you check-in
                      </div>
                    </div>
                    {paymentMethod === "hotel" && (
                      <CheckCircle2 className="w-4 h-4 text-[#1abc9c] dark:text-[#2dd4bf]" />
                    )}
                  </label>
                </div>

                {/* Card Details Form */}
                {paymentMethod === "card" && (
                  <div className="space-y-3.5 pt-4 border-t border-[#eaeaea] dark:border-white/[0.06]">
                    <div>
                      <label className="font-['Inter:Medium',sans-serif] text-[13px] text-[#3b3b3b] dark:text-white/85 mb-1.5 block">
                        Card Number
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c8c8c]">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={(e) =>
                            handleCardNumberChange(e.target.value)
                          }
                          className="w-full pl-9 pr-20 py-2.5 border border-[#eaeaea] dark:border-white/[0.08] bg-white/80 dark:bg-white/[0.04] dark:text-white rounded-xl font-['Inter:Regular',sans-serif] text-[13.5px] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/10 transition-all"
                        />
                        {/* Card Brand Icons */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1.5">
                          <div className="w-7 h-5 bg-[#f3f4f6] dark:bg-white/[0.08] rounded flex items-center justify-center text-[9px] font-bold dark:text-white/75">
                            VISA
                          </div>
                          <div className="w-7 h-5 bg-[#f3f4f6] dark:bg-white/[0.08] rounded flex items-center justify-center text-[9px] font-bold dark:text-white/75">
                            MC
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="font-['Inter:Medium',sans-serif] text-[13px] text-[#3b3b3b] dark:text-white/85 mb-1.5 block">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        placeholder="JOHN DOE"
                        value={cardName}
                        onChange={(e) =>
                          setCardName(e.target.value.toUpperCase())
                        }
                        className="w-full px-3 py-2.5 border border-[#eaeaea] dark:border-white/[0.08] bg-white/80 dark:bg-white/[0.04] dark:text-white rounded-xl font-['Inter:Regular',sans-serif] text-[13.5px] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/10 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-['Inter:Medium',sans-serif] text-[13px] text-[#3b3b3b] dark:text-white/85 mb-1.5 block">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={(e) => handleExpiryChange(e.target.value)}
                          className="w-full px-3 py-2.5 border border-[#eaeaea] dark:border-white/[0.08] bg-white/80 dark:bg-white/[0.04] dark:text-white rounded-xl font-['Inter:Regular',sans-serif] text-[13.5px] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/10 transition-all"
                        />
                      </div>

                      <div>
                        <label className="font-['Inter:Medium',sans-serif] text-[13px] text-[#3b3b3b] dark:text-white/85 mb-1.5 flex items-center gap-1.5">
                          CVV
                          <div className="group relative">
                            <Info className="w-3.5 h-3.5 text-[#8c8c8c] cursor-help" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-[#3b3b3b] text-white text-[11px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              3 digits on back of card
                            </div>
                          </div>
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          value={cvv}
                          onChange={(e) =>
                            setCvv(
                              e.target.value.replace(/\D/g, "").slice(0, 3),
                            )
                          }
                          maxLength={3}
                          className="w-full px-3 py-2.5 border border-[#eaeaea] dark:border-white/[0.08] bg-white/80 dark:bg-white/[0.04] dark:text-white rounded-xl font-['Inter:Regular',sans-serif] text-[13.5px] focus:outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/10 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Security Notice */}
              <div className="bg-linear-to-br from-[#d1fae5]/70 to-[#a7f3d0]/60 dark:from-emerald-500/[0.10] dark:to-emerald-500/[0.06] border border-[#86efac] dark:border-emerald-400/25 rounded-2xl p-4 md:p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-[#10b981] dark:bg-emerald-500/25 dark:ring-1 dark:ring-emerald-400/40 rounded-xl flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4 text-white dark:text-emerald-200" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-['Poppins:SemiBold',sans-serif] text-[14.5px] text-[#047857] dark:text-emerald-300 mb-1">
                      Secure Payment Processing
                    </h4>
                    <p className="font-['Inter:Regular',sans-serif] text-[12.5px] text-[#065f46] dark:text-emerald-100/80 leading-[19px] mb-2">
                      Your payment information is encrypted using industry-standard SSL technology. We never store your card details on our servers.
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-[#047857] dark:text-emerald-300" />
                        <span className="font-['Inter:SemiBold',sans-serif] text-[11.5px] text-[#047857] dark:text-emerald-300">
                          256-bit Encryption
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#047857] dark:text-emerald-300" />
                        <span className="font-['Inter:SemiBold',sans-serif] text-[11.5px] text-[#047857] dark:text-emerald-300">
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
            <div className="lg:sticky lg:top-24">
              {/* Price Summary Card */}
              <div className="hero-glass rounded-2xl p-5 mb-4 ring-1 ring-[#1abc9c]/30 dark:ring-[#2dd4bf]/35">
                <h3 className="font-['Poppins:Bold',sans-serif] text-[18px] text-[#3b3b3b] dark:text-white mb-4">
                  Price Summary
                </h3>

                <div className="rounded-xl border border-[#eaeaea] dark:border-white/[0.06] bg-[#f9fafb] dark:bg-white/[0.04] p-3 mb-4">
                  <div className="font-['Inter:Regular',sans-serif] text-[12px] text-[#6b7280] dark:text-white/55 mb-0.5">
                    Recommended total price
                  </div>
                  <div className="font-['Inter:SemiBold',sans-serif] text-[13px] text-[#3b3b3b] dark:text-white/90">
                    {formatCurrency(nightlyPrice, language)} × {nights} {nights === 1 ? "night" : "nights"} × {roomCount} room{roomCount > 1 ? "s" : ""}
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
                      {roomCount} room{roomCount > 1 ? "s" : ""} for {nights} {nights === 1 ? "night" : "nights"}
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  type="submit"
                  disabled={isActionDisabled}
                  className={`w-full bg-[#1abc9c] text-white py-3 rounded-xl hover:bg-[#16a085] transition-all font-['Inter:Bold',sans-serif] text-[14px] mb-2.5 relative overflow-hidden group ${
                    isActionDisabled ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing Payment...
                    </span>
                  ) : (
                    <>
                      <span className="relative z-10">
                        {isCardPaymentPending
                          ? "Pay Now (coming soon)"
                          : "Confirm Booking"}
                      </span>
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/20 to-transparent" />
                    </>
                  )}
                </button>

                {/* When card payment is disabled, give the user a way out
                    to talk to support directly via WhatsApp. The number is
                    pulled from VITE_SUPPORT_WHATSAPP at build time so the
                    operator can change it without a code edit. */}
                {isCardPaymentPending && (() => {
                  const rawNumber = import.meta.env.VITE_SUPPORT_WHATSAPP || '15551234567';
                  const phoneDigits = String(rawNumber).replace(/[^\d]/g, '');
                  const hotelName = currentHotel?.name || 'a hotel';
                  const text = `Hi! I'd like to book ${hotelName} from ${booking.checkIn} to ${booking.checkOut} (${roomCount} room${roomCount > 1 ? 's' : ''}, ${nights} night${nights > 1 ? 's' : ''}). Card payment isn't enabled — can you help me complete the booking?`;
                  const href = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(text)}`;
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl hover:bg-[#1da851] transition-all font-['Inter:Bold',sans-serif] text-[14px] mb-2.5"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat with us on WhatsApp
                    </a>
                  );
                })()}

                <p className="font-['Inter:Regular',sans-serif] text-[11px] text-[#8c8c8c] text-center leading-[16px]">
                  By completing this booking, you agree to our{" "}
                  <Link to="/terms" className="text-[#1abc9c] hover:underline">
                    terms and conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="text-[#1abc9c] hover:underline"
                  >
                    privacy policy
                  </Link>
                </p>
              </div>

              {/* Trust Badges */}
              <div className="bg-linear-to-br from-[#f3f4f6] to-white dark:from-white/[0.04] dark:to-white/[0.02] rounded-2xl p-4 border border-[#eaeaea] dark:border-white/[0.06]">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-[#10b981]/10 dark:bg-[#10b981]/20 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-[#10b981] dark:text-[#34d399]" />
                    </div>
                    <span className="font-['Inter:Regular',sans-serif] text-[13px] text-[#3b3b3b] dark:text-white/85">
                      Instant confirmation
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-[#10b981]/10 dark:bg-[#10b981]/20 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-[#10b981] dark:text-[#34d399]" />
                    </div>
                    <span className="font-['Inter:Regular',sans-serif] text-[13px] text-[#3b3b3b] dark:text-white/85">
                      Free cancellation
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-[#10b981]/10 dark:bg-[#10b981]/20 rounded-lg flex items-center justify-center">
                      <Lock className="w-4 h-4 text-[#10b981] dark:text-[#34d399]" />
                    </div>
                    <span className="font-['Inter:Regular',sans-serif] text-[13px] text-[#3b3b3b] dark:text-white/85">
                      Secure payment
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-[#10b981]/10 dark:bg-[#10b981]/20 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-[#10b981] dark:text-[#34d399]" />
                    </div>
                    <span className="font-['Inter:Regular',sans-serif] text-[13px] text-[#3b3b3b] dark:text-white/85">
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
