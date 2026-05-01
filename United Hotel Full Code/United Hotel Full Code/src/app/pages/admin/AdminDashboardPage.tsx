import { AdminLayout } from '../../components/admin/AdminLayout';
import { CalendarCheck, DollarSign, Percent, TrendingUp, Building2, Tag, FileDown, Calendar, Info, Globe2 } from 'lucide-react';
import { useState, useMemo, memo, useEffect } from 'react';
import { Modal } from '../../components/admin/Modal';
import { useNavigate } from 'react-router';
import { useRole } from '../../components/admin/RoleSwitcher';
import { adminService, vendorService, type AdminStats } from '../../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// Mock recent bookings
const recentBookings = [
  { id: 'BK-1247', guest: 'John Smith', hotel: 'Grand Palace Hotel', room: 'Deluxe Suite', checkIn: '2026-04-15', status: 'confirmed', amount: '$450' },
  { id: 'BK-1246', guest: 'Emma Johnson', hotel: 'Bosphorus View Hotel', room: 'Standard Room', checkIn: '2026-04-10', status: 'pending', amount: '$280' },
  { id: 'BK-1245', guest: 'Michael Brown', hotel: 'Sultanahmet Inn', room: 'Family Room', checkIn: '2026-04-08', status: 'checked-in', amount: '$380' },
  { id: 'BK-1244', guest: 'Sarah Davis', hotel: 'Grand Palace Hotel', room: 'Executive Suite', checkIn: '2026-04-05', status: 'checked-out', amount: '$520' },
  { id: 'BK-1243', guest: 'Robert Wilson', hotel: 'Bosphorus View Hotel', room: 'Deluxe Room', checkIn: '2026-04-01', status: 'cancelled', amount: '$320' },
];

type DateFilter = '7days' | '30days' | '90days' | 'today' | 'custom';

export function AdminDashboardPage() {
  const [dateFilter, setDateFilter] = useState<DateFilter>('30days');
  const [showAddHotelModal, setShowAddHotelModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const navigate = useNavigate();
  const currentRole = useRole();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [byCountry, setByCountry] = useState<Array<{ country: string; bookings: number; revenue: number; share: number }>>([]);

  useEffect(() => {
    let active = true;
    const isAdmin = currentRole === 'admin';
    const statsPromise = isAdmin ? adminService.getStats() : vendorService.getStats();
    statsPromise
      .then((s) => { if (active) setStats(s); })
      .catch((e: any) => { if (active) setStatsError(e?.data?.error || e?.message || 'Failed to load stats'); });

    if (isAdmin) {
      adminService.getBookingsByCountry()
        .then((r) => { if (active) setByCountry(r.countries || []); })
        .catch(() => { if (active) setByCountry([]); });
    }
    return () => { active = false; };
  }, [currentRole]);

  const liveBookings = stats ? stats.totals.bookings.toLocaleString() : '—';
  const liveRevenue = stats ? `$${Math.round(stats.totals.revenue).toLocaleString()}` : '—';
  const liveHotels = stats ? stats.totals.hotels.toLocaleString() : '—';
  const liveUsers = stats
    ? (stats.usersByRole.user + stats.usersByRole.vendor + stats.usersByRole.admin).toLocaleString()
    : '—';
  const liveRecent = stats?.recentBookings ?? [];

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
      <div className="space-y-8">
        {/* Welcome Bar + Date Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-[#3B3B3B]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Welcome back, Admin
            </h2>
            <p className="text-sm text-[#8C8C8C] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              Grand Palace Hotel
            </p>
          </div>
          
          {/* Date Filter Pills */}
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
                className={`
                  rounded-full px-4 py-2 text-sm font-medium transition-colors
                  ${dateFilter === filter.value
                    ? 'bg-[#1ABC9C] text-white'
                    : 'bg-[#EAEAEA] text-[#3B3B3B] hover:bg-[#EAEAEA]/80'
                  }
                `}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Bookings */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#EAEAEA]">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1ABC9C]/10">
                <CalendarCheck className="h-6 w-6 text-[#1ABC9C]" strokeWidth={1.5} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-[#8C8C8C]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Total Bookings
              </p>
              <p className="text-3xl font-bold text-[#3B3B3B] mt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {liveBookings}
              </p>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#EAEAEA]">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1ABC9C]/10">
                <DollarSign className="h-6 w-6 text-[#1ABC9C]" strokeWidth={1.5} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-[#8C8C8C]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Revenue
              </p>
              <p className="text-3xl font-bold text-[#3B3B3B] mt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {liveRevenue}
              </p>
            </div>
          </div>

          {/* Occupancy Rate */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#EAEAEA]">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1ABC9C]/10">
                <Percent className="h-6 w-6 text-[#1ABC9C]" strokeWidth={1.5} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-[#8C8C8C]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Hotels (Active)
              </p>
              <p className="text-3xl font-bold text-[#3B3B3B] mt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {liveHotels}
              </p>
            </div>
          </div>

          {/* Direct Booking % */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#EAEAEA]">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1ABC9C]/10">
                <TrendingUp className="h-6 w-6 text-[#1ABC9C]" strokeWidth={1.5} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-[#8C8C8C]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Total Users
              </p>
              <p className="text-3xl font-bold text-[#3B3B3B] mt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {liveUsers}
              </p>
            </div>
          </div>
        </div>

        {/* Bookings by country (admin only) */}
        {currentRole === 'admin' && (
          <BookingsByCountryCard rows={byCountry} />
        )}

        {/* Recent Bookings Table — vendors only; admins see the country chart instead */}
        {currentRole !== 'admin' && (
        <div className="bg-white rounded-xl shadow-sm border border-[#EAEAEA] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-[#EAEAEA]">
            <h3 className="text-lg font-semibold text-[#3B3B3B]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Recent Bookings
            </h3>
            <a 
              href="/admin/bookings"
              className="text-sm font-medium text-[#1ABC9C] hover:text-[#16A085] transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              View All →
            </a>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FAFAFA]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#8C8C8C] uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Booking ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#8C8C8C] uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#8C8C8C] uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Hotel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#8C8C8C] uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#8C8C8C] uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Check-in
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#8C8C8C] uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#8C8C8C] uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#EAEAEA]">
                {(liveRecent.length > 0
                  ? liveRecent.map((b) => ({
                      id: `BK-${b.id}`,
                      guest: b.userName || b.userEmail || 'Guest',
                      hotel: b.hotelName || '—',
                      room: '—',
                      checkIn: b.checkIn ? String(b.checkIn).slice(0, 10) : '',
                      status: b.status || 'pending',
                      amount: `$${Math.round(Number(b.totalPrice) || 0).toLocaleString()}`,
                    }))
                  : recentBookings
                ).map((booking) => (
                  <tr key={booking.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={`/admin/bookings/${booking.id}`}
                        className="text-sm font-mono text-[#1ABC9C] hover:text-[#16A085]"
                      >
                        {booking.id}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#3B3B3B]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {booking.guest}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#3B3B3B]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {booking.hotel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#8C8C8C]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {booking.room}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#3B3B3B]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {booking.checkIn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadgeClass(booking.status)}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#3B3B3B]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {booking.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Building2, title: 'Add New Hotel', description: 'Create a new property listing', color: '#1ABC9C' },
            { icon: Tag, title: 'Manage Pricing', description: 'Update room rates', color: '#1ABC9C' },
            { icon: FileDown, title: 'Generate Report', description: 'Export analytics data', color: '#1ABC9C' },
            { icon: Calendar, title: 'View Calendar', description: 'Check availability', color: '#1ABC9C' },
          ].map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => handleQuickAction(action.title)}
                className="group bg-white rounded-xl p-6 shadow-sm border border-[#EAEAEA] hover:border-[#1ABC9C] transition-all text-left"
              >
                <Icon className="h-6 w-6 text-[#1ABC9C] mb-3" strokeWidth={1.5} />
                <h4 className="text-base font-semibold text-[#3B3B3B] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {action.title}
                </h4>
                <p className="text-sm text-[#8C8C8C]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {action.description}
                </p>
              </button>
            );
          })}
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

const COUNTRY_FLAGS: Record<string, string> = {
  US: '🇺🇸', GB: '🇬🇧', UK: '🇬🇧', TR: '🇹🇷', DE: '🇩🇪', FR: '🇫🇷', ES: '🇪🇸',
  IT: '🇮🇹', AE: '🇦🇪', SA: '🇸🇦', RU: '🇷🇺', CN: '🇨🇳', JP: '🇯🇵', IN: '🇮🇳',
  BR: '🇧🇷', NL: '🇳🇱', CH: '🇨🇭', SE: '🇸🇪', NO: '🇳🇴', AU: '🇦🇺', CA: '🇨🇦',
};

const COUNTRY_COLORS = ['#1ABC9C', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#10B981', '#EC4899', '#14B8A6'];

function BookingsByCountryCard({ rows }: { rows: Array<{ country: string; bookings: number; revenue: number; share: number }> }) {
  const total = rows.reduce((s, r) => s + r.bookings, 0);
  const top = rows.slice(0, 8);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#EAEAEA] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#3B3B3B] flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
          <Globe2 className="w-5 h-5 text-[#1ABC9C]" /> Bookings by country
        </h3>
        <span className="text-xs text-[#8C8C8C]">{total} bookings · top {top.length} countries</span>
      </div>

      {top.length === 0 ? (
        <div className="py-12 text-center text-sm text-[#8C8C8C]">
          No bookings yet. Country distribution will populate as guests book.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={top} dataKey="bookings" nameKey="country" innerRadius={50} outerRadius={90} isAnimationActive={false} label>
                  {top.map((_, i) => (
                    <Cell key={i} fill={COUNTRY_COLORS[i % COUNTRY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #EAEAEA' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={top} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEA" horizontal={false} />
                <XAxis type="number" stroke="#8C8C8C" tickLine={false} allowDecimals={false} />
                <YAxis
                  dataKey="country"
                  type="category"
                  stroke="#8C8C8C"
                  tickLine={false}
                  width={120}
                  tickFormatter={(c: string) => `${COUNTRY_FLAGS[c] || '🌐'} ${c}`}
                />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #EAEAEA' }} />
                <Bar dataKey="bookings" name="Bookings" fill="#1ABC9C" radius={[0, 4, 4, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}