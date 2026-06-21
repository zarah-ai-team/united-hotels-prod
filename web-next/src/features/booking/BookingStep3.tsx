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
import { useBooking } from "@/shared/context/BookingContext";
import { useLanguage } from "@/shared/context/LanguageContext";
import { bookingService, paymentService } from "@/shared/api/services";
import { postToIsbankGateway, isbankUiEnabled } from "@/shared/lib/isbankCheckout";
import svgPaths from "@/shared/imports/svg-nnzqmx1xjq";
import { Navigation } from "@/shared/components/Navigation";
import { formatCurrency } from "@/shared/lib/currency";
import { makeImageFallback } from "@/shared/lib/hotelImages";

export function BookingStep3() {
  const navigate = useNavigate();
  const { booking, calculateNights, setConfirmationId } = useBooking();
  const { language } = useLanguage();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);

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
  const isActionDisabled = isProcessing;
  // When the bank gateway is live, the card is entered on İş Bankası's hosted
  // page — so we hide the manual card fields and the "payments unavailable"
  // notice, and show a secure-redirect note instead.
  const isbankEnabled = isbankUiEnabled();
  const cardViaBank = paymentMethod === "card" && isbankEnabled;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

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
        guestFirstName: currentGuest.firstName,
        guestLastName: currentGuest.lastName,
        guestName: [currentGuest.firstName, currentGuest.lastName].filter(Boolean).join(" "),
        guests: booking.guests,
        adults: booking.adults,
        children: booking.children,
        currency: "USD",
      });

      const bookingId = response?.booking?.id || response?.id || response?.bookingId || null;

      // When the card gateway is live and the guest is paying by card, the
      // backend returns paymentRequired=true and leaves the booking pending.
      // Start the İş Bankası payment and hand the browser to the bank's hosted
      // page; the booking is confirmed (and emailed) by the payment callback.
      if (response?.paymentRequired && bookingId) {
        const init = await paymentService.initiateIsbank({
          bookingId,
          amount: Number(response.amount ?? total),
          currency: response.currency || "USD",
          notify: {
            hotelId: Number(currentHotel.id),
            guestEmail: currentGuest.email,
            guestName: [currentGuest.firstName, currentGuest.lastName].filter(Boolean).join(" "),
            guestPhone: currentGuest.phone,
            hotelName: currentHotel.name,
            roomName: currentRoom.name,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            nights,
          },
        });

        if (init?.gateUrl && init?.fields) {
          if (bookingId) setConfirmationId(String(bookingId));
          toast.info("Redirecting to secure payment…", {
            description: "You'll complete your card details on İş Bankası's secure page.",
          });
          postToIsbankGateway(init.gateUrl, init.fields);
          return; // browser navigates away to the bank
        }
        throw new Error("Could not start secure payment. Please try again.");
      }

      // Pay-at-hotel, or gateway disabled — booking is already recorded.
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

  return (
    <div className="min-h-screen glass-section-bg">
      <Navigation />

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
              <div className="w-8 h-8 bg-gradient-to-br from-[#2F80ED] to-[#5DA0F8] rounded-full flex items-center justify-center text-white font-['Inter:Bold',sans-serif] shadow-[0_6px_16px_-6px_rgba(47, 128, 237,0.55)] ring-2 ring-white/40 dark:ring-white/10 text-[13px]">
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
              <div className="w-6 h-6 bg-gradient-to-br from-[#2F80ED] to-[#5DA0F8] rounded-full flex items-center justify-center text-white font-['Inter:Bold',sans-serif] shadow-[0_6px_16px_-6px_rgba(47, 128, 237,0.55)] ring-2 ring-white/40 dark:ring-white/10 text-[11px]">
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
          className="inline-flex items-center gap-1.5 text-[#2F80ED] hover:text-[#1E5FBC] transition-colors font-['Inter:SemiBold',sans-serif] text-[13px] md:text-[14px] mb-3 md:mb-4"
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
            <p className="font-['Inter:Regular',sans-serif] text-[13px] text-[#6b7280] dark:text-white/60 mb-4 md:mb-5">
              Please review your booking details before confirming
            </p>

            {/* Payments-unavailable notice — hidden once the card gateway is live. */}
            {!isbankEnabled && (
            <div className="bg-linear-to-br from-[#fef3c7]/80 to-[#fde68a]/40 dark:from-amber-500/[0.10] dark:to-amber-500/[0.05] border border-[#fcd34d] dark:border-amber-400/25 rounded-2xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-[#f59e0b] dark:bg-amber-500/25 dark:ring-1 dark:ring-amber-400/40 rounded-xl flex items-center justify-center shrink-0">
                  <Info className="w-4 h-4 text-white dark:text-amber-200" />
                </div>
                <div className="flex-1">
                  <h4 className="font-['Poppins:SemiBold',sans-serif] text-[14.5px] text-[#92400e] dark:text-amber-300 mb-1">
                    Online payments are not available yet
                  </h4>
                  <p className="font-['Inter:Regular',sans-serif] text-[12.5px] text-[#78350f] dark:text-amber-100/80 leading-[19px]">
                    We're still finishing setup with our payment provider. To complete your reservation, please reach out to our team on WhatsApp and we'll take care of the rest — quickly and personally.
                  </p>
                </div>
              </div>
            </div>
            )}

            {/* Booking Review Card */}
            <div className="glass-card rounded-2xl p-4 md:p-5 mb-4">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-[#2F80ED]/10 dark:bg-[#5DA0F8]/15 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-[#2F80ED] dark:text-[#5DA0F8]" />
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
                    <MapPin className="w-3.5 h-3.5 text-[#2F80ED]" />
                    <span className="font-['Inter:Regular',sans-serif] text-[12.5px] text-[#6b7280] dark:text-white/70">
                      {booking.hotel.location}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 bg-[#f9fafb] dark:bg-white/[0.04] px-2.5 py-1 rounded-lg border border-[#eaeaea] dark:border-white/[0.06]">
                    <Bed className="w-3.5 h-3.5 text-[#2F80ED]" />
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
                    <Calendar className="w-3.5 h-3.5 text-[#2F80ED]" />
                    <span className="font-['Inter:Medium',sans-serif] text-[10.5px] text-[#8c8c8c] uppercase tracking-wide">
                      Check-in
                    </span>
                  </div>
                  <div className="font-['Inter:Bold',sans-serif] text-[13.5px] text-[#3b3b3b] dark:text-white">
                    {formatDate(booking.checkIn)}
                  </div>
                  <div className="font-['Inter:Regular',sans-serif] text-[11.5px] text-[#6b7280] dark:text-white/60">
                    From 2:00 PM
                  </div>
                </div>

                <div className="bg-[#fafafa] dark:bg-white/[0.04] rounded-xl p-3 border border-[#eaeaea] dark:border-white/[0.06]">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#2F80ED]" />
                    <span className="font-['Inter:Medium',sans-serif] text-[10.5px] text-[#8c8c8c] uppercase tracking-wide">
                      Check-out
                    </span>
                  </div>
                  <div className="font-['Inter:Bold',sans-serif] text-[13.5px] text-[#3b3b3b] dark:text-white">
                    {formatDate(booking.checkOut)}
                  </div>
                  <div className="font-['Inter:Regular',sans-serif] text-[11.5px] text-[#6b7280] dark:text-white/60">
                    Until 12:00 PM
                  </div>
                </div>
              </div>

              {/* Guest Information */}
              <div className="bg-[#f9fafb] dark:bg-white/[0.04] rounded-xl p-3.5 border border-[#eaeaea] dark:border-white/[0.06]">
                <div className="flex items-center gap-1.5 mb-2">
                  <User className="w-3.5 h-3.5 text-[#2F80ED]" />
                  <span className="font-['Inter:Medium',sans-serif] text-[10.5px] text-[#8c8c8c] uppercase tracking-wide">
                    Guest Information
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#6b7280] dark:text-white/60" />
                    <span className="font-['Inter:SemiBold',sans-serif] text-[13.5px] text-[#3b3b3b] dark:text-white">
                      {booking.guestDetails.firstName}{" "}
                      {booking.guestDetails.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#6b7280] dark:text-white/60" />
                    <span className="font-['Inter:Regular',sans-serif] text-[12.5px] text-[#6b7280] dark:text-white/70">
                      {booking.guestDetails.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#6b7280] dark:text-white/60" />
                    <span className="font-['Inter:Regular',sans-serif] text-[12.5px] text-[#6b7280] dark:text-white/70">
                      {booking.guestDetails.phone}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            {/* id lets the CTA button (which lives outside this form, in the
                right-column sticky summary) submit it via the `form` attribute. */}
            <form id="booking-payment-form" onSubmit={handlePayment}>
              <div className="glass-card rounded-2xl p-4 md:p-5 mb-4">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 bg-[#2F80ED]/10 dark:bg-[#5DA0F8]/15 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-[#2F80ED] dark:text-[#5DA0F8]" />
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
                        ? "border-[#2F80ED] bg-[#2F80ED]/5 dark:bg-[#5DA0F8]/[0.07]"
                        : "border-[#eaeaea] dark:border-white/[0.08] hover:border-[#2F80ED]/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 accent-[#2F80ED]"
                    />
                    <div className="w-8 h-8 bg-[#2F80ED]/10 dark:bg-[#5DA0F8]/15 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-[#2F80ED] dark:text-[#5DA0F8]" />
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
                      <CheckCircle2 className="w-4 h-4 text-[#2F80ED] dark:text-[#5DA0F8]" />
                    )}
                  </label>
                </div>

                {/* Bank-hosted card flow: card is entered on İş Bankası's secure
                    page after redirect, so we don't collect card data here. */}
                {cardViaBank && (
                  <div className="pt-4 border-t border-[#eaeaea] dark:border-white/[0.06]">
                    <div className="flex items-start gap-3 bg-[#2F80ED]/[0.06] dark:bg-[#5DA0F8]/[0.08] border border-[#2F80ED]/20 rounded-xl p-3.5">
                      <Lock className="w-4 h-4 text-[#2F80ED] dark:text-[#5DA0F8] mt-0.5 shrink-0" />
                      <p className="font-['Inter:Regular',sans-serif] text-[12.5px] text-[#3b3b3b] dark:text-white/80 leading-[19px]">
                        You'll be redirected to <strong>İş Bankası's secure payment page</strong> to enter your card details and complete 3-D Secure verification. We never see or store your card number.
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* Security Notice */}
              <div className="bg-linear-to-br from-[#d1fae5]/70 to-[#BFD9F8]/60 dark:from-emerald-500/[0.10] dark:to-emerald-500/[0.06] border border-[#86efac] dark:border-emerald-400/25 rounded-2xl p-4 md:p-5">
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
              <div className="hero-glass rounded-2xl p-5 mb-4 ring-1 ring-[#2F80ED]/30 dark:ring-[#5DA0F8]/35">
                <h3 className="font-['Poppins:Bold',sans-serif] text-[18px] text-[#3b3b3b] dark:text-white mb-4">
                  Price Summary
                </h3>

                <div className="rounded-xl border border-[#eaeaea] dark:border-white/[0.06] bg-[#f9fafb] dark:bg-white/[0.04] p-3 mb-4">
                  <div className="font-['Inter:Regular',sans-serif] text-[12px] text-[#6b7280] dark:text-white/60 mb-0.5">
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
                    <div className="font-['Poppins:Bold',sans-serif] text-[26px] leading-tight text-[#2F80ED] dark:text-[#5DA0F8]">
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
                  form="booking-payment-form"
                  disabled={isActionDisabled}
                  className={`w-full bg-[#2F80ED] text-white py-3 rounded-xl hover:bg-[#1E5FBC] transition-all font-['Inter:Bold',sans-serif] text-[14px] mb-2.5 relative overflow-hidden group ${
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
                      <span className="relative z-10">{cardViaBank ? "Continue to secure payment" : "Confirm Booking"}</span>
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/20 to-transparent" />
                    </>
                  )}
                </button>

                {/* WhatsApp escape hatch — payments aren't live yet, so this is
                    currently the recommended path to confirm a booking. The number
                    comes from VITE_SUPPORT_WHATSAPP so the operator can change it
                    without a code edit. */}
                {(() => {
                  const rawNumber = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '905449580798';
                  const phoneDigits = String(rawNumber).replace(/[^\d]/g, '');
                  const hotelName = currentHotel?.name || 'a hotel';
                  const text = `Hi! I'd like to book ${hotelName} from ${booking.checkIn} to ${booking.checkOut} (${roomCount} room${roomCount > 1 ? 's' : ''}, ${nights} night${nights > 1 ? 's' : ''}).`;
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
                  <Link to="/terms" className="text-[#2F80ED] hover:underline">
                    terms and conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="text-[#2F80ED] hover:underline"
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
