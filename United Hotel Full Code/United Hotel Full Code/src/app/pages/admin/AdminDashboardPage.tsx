import { AdminLayout } from '../../components/admin/AdminLayout';
import { CalendarCheck, DollarSign, Percent, TrendingUp, Building2, Tag, FileDown, Calendar, ShieldCheck, User as UserIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState, useMemo } from 'react';
import { Modal } from '../../components/admin/Modal';
import { useNavigate } from 'react-router';
import { useRole, setUserActualRole } from '../../components/admin/RoleSwitcher';
import { bookingService, hotelService, type BookingRecord, type PublicHotel } from '../../services/api';
import {
  computeKpis,
  buildRecentBookings,
  buildWeeklyRevenue,
  formatKpiCurrency,
  type RecentBookingRow,
  type WeeklyRevenuePoint,
  type AdminKpis,
} from '../../utils/adminMetrics';

type DateFilter = '7days' | '30days' | '90days' | 'today' | 'custom';

export function AdminDashboardPage() {
  const [dateFilter, setDateFilter] = useState<DateFilter>('30days');
  const [showAddHotelModal, setShowAddHotelModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showRoleInfo, setShowRoleInfo] = useState(true);
  const navigate = useNavigate();
  const currentRole = useRole();

  // Live data
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [hotels, setHotels] = useState<PublicHotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [bookingsResp, hotelsList] = await Promise.all([
          bookingService.getAll().catch(() => ({ bookings: [], count: 0 })),
          hotelService.getAll().catch(() => [] as PublicHotel[]),
        ]);
        if (cancelled) return;
        setBookings(bookingsResp.bookings || []);
        setHotels(hotelsList);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis: AdminKpis = useMemo(() => computeKpis(bookings, hotels), [bookings, hotels]);
  const recentBookings: RecentBookingRow[] = useMemo(
    () => buildRecentBookings(bookings, hotels, 5),
    [bookings, hotels],
  );
  const revenueData: WeeklyRevenuePoint[] = useMemo(() => buildWeeklyRevenue(bookings), [bookings]);
  const hasRevenue = revenueData.some((r) => r.direct > 0 || r.ota > 0);

  const handleQuickAction = (actionTitle: string) => {
    switch(actionTitle) {
      case 'Add New Hotel':
        navigate('/admin/hotels');
        break;
      case 'Manage Pricing':
        setShowPricingModal(true);
        break;
      case 'Generate Report':
        setShowReportModal(true);
        break;
      case 'View Calendar':
        setShowCalendarModal(true);
        break;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const baseClass = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
    switch (status) {
      case 'confirmed':
        return `${baseClass} bg-[#22C55E]/10 text-[#22C55E]`;
      case 'pending':
        return `${baseClass} bg-[#F59E0B]/10 text-[#F59E0B]`;
      case 'cancelled':
        return `${baseClass} bg-[#EF4444]/10 text-[#EF4444]`;
      case 'checked-in':
        return `${baseClass} bg-[#3B82F6]/10 text-[#3B82F6]`;
      case 'checked-out':
        return `${baseClass} bg-[#8C8C8C]/10 text-[#8C8C8C]`;
      default:
        return baseClass;
    }
  };

  return (
    <AdminLayout title="Dashboard" breadcrumb="Admin">
      <div className="space-y-6">
        {/* Welcome bar — compact role pill instead of bulky banner */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div>
              <h2
                className="text-[22px] md:text-[26px] font-semibold text-[#1f2937] dark:text-white leading-tight"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Welcome back, {currentRole === 'admin' ? 'Admin' : 'Team'}
              </h2>
              <p
                className="text-[13px] text-[#6b7280] dark:text-white/55 mt-0.5"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Grand Palace Hotel · here&rsquo;s how things look today
              </p>
            </div>
            {showRoleInfo && (
              <button
                onClick={() => setShowRoleInfo(false)}
                className={`hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
                  currentRole === 'admin'
                    ? 'bg-[#1ABC9C]/10 border-[#1ABC9C]/30 text-[#16A085] dark:bg-[#2dd4bf]/15 dark:border-[#2dd4bf]/40 dark:text-[#5eead4]'
                    : 'bg-[#8C8C8C]/10 border-[#8C8C8C]/30 text-[#4b5563] dark:bg-white/[0.06] dark:border-white/[0.12] dark:text-white/75'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
                title="Click to dismiss"
              >
                {currentRole === 'admin' ? (
                  <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} />
                ) : (
                  <UserIcon className="h-3.5 w-3.5" strokeWidth={2} />
                )}
                {currentRole === 'admin' ? 'Admin view' : 'Staff view'}
              </button>
            )}
          </div>

          {/* Date filter pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Today', value: 'today' as DateFilter },
              { label: '7 Days', value: '7days' as DateFilter },
              { label: '30 Days', value: '30days' as DateFilter },
              { label: '90 Days', value: '90days' as DateFilter },
              { label: 'Custom', value: 'custom' as DateFilter },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setDateFilter(filter.value)}
                className={`admin-pill ${dateFilter === filter.value ? 'is-active' : ''}`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
          {/* Total Bookings */}
          <div className="admin-card p-5">
            <div className="flex items-start justify-between">
              <div className="admin-kpi-icon">
                <CalendarCheck className="h-5 w-5" strokeWidth={1.7} />
              </div>
              <span className="text-[11px] font-medium tracking-wide uppercase text-[#8C8C8C] dark:text-white/45">
                Bookings
              </span>
            </div>
            <p
              className="text-[28px] font-bold text-[#1f2937] dark:text-white mt-4 leading-none"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {loading ? '—' : kpis.totalBookings.toLocaleString()}
            </p>
            <div className="flex items-center gap-1 mt-2 min-h-[18px]">
              <span className="text-[11px] text-[#8C8C8C] dark:text-white/45">
                {loading ? 'loading…' : kpis.totalBookings === 0 ? 'no bookings yet' : 'all-time total'}
              </span>
            </div>
          </div>

          {/* Revenue */}
          <div className="admin-card p-5">
            <div className="flex items-start justify-between">
              <div className="admin-kpi-icon">
                <DollarSign className="h-5 w-5" strokeWidth={1.7} />
              </div>
              <span className="text-[11px] font-medium tracking-wide uppercase text-[#8C8C8C] dark:text-white/45">
                Revenue
              </span>
            </div>
            <p
              className="text-[28px] font-bold text-[#1f2937] dark:text-white mt-4 leading-none"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {loading ? '—' : formatKpiCurrency(kpis.totalRevenue)}
            </p>
            <div className="flex items-center gap-1 mt-2 min-h-[18px]">
              <span className="text-[11px] text-[#8C8C8C] dark:text-white/45">
                {loading ? 'loading…' : kpis.totalBookings === 0 ? 'awaiting first booking' : 'across all bookings'}
              </span>
            </div>
          </div>

          {/* Occupancy Rate */}
          <div className="admin-card p-5">
            <div className="flex items-start justify-between">
              <div className="admin-kpi-icon">
                <Percent className="h-5 w-5" strokeWidth={1.7} />
              </div>
              <span className="text-[11px] font-medium tracking-wide uppercase text-[#8C8C8C] dark:text-white/45">
                Occupancy
              </span>
            </div>
            <p
              className="text-[28px] font-bold text-[#1f2937] dark:text-white mt-4 leading-none"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {loading ? '—' : kpis.occupancyPct == null ? '—' : `${kpis.occupancyPct}%`}
            </p>
            <div className="flex items-center gap-1 mt-2 min-h-[18px]">
              <span className="text-[11px] text-[#8C8C8C] dark:text-white/45">
                {loading
                  ? 'loading…'
                  : kpis.occupancyPct == null
                  ? 'add room counts to compute'
                  : 'last 30 days'}
              </span>
            </div>
          </div>

          {/* Direct Booking % */}
          <div className="admin-card p-5">
            <div className="flex items-start justify-between">
              <div className="admin-kpi-icon">
                <TrendingUp className="h-5 w-5" strokeWidth={1.7} />
              </div>
              <span className="text-[11px] font-medium tracking-wide uppercase text-[#8C8C8C] dark:text-white/45">
                Direct
              </span>
            </div>
            <p
              className="text-[28px] font-bold text-[#1f2937] dark:text-white mt-4 leading-none"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {loading ? '—' : kpis.directBookingPct == null ? '—' : `${kpis.directBookingPct}%`}
            </p>
            <div className="flex items-center gap-1 mt-2 min-h-[18px]">
              <span className="text-[11px] text-[#8C8C8C] dark:text-white/45">
                {loading
                  ? 'loading…'
                  : kpis.directBookingPct == null
                  ? 'awaiting first booking'
                  : `${100 - kpis.directBookingPct}% via OTA`}
              </span>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="admin-card p-5 md:p-6" key="revenue-chart-container">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3
                className="text-[16px] font-semibold text-[#1f2937] dark:text-white"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Revenue Overview
              </h3>
              <p
                className="text-[12px] text-[#8C8C8C] dark:text-white/55 mt-0.5"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Direct vs OTA bookings, last 7 weeks
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-[12px]">
              <span className="inline-flex items-center gap-1.5 text-[#3B3B3B] dark:text-white/75">
                <span className="h-2 w-2 rounded-full bg-[#1ABC9C]" /> Direct
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#3B3B3B] dark:text-white/75">
                <span className="h-2 w-2 rounded-full bg-[#8C8C8C]" /> OTA
              </span>
            </div>
          </div>
          {!loading && !hasRevenue ? (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <div className="admin-kpi-icon mb-3">
                <DollarSign className="h-5 w-5" strokeWidth={1.7} />
              </div>
              <p
                className="text-[13.5px] font-semibold text-[#1f2937] dark:text-white"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                No revenue yet
              </p>
              <p
                className="text-[12px] text-[#6b7280] dark:text-white/55 mt-1 max-w-sm"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Once bookings are created, weekly direct vs OTA revenue will plot here automatically.
              </p>
            </div>
          ) : (
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height={300} minHeight={300}>
              <LineChart data={revenueData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,140,140,0.18)" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#8C8C8C"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}
                  tick={{ fill: '#8C8C8C' }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(140,140,140,0.25)' }}
                />
                <YAxis
                  stroke="#8C8C8C"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}
                  tick={{ fill: '#8C8C8C' }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(140,140,140,0.25)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.92)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(15,23,42,0.08)',
                    borderRadius: '10px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="direct"
                  stroke="#1ABC9C"
                  strokeWidth={2.4}
                  name="Direct Bookings"
                  dot={{ fill: '#1ABC9C', r: 3.5 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="ota"
                  stroke="#8C8C8C"
                  strokeWidth={2}
                  name="OTA Bookings"
                  dot={{ fill: '#8C8C8C', r: 3.5 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          )}
        </div>

        {/* Recent Bookings Table */}
        <div className="admin-card overflow-hidden">
          <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.06]">
            <h3
              className="text-[16px] font-semibold text-[#1f2937] dark:text-white"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Recent Bookings
            </h3>
            <a
              href="/admin/bookings"
              className="text-[12.5px] font-medium text-[#1ABC9C] hover:text-[#16A085] transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              View All →
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/40 dark:bg-white/[0.03]">
                <tr>
                  <th className="px-6 py-3 text-left text-[10.5px] font-semibold text-[#8C8C8C] dark:text-white/45 uppercase tracking-[0.12em]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Booking ID
                  </th>
                  <th className="px-6 py-3 text-left text-[10.5px] font-semibold text-[#8C8C8C] dark:text-white/45 uppercase tracking-[0.12em]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-[10.5px] font-semibold text-[#8C8C8C] dark:text-white/45 uppercase tracking-[0.12em]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Hotel
                  </th>
                  <th className="px-6 py-3 text-left text-[10.5px] font-semibold text-[#8C8C8C] dark:text-white/45 uppercase tracking-[0.12em]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-[10.5px] font-semibold text-[#8C8C8C] dark:text-white/45 uppercase tracking-[0.12em]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Check-in
                  </th>
                  <th className="px-6 py-3 text-left text-[10.5px] font-semibold text-[#8C8C8C] dark:text-white/45 uppercase tracking-[0.12em]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-[10.5px] font-semibold text-[#8C8C8C] dark:text-white/45 uppercase tracking-[0.12em]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4" colSpan={7}>
                        <div className="h-3.5 w-full rounded bg-black/[0.04] dark:bg-white/[0.04] animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="admin-kpi-icon">
                          <CalendarCheck className="h-5 w-5" strokeWidth={1.7} />
                        </div>
                        <p
                          className="text-[13px] font-semibold text-[#1f2937] dark:text-white"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          No bookings yet
                        </p>
                        <p
                          className="text-[12px] text-[#6b7280] dark:text-white/55 max-w-sm"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          New reservations will appear in this list as guests book.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-white/45 dark:hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <a
                        href={`/admin/bookings`}
                        className="text-[12.5px] font-mono text-[#1ABC9C] hover:text-[#16A085]"
                      >
                        {booking.id}
                      </a>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-[13px] text-[#1f2937] dark:text-white/85" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {booking.guest}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-[13px] text-[#1f2937] dark:text-white/85 max-w-[220px] truncate" style={{ fontFamily: 'Inter, sans-serif' }} title={booking.hotelName}>
                      {booking.hotelName}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-[13px] text-[#6b7280] dark:text-white/55" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {booking.roomName}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-[13px] text-[#1f2937] dark:text-white/85" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {booking.checkIn}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className={getStatusBadgeClass(booking.status)}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-[13px] font-semibold text-[#1f2937] dark:text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {booking.amount}
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3
            className="text-[14px] font-semibold text-[#1f2937] dark:text-white/85 mb-3 uppercase tracking-[0.12em]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Building2, title: 'Add New Hotel', description: 'Create a property listing' },
              { icon: Tag, title: 'Manage Pricing', description: 'Update room rates' },
              { icon: FileDown, title: 'Generate Report', description: 'Export analytics data' },
              { icon: Calendar, title: 'View Calendar', description: 'Check availability' },
            ].map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.title)}
                  className="admin-card is-interactive p-5 text-left group"
                >
                  <div className="admin-kpi-icon mb-3 transition-transform group-hover:scale-105">
                    <Icon className="h-5 w-5" strokeWidth={1.7} />
                  </div>
                  <h4
                    className="text-[14px] font-semibold text-[#1f2937] dark:text-white mb-1"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {action.title}
                  </h4>
                  <p
                    className="text-[12px] text-[#6b7280] dark:text-white/55"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {action.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} title="Manage Pricing" size="lg">
        <div className="space-y-6">
          <p className="text-sm text-[#8C8C8C]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Update room rates for your properties
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#3B3B3B] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Select Hotel
              </label>
              <select className="w-full px-4 py-2.5 border border-[#EAEAEA] rounded-lg focus:outline-none focus:border-[#1ABC9C] focus:ring-2 focus:ring-[#1ABC9C]/20">
                <option>Grand Palace Hotel</option>
                <option>Bosphorus View Hotel</option>
                <option>Sultanahmet Inn</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#3B3B3B] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Room Type
              </label>
              <select className="w-full px-4 py-2.5 border border-[#EAEAEA] rounded-lg focus:outline-none focus:border-[#1ABC9C] focus:ring-2 focus:ring-[#1ABC9C]/20">
                <option>Deluxe Suite</option>
                <option>Standard Room</option>
                <option>Family Room</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#3B3B3B] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Base Price (USD)
              </label>
              <input type="number" placeholder="150" className="w-full px-4 py-2.5 border border-[#EAEAEA] rounded-lg focus:outline-none focus:border-[#1ABC9C] focus:ring-2 focus:ring-[#1ABC9C]/20" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#3B3B3B] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Weekend Price (USD)
              </label>
              <input type="number" placeholder="180" className="w-full px-4 py-2.5 border border-[#EAEAEA] rounded-lg focus:outline-none focus:border-[#1ABC9C] focus:ring-2 focus:ring-[#1ABC9C]/20" />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3B3B3B] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Peak Season Price (USD)
              </label>
              <input type="number" placeholder="220" className="w-full px-4 py-2.5 border border-[#EAEAEA] rounded-lg focus:outline-none focus:border-[#1ABC9C] focus:ring-2 focus:ring-[#1ABC9C]/20" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => setShowPricingModal(false)} className="px-6 py-2.5 border border-[#EAEAEA] rounded-lg text-[#3B3B3B] hover:bg-[#FAFAFA] transition-colors">
              Cancel
            </button>
            <button onClick={() => setShowPricingModal(false)} className="px-6 py-2.5 bg-[#1ABC9C] text-white rounded-lg hover:bg-[#16A085] transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showReportModal} onClose={() => setShowReportModal(false)} title="Generate Report">
        <div className="space-y-6">
          <p className="text-sm text-[#8C8C8C]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Export analytics data for the selected period
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#3B3B3B] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Report Type
              </label>
              <select className="w-full px-4 py-2.5 border border-[#EAEAEA] rounded-lg focus:outline-none focus:border-[#1ABC9C] focus:ring-2 focus:ring-[#1ABC9C]/20">
                <option>Revenue Report</option>
                <option>Booking Report</option>
                <option>Occupancy Report</option>
                <option>Guest Demographics</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#3B3B3B] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Start Date
                </label>
                <input type="date" className="w-full px-4 py-2.5 border border-[#EAEAEA] rounded-lg focus:outline-none focus:border-[#1ABC9C] focus:ring-2 focus:ring-[#1ABC9C]/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3B3B3B] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  End Date
                </label>
                <input type="date" className="w-full px-4 py-2.5 border border-[#EAEAEA] rounded-lg focus:outline-none focus:border-[#1ABC9C] focus:ring-2 focus:ring-[#1ABC9C]/20" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3B3B3B] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Format
              </label>
              <select className="w-full px-4 py-2.5 border border-[#EAEAEA] rounded-lg focus:outline-none focus:border-[#1ABC9C] focus:ring-2 focus:ring-[#1ABC9C]/20">
                <option>Excel (.xlsx)</option>
                <option>PDF</option>
                <option>CSV</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => setShowReportModal(false)} className="px-6 py-2.5 border border-[#EAEAEA] rounded-lg text-[#3B3B3B] hover:bg-[#FAFAFA] transition-colors">
              Cancel
            </button>
            <button onClick={() => setShowReportModal(false)} className="px-6 py-2.5 bg-[#1ABC9C] text-white rounded-lg hover:bg-[#16A085] transition-colors flex items-center gap-2">
              <FileDown className="h-4 w-4" />
              Generate & Download
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showCalendarModal} onClose={() => setShowCalendarModal(false)} title="Availability Calendar" size="xl">
        <div className="space-y-6">
          <p className="text-sm text-[#8C8C8C]" style={{ fontFamily: 'Inter, sans-serif' }}>
            View and manage room availability across your properties
          </p>
          
          <div className="grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="text-center font-medium text-sm text-[#8C8C8C]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }, (_, i) => (
              <button
                key={i}
                className="aspect-square p-2 border border-[#EAEAEA] rounded-lg hover:border-[#1ABC9C] transition-colors text-sm"
              >
                <div className="font-medium text-[#3B3B3B]">{((i % 30) + 1)}</div>
                <div className="text-xs text-[#22C55E] mt-1">{Math.floor(Math.random() * 20) + 5} avail</div>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-[#EAEAEA]">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-[#22C55E]/20 border border-[#22C55E] rounded"></div>
              <span className="text-sm text-[#8C8C8C]">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-[#F59E0B]/20 border border-[#F59E0B] rounded"></div>
              <span className="text-sm text-[#8C8C8C]">Limited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-[#EF4444]/20 border border-[#EF4444] rounded"></div>
              <span className="text-sm text-[#8C8C8C]">Sold Out</span>
            </div>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}