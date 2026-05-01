import { useNavigate } from 'react-router';
import { CheckCircle, Download, Calendar, MapPin, Mail, Phone } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useBooking } from '../context/BookingContext';

export function ConfirmationPage() {
  const navigate = useNavigate();
  const { booking } = useBooking();

  const bookingId = `UH${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  if (!booking.hotel || !booking.room || !booking.guestDetails) {
    navigate('/');
    return null;
  }

  const nights = booking.nights || 0;
  const basePrice = (booking.room.price || 0) * nights;
  const taxes = Math.round(basePrice * 0.1);
  const total = basePrice + taxes;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="bg-white border-b border-[rgba(0,0,0,0.1)]">
        <div className="max-w-[1200px] mx-auto px-[16px] md:px-[32px]">
          <div className="flex items-center justify-between h-[64px]">
            <a href="/" className="font-['Poppins'] font-bold text-[20px] text-[#1ABC9C]">
              United Hotels
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-[800px] mx-auto px-[16px] md:px-[32px] py-[32px] md:py-[48px]">
        {/* Success Message */}
        <div className="text-center mb-[32px]">
          <div className="w-[80px] h-[80px] bg-[#10B981] rounded-full flex items-center justify-center mx-auto mb-[24px]">
            <CheckCircle className="w-[48px] h-[48px] text-white" />
          </div>
          
          <h1 className="font-['Poppins'] font-bold text-[32px] md:text-[40px] text-[#3b3b3b] mb-[12px]">
            Booking Confirmed!
          </h1>
          
          <p className="font-['Inter'] text-[16px] md:text-[18px] text-[#8c8c8c] mb-[24px]">
            Your reservation has been successfully confirmed
          </p>

          <div className="bg-[#f0fdf4] border border-[#1ABC9C]/20 rounded-[12px] p-[20px] inline-block">
            <div className="font-['Inter'] text-[14px] text-[#8c8c8c] mb-[4px]">
              Booking ID
            </div>
            <div className="font-['Poppins'] font-bold text-[24px] text-[#1ABC9C]">
              {bookingId}
            </div>
          </div>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-[12px] border border-[#eaeaea] p-[24px] md:p-[32px] mb-[24px]">
          <h2 className="font-['Poppins'] font-bold text-[20px] text-[#3b3b3b] mb-[24px]">
            Reservation Details
          </h2>

          <div className="flex gap-[16px] mb-[24px] pb-[24px] border-b border-[#eaeaea]">
            <img 
              src={booking.hotel.image} 
              alt={booking.hotel.name}
              className="w-[100px] h-[100px] rounded-[8px] object-cover flex-shrink-0"
            />
            <div className="flex-1">
              <h3 className="font-['Poppins'] font-semibold text-[18px] text-[#3b3b3b] mb-[4px]">
                {booking.hotel.name}
              </h3>
              <div className="flex items-center gap-[6px] mb-[8px]">
                <MapPin className="w-[14px] h-[14px] text-[#8c8c8c]" />
                <span className="font-['Inter'] text-[14px] text-[#8c8c8c]">
                  {booking.hotel.location}
                </span>
              </div>
              <p className="font-['Inter'] text-[14px] text-[#3b3b3b]">
                {booking.room.name}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-[24px] mb-[24px] pb-[24px] border-b border-[#eaeaea]">
            <div>
              <div className="font-['Inter'] text-[12px] text-[#8c8c8c] mb-[8px] uppercase tracking-wide">
                Check-in
              </div>
              <div className="font-['Poppins'] font-semibold text-[16px] text-[#3b3b3b] mb-[4px]">
                {booking.checkIn}
              </div>
              <div className="font-['Inter'] text-[14px] text-[#8c8c8c]">
                After 2:00 PM
              </div>
            </div>
            
            <div>
              <div className="font-['Inter'] text-[12px] text-[#8c8c8c] mb-[8px] uppercase tracking-wide">
                Check-out
              </div>
              <div className="font-['Poppins'] font-semibold text-[16px] text-[#3b3b3b] mb-[4px]">
                {booking.checkOut}
              </div>
              <div className="font-['Inter'] text-[14px] text-[#8c8c8c]">
                Before 12:00 PM
              </div>
            </div>
          </div>

          <div className="mb-[24px] pb-[24px] border-b border-[#eaeaea]">
            <div className="font-['Inter'] text-[12px] text-[#8c8c8c] mb-[8px] uppercase tracking-wide">
              Guest Information
            </div>
            <div className="font-['Inter'] text-[16px] text-[#3b3b3b] font-medium mb-[8px]">
              {booking.guestDetails.firstName} {booking.guestDetails.lastName}
            </div>
            <div className="flex items-center gap-[8px] mb-[4px]">
              <Mail className="w-[14px] h-[14px] text-[#8c8c8c]" />
              <span className="font-['Inter'] text-[14px] text-[#8c8c8c]">
                {booking.guestDetails.email}
              </span>
            </div>
            <div className="flex items-center gap-[8px]">
              <Phone className="w-[14px] h-[14px] text-[#8c8c8c]" />
              <span className="font-['Inter'] text-[14px] text-[#8c8c8c]">
                {booking.guestDetails.phone}
              </span>
            </div>
          </div>

          <div>
            <div className="font-['Inter'] text-[12px] text-[#8c8c8c] mb-[12px] uppercase tracking-wide">
              Payment Summary
            </div>
            <div className="space-y-[8px] mb-[16px]">
              <div className="flex justify-between">
                <span className="font-['Inter'] text-[14px] text-[#3b3b3b]">
                  ${booking.room.price} × {nights} nights
                </span>
                <span className="font-['Inter'] text-[14px] text-[#3b3b3b]">
                  ${basePrice}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-['Inter'] text-[14px] text-[#3b3b3b]">
                  Taxes & fees
                </span>
                <span className="font-['Inter'] text-[14px] text-[#3b3b3b]">
                  ${taxes}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-[16px] border-t border-[#eaeaea]">
              <span className="font-['Poppins'] font-bold text-[18px] text-[#3b3b3b]">
                Total Paid
              </span>
              <span className="font-['Poppins'] font-bold text-[24px] text-[#10B981]">
                ${total}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-[16px] mb-[32px]">
          <Button variant="outline" size="lg" fullWidth>
            <Download className="w-[20px] h-[20px]" />
            Download Invoice
          </Button>
          
          <Button variant="outline" size="lg" fullWidth>
            <Calendar className="w-[20px] h-[20px]" />
            Add to Calendar
          </Button>
        </div>

        {/* Next Steps */}
        <div className="bg-[#fffbeb] border border-[#FFA500]/20 rounded-[12px] p-[24px] mb-[24px]">
          <h3 className="font-['Poppins'] font-semibold text-[16px] text-[#3b3b3b] mb-[16px]">
            What's Next?
          </h3>
          <ul className="space-y-[12px] font-['Inter'] text-[14px] text-[#3b3b3b]">
            <li className="flex items-start gap-[12px]">
              <span className="text-[#FFA500] flex-shrink-0 mt-[2px]">✓</span>
              <span>Confirmation email sent to {booking.guestDetails.email}</span>
            </li>
            <li className="flex items-start gap-[12px]">
              <span className="text-[#FFA500] flex-shrink-0 mt-[2px]">✓</span>
              <span>Hotel has been notified of your reservation</span>
            </li>
            <li className="flex items-start gap-[12px]">
              <span className="text-[#FFA500] flex-shrink-0 mt-[2px]">✓</span>
              <span>Bring a valid ID and credit card for check-in</span>
            </li>
            <li className="flex items-start gap-[12px]">
              <span className="text-[#FFA500] flex-shrink-0 mt-[2px]">✓</span>
              <span>Need help? Contact us on WhatsApp: +90 555 123 4567</span>
            </li>
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className="grid md:grid-cols-2 gap-[16px]">
          <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/portal')}>
            View in My Bookings
          </Button>
          
          <Button variant="secondary" size="lg" fullWidth onClick={() => navigate('/')}>
            Back to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
}
