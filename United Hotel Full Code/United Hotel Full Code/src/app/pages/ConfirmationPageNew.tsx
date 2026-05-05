import { Link } from "react-router";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { useBooking } from "../context/BookingContext";
import { useLanguage } from "../context/LanguageContext";
import { resolveImage } from "../data/siteConfig";
import { makeImageFallback } from "../utils/hotelImages";
import imgImageHotel from "figma:asset/126d7e43c8c296ca95f6cc5a2e933adaced67080.png";
import { formatCurrency } from "../utils/currency";
import { 
  Check, Calendar, User, Phone, Mail, MapPin, Download, 
  CalendarPlus, Clock, ChevronRight 
} from "lucide-react";

export function ConfirmationPageNew() {
  const { booking } = useBooking();
  const { language } = useLanguage();

  // Mock booking data (in real app, this would come from API)
  const bookingData = {
    id: booking.confirmationId || "UHP86FPOZ70",
    hotel: {
      name: booking.hotel?.name || "Sultanahmet Boutique Hotel",
      location: booking.hotel?.location || "Sultanahmet, Old City",
      image: booking.hotel?.image || imgImageHotel,
      roomType: booking.room?.name || "Standard Double Room"
    },
    checkIn: {
      date: "2025-03-15",
      displayDate: "2025-03-15",
      time: "After 2:00 PM"
    },
    checkOut: {
      date: "2025-03-18",
      displayDate: "2025-03-18",
      time: "Before 12:00 PM"
    },
    guest: {
      name: booking.guestDetails ? `${booking.guestDetails.firstName} ${booking.guestDetails.lastName}` : "Sachin Verma",
      email: booking.guestDetails?.email || "sachinverma@gmail.com",
      phone: booking.guestDetails?.phone || "+91 93105 13525"
    },
    payment: {
      nightlyRate: booking.room?.price || 42,
      nights: booking.nights || 3,
      subtotal: (booking.room?.price || 42) * (booking.nights || 3),
      taxes: 13,
      total: ((booking.room?.price || 42) * (booking.nights || 3)) + 13
    }
  };

  const handleDownloadInvoice = () => {
    // In production, this would generate a PDF
    alert("Invoice download will be available soon!");
  };

  const handleAddToCalendar = () => {
    // In production, this would create a .ics file
    alert("Calendar event will be created!");
  };

  return (
    <div className="glass-section-bg min-h-screen">
      <Navigation />

      <main className="max-w-[820px] mx-auto px-4 md:px-10 py-8 md:py-12">
        {/* Success Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#10b981] rounded-full mb-6 shadow-lg">
            <Check className="w-10 h-10 text-white stroke-[3]" />
          </div>
          
          <h1 className="font-['Poppins:Bold',sans-serif] text-[30px] md:text-[42px] leading-tight md:leading-[52px] text-[#3b3b3b] mb-3">
            Booking Confirmed!
          </h1>
          
          <p className="font-['Inter:Regular',sans-serif] text-[18px] text-[#6b7280] mb-6">
            Your reservation has been successfully confirmed
          </p>

          <div className="inline-flex items-center gap-2 bg-[#d1fae5] px-6 py-3 rounded-xl">
            <span className="font-['Inter:Medium',sans-serif] text-[14px] text-[#059669]">
              Booking ID
            </span>
            <span className="font-['Poppins:Bold',sans-serif] text-[18px] text-[#047857]">
              {bookingData.id}
            </span>
          </div>
        </div>

        {/* Reservation Details Card */}
        <div className="glass-card rounded-2xl p-4 md:p-8 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <h2 className="font-['Poppins:SemiBold',sans-serif] text-[24px] text-[#3b3b3b] mb-6">
            Reservation Details
          </h2>

          {/* Hotel Info */}
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 mb-8 pb-8 border-b border-[#eaeaea]">
            <img
              src={resolveImage(bookingData.hotel.image)}
              alt={bookingData.hotel.name}
              onError={makeImageFallback({ id: booking.hotel?.id, name: bookingData.hotel.name })}
              className="w-32 h-32 object-cover rounded-xl"
            />
            <div className="flex-1">
              <h3 className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-[#3b3b3b] mb-2">
                {bookingData.hotel.name}
              </h3>
              <div className="flex items-center gap-2 text-[#6b7280] mb-2">
                <MapPin className="w-4 h-4" />
                <span className="font-['Inter:Regular',sans-serif] text-[14px]">
                  {bookingData.hotel.location}
                </span>
              </div>
              <div className="font-['Inter:SemiBold',sans-serif] text-[15px] text-[#3b3b3b]">
                {bookingData.hotel.roomType}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8 pb-8 border-b border-[#eaeaea]">
            <div>
              <div className="flex items-center gap-2 text-[#8c8c8c] mb-3">
                <Calendar className="w-4 h-4" />
                <span className="font-['Inter:Medium',sans-serif] text-[13px] uppercase tracking-wide">
                  Check-in
                </span>
              </div>
              <div className="font-['Poppins:Bold',sans-serif] text-[20px] text-[#3b3b3b] mb-1">
                {bookingData.checkIn.displayDate}
              </div>
              <div className="flex items-center gap-2 text-[#6b7280]">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-['Inter:Regular',sans-serif] text-[13px]">
                  {bookingData.checkIn.time}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-[#8c8c8c] mb-3">
                <Calendar className="w-4 h-4" />
                <span className="font-['Inter:Medium',sans-serif] text-[13px] uppercase tracking-wide">
                  Check-out
                </span>
              </div>
              <div className="font-['Poppins:Bold',sans-serif] text-[20px] text-[#3b3b3b] mb-1">
                {bookingData.checkOut.displayDate}
              </div>
              <div className="flex items-center gap-2 text-[#6b7280]">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-['Inter:Regular',sans-serif] text-[13px]">
                  {bookingData.checkOut.time}
                </span>
              </div>
            </div>
          </div>

          {/* Guest Information */}
          <div className="mb-8 pb-8 border-b border-[#eaeaea]">
            <div className="flex items-center gap-2 text-[#8c8c8c] mb-4">
              <User className="w-4 h-4" />
              <span className="font-['Inter:Medium',sans-serif] text-[13px] uppercase tracking-wide">
                Guest Information
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-[#2F80ED]" />
                <span className="font-['Inter:SemiBold',sans-serif] text-[16px] text-[#3b3b3b]">
                  {bookingData.guest.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#2F80ED]" />
                <span className="font-['Inter:Regular',sans-serif] text-[15px] text-[#6b7280]">
                  {bookingData.guest.email}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#2F80ED]" />
                <span className="font-['Inter:Regular',sans-serif] text-[15px] text-[#6b7280]">
                  {bookingData.guest.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div>
            <div className="flex items-center gap-2 text-[#8c8c8c] mb-4">
              <span className="font-['Inter:Medium',sans-serif] text-[13px] uppercase tracking-wide">
                Payment Summary
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-['Inter:Regular',sans-serif] text-[15px] text-[#6b7280]">
                  {formatCurrency(bookingData.payment.nightlyRate, language)} Ã— {bookingData.payment.nights} nights
                </span>
                <span className="font-['Inter:SemiBold',sans-serif] text-[16px] text-[#3b3b3b]">
                  {formatCurrency(bookingData.payment.subtotal, language)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-['Inter:Regular',sans-serif] text-[15px] text-[#6b7280]">
                  Taxes & fees
                </span>
                <span className="font-['Inter:SemiBold',sans-serif] text-[16px] text-[#3b3b3b]">
                  {formatCurrency(bookingData.payment.taxes, language)}
                </span>
              </div>
              <div className="pt-3 border-t-2 border-[#eaeaea] flex items-center justify-between">
                <span className="font-['Poppins:SemiBold',sans-serif] text-[18px] text-[#3b3b3b]">
                  Total Paid
                </span>
                <span className="font-['Poppins:Bold',sans-serif] text-[28px] text-[#10b981]">
                  {formatCurrency(bookingData.payment.total, language)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <button
            onClick={handleDownloadInvoice}
            className="flex items-center justify-center gap-3 bg-white border-2 border-[#eaeaea] text-[#3b3b3b] px-6 py-4 rounded-xl hover:border-[#2F80ED] hover:text-[#2F80ED] transition-all font-['Inter:SemiBold',sans-serif] text-[15px] group"
          >
            <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Download Invoice
          </button>
          <button
            onClick={handleAddToCalendar}
            className="flex items-center justify-center gap-3 bg-white border-2 border-[#eaeaea] text-[#3b3b3b] px-6 py-4 rounded-xl hover:border-[#2F80ED] hover:text-[#2F80ED] transition-all font-['Inter:SemiBold',sans-serif] text-[15px] group"
          >
            <CalendarPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Add to Calendar
          </button>
        </div>

        {/* What's Next */}
        <div className="bg-[#fef3c7] rounded-xl p-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <h3 className="font-['Poppins:SemiBold',sans-serif] text-[18px] text-[#92400e] mb-4">
            What's Next?
          </h3>
          <ul className="space-y-3">
            {[
              "Confirmation email sent to " + bookingData.guest.email,
              "Hotel has been notified of your reservation",
              "Bring a valid ID and credit card for check-in",
              "Need help? Contact us on WhatsApp: +90 555 123 4567"
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#92400e] mt-0.5 flex-shrink-0" />
                <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#78350f] leading-[22px]">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
          <Link
            to="/portal"
            className="flex items-center justify-center gap-2 bg-[#2F80ED] text-white px-8 py-4 rounded-xl hover:bg-[#1E5FBC] transition-all hover:shadow-lg font-['Inter:Bold',sans-serif] text-[16px]"
          >
            View in My Bookings
            <ChevronRight className="w-5 h-5" />
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-white border-2 border-[#2F80ED] text-[#2F80ED] px-8 py-4 rounded-xl hover:bg-[#2F80ED] hover:text-white transition-all font-['Inter:Bold',sans-serif] text-[16px]"
          >
            Back to Homepage
          </Link>
        </div>

        {/* Support Message */}
        <div className="mt-12 text-center">
          <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#6b7280] mb-2">
            Questions about your booking?
          </p>
          <Link to="/support" className="font-['Inter:SemiBold',sans-serif] text-[15px] text-[#2F80ED] hover:text-[#1E5FBC]">
            Contact Support â†’
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ConfirmationPageNew;
