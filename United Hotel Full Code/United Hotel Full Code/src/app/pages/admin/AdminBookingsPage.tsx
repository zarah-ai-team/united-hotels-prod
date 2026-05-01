import { AdminLayout } from '../../components/admin/AdminLayout';
import { Search, Download, MoreVertical, X, AlertCircle, CalendarX } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { bookingService, hotelService, type PublicHotel } from '../../services/api';
import { buildBookingsTable, type BookingsTableRow } from '../../utils/adminMetrics';

type StatusFilter = 'all' | 'confirmed' | 'pending' | 'cancelled' | 'checked-in' | 'checked-out';

export function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingsTableRow[]>([]);
  const [hotelsCount, setHotelsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedBooking, setSelectedBooking] = useState<BookingsTableRow | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [bookingsResp, hotels] = await Promise.all([
          bookingService.getAll(),
          hotelService.getAll().catch(() => [] as PublicHotel[]),
        ]);
        if (cancelled) return;
        setBookings(buildBookingsTable(bookingsResp.bookings || [], hotels));
        setHotelsCount(hotels.length);
      } catch (err) {
        if (cancelled) return;
        const message =
          (err as { data?: { error?: string }; message?: string } | null)?.data?.error ||
          (err as { message?: string } | null)?.message ||
          'Failed to load bookings';
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredBookings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return bookings.filter((booking) => {
      const matchesSearch =
        !q ||
        booking.id.toLowerCase().includes(q) ||
        booking.guest.toLowerCase().includes(q) ||
        booking.email.toLowerCase().includes(q) ||
        booking.hotelName.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  const getStatusBadgeClass = (status: string) => {
    const baseClass = 'inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold';
    switch (status) {
      case 'confirmed':
        return `${baseClass} bg-[#22C55E]/15 text-[#16a34a]`;
      case 'pending':
        return `${baseClass} bg-[#F59E0B]/15 text-[#d97706]`;
      case 'cancelled':
        return `${baseClass} bg-[#EF4444]/15 text-[#dc2626]`;
      case 'checked-in':
        return `${baseClass} bg-[#3B82F6]/15 text-[#2563eb]`;
      case 'checked-out':
        return `${baseClass} bg-[#8C8C8C]/15 text-[#52525b]`;
      default:
        return `${baseClass} bg-[#8C8C8C]/15 text-[#52525b]`;
    }
  };

  return (
    <AdminLayout title="Bookings Management" breadcrumb="Admin">
      <div className="space-y-6">
        {/* Filter bar */}
        <div className="admin-card p-5">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C8C8C] dark:text-white/45" strokeWidth={1.8} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by guest, hotel, or booking ID…"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-black/[0.08] dark:border-white/[0.10] bg-white/65 dark:bg-white/[0.04] text-[13px] text-[#1f2937] dark:text-white placeholder:text-[#8C8C8C] dark:placeholder:text-white/40 focus:border-[#1ABC9C] focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]/30"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="px-4 py-2.5 rounded-lg border border-black/[0.08] dark:border-white/[0.10] bg-white/65 dark:bg-white/[0.04] text-[13px] text-[#1f2937] dark:text-white font-medium focus:border-[#1ABC9C] focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]/30"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="checked-in">Checked-in</option>
                <option value="checked-out">Checked-out</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1ABC9C]/10 dark:bg-[#2dd4bf]/15 border border-[#1ABC9C]/25 dark:border-[#2dd4bf]/30 text-[12.5px] font-semibold text-[#16A085] dark:text-[#5eead4]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {filteredBookings.length} booking{filteredBookings.length === 1 ? '' : 's'}
              </span>
              <button
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-black/[0.08] dark:border-white/[0.10] bg-white/65 dark:bg-white/[0.04] text-[13px] font-semibold text-[#1f2937] dark:text-white/85 hover:border-[#1ABC9C]/45 hover:text-[#16A085] transition-colors"
                disabled={bookings.length === 0}
              >
                <Download className="h-4 w-4" strokeWidth={1.8} />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="admin-card p-5 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-[#EF4444] shrink-0 mt-0.5" strokeWidth={1.8} />
            <div className="flex-1">
              <p
                className="text-[13.5px] font-semibold text-[#1f2937] dark:text-white"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Couldn&rsquo;t load bookings
              </p>
              <p
                className="text-[12.5px] text-[#6b7280] dark:text-white/60 mt-0.5"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Bookings table */}
        <div className="admin-card overflow-hidden">
          <div className="px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
            <div>
              <h3
                className="text-[16px] font-semibold text-[#1f2937] dark:text-white"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                All Bookings
              </h3>
              <p
                className="text-[12px] text-[#6b7280] dark:text-white/55 mt-0.5"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {hotelsCount > 0
                  ? `Across ${hotelsCount} propert${hotelsCount === 1 ? 'y' : 'ies'}`
                  : 'Live from /api/bookings'}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/40 dark:bg-white/[0.03]">
                <tr>
                  {[
                    'Booking ID',
                    'Guest',
                    'Hotel',
                    'Room',
                    'Check-in',
                    'Check-out',
                    'Nights',
                    'Amount',
                    'Status',
                    '',
                  ].map((h, i) => (
                    <th
                      key={i}
                      className={`px-5 py-3 text-[10.5px] font-semibold text-[#8C8C8C] dark:text-white/45 uppercase tracking-[0.12em] ${
                        i === 9 ? 'text-center' : 'text-left'
                      }`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-4" colSpan={10}>
                        <div className="h-4 w-full rounded bg-black/[0.04] dark:bg-white/[0.04] animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="admin-kpi-icon">
                          <CalendarX className="h-5 w-5" strokeWidth={1.7} />
                        </div>
                        <p
                          className="text-[14px] font-semibold text-[#1f2937] dark:text-white"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {bookings.length === 0 ? 'No bookings yet' : 'No matching bookings'}
                        </p>
                        <p
                          className="text-[12.5px] text-[#6b7280] dark:text-white/55 max-w-sm"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {bookings.length === 0
                            ? 'When guests reserve rooms, their bookings will appear here in real time.'
                            : 'Try adjusting your search or status filter.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-white/55 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="text-[12px] font-mono font-semibold text-[#16A085] bg-[#1ABC9C]/10 px-2.5 py-1 rounded-md inline-block">
                          {booking.id}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span
                            className="text-[13px] font-semibold text-[#1f2937] dark:text-white truncate"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            {booking.guest}
                          </span>
                          {booking.email && (
                            <span
                              className="text-[11.5px] text-[#6b7280] dark:text-white/55 truncate"
                              style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                              {booking.email}
                            </span>
                          )}
                        </div>
                      </td>
                      <td
                        className="px-5 py-3.5 whitespace-nowrap text-[13px] text-[#1f2937] dark:text-white/85 max-w-[220px] truncate"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                        title={booking.hotelName}
                      >
                        {booking.hotelName}
                      </td>
                      <td
                        className="px-5 py-3.5 whitespace-nowrap text-[12.5px] text-[#6b7280] dark:text-white/60"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {booking.roomName}
                      </td>
                      <td
                        className="px-5 py-3.5 whitespace-nowrap text-[12.5px] text-[#1f2937] dark:text-white/85"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {booking.checkIn}
                      </td>
                      <td
                        className="px-5 py-3.5 whitespace-nowrap text-[12.5px] text-[#1f2937] dark:text-white/85"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {booking.checkOut}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="text-[11.5px] font-semibold text-[#1f2937] dark:text-white bg-[#3B82F6]/10 px-2 py-0.5 rounded-md">
                          {booking.nights}N
                        </span>
                      </td>
                      <td
                        className="px-5 py-3.5 whitespace-nowrap text-[13.5px] font-bold text-[#1f2937] dark:text-white"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {booking.amount}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={getStatusBadgeClass(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() +
                            booking.status.slice(1).replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBooking(booking);
                          }}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-[#8C8C8C] hover:bg-[#1ABC9C] hover:text-white transition-all"
                        >
                          <MoreVertical className="h-4 w-4" strokeWidth={2} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Booking detail slide-over */}
      {selectedBooking && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setSelectedBooking(null)}
          />
          <div className="admin-card fixed right-0 top-0 h-full w-full sm:w-[460px] z-50 overflow-y-auto rounded-none border-l">
            <div className="sticky top-0 admin-glass-header px-6 py-4 flex items-center justify-between">
              <div>
                <h2
                  className="text-[15px] font-semibold text-[#1f2937] dark:text-white"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  {selectedBooking.id}
                </h2>
                <span className={`mt-1 ${getStatusBadgeClass(selectedBooking.status)}`}>
                  {selectedBooking.status.charAt(0).toUpperCase() +
                    selectedBooking.status.slice(1).replace('-', ' ')}
                </span>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-[#8C8C8C] dark:text-white/60 hover:text-[#1f2937] dark:hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={1.8} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#8C8C8C] dark:text-white/45">
                  Guest
                </p>
                <div className="space-y-1 text-[13px]">
                  <div className="flex justify-between gap-3">
                    <span className="text-[#6b7280] dark:text-white/55">Name</span>
                    <span className="text-[#1f2937] dark:text-white font-medium text-right truncate">
                      {selectedBooking.guest}
                    </span>
                  </div>
                  {selectedBooking.email && (
                    <div className="flex justify-between gap-3">
                      <span className="text-[#6b7280] dark:text-white/55">Email</span>
                      <span className="text-[#1f2937] dark:text-white font-medium text-right truncate">
                        {selectedBooking.email}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#8C8C8C] dark:text-white/45">
                  Stay Details
                </p>
                <div className="space-y-1 text-[13px]">
                  <div className="flex justify-between gap-3">
                    <span className="text-[#6b7280] dark:text-white/55">Hotel</span>
                    <span className="text-[#1f2937] dark:text-white font-medium text-right truncate">
                      {selectedBooking.hotelName}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#6b7280] dark:text-white/55">Room</span>
                    <span className="text-[#1f2937] dark:text-white font-medium text-right truncate">
                      {selectedBooking.roomName}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#6b7280] dark:text-white/55">Check-in</span>
                    <span className="text-[#1f2937] dark:text-white font-medium">
                      {selectedBooking.checkIn}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#6b7280] dark:text-white/55">Check-out</span>
                    <span className="text-[#1f2937] dark:text-white font-medium">
                      {selectedBooking.checkOut}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#6b7280] dark:text-white/55">Nights</span>
                    <span className="text-[#1f2937] dark:text-white font-medium">
                      {selectedBooking.nights}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#8C8C8C] dark:text-white/45">
                  Total
                </p>
                <div className="flex items-baseline justify-between">
                  <span className="text-[13px] text-[#6b7280] dark:text-white/55">Amount</span>
                  <span
                    className="text-[20px] font-bold text-[#1f2937] dark:text-white"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {selectedBooking.amount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
