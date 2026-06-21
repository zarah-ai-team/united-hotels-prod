import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Navigation } from '@/shared/components/Navigation';
import { Footer } from '@/shared/components/Footer';
import { resolveImage, handleImageError } from '@/shared/data/siteConfig';
import { bookingService } from '@/shared/api/services';
import { STORAGE_KEYS } from '@/shared/config/api';
import {
  Calendar, MapPin, X, Clock, Users, Download,
  Mail, Phone, CheckCircle2, XCircle, History,
  ArrowRight, Star, AlertCircle, Loader
} from 'lucide-react';

interface Booking {
  id: string;
  roomId?: string | number;
  hotelName: string;
  location: string;
  image: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  roomPrice: number;
  total: number;
  status: 'upcoming' | 'past' | 'cancelled';
  // Card payment started but not yet settled — shown in the upcoming tab with
  // an "Awaiting payment" badge instead of "Confirmed".
  pending?: boolean;
  rating?: number;
  email?: string;
  phone?: string;
}

function mapApiBooking(raw: any): Booking {
  const checkIn = raw.fromDate || raw.fromdate || raw.check_in_date || '';
  const checkOut = raw.toDate || raw.todate || raw.check_out_date || '';
  const nights = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 1;

  const rawStatus = (raw.status || '').toLowerCase();
  const pending = rawStatus === 'pending' || rawStatus === 'awaiting_payment';
  let status: 'upcoming' | 'past' | 'cancelled' = 'upcoming';
  if (rawStatus === 'cancelled' || rawStatus === 'canceled') status = 'cancelled';
  else if (rawStatus === 'completed' || rawStatus === 'past' || new Date(checkOut) < new Date()) status = 'past';

  return {
    pending,
    id: String(raw.id || raw._id || raw.transactionId || raw.transactionid || ''),
    roomId: raw.roomId ?? raw.roomid ?? raw.room_id ?? undefined,
    hotelName: raw.hotelName || raw.hotel_name || (raw.hotelId ? `Hotel #${raw.hotelId}` : 'Hotel'),
    location: raw.location || raw.address || '',
    image: raw.image || raw.hotel_image || '',
    roomName: raw.room || raw.room_name || raw.roomName || (raw.roomId ? `Room #${raw.roomId}` : 'Room'),
    checkIn,
    checkOut,
    guests: raw.guests || raw.num_guests || 1,
    nights,
    roomPrice: Number(raw.roomPrice || raw.room_price || (raw.totalAmount || raw.totalamount || 0) / Math.max(nights, 1)),
    total: Number(raw.totalAmount || raw.totalamount || raw.total_price || 0),
    status,
    rating: raw.rating || undefined,
    email: raw.email || undefined,
    phone: raw.phone || undefined,
  };
}

export function GuestPortal() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const loadBookings = useCallback(async () => {
    try {
      const res = await bookingService.getByUser();
      setBookings((res.bookings || []).map(mapApiBooking));
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403 || err?.message?.includes('authenticated')) {
        navigate('/auth?returnUrl=/portal', { replace: true });
        return;
      }
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) {
      navigate('/auth?returnUrl=/portal', { replace: true });
      return;
    }
    loadBookings();
  }, [navigate, loadBookings]);

  const filteredBookings = bookings.filter(b => b.status === activeTab);
  const upcomingCount = bookings.filter(b => b.status === 'upcoming').length;
  const pastCount = bookings.filter(b => b.status === 'past').length;
  const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

  const handleCancelClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;
    const booking = selectedBooking;
    setCancelling(true);
    try {
      await bookingService.cancel(booking.id, booking.roomId);
      // Reflect immediately, then refresh from the server for the source of truth.
      setBookings((prev) =>
        prev.map((b) => (b.id === booking.id ? { ...b, status: 'cancelled', pending: false } : b))
      );
      setShowCancelModal(false);
      setSelectedBooking(null);
      toast.success('Booking cancelled', {
        description: `Your booking at ${booking.hotelName} has been cancelled.`,
      });
      loadBookings();
    } catch (err: any) {
      toast.error('Could not cancel booking', {
        description: err?.data?.error || err?.message || 'Please try again in a moment.',
      });
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <Navigation />

      <main className="max-w-[1840px] mx-auto px-4 py-6 md:px-10 md:py-10">

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-32">
            <Loader className="w-10 h-10 text-[#2F80ED] animate-spin" />
          </div>
        )}

        {!loading && (<>
          {/* Header Section */}
          <div className="mb-6 md:mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
            <div>
              <h1 className="font-['Poppins:Bold',sans-serif] text-[28px] md:text-[40px] leading-tight md:leading-[48px] text-[#3b3b3b] mb-2">
                My Bookings
              </h1>
              <p className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[16px] text-[#6b7280]">
                Manage your past and upcoming hotel reservations
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-xl px-4 py-3 md:px-6 md:py-4 border border-[#eaeaea]">
                <div className="font-['Inter:Regular',sans-serif] text-[13px] text-[#8c8c8c] mb-1">
                  Total Bookings
                </div>
                <div className="font-['Poppins:Bold',sans-serif] text-[24px] md:text-[28px] text-[#2F80ED]">
                  {bookings.length}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="w-full overflow-x-auto pb-1">
          <div className="flex gap-2 md:gap-3 bg-white p-1.5 md:p-2 rounded-xl border border-[#eaeaea] min-w-max">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`
                px-6 py-3 rounded-lg font-['Inter:SemiBold',sans-serif] text-[15px] transition-all flex items-center gap-2
                ${activeTab === 'upcoming' 
                  ? 'bg-[#2F80ED] text-white shadow-lg' 
                  : 'text-[#6b7280] hover:text-[#3b3b3b] hover:bg-[#fafafa]'
                }
              `}
            >
              <CheckCircle2 className="w-4 h-4" />
              Upcoming
              {upcomingCount > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[12px] font-['Inter:Bold',sans-serif] ${
                  activeTab === 'upcoming' ? 'bg-white/20' : 'bg-[#2F80ED]/10 text-[#2F80ED]'
                }`}>
                  {upcomingCount}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('past')}
              className={`
                px-6 py-3 rounded-lg font-['Inter:SemiBold',sans-serif] text-[15px] transition-all flex items-center gap-2
                ${activeTab === 'past' 
                  ? 'bg-[#2F80ED] text-white shadow-lg' 
                  : 'text-[#6b7280] hover:text-[#3b3b3b] hover:bg-[#fafafa]'
                }
              `}
            >
              <History className="w-4 h-4" />
              Past
              {pastCount > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[12px] font-['Inter:Bold',sans-serif] ${
                  activeTab === 'past' ? 'bg-white/20' : 'bg-[#2F80ED]/10 text-[#2F80ED]'
                }`}>
                  {pastCount}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`
                px-6 py-3 rounded-lg font-['Inter:SemiBold',sans-serif] text-[15px] transition-all flex items-center gap-2
                ${activeTab === 'cancelled' 
                  ? 'bg-[#2F80ED] text-white shadow-lg' 
                  : 'text-[#6b7280] hover:text-[#3b3b3b] hover:bg-[#fafafa]'
                }
              `}
            >
              <XCircle className="w-4 h-4" />
              Cancelled
              {cancelledCount > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[12px] font-['Inter:Bold',sans-serif] ${
                  activeTab === 'cancelled' ? 'bg-white/20' : 'bg-[#2F80ED]/10 text-[#2F80ED]'
                }`}>
                  {cancelledCount}
                </span>
              )}
            </button>
          </div>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div 
                key={booking.id}
                className="bg-white rounded-2xl border border-[#eaeaea] overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 md:gap-6 p-4 md:p-6">
                  {/* Image */}
                  <div className="relative rounded-xl overflow-hidden group h-52 md:h-auto">
                    <img
                      src={resolveImage(booking.image)}
                      alt={booking.hotelName}
                      onError={handleImageError}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Status Badge — pending (card payment not settled) shows a
                        distinct amber "Awaiting payment" badge. */}
                    <div className="absolute top-3 right-3">
                      <span className={`
                        px-3 py-1.5 rounded-lg font-['Inter:Bold',sans-serif] text-[13px] shadow-lg flex items-center gap-1.5
                        ${booking.pending ? 'bg-[#f59e0b] text-white' : ''}
                        ${!booking.pending && booking.status === 'upcoming' ? 'bg-[#10b981] text-white' : ''}
                        ${!booking.pending && booking.status === 'past' ? 'bg-white text-[#6b7280]' : ''}
                        ${booking.status === 'cancelled' ? 'bg-[#ef4444] text-white' : ''}
                      `}>
                        {booking.pending && <Loader className="w-3.5 h-3.5" />}
                        {!booking.pending && booking.status === 'upcoming' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {!booking.pending && booking.status === 'past' && <History className="w-3.5 h-3.5" />}
                        {booking.status === 'cancelled' && <XCircle className="w-3.5 h-3.5" />}
                        {booking.status === 'cancelled'
                          ? 'Cancelled'
                          : booking.pending
                            ? 'Awaiting payment'
                            : booking.status === 'past' ? 'Completed' : 'Confirmed'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col">
                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-2">
                          <div className="flex-1">
                            <h3 className="font-['Poppins:SemiBold',sans-serif] text-[20px] md:text-[24px] text-[#3b3b3b] mb-2">
                            {booking.hotelName}
                          </h3>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <MapPin className="w-4 h-4 text-[#2F80ED]" />
                            <span className="font-['Inter:Regular',sans-serif] text-[15px] text-[#6b7280]">
                              {booking.location}
                            </span>
                          </div>

                          <div className="inline-flex items-center gap-2 bg-[#f9fafb] px-3 py-1.5 rounded-lg">
                            <span className="font-['Inter:SemiBold',sans-serif] text-[14px] text-[#3b3b3b]">
                              {booking.roomName}
                            </span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="sm:text-right">
                          <div className="font-['Poppins:Bold',sans-serif] text-[26px] md:text-[32px] leading-tight text-[#3b3b3b] mb-1">
                            ${booking.total}
                          </div>
                          <div className="font-['Inter:Regular',sans-serif] text-[14px] text-[#8c8c8c]">
                            {booking.pending ? 'Total due' : booking.status === 'cancelled' ? 'Total' : 'Total paid'}
                          </div>
                        </div>
                      </div>

                      {/* Booking Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4">
                        <div className="bg-[#fafafa] rounded-xl p-4 border border-[#eaeaea]">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-[#2F80ED]" />
                            <span className="font-['Inter:Medium',sans-serif] text-[12px] text-[#8c8c8c] uppercase tracking-wide">
                              Check-in
                            </span>
                          </div>
                          <div className="font-['Inter:SemiBold',sans-serif] text-[15px] text-[#3b3b3b]">
                            {formatDate(booking.checkIn)}
                          </div>
                          <div className="font-['Inter:Regular',sans-serif] text-[13px] text-[#8c8c8c] mt-0.5">
                            After 2:00 PM
                          </div>
                        </div>

                        <div className="bg-[#fafafa] rounded-xl p-4 border border-[#eaeaea]">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-[#2F80ED]" />
                            <span className="font-['Inter:Medium',sans-serif] text-[12px] text-[#8c8c8c] uppercase tracking-wide">
                              Check-out
                            </span>
                          </div>
                          <div className="font-['Inter:SemiBold',sans-serif] text-[15px] text-[#3b3b3b]">
                            {formatDate(booking.checkOut)}
                          </div>
                          <div className="font-['Inter:Regular',sans-serif] text-[13px] text-[#8c8c8c] mt-0.5">
                            Before 12:00 PM
                          </div>
                        </div>

                        <div className="bg-[#fafafa] rounded-xl p-4 border border-[#eaeaea]">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-[#2F80ED]" />
                            <span className="font-['Inter:Medium',sans-serif] text-[12px] text-[#8c8c8c] uppercase tracking-wide">
                              Duration
                            </span>
                          </div>
                          <div className="font-['Inter:SemiBold',sans-serif] text-[15px] text-[#3b3b3b]">
                            {booking.nights} {booking.nights === 1 ? 'Night' : 'Nights'}
                          </div>
                          <div className="font-['Inter:Regular',sans-serif] text-[13px] text-[#8c8c8c] mt-0.5">
                            {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}
                          </div>
                        </div>
                      </div>

                      {/* Booking ID */}
                      <div className="bg-gradient-to-r from-[#2F80ED]/10 to-transparent rounded-xl p-4 border border-[#2F80ED]/20 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-[#2F80ED] text-white px-2 py-1 rounded text-[11px] font-['Inter:Bold',sans-serif]">
                              ID
                            </div>
                            <div>
                              <span className="font-['Inter:Regular',sans-serif] text-[13px] text-[#6b7280]">
                                Booking Reference
                              </span>
                              <div className="font-['Inter:Bold',sans-serif] text-[16px] text-[#3b3b3b]">
                                {booking.id}
                              </div>
                            </div>
                          </div>

                          {booking.status === 'past' && booking.rating && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${
                                    i < booking.rating! 
                                      ? 'fill-[#FFA500] text-[#FFA500]' 
                                      : 'fill-[#e5e7eb] text-[#e5e7eb]'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-[#eaeaea]">
                      <Link
                        to={`/hotel/${booking.id}`}
                        className="px-5 py-2.5 border-2 border-[#2F80ED] text-[#2F80ED] rounded-lg hover:bg-[#2F80ED] hover:text-white transition-all font-['Inter:SemiBold',sans-serif] text-[14px] flex items-center gap-2"
                      >
                        View Details
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      
                      {booking.status === 'upcoming' && (
                        <>
                          <button className="px-5 py-2.5 border border-[#eaeaea] text-[#3b3b3b] rounded-lg hover:border-[#2F80ED] hover:bg-[#2F80ED]/5 transition-all font-['Inter:SemiBold',sans-serif] text-[14px] flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Download Voucher
                          </button>
                          
                          <button className="px-5 py-2.5 border border-[#eaeaea] text-[#3b3b3b] rounded-lg hover:border-[#2F80ED] hover:bg-[#2F80ED]/5 transition-all font-['Inter:SemiBold',sans-serif] text-[14px] flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email Confirmation
                          </button>

                          <button 
                            onClick={() => handleCancelClick(booking)}
                            className="px-5 py-2.5 border border-[#fee2e2] text-[#ef4444] rounded-lg hover:bg-[#fee2e2] transition-all font-['Inter:SemiBold',sans-serif] text-[14px] flex items-center gap-2 ml-auto"
                          >
                            <XCircle className="w-4 h-4" />
                            Cancel Booking
                          </button>
                        </>
                      )}

                      {booking.status === 'past' && (
                        <>
                          {!booking.rating && (
                            <button className="px-5 py-2.5 bg-[#2F80ED] text-white rounded-lg hover:bg-[#1E5FBC] transition-all font-['Inter:SemiBold',sans-serif] text-[14px] flex items-center gap-2">
                              <Star className="w-4 h-4" />
                              Leave a Review
                            </button>
                          )}
                          
                          <Link
                            to="/listing"
                            className="px-5 py-2.5 border border-[#eaeaea] text-[#3b3b3b] rounded-lg hover:border-[#2F80ED] hover:bg-[#2F80ED]/5 transition-all font-['Inter:SemiBold',sans-serif] text-[14px] flex items-center gap-2"
                          >
                            Book Again
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#eaeaea] p-8 md:p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-[#f3f4f6] rounded-full flex items-center justify-center mx-auto mb-6">
                {activeTab === 'upcoming' && <Calendar className="w-10 h-10 text-[#8c8c8c]" />}
                {activeTab === 'past' && <History className="w-10 h-10 text-[#8c8c8c]" />}
                {activeTab === 'cancelled' && <XCircle className="w-10 h-10 text-[#8c8c8c]" />}
              </div>
              
              <h3 className="font-['Poppins:SemiBold',sans-serif] text-[24px] text-[#3b3b3b] mb-3">
                {activeTab === 'upcoming' && "No Upcoming Bookings"}
                {activeTab === 'past' && "No Past Bookings"}
                {activeTab === 'cancelled' && "No Cancelled Bookings"}
              </h3>
              
              <p className="font-['Inter:Regular',sans-serif] text-[16px] text-[#6b7280] mb-8 leading-[26px]">
                {activeTab === 'upcoming' && "You don't have any upcoming reservations. Start planning your next Turkey adventure!"}
                {activeTab === 'past' && "You haven't completed any bookings yet. Book your first stay and create amazing memories."}
                {activeTab === 'cancelled' && "You don't have any cancelled bookings. All your trips are on track!"}
              </p>
              
              <Link
                to="/listing"
                className="inline-flex items-center gap-2 bg-[#2F80ED] text-white px-8 py-4 rounded-xl hover:bg-[#1E5FBC] transition-all font-['Inter:Bold',sans-serif] text-[16px]"
              >
                Browse Hotels in Turkey
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 md:mt-12 bg-gradient-to-br from-[#2F80ED]/10 to-[#2F80ED]/5 rounded-2xl p-5 md:p-8 border border-[#2F80ED]/20">
          <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
            <div className="w-12 h-12 bg-[#2F80ED] rounded-xl flex items-center justify-center flex-shrink-0">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-[#3b3b3b] mb-2">
                Need Help with Your Booking?
              </h3>
              <p className="font-['Inter:Regular',sans-serif] text-[15px] text-[#6b7280] mb-4">
                Our 24/7 customer support team is here to assist you with any questions or changes to your reservations.
              </p>
              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                <Link
                  to="/support"
                  className="bg-[#2F80ED] text-white px-6 py-3 rounded-lg hover:bg-[#1E5FBC] transition-colors font-['Inter:SemiBold',sans-serif] text-[14px]"
                >
                  Contact Support
                </Link>
                <a
                  href="tel:+905449580798"
                  className="text-[#2F80ED] font-['Inter:SemiBold',sans-serif] text-[14px] hover:text-[#1E5FBC] transition-colors"
                >
                  Call: +90 544 958 07 98
                </a>
              </div>
            </div>
          </div>
        </div>
        </>)}
      </main>

      <Footer />

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-[560px] w-full p-5 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#fee2e2] rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-[#ef4444]" />
                </div>
                <h3 className="font-['Poppins:Bold',sans-serif] text-[24px] text-[#3b3b3b]">
                  Cancel Booking?
                </h3>
              </div>
              <button 
                onClick={() => setShowCancelModal(false)}
                className="p-2 hover:bg-[#f3f4f6] rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-[#3b3b3b]" />
              </button>
            </div>

            <div className="mb-6">
              <p className="font-['Inter:Regular',sans-serif] text-[16px] text-[#3b3b3b] mb-4 leading-[26px]">
                Are you sure you want to cancel your booking at <strong className="text-[#2F80ED]">{selectedBooking.hotelName}</strong>?
              </p>

              {/* Booking Summary */}
              <div className="bg-[#fafafa] rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={resolveImage(selectedBooking.image)}
                    alt={selectedBooking.hotelName}
                    onError={handleImageError}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <div className="font-['Inter:SemiBold',sans-serif] text-[15px] text-[#3b3b3b]">
                      {selectedBooking.hotelName}
                    </div>
                    <div className="font-['Inter:Regular',sans-serif] text-[13px] text-[#6b7280]">
                      {formatDate(selectedBooking.checkIn)} - {formatDate(selectedBooking.checkOut)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#eaeaea]">
                  <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#6b7280]">
                    Booking ID:
                  </span>
                  <span className="font-['Inter:Bold',sans-serif] text-[14px] text-[#3b3b3b]">
                    {selectedBooking.id}
                  </span>
                </div>
              </div>

              {/* Refund Info */}
              <div className="bg-[#d1fae5] border border-[#86efac] rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-['Inter:SemiBold',sans-serif] text-[14px] text-[#059669] mb-1">
                      Full Refund Available
                    </div>
                    <p className="font-['Inter:Regular',sans-serif] text-[13px] text-[#047857]">
                      Free cancellation until 24 hours before check-in. You will receive a full refund of <strong>${selectedBooking.total}</strong> within 5-7 business days.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="flex-1 px-6 py-4 border-2 border-[#eaeaea] text-[#3b3b3b] rounded-xl hover:border-[#2F80ED] hover:bg-[#2F80ED]/5 transition-all font-['Inter:SemiBold',sans-serif] text-[16px] disabled:opacity-60"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="flex-1 px-6 py-4 bg-[#ef4444] text-white rounded-xl hover:bg-[#dc2626] transition-all font-['Inter:Bold',sans-serif] text-[16px] shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {cancelling && <Loader className="w-4 h-4 animate-spin" />}
                {cancelling ? 'Cancelling…' : 'Yes, Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GuestPortal;
