import { AdminLayout } from '@/features/admin/components/AdminLayout';
import { CalendarCheck, DollarSign, Percent, TrendingUp, Building2, Tag, FileDown, Calendar, Info, Globe2 } from 'lucide-react';
import { useState, useMemo, memo, useEffect } from 'react';
import { Modal } from '@/features/admin/components/Modal';
import { useNavigate } from 'react-router';
import { useRole } from '@/features/admin/components/RoleSwitcher';
import { adminService, vendorService, type AdminStats } from '@/shared/api/services';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// All booking data is fetched live from the backend (/api/admin/stats →
// recentBookings, /api/admin/bookings-by-country, /api/admin/users-by-country).
// No hard-coded sample data is allowed in this file.

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
  const [usersByCountry, setUsersByCountry] = useState<Array<{ country: string; users: number; share: number }>>([]);

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
      adminService.getUsersByCountry()
        .then((r) => { if (active) setUsersByCountry(r.countries || []); })
        .catch(() => { if (active) setUsersByCountry([]); });
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

  // Compact stat-card config so the four KPIs share one tidy markup block.
  const statCards: Array<{
    label: string;
    value: string;
    Icon: typeof CalendarCheck;
    accent: string;
  }> = [
    { label: 'Total Bookings', value: liveBookings, Icon: CalendarCheck, accent: '#2F80ED' },
    { label: 'Revenue',        value: liveRevenue,  Icon: DollarSign,    accent: '#10b981' },
    { label: 'Hotels (Active)',value: liveHotels,   Icon: Percent,       accent: '#0ea5e9' },
    { label: 'Total Users',    value: liveUsers,    Icon: TrendingUp,    accent: '#8b5cf6' },
  ];

  return (
    <AdminLayout title="Dashboard" breadcrumb="Admin">
      <div className="space-y-5">
        {/* Welcome Bar + Date Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-semibold leading-tight" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--admin-text)' }}>
              Welcome back, Admin
            </h2>
            <p className="text-[12px] mt-0.5" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--admin-text-muted)' }}>
              United Hotels Partner Network
            </p>
          </div>

          {/* Date Filter — segmented control */}
          <div className="inline-flex items-center gap-0.5 admin-card !p-0.5 rounded-lg !shadow-none">
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
                className={`rounded-md px-2.5 py-1 text-[11.5px] font-medium transition-colors ${
                  dateFilter === filter.value
                    ? 'bg-[#2F80ED] text-white shadow-[0_4px_12px_-4px_rgba(47, 128, 237,0.55)]'
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: dateFilter === filter.value ? '#ffffff' : 'var(--admin-text-muted)',
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI stat cards — admin-card (CSS-var driven) so dark mode picks
            up charcoal surface + hairline border + inner highlight without
            per-card overrides. */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map(({ label, value, Icon, accent }) => (
            <div
              key={label}
              className="group admin-card p-3.5 hover:border-[#2F80ED]/30 hover:shadow-[0_8px_22px_-10px_rgba(47, 128, 237,0.25)] transition-all"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${accent}1a, ${accent}33)`,
                    boxShadow: `inset 0 0 0 1px ${accent}28`,
                  }}
                >
                  <Icon className="h-[16px] w-[16px]" style={{ color: accent }} strokeWidth={1.85} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10.5px] uppercase tracking-[0.08em] font-medium" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--admin-text-muted)' }}>
                    {label}
                  </p>
                  <p className="text-[20px] font-bold mt-0.5 leading-none truncate" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--admin-text)' }}>
                    {value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bookings by country + Users by country (admin only) */}
        {currentRole === 'admin' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <BookingsByCountryCard rows={byCountry} />
            <UsersByCountryCard rows={usersByCountry} />
          </div>
        )}

        {/* Recent Bookings Table — vendors only; admins see the country chart instead */}
        {currentRole !== 'admin' && (
        <div className="bg-white/80 dark:bg-[#11151a]/85 rounded-xl border border-[#EAEAEA]/80 overflow-hidden" style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#EAEAEA]/60">
            <h3 className="text-[14px] font-semibold text-[#1f2937]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Recent Bookings
            </h3>
            <a
              href="/admin/bookings"
              className="text-[12px] font-medium text-[#2F80ED] hover:text-[#1E5FBC] transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              View All →
            </a>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FAFAFA]">
                <tr>
                  <th className="px-3 py-2 text-left text-[10.5px] font-semibold text-[#8C8C8C] uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Booking ID
                  </th>
                  <th className="px-3 py-2 text-left text-[10.5px] font-semibold text-[#8C8C8C] uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Guest
                  </th>
                  <th className="px-3 py-2 text-left text-[10.5px] font-semibold text-[#8C8C8C] uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Hotel
                  </th>
                  <th className="px-3 py-2 text-left text-[10.5px] font-semibold text-[#8C8C8C] uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Room
                  </th>
                  <th className="px-3 py-2 text-left text-[10.5px] font-semibold text-[#8C8C8C] uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Check-in
                  </th>
                  <th className="px-3 py-2 text-left text-[10.5px] font-semibold text-[#8C8C8C] uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-[10.5px] font-semibold text-[#8C8C8C] uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[#11151a] divide-y divide-[#EAEAEA]">
                {liveRecent.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-[12.5px]" style={{ color: 'var(--admin-text-faint)' }}>
                      No bookings yet. Recent bookings will appear here once guests start booking.
                    </td>
                  </tr>
                )}
                {liveRecent.map((b) => ({
                  id: `BK-${b.id}`,
                  guest: b.userName || b.userEmail || 'Guest',
                  hotel: b.hotelName || '—',
                  room: '—',
                  checkIn: b.checkIn ? String(b.checkIn).slice(0, 10) : '',
                  status: b.status || 'pending',
                  amount: `$${Math.round(Number(b.totalPrice) || 0).toLocaleString()}`,
                })).map((booking) => (
                  <tr key={booking.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <a
                        href={`/admin/bookings/${booking.id}`}
                        className="text-sm font-mono text-[#2F80ED] hover:text-[#1E5FBC]"
                      >
                        {booking.id}
                      </a>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-[12.5px] text-[#3B3B3B]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {booking.guest}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-[12.5px] text-[#3B3B3B]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {booking.hotel}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-[12.5px] text-[#8C8C8C]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {booking.room}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-[12.5px] text-[#3B3B3B]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {booking.checkIn}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={getStatusBadgeClass(booking.status)}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-[12.5px] font-semibold text-[#3B3B3B]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {booking.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Quick Actions — compact row of icon-led buttons */}
        <div>
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] mb-2" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--admin-text-muted)' }}>
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: Building2, title: 'Add New Hotel', description: 'Create a new property', accent: '#2F80ED' },
              { icon: Tag, title: 'Manage Pricing', description: 'Update room rates', accent: '#10b981' },
              { icon: FileDown, title: 'Generate Report', description: 'Export analytics', accent: '#0ea5e9' },
              { icon: Calendar, title: 'View Calendar', description: 'Check availability', accent: '#8b5cf6' },
            ].map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.title)}
                  className="group admin-card p-3 hover:border-[#2F80ED]/40 hover:shadow-[0_8px_20px_-10px_rgba(47, 128, 237,0.25)] transition-all text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${action.accent}1a, ${action.accent}30)`,
                        boxShadow: `inset 0 0 0 1px ${action.accent}22`,
                      }}
                    >
                      <Icon className="h-[15px] w-[15px]" style={{ color: action.accent }} strokeWidth={1.85} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[12.5px] font-semibold leading-tight truncate" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--admin-text)' }}>
                        {action.title}
                      </h4>
                      <p className="text-[10.5px] mt-0.5 truncate" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--admin-text-muted)' }}>
                        {action.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick-action modals are intentionally light: they only deep-link
          into the real flow rather than ship a placeholder UI with mock
          hotels / mock availability. The user explicitly asked for zero
          mock data anywhere on the site, so the once-hard-coded selects
          and Math.random() availability grids were replaced. */}
      <Modal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} title="Manage Pricing">
        <div className="space-y-4 text-[13px]" style={{ color: 'var(--admin-text-muted)', fontFamily: 'Inter, sans-serif' }}>
          <p>Per-room base / min / max price bands are edited live on each hotel's room cards.</p>
          <button
            onClick={() => { setShowPricingModal(false); navigate('/admin/hotels'); }}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2F80ED] hover:bg-[#1E5FBC] text-white text-[12.5px] font-semibold px-3.5 py-2 transition-colors shadow-[0_4px_12px_-4px_rgba(47, 128, 237,0.55)]"
          >
            <Tag className="w-3.5 h-3.5" /> Open Hotels & Rooms
          </button>
        </div>
      </Modal>

      <Modal isOpen={showReportModal} onClose={() => setShowReportModal(false)} title="Generate Report">
        <div className="space-y-4 text-[13px]" style={{ color: 'var(--admin-text-muted)', fontFamily: 'Inter, sans-serif' }}>
          <p>Live KPIs, daily booking trend, top-performing hotels and revenue by district are all on the Analytics page — pick a 7/30/90-day window there. Export will be wired to /api/admin/analytics in a follow-up.</p>
          <button
            onClick={() => { setShowReportModal(false); navigate('/admin/analytics'); }}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2F80ED] hover:bg-[#1E5FBC] text-white text-[12.5px] font-semibold px-3.5 py-2 transition-colors shadow-[0_4px_12px_-4px_rgba(47, 128, 237,0.55)]"
          >
            <FileDown className="w-3.5 h-3.5" /> Open Analytics
          </button>
        </div>
      </Modal>

      <Modal isOpen={showCalendarModal} onClose={() => setShowCalendarModal(false)} title="Availability">
        <div className="space-y-4 text-[13px]" style={{ color: 'var(--admin-text-muted)', fontFamily: 'Inter, sans-serif' }}>
          <p>Room-level availability per hotel is reflected on the public listing page once dates are picked, and on each hotel's admin detail page. A standalone calendar view is on the roadmap.</p>
          <button
            onClick={() => { setShowCalendarModal(false); navigate('/admin/bookings'); }}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2F80ED] hover:bg-[#1E5FBC] text-white text-[12.5px] font-semibold px-3.5 py-2 transition-colors shadow-[0_4px_12px_-4px_rgba(47, 128, 237,0.55)]"
          >
            <Calendar className="w-3.5 h-3.5" /> Open Bookings
          </button>
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

const COUNTRY_COLORS = ['#2F80ED', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#10B981', '#EC4899', '#5DA0F8'];

function BookingsByCountryCard({ rows }: { rows: Array<{ country: string; bookings: number; revenue: number; share: number }> }) {
  const total = rows.reduce((s, r) => s + r.bookings, 0);
  const top = rows.slice(0, 8);
  return (
    <div className="bg-white dark:bg-[#11151a] rounded-xl shadow-sm border border-[#EAEAEA] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#3B3B3B] flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
          <Globe2 className="w-5 h-5 text-[#2F80ED]" /> Bookings by country
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
                <Bar dataKey="bookings" name="Bookings" fill="#2F80ED" radius={[0, 4, 4, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Users-by-country tile — companion to BookingsByCountryCard.
 *
 * Reads from /api/admin/users-by-country, which groups every registered
 * user by the geo-detected country saved on registration (utils/geoip).
 * Presented as a sorted list of pills (no chart) so the dashboard stays
 * scannable — the chart on the bookings card already covers the visual
 * distribution case.
 */
function UsersByCountryCard({ rows }: { rows: Array<{ country: string; users: number; share: number }> }) {
  const top = rows.slice(0, 10);
  const total = rows.reduce((s, r) => s + r.users, 0);
  const max = Math.max(1, ...top.map((r) => r.users));
  return (
    <div className="admin-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-semibold flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--admin-text)' }}>
          <Globe2 className="w-4 h-4 text-[#2F80ED]" /> Users by country
        </h3>
        <span className="text-[11px]" style={{ color: 'var(--admin-text-faint)' }}>
          {total} users · {top.length} countries
        </span>
      </div>

      {top.length === 0 ? (
        <div className="py-12 text-center text-[12.5px]" style={{ color: 'var(--admin-text-faint)' }}>
          No users yet. Country detection runs on every signup (CDN header → IP geo → locale).
        </div>
      ) : (
        <div className="space-y-1.5">
          {top.map((row, i) => {
            const widthPct = Math.round((row.users / max) * 100);
            return (
              <div key={row.country} className="grid grid-cols-[100px_1fr_60px] items-center gap-2 text-[12px]">
                <div className="truncate font-medium" style={{ color: 'var(--admin-text)' }} title={row.country}>
                  {COUNTRY_FLAGS[row.country] || '🌐'} {row.country}
                </div>
                <div className="relative h-1.5 rounded-full" style={{ background: 'var(--admin-row-hover)' }}>
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: `${widthPct}%`,
                      background: COUNTRY_COLORS[i % COUNTRY_COLORS.length],
                      boxShadow: `0 0 8px -2px ${COUNTRY_COLORS[i % COUNTRY_COLORS.length]}66`,
                    }}
                  />
                </div>
                <div className="text-right tabular-nums" style={{ color: 'var(--admin-text-muted)' }}>
                  {row.users} <span className="text-[10.5px]" style={{ color: 'var(--admin-text-faint)' }}>· {row.share.toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}